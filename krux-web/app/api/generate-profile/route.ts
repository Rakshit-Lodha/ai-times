import path from "path";
import dotenv from "dotenv";
import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import Exa from "exa-js";
import {
  buildVoiceProfilePrompt,
  buildBannedPhrasesPrompt,
  buildProjectInstructionsPrompt,
  type GenerateMetadata,
  type PostData,
} from "@/lib/generate-prompts";

// Load env vars from the parent ai-times/.env (has CLAUDE_API_KEY + EXA_API_KEY)
dotenv.config({ path: path.resolve(process.cwd(), "../.env") });

// Allow up to 5 minutes for the full pipeline
export const maxDuration = 300;

const MIN_POSTS = 3;
const MAX_POSTS = 10;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 3;

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const rateLimitStore = new Map<string, RateLimitEntry>();

// Lazy-init clients to avoid build-time failures when env vars aren't set
function getClients() {
  const anthropic = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });
  const exa = new Exa(process.env.EXA_API_KEY);
  return { anthropic, exa };
}

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") || "unknown";
}

function enforceRateLimit(request: NextRequest): NextResponse | null {
  const now = Date.now();
  const ip = getClientIp(request);
  const current = rateLimitStore.get(ip);

  if (!current || current.resetAt <= now) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return null;
  }

  if (current.count >= RATE_LIMIT_MAX_REQUESTS) {
    return NextResponse.json(
      {
        error: "Too many generation attempts. Please wait a few minutes and try again.",
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((current.resetAt - now) / 1000)),
        },
      },
    );
  }

  current.count += 1;
  rateLimitStore.set(ip, current);
  return null;
}

function isValidLinkedInProfileUrl(value: string): boolean {
  try {
    const url = new URL(value.trim());
    const hostname = url.hostname.replace(/^www\./, "");
    return (hostname === "linkedin.com" || hostname.endsWith(".linkedin.com")) && /^\/in\/[^/]+/.test(url.pathname);
  } catch {
    return false;
  }
}

function isValidLinkedInPostUrl(value: string): boolean {
  try {
    const url = new URL(value.trim());
    const hostname = url.hostname.replace(/^www\./, "");
    return (
      (hostname === "linkedin.com" || hostname.endsWith(".linkedin.com")) &&
      /^\/(posts|feed|pulse)\//.test(url.pathname)
    );
  } catch {
    return false;
  }
}

function normalizePostUrls(postUrls: string[]): string[] {
  return [...new Set(postUrls.map((url) => url.trim()).filter(Boolean))];
}

type ProfileJSON = {
  profile_url: string;
  profile_image: string;
  profile_title: string;
  current_job: {
    title: string;
    company: string;
    duration: string;
    location: string;
    description: string;
  };
  previous_jobs: Array<{
    title: string;
    company: string;
    duration: string;
    location: string;
    description: string;
  }>;
  profile_summary: string;
};

// JSON schemas for structured output (mirrors notebook cells 38 and 44)
// TS SDK uses { type: "json_schema", schema: {...} } format (different from Python SDK)
const PROFILE_SCHEMA = {
  type: "json_schema" as const,
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      profile_url: { type: "string" },
      profile_image: { type: "string" },
      profile_title: { type: "string" },
      current_job: {
        type: "object",
        additionalProperties: false,
        properties: {
          title: { type: "string" },
          company: { type: "string" },
          duration: { type: "string" },
          location: { type: "string" },
          description: { type: "string" },
        },
        required: ["title", "company", "duration", "location", "description"],
      },
      previous_jobs: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            title: { type: "string" },
            company: { type: "string" },
            duration: { type: "string" },
            location: { type: "string" },
            description: { type: "string" },
          },
          required: ["title", "company", "duration", "location", "description"],
        },
      },
      profile_summary: { type: "string" },
    },
    required: [
      "profile_title",
      "profile_url",
      "profile_image",
      "current_job",
      "previous_jobs",
      "profile_summary",
    ],
  },
};

const POST_SCHEMA = {
  type: "json_schema" as const,
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      post_url: { type: "string" },
      post_title: { type: "string" },
      post_text: { type: "string" },
    },
    required: ["post_url", "post_text", "post_title"],
  },
};

export async function POST(request: NextRequest) {
  try {
    const rateLimitResponse = enforceRateLimit(request);
    if (rateLimitResponse) return rateLimitResponse;

    const body = await request.json();
    const { linkedinUrl, postUrls, metadata } = body as {
      linkedinUrl: string;
      postUrls: string[];
      metadata: GenerateMetadata;
    };

    if (!linkedinUrl || !postUrls?.length || !metadata) {
      return NextResponse.json(
        { error: "Missing required fields: linkedinUrl, postUrls, metadata" },
        { status: 400 },
      );
    }

    if (!isValidLinkedInProfileUrl(linkedinUrl)) {
      return NextResponse.json(
        { error: "Please enter a valid LinkedIn profile URL." },
        { status: 400 },
      );
    }

    const uniquePostUrls = normalizePostUrls(postUrls);
    if (uniquePostUrls.length < MIN_POSTS || uniquePostUrls.length > MAX_POSTS) {
      return NextResponse.json(
        { error: `Please provide between ${MIN_POSTS} and ${MAX_POSTS} LinkedIn post URLs.` },
        { status: 400 },
      );
    }

    if (!uniquePostUrls.every(isValidLinkedInPostUrl)) {
      return NextResponse.json(
        { error: "All post URLs must be valid LinkedIn post URLs." },
        { status: 400 },
      );
    }

    const { anthropic, exa } = getClients();

    // Step 1: Scrape LinkedIn profile via Exa (mirrors notebook cell 34)
    const profileResult = await exa.getContents([linkedinUrl], {
      text: true,
      highlights: {
        query: "Give me basic details of the user like job, title etc",
        numSentences: 10,
      },
    });

    const profilePage = profileResult.results[0];
    if (!profilePage?.url || !profilePage.text) {
      return NextResponse.json(
        {
          error: "We couldn't read that LinkedIn profile. Please check the URL and try again.",
        },
        { status: 422 },
      );
    }

    const rawProfile = {
      profile_url: profilePage.url,
      profile_title: profilePage.title,
      profile_image: profilePage.image ?? "",
      profile_text: profilePage.text,
      profile_highlights: profilePage.highlights,
    };

    // Step 2: Extract structured profile via Claude with json_schema (mirrors notebook cell 38)
    const profileResponse = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 10000,
      messages: [
        {
          role: "user",
          content: `Extract key information from this linkedin profile, for profile summary include things
like profile URL which you can find in Profile JSON,
name of the user, current job and a description of the overall user. Here is the profile JSON:
${JSON.stringify(rawProfile)}`,
        },
      ],
      output_config: { format: PROFILE_SCHEMA },
    });

    const profile = JSON.parse(
      profileResponse.content[0].type === "text" ? profileResponse.content[0].text : "{}",
    ) as ProfileJSON;

    // Step 3: Scrape posts via Exa in parallel (mirrors notebook cell 41)
    const rawPosts = await Promise.all(
      uniquePostUrls.map(async (url) => {
        const result = await exa.getContents([url], {
          text: true,
          highlights: {
            query: "Fetch the entire post of the user along with meta data like number of likes, comments etc",
            numSentences: 20,
          },
        });

        const page = result.results[0];
        if (!page?.url || !page.text) {
          throw new Error(`We couldn't read one of the LinkedIn posts: ${url}`);
        }

        return {
          url: page.url,
          title: page.title ?? "",
          text: page.text,
        };
      }),
    );

    // Step 4: Attribute posts to user via Claude with json_schema (mirrors notebook cell 44)
    const posts: PostData[] = await Promise.all(
      rawPosts.map(async (post) => {
        const response = await anthropic.messages.create({
          model: "claude-sonnet-4-5",
          max_tokens: 10000,
          messages: [
            {
              role: "user",
              content: `You are given the profile summary of the user with links, name and basic details of the user's linkedin profile:
${profile.profile_summary}

You need to use these details to find out what the post of the user should be among all the posts which are given to you in:
${post.text}

Finally you need to give the final data in the JSON format by combining:
${post.url},
${post.text}

In the final JSON output`,
            },
          ],
          output_config: { format: POST_SCHEMA },
        });

        return JSON.parse(
          response.content[0].type === "text" ? response.content[0].text : "{}",
        ) as PostData;
      }),
    );

    // Step 5: Generate voice profile (Cell 51)
    const voiceProfileResponse = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 2048,
      messages: [{ role: "user", content: buildVoiceProfilePrompt(posts, metadata) }],
    });
    const voiceProfile =
      voiceProfileResponse.content[0].type === "text"
        ? voiceProfileResponse.content[0].text
        : "";

    // Step 6: Generate banned phrases using voice profile (Cell 54)
    const bannedPhrasesResponse = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: buildBannedPhrasesPrompt(metadata.wordsToAvoid, voiceProfile),
        },
      ],
    });
    const bannedPhrases =
      bannedPhrasesResponse.content[0].type === "text"
        ? bannedPhrasesResponse.content[0].text
        : "";

    // Step 7: Generate project instructions (Cell 57)
    const name = profile.profile_title?.split("|")[0]?.trim() || "User";
    const title = profile.current_job?.title || "Professional";
    const company = profile.current_job?.company || "Company";

    const instructionsResponse = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 1500,
      messages: [
        {
          role: "user",
          content: buildProjectInstructionsPrompt(
            name,
            title,
            company,
            metadata,
            voiceProfile,
            bannedPhrases,
          ),
        },
      ],
    });
    const projectInstructions =
      instructionsResponse.content[0].type === "text"
        ? instructionsResponse.content[0].text
        : "";

    // Step 8: Format best posts (Cell 60)
    const bestPosts = posts
      .map((p) => `POST: ${p.post_title}\n\n${p.post_text}`)
      .join("\n\n---\n\n");

    const userName = profile.profile_title?.split("|")[0]?.trim() || "User";

    return NextResponse.json({
      files: { voiceProfile, bannedPhrases, projectInstructions, bestPosts },
      userName,
    });
  } catch (err) {
    console.error("Generate profile error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
