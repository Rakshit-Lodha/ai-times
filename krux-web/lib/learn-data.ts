export type LearnCard = {
  id: number;
  position: number;
  headline: string;
  body: string;
};

export type LearnSubtopic = {
  id: number;
  slug: string;
  title: string;
  emoji: string;
  learningOutcome: string;
  position: number;
  cardCount: number;
  estMinutes: number;
  cards: LearnCard[];
};

export type LearnCourse = {
  id: number;
  slug: string;
  title: string;
  emoji: string;
  description: string;
  coverGradient: string;
  subtopicCount: number;
  cardCount: number;
  estMinutes: number;
  subtopics: LearnSubtopic[];
};

export type CoursePreview = {
  id: number;
  slug: string;
  title: string;
  emoji: string;
  description: string;
  coverGradient: string;
  subtopicCount: number;
  cardCount: number;
  estMinutes: number;
  comingSoon?: boolean;
};

const LINKEDIN_VOICE_COURSE: LearnCourse = {
  id: 1,
  slug: "stop-your-linkedin-posts-from-sounding-like-ai",
  title: "Stop Your LinkedIn Posts From Sounding Like AI",
  emoji: "🎯",
  description: "Build a complete voice system — Custom Style, Project, banned phrases, and hook templates — so Claude writes LinkedIn posts that sound like you, not the internet.",
  coverGradient: "linear-gradient(135deg, #D97757, #7c3aed)",
  subtopicCount: 5,
  cardCount: 19,
  estMinutes: 40,
  subtopics: [
    {
      id: 1,
      slug: "why-your-ai-posts-sound-like-everyone-elses",
      title: "Why Your AI Posts Sound Like Everyone Else's",
      emoji: "👀",
      learningOutcome: "Identify the specific vocabulary and structural tells that make AI LinkedIn posts detectable — and explain why better prompts alone won't fix it.",
      position: 1,
      cardCount: 3,
      estMinutes: 3,
      cards: [
        {
          id: 1,
          position: 1,
          headline: "The Tell That's Killing Your Reach",
          body: "Search your last five LinkedIn posts for these words: thrilled, honored, leverage, innovative, fostering, nuanced, passionate. Found two or more? Your feed presence has an AI problem. LinkedIn's algorithm measures dwell time. Generic posts get skimmed. Skimmed posts get buried. Originality.ai found 53.7% of LinkedIn posts are now AI-generated. Richard van der Blom's algorithm research shows AI posts get 30% less reach and 55% less engagement. The feed is becoming a monoculture. Scroll ten posts and you've read one post ten times. Your audience feels it, even if they can't name it. The algorithm confirms it in your analytics.",
        },
        {
          id: 2,
          position: 2,
          headline: "The Real Problem Isn't Your Prompt",
          body: "You've tried fixing this. \"Write in a professional but conversational tone.\" \"My audience is founders.\" \"Make it engaging.\" The output gets marginally better. Then you're back rewriting the hook, cutting corporate filler, adding your personality. Twenty minutes later, you wonder why you used AI at all. Here's what's actually happening: Claude trained on billions of web pages. Most web writing is middle-of-the-road. Professional. Forgettable. Optimized for search engines, not humans. When you ask Claude to write a LinkedIn post, it predicts what words typically follow other words. Those words are not yours. They're the statistical average of the internet.",
        },
        {
          id: 3,
          position: 3,
          headline: "What Generic Looks Like vs. What Voice Looks Like",
          body: "Open Claude. Type: \"Write a LinkedIn post about AI tools.\" You'll get something like: \"AI has changed how businesses operate. By leveraging these tools, teams can streamline workflows and achieve new productivity levels.\" Technically fine. Posted a million times. Now compare that to a voice-trained output: \"AI tools promise to save you time. Then you spend three hours watching tutorials. Here's what actually works: Pick one task that costs you 30 minutes daily. Automate just that. Nothing else.\" Same topic. Completely different person. The second one has a point of view. That's what the LinkedIn feed rewards. That's what you're building toward.",
        },
      ],
    },
    {
      id: 2,
      slug: "build-your-voice-profile",
      title: "Build Your Voice Profile (5 Minutes, No Tech Required)",
      emoji: "🪪",
      learningOutcome: "Collect your best LinkedIn posts, run a voice analysis prompt, and produce a filled-out voice profile document you can use immediately.",
      position: 2,
      cardCount: 4,
      estMinutes: 4,
      cards: [
        {
          id: 4,
          position: 1,
          headline: "Collect Your Raw Material",
          body: "Go to your LinkedIn profile. Find five to ten posts that sound most like you — posts you're proud of, posts that got engagement, posts you didn't have to rewrite twelve times. Copy the full text of each. Paste them into a single document. Call it my-best-posts.txt. Two rules: First, only use LinkedIn posts, not blog posts or emails. Different formats train different voices. Second, skip anything you already wrote with AI help. AI-generated samples poison the extraction. Claude will learn your AI voice, not your real one. Brendan McNulty collected 25 examples. Five is the minimum. More is better. Quality beats quantity.",
        },
        {
          id: 5,
          position: 2,
          headline: "Run the Voice Analysis Prompt",
          body: "Open Claude. Paste your posts into the chat. Then paste this exact prompt: \"Analyze these LinkedIn posts and build a voice profile. Cover: sentence length and variation, formality level, how posts typically open and close, vocabulary I favor, phrases I repeat, and patterns I avoid. Format it as a reference document I can use to train AI to write in this voice.\" Claude will return a structured analysis. It might find things you never noticed about yourself. Sam Dumont ran this process and discovered French-influenced punctuation habits and a pattern of using ALL CAPS for emphasis instead of bold — patterns he'd never have listed from memory. The profile Claude gives you is your starting point. Not the final document.",
        },
        {
          id: 6,
          position: 3,
          headline: "Refine What Claude Got Wrong",
          body: "Claude's voice analysis is a first draft. Read it carefully. Correct it out loud, then correct it in the document. Common refinements: \"I'm actually more casual than this suggests.\" \"Add that I never use the word 'utilize' — I always say 'use.'\" \"My humor is drier than this captures.\" \"I often end with a question, not a statement.\" Push back in the same chat: \"You said my tone is authoritative. It's more like a peer sharing what worked for them. Rewrite that section.\" The goal is a profile that, when you read it, sounds exactly like someone describing your writing to a stranger. When it does, save the final version as voice-profile.md. You'll use this file in every next step.",
        },
        {
          id: 7,
          position: 4,
          headline: "The Failure Mode: \"Professional and Friendly\" Tells Claude Nothing",
          body: "Here's where most people stop too early. They write one line: \"Casual but professional tone.\" That describes 90% of LinkedIn. Claude has nothing unique to work with. Compare these two voice profiles. Vague: \"Conversational, professional, engaging tone.\" Specific: \"Short sentences, 5-10 words average. First-person, always. Open every post with a pain point or bold claim. Never use 'utilize,' 'leverage,' or 'innovative.' End with a question. No hashtags. No emojis.\" The second one is trainable. The first one produces the same generic output you started with. Your voice profile needs behaviors, not adjectives. Not \"confident\" — \"opens with a bold claim under 12 words.\" Not \"casual\" — \"uses contractions in every paragraph.\" Behaviors Claude can follow.",
        },
      ],
    },
    {
      id: 3,
      slug: "set-up-your-custom-style",
      title: "Set Up Your Custom Style (Global Voice Layer)",
      emoji: "🎨",
      learningOutcome: "Create a Claude Custom Style from your writing samples that applies your voice automatically across every LinkedIn conversation.",
      position: 3,
      cardCount: 3,
      estMinutes: 3,
      cards: [
        {
          id: 8,
          position: 1,
          headline: "What a Custom Style Does",
          body: "Claude has a feature called Custom Styles. It lives in your account, not in a specific conversation. Once set, it applies your voice baseline to every chat automatically — you don't have to paste instructions each time. Think of it as the default mode for how Claude writes when you're around. Without it, every new conversation starts from \"professional internet writing.\" With it, every new conversation starts from you. This is the fastest fix you can make today. It takes five minutes. It requires no paid plan for basic setup. It is not the complete solution — that comes in the next sub-topic — but it handles the most common problem: forgetting to set context before you write.",
        },
        {
          id: 9,
          position: 2,
          headline: "Create Your Custom Style Step by Step",
          body: "Go to claude.ai. Click the menu at the bottom-left of the chat interface. Select \"Use style\" then \"Create and edit styles.\" Click \"Create custom style.\" Select \"Add writing example.\" Paste the LinkedIn posts from your my-best-posts.txt file. Click \"Create style.\" Claude analyzes your vocabulary, sentence structure, and formatting habits. Name it \"My LinkedIn Voice.\" Now the critical step most people skip: after Claude generates the style description, click \"Set Instructions Manually\" in the options menu. Read what Claude wrote. Edit it to match your voice-profile.md. Claude's auto-generated description is a starting point, not the final word. Your manual edits are what make it accurate.",
        },
        {
          id: 10,
          position: 3,
          headline: "Test Your Style Before Trusting It",
          body: "Select your new Custom Style from the dropdown menu. Type this: \"Write a LinkedIn post about a mistake I made in my first year as a marketing manager.\" Read the output. Ask yourself three questions: Does the hook work in the first two lines? Those first lines are all that appears in the feed before \"...see more\" cuts off the post. Does it sound like something you'd say to a colleague over coffee, or like a press release? Could someone in a completely different industry post this with only the company name changed? If the hook is weak, the post dies in the feed. If it sounds corporate, it gets skimmed. If it's interchangeable, it has no business being on your profile. Note what to fix. You'll address it in the Project setup next.",
        },
      ],
    },
    {
      id: 4,
      slug: "build-your-linkedin-project",
      title: "Build Your LinkedIn Project (Persistent Voice System)",
      emoji: "📁",
      learningOutcome: "Create a Claude Project with uploaded writing samples, voice instructions, and a banned-phrases list that produces on-voice LinkedIn posts every session.",
      position: 4,
      cardCount: 5,
      estMinutes: 10,
      cards: [
        {
          id: 11,
          position: 1,
          headline: "Why a Project Beats a Custom Style Alone",
          body: "The Custom Style handles your general voice. A Project handles everything LinkedIn-specific: hook structure, post length, the \"see more\" fold, mobile formatting, your best-performing formats, and the exact phrases you never use. Here's the key difference. A Custom Style applies everywhere. A Project is a workspace that reloads your LinkedIn rules fresh every single conversation. This matters because of context window degradation — as a conversation gets longer, early instructions carry less weight. By starting a new conversation inside your Project for each post, your rules reload at full strength every time. Style plus Project, running together, is the full system. Style alone is incomplete. Project alone misses global voice. Both together produce consistent output.",
        },
        {
          id: 12,
          position: 2,
          headline: "Create the Project and Upload Your Files",
          body: "Go to claude.ai. Click \"Projects\" in the sidebar. Click \"New Project.\" Name it \"[Your Name] LinkedIn Posts.\" Inside the Project, find \"Project knowledge.\" Click \"Add content.\" Upload two files: First, my-best-posts.txt — the LinkedIn posts you collected earlier. Second, voice-profile.md — the voice profile you built and refined. These files give Claude something to reference on every generation. Rules without examples are too vague. Examples without rules are inconsistent. You need both. Use .txt or .md file formats, not PDFs. Practitioners consistently report better results with plaintext. Claude reads plaintext more reliably than formatted documents. Two files uploaded. Project created. Now you write the instructions.",
        },
        {
          id: 13,
          position: 3,
          headline: "Write Your Project Instructions",
          body: "Inside the Project, go to Settings and find \"Custom instructions.\" Paste and fill out this template: \"You are writing as [Name], a [role] who helps [audience] with [topic]. Voice: [paste key lines from your voice-profile.md]. LinkedIn rules: First two lines must hook — that's all that shows before 'see more.' Keep paragraphs to one or two lines for mobile. No native bold or italic. Target length: 150 to 300 words. NEVER USE: leverage, synergy, delve, innovative, game-changing, thrilled to announce, it's important to note, em dashes. Always review voice-profile.md and my-best-posts.txt before writing. Reference them explicitly.\" Fill every bracket. Leave none generic. The instructions are what connect your files to Claude's output.",
        },
        {
          id: 14,
          position: 4,
          headline: "Build Your Banned-Phrases List",
          body: "Your Project instructions need a specific banned list. Here is the core list, confirmed across multiple practitioner setups. Add it verbatim to your instructions, then add your own. Never use these words: delve, leverage, synergy, utilize, innovative, game-changing, revolutionary, pivotal, seamless, transformative, nuanced, impactful, groundbreaking, embark, foster, harness, unlock, elevate, showcase, resonate. Never use these phrases: \"thrilled to announce,\" \"excited to share,\" \"I'm honored,\" \"let that sink in,\" \"it's important to note,\" \"in today's fast-paced world,\" \"the funny part?\" followed by something not funny. Never use em dashes. Rewrite the sentence or use a colon. Never use emojis as bullet points. No hashtag spam. No fake vulnerability hooks. Put this list at the top of your instructions, not the bottom.",
        },
        {
          id: 15,
          position: 5,
          headline: "Write Your First Post Inside the Project",
          body: "Open a new conversation inside your LinkedIn Project. Select your Custom Style from the dropdown. Use this prompt: \"Before writing, confirm you've reviewed voice-profile.md and my-best-posts.txt. Then write a LinkedIn post about [topic]. Hook: open with a bold claim or tension in under 12 words — this must work before the 'see more' cut. Body: 3 to 5 short paragraphs, one to two lines each, formatted for mobile. Close with a question. Target: 200 words. Avoid all banned phrases from my instructions.\" You should get a post that feels 70% publishable with light edits. That's the benchmark. Not 100% — you own the final 20%. If it needs heavy rewriting, your instructions are too vague. Go back and replace adjectives with specific behaviors.",
        },
      ],
    },
    {
      id: 5,
      slug: "advanced-setup-for-power-users",
      title: "Advanced Setup for Power Users (Skills + Iterative Refinement)",
      emoji: "⚡",
      learningOutcome: "Use Claude's Skills feature to auto-activate voice rules, run a two-pass AI-tell review, and maintain the system so output improves over time.",
      position: 5,
      cardCount: 4,
      estMinutes: 8,
      cards: [
        {
          id: 16,
          position: 1,
          headline: "What Claude Skills Add (And When You Need Them)",
          body: "You have a Project. It works. Skills go one step further. A Skill activates automatically when you start a relevant task — you don't have to open the right Project or select the right Style. Oliver Benns, a software engineer, built a LinkedIn Skill by running /skill-creator in Claude and pointing it at his own blog posts, website copy, and past LinkedIn posts. Claude extracted his patterns and built a SKILL.md file that activates on relevant tasks. The result: direct openers, problem-solution flow, dry wit, British English, and an explicit anti-pattern blocklist — all auto-applied. His review: it gets him \"90% of the way there\" to authentic voice without any setup friction per session.",
        },
        {
          id: 17,
          position: 2,
          headline: "Run the Two-Pass Review Before You Post",
          body: "Even with a full system running, add two review passes to every post before publishing. They catch different problems. Add this to the end of your generation prompt: \"After writing, do two review passes. Pass one: scan for AI-tell vocabulary — delve, leverage, em dashes, hedging phrases, paragraphs all the same length. Replace anything found. Pass two: check for exaggerated voice patterns. If I occasionally use rhetorical questions, you may have used them in every paragraph. Tone it down to match the frequency in my example posts, not higher.\" Hamza Khalid, who generates LinkedIn posts with 34k views, adds a third layer: \"Mark sections you're most confident about [STRONG]. Mark sections you're least confident about [WEAK]. Tell me what you'd change with one more revision.\"",
        },
        {
          id: 18,
          position: 3,
          headline: "Add Hook Templates to Your Project",
          body: "Generic Claude output follows one structure: bold opener, three supporting points, tidy conclusion. Every post. To break this, add a hook-templates.md file to your Project Knowledge. Jack C., whose setup generated a post with 68k impressions, trained Claude on 23 hook templates built from analyzing 1,000+ LinkedIn posts. Here are five to start with: \"Your [X] is costing you [Y].\" \"Stop [common behavior]. Here's why.\" \"[Contrarian claim]. Most people get this wrong.\" \"I [did something unexpected]. Here's what happened.\" \"[Number] [professionals] still make this mistake.\" Add ten to twenty templates to your file. Claude will vary post structure using your templates instead of defaulting to its own. Structure variety signals human writing to the algorithm.",
        },
        {
          id: 19,
          position: 4,
          headline: "Maintain the System Quarterly",
          body: "A voice system that doesn't update drifts. Your writing evolves. Posts from two years ago may not match how you write today. Set a calendar reminder every three months to do four things. First, add your three best-performing recent LinkedIn posts to my-best-posts.txt. Remove older posts that no longer represent you. Second, re-run the voice analysis prompt on your updated samples. Look for any shifts in your patterns. Third, show Claude what you changed in a recent post and why: \"I edited this output. Here is what I changed and why. Update my instructions accordingly.\" Fourth, scan your banned list. Add any new AI-tell words you caught in recent output. The system compounds. Output gets better as the files get better.",
        },
      ],
    },
  ],
};

export const COURSES: LearnCourse[] = [LINKEDIN_VOICE_COURSE];

export function getCourseBySlug(slug: string): LearnCourse | undefined {
  return COURSES.find((c) => c.slug === slug);
}

export function getSubtopic(course: LearnCourse, subtopicSlug: string): LearnSubtopic | undefined {
  return course.subtopics.find((s) => s.slug === subtopicSlug);
}

export function getNextSubtopic(course: LearnCourse, currentPosition: number): LearnSubtopic | undefined {
  return course.subtopics.find((s) => s.position === currentPosition + 1);
}

const COMING_SOON_COURSES: CoursePreview[] = [
  {
    id: 100,
    slug: "claude-code-from-zero-to-shipped",
    title: "Claude Code: From Zero to Shipped",
    emoji: "💻",
    description: "Set up Claude Code, learn the workflow, and ship your first project — no engineering background needed.",
    coverGradient: "linear-gradient(135deg, #3b82f6, #06b6d4)",
    subtopicCount: 6,
    cardCount: 24,
    estMinutes: 25,
    comingSoon: true,
  },
  {
    id: 101,
    slug: "automate-your-content-research",
    title: "Automate Your Content Research with AI",
    emoji: "🔍",
    description: "Build a system that finds, filters, and summarizes industry news and competitor content — so you never start from a blank page.",
    coverGradient: "linear-gradient(135deg, #10b981, #059669)",
    subtopicCount: 5,
    cardCount: 20,
    estMinutes: 20,
    comingSoon: true,
  },
];

export function getCoursePreviews(): CoursePreview[] {
  const live = COURSES.map((c) => ({
    id: c.id,
    slug: c.slug,
    title: c.title,
    emoji: c.emoji,
    description: c.description,
    coverGradient: c.coverGradient,
    subtopicCount: c.subtopicCount,
    cardCount: c.cardCount,
    estMinutes: c.estMinutes,
  }));
  return [...live, ...COMING_SOON_COURSES];
}
