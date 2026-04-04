// Prompt constants ported from krux-learn.ipynb (Cell 48)
// Used as specs for the voice profile generation functions

export const COURSE_VOICE_PROFILE_CARDS = `
  CARD 2.2 — Run the Voice Analysis Prompt:
  The voice analysis prompt to use: "Analyze these LinkedIn posts and build a voice profile.
  Cover: sentence length and variation, formality level, how posts typically open and close,
  vocabulary I favor, phrases I repeat, and patterns I avoid.
  Format it as a reference document I can use to train AI to write in this voice."

  CARD 2.3 — Refine What Claude Got Wrong:
  The goal is a profile that, when you read it, sounds exactly like someone describing your
  writing to a stranger. Common refinements people make: "I'm actually more casual than this
  suggests." / "Add that I never use the word 'utilize' — I always say 'use.'" / "My humor
  is drier than this captures." / "I often end with a question, not a statement."

  CARD 2.4 — The Failure Mode: "Professional and Friendly" Tells Claude Nothing:
  Your voice profile needs behaviors, not adjectives.
  - Not "confident" — "opens with a bold claim under 12 words"
  - Not "casual" — "uses contractions in every paragraph"
  - Not "conversational" — "writes in short sentences, 5-10 words average, first-person always"
  Vague profile: "Conversational, professional, engaging tone." → produces generic output.
  Specific profile: "Short sentences, 5-10 words average. First-person, always. Open every post
  with a pain point or bold claim. Never use 'utilize,' 'leverage,' or 'innovative.' End with
  a question. No hashtags. No emojis." → trainable.
`;

export const COURSE_BANNED_PHRASES_CARD = `
  CARD 4.4 — Build Your Banned-Phrases List:
  The Project instructions need a specific banned list structured in three layers:

  Layer 1 — Personal list: words/phrases the user consciously dislikes.

  Layer 2 — AI-isms detected in their writing that clash with their natural voice.

  Layer 3 — Core defaults (always include verbatim):
  Words: delve, leverage, synergy, utilize, innovative, game-changing, revolutionary, pivotal,
  seamless, transformative, nuanced, impactful, groundbreaking, embark, foster, harness, unlock,
  elevate, showcase, resonate.
  Phrases: "thrilled to announce," "excited to share," "I'm honored," "let that sink in,"
  "it's important to note," "in today's fast-paced world," "the funny part?" followed by
  something not funny.
  Structures: em dashes (rewrite or use a colon), emoji bullet points, hashtag spam,
  fake vulnerability hooks.

  Put the banned list at the TOP of instructions, not the bottom.
`;

export const COURSE_PROJECT_INSTRUCTIONS_CARDS = `
  CARD 4.2 — Create the Project and Upload Your Files:
  The Project knowledge section must reference two files:
  1. my-best-posts.txt — the user's actual LinkedIn posts as training material
  2. voice-profile.md — the voice profile built from analysis
  The instructions must tell Claude to review both files before writing.

  CARD 4.3 — Write Your Project Instructions:
  The exact template to fill out:
  "You are writing as [Name], a [role] who helps [audience] with [topic].
  Voice: [paste key lines from your voice-profile.md].
  LinkedIn rules: First two lines must hook — that's all that shows before 'see more.'
  Keep paragraphs to one or two lines for mobile. No native bold or italic.
  Target length: 150 to 300 words.
  NEVER USE: [banned list].
  Always review voice-profile.md and my-best-posts.txt before writing.
  Reference them explicitly."
  Fill every bracket. Leave none generic.
`;

// Prompt builders — mirror notebook cells 51, 54, 57

export type GenerateMetadata = {
  targetReaders: string[];
  postingObjectives: string[];
  postTypes: string[];
  wordsToAvoid: string;
  tonePrinciple: string;
};

export type PostData = {
  post_url: string;
  post_title: string;
  post_text: string;
};

export function buildVoiceProfilePrompt(
  posts: PostData[],
  metadata: GenerateMetadata,
): string {
  const formattedPosts = posts
    .map((p, i) => `POST ${i + 1}: ${p.post_title}\n${p.post_text}`)
    .join("\n---\n");

  const postTypes = metadata.postTypes.map((pt) => `- ${pt}`).join("\n");

  return `You are generating a voice-profile.md for a LinkedIn user.
The course below defines exactly what a good voice profile looks like. Use it as your spec.

<course_definition>
${COURSE_VOICE_PROFILE_CARDS}
</course_definition>

<posts>
${formattedPosts}
</posts>

<intent>
Target reader: ${metadata.targetReaders.join(", ")}
Posting objective: ${metadata.postingObjectives.join(", ")}
Post types:
${postTypes}
Tone principle: ${metadata.tonePrinciple}
</intent>

Generate the voice-profile.md.
- Every observation must be a behavior, not an adjective (card 2.4)
- Base all observations on patterns actually present in the posts — do not invent
- The profile should read like someone accurately describing this person's writing to a stranger
- Cover: how posts open, how posts close, sentence rhythm, structure patterns,
  vocabulary, formality level, what makes it distinct, hook pattern per post type

Output only the markdown document. No preamble.`;
}

export function buildBannedPhrasesPrompt(
  wordsToAvoid: string,
  voiceProfile: string,
): string {
  return `You are generating a banned-phrases.md for a LinkedIn user.
The course below defines the exact structure this file must follow.

<course_definition>
${COURSE_BANNED_PHRASES_CARD}
</course_definition>

<voice_profile>
${voiceProfile}
</voice_profile>

<personal_avoid_list>
${wordsToAvoid}
</personal_avoid_list>

Generate the banned-phrases.md with exactly three sections as the course defines:

## My Personal Avoid List
Convert personal_avoid_list into specific bullet items. Break compound descriptions into individual words and phrases.

## Patterns Detected in My Posts to Watch
From the voice profile, identify patterns that could drift toward generic —
overused openers, repetitive structures, phrases any LinkedIn user could post unchanged.

## Core AI-Tell Defaults (Always Ban These)
Use the exact core list from the course card verbatim.

Output only the markdown document. No preamble.`;
}

export function buildProjectInstructionsPrompt(
  name: string,
  title: string,
  company: string,
  metadata: GenerateMetadata,
  voiceProfile: string,
  bannedPhrases: string,
): string {
  return `You are generating a claude-project-instructions.md for a LinkedIn user.
The course below provides the exact template. Fill it out precisely for this user.

<course_definition>
${COURSE_PROJECT_INSTRUCTIONS_CARDS}
</course_definition>

<voice_profile>
${voiceProfile}
</voice_profile>

<banned_phrases>
${bannedPhrases}
</banned_phrases>

<user_details>
Name: ${name}
Role: ${title} at ${company}
Target reader: ${metadata.targetReaders.join(", ")}
Posting objective: ${metadata.postingObjectives.join(", ")}
</user_details>

Fill the course template (card 4.3) for this user:
- Extract 6-8 behavioral voice rules from voice_profile (behaviors, not adjectives)
- Merge all three sections of banned_phrases into the NEVER USE block
- Include the file reference instruction from card 4.2
- Fill every bracket — leave nothing generic

Output plain text only. No markdown, no headers, no preamble.
This pastes directly into Claude's Project custom instructions field.`;
}
