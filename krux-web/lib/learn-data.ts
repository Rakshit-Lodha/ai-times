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

const BRAND_VOICE_COURSE: LearnCourse = {
  id: 1,
  slug: "make-claude-write-in-your-brand-voice",
  title: "Make Claude Write in Your Brand Voice",
  emoji: "🎯",
  description: "Go from generic AI output to copy that sounds like you wrote it. Build a complete voice system with Projects, Styles, banned phrase lists, and a two-pass rewriting process.",
  coverGradient: "linear-gradient(135deg, #D97757, #7c3aed)",
  subtopicCount: 7,
  cardCount: 29,
  estMinutes: 30,
  subtopics: [
    {
      id: 1,
      slug: "why-ai-sounds-like-ai",
      title: "Why AI Sounds Like AI",
      emoji: "🤔",
      learningOutcome: "Understand the three reasons Claude produces generic output and recognize them in your own AI-generated content.",
      position: 1,
      cardCount: 3,
      estMinutes: 3,
      cards: [
        {
          id: 1,
          position: 1,
          headline: "The Zero-Shot Trap",
          body: "You open Claude, type \"write a LinkedIn post about our new product,\" and hit send. No examples. No context. No guidelines. That's called zero-shot prompting. Claude has nothing to work with except its training data — billions of words written by everyone. So it averages them all together. The result? Generic, emoji-heavy, uninspired text that sounds like every other AI post. It's not Claude's fault. You asked it to guess your voice with zero information. Every time you use AI like a blank text box, you fall into this trap.",
        },
        {
          id: 2,
          position: 2,
          headline: "Vague Instructions Don't Work",
          body: "You tell Claude \"be conversational\" or \"sound professional and friendly.\" These words mean nothing to an AI. Conversational compared to what? Professional like a law firm or a sneaker brand? Friendly like a kindergarten teacher or a bartender? These descriptors are too abstract. Claude can't act on them meaningfully. It defaults to middle-of-the-road corporate speak because that's the safest guess. If you can't show someone five examples of what \"conversational\" means for your brand, Claude definitely can't figure it out. Specificity beats adjectives every single time.",
        },
        {
          id: 3,
          position: 3,
          headline: "Claude Doesn't Learn From Corrections",
          body: "Today you change \"utilize\" to \"use\" in Claude's output. Tomorrow it suggests \"utilize\" again. Claude doesn't remember your edits. It doesn't learn your preferences across conversations. Every chat starts from scratch unless you build permanent instructions. This isn't a bug. It's how the tool works. Transformer models don't retain individual user corrections. If you want Claude to stop making the same mistakes, you can't just fix them once. You must encode the rule — \"never use 'utilize,' always use 'use'\" — into a place Claude checks every single time. Otherwise you'll rewrite forever.",
        },
      ],
    },
    {
      id: 2,
      slug: "your-first-5-minute-setup",
      title: "Your First 5-Minute Setup",
      emoji: "⚡",
      learningOutcome: "Create a simple context folder with three files that Claude will reference before every task.",
      position: 2,
      cardCount: 4,
      estMinutes: 4,
      cards: [
        {
          id: 4,
          position: 1,
          headline: "The Three-File Starter System",
          body: "Create a folder on your desktop called \"claude-context.\" Inside, create three files: about-me.md, brand-voice.md, and examples.md. That's it. These three files will give Claude the minimum context to stop sounding generic. About-me tells Claude who you are and what you do. Brand-voice tells Claude how you communicate. Examples shows Claude what good looks like. You'll fill each file with specific, concrete information — not adjectives, not aspirations. Save this folder somewhere permanent. You'll point Claude to it every time you start a new task. This takes five minutes and cuts your editing time in half immediately.",
        },
        {
          id: 5,
          position: 2,
          headline: "Fill Out about-me.md",
          body: "Open about-me.md. Write four things. One: Your role. \"I'm a marketing director at a B2B SaaS company.\" Two: What you do. \"I write email campaigns, LinkedIn posts, and landing page copy.\" Three: How you communicate. \"I use short sentences. I avoid jargon. I write like I talk.\" Four: Paste one full example of your writing — an email you're proud of, a post that performed well, anything 150-250 words. That's your about-me file. No fluff. No mission statements. Just facts Claude can use. Save it. This single file eliminates 80% of generic output immediately.",
        },
        {
          id: 6,
          position: 3,
          headline: "Fill Out brand-voice.md",
          body: "Open brand-voice.md. Start with a \"Never Use\" list. Write the exact words and phrases you hate: \"leverage,\" \"robust,\" \"game-changing,\" \"unlock,\" \"utilize,\" \"delve,\" \"revolutionary,\" \"circle back.\" Add any emoji-heavy openers or corporate clichés. Then write a \"Always Use\" list: simple words you prefer, sentence length rules (example: \"Most sentences under 15 words\"), specific tone notes (example: \"Explain like you're talking to a smart friend, not a conference room\"). Add one example sentence in your voice. That's it. Banned words plus specific replacements. Claude now knows what to avoid and what to copy. Save it.",
        },
        {
          id: 7,
          position: 4,
          headline: "Fill Out examples.md",
          body: "Open examples.md. Paste three finished pieces of your writing. Pick different formats: one email, one social post, one landing page paragraph. Label each one. \"Example 1: Product launch email.\" \"Example 2: LinkedIn thought leadership post.\" \"Example 3: Homepage hero section.\" Don't paste bad examples or drafts. Only paste work you'd publish again today. Claude will pattern-match against these. More examples beats more rules. If you only have two examples, paste two. If you have five, paste five. Quality matters more than quantity. Save it. You now have a complete starter system. Next you'll connect it to Claude.",
        },
      ],
    },
    {
      id: 3,
      slug: "make-claude-use-your-files-every-time",
      title: "Make Claude Use Your Files Every Time",
      emoji: "📁",
      learningOutcome: "Set up a Claude Project that automatically loads your context files into every conversation.",
      position: 3,
      cardCount: 4,
      estMinutes: 4,
      cards: [
        {
          id: 8,
          position: 1,
          headline: "What a Project Does",
          body: "A Project in Claude is a knowledge base plus permanent instructions. You upload files once. Claude references them in every conversation inside that Project forever. You don't re-paste your guidelines every time. You don't remind Claude who you are. The Project does it automatically. Think of it like a workspace. Every chat inside the Project starts with your context already loaded. Free users get five Projects. Paid users get more and can upload larger files. One Project can hold all your brand voice files, examples, and rules. You'll create one Project called \"Brand Voice\" and use it for all marketing tasks.",
        },
        {
          id: 9,
          position: 2,
          headline: "Create Your Brand Voice Project",
          body: "Open Claude. Click Projects in the sidebar. Click \"Create Project.\" Name it \"Brand Voice.\" Now upload your three files: about-me.md, brand-voice.md, and examples.md. Drag them into the knowledge section or click \"Add content.\" They'll appear as attached files. Claude can now read them in every conversation. Next, scroll to \"Custom Instructions.\" This is where you write permanent rules Claude follows automatically. Paste this: \"Read all files in this Project before responding. Ask clarifying questions if the task is unclear. Match the voice and style shown in examples.md. Never use words from the banned list in brand-voice.md.\" Save. Done.",
        },
        {
          id: 10,
          position: 3,
          headline: "Test It Immediately",
          body: "Open a new chat inside your Brand Voice Project. Type this: \"Write a 100-word LinkedIn post announcing a new feature in our product. The feature is a saved-search alert system for sales teams.\" Watch what Claude does. It should reference your files, match your tone from examples.md, avoid banned words from brand-voice.md, and ask a clarifying question if it needs more detail. Compare this output to what you got before you built the Project. It should sound much closer to you. If it still sounds generic, check: Did you upload the files? Did you add Custom Instructions? Are your examples specific enough? Test with three different tasks.",
        },
        {
          id: 11,
          position: 4,
          headline: "When Projects Aren't Enough",
          body: "Projects work brilliantly for short outputs — emails, social posts, ad copy. But voice quality still degrades in long outputs over 1,500 words. That's a fundamental limitation of how language models work. Claude loses consistency the longer it writes. Also, Projects don't solve every problem. If your examples are all formal emails, Claude will struggle with casual LinkedIn posts. You need examples that match the formats you actually create. And if you ask Claude to generate from scratch — \"write a blog post about leadership\" — with no outline or talking points, it'll still sound generic. Projects amplify your input. They don't replace it. Transform your ideas, don't generate from nothing.",
        },
      ],
    },
    {
      id: 4,
      slug: "build-a-banned-phrase-list",
      title: "Build a Banned Phrase List That Actually Works",
      emoji: "🚫",
      learningOutcome: "Compile a specific, categorized list of AI-isms and corporate jargon Claude will never use again.",
      position: 4,
      cardCount: 4,
      estMinutes: 4,
      cards: [
        {
          id: 12,
          position: 1,
          headline: "Why Banned Phrases Matter More Than Rules",
          body: "Negative examples are more powerful than positive instructions. Telling Claude \"don't use corporate jargon\" is vague. Telling Claude \"never use: leverage, synergy, robust, ecosystem, game-changing, unlock, unleash, utilize, delve, circle back\" is crystal clear. Claude can check every word it generates against that list. Multiple practitioners report that banned phrase lists are the single most effective tool for eliminating generic AI voice. One marketer reduced AI detection scores from 40% to under 8% by adding measurable thresholds and a taboo phrase file. Start your list today. You'll update it weekly as you catch new AI-isms in Claude's output.",
        },
        {
          id: 13,
          position: 2,
          headline: "The Core Banned List for Marketing",
          body: "Copy this starter list into your brand-voice.md file under a heading \"Never Use These Words or Phrases:\" Leverage, robust, delve, revolutionary, game-changing, unlock, unleash, utilize (use \"use\" instead), cutting-edge, next-level, synergy, ecosystem, touch base, circle back, deep dive, move the needle, best-in-class, world-class, industry-leading, seamless, empower, transform (as a buzzword), disrupt, innovative (without proof), take it to the next level, at the end of the day, low-hanging fruit. Add any phrase that makes you cringe when you read marketing copy. This is your foundation. Every AI tool defaults to these words. Banning them forces Claude to find clearer alternatives. Update this list every week.",
        },
        {
          id: 14,
          position: 3,
          headline: "Banned Structures, Not Just Words",
          body: "AI also defaults to formulaic structures. Ban these patterns and add them to brand-voice.md: Opening with rhetorical questions (\"Ever wondered why...?\"), emoji-heavy intros (🚀 Exciting news!), listicle-style everything, three-sentence paragraphs that all follow subject-verb-object, sentences that start with \"In today's fast-paced world,\" conclusions that start with \"In conclusion\" or \"At the end of the day,\" any sentence over 30 words with three commas. Write it like this in your file: \"Never open with rhetorical questions. Never use emojis unless I specifically request them. Vary sentence length: some under 10 words, some 15-20, rarely over 25. No formulaic conclusions.\" Structures matter as much as word choice.",
        },
        {
          id: 15,
          position: 4,
          headline: "Catch New AI-isms Every Week",
          body: "Your banned list is never finished. AI language evolves. New generic phrases emerge. Set a weekly 10-minute maintenance routine: Open five recent pieces Claude wrote for you. Highlight any phrase that sounds like AI, not you. Add it to your banned list immediately. Common new offenders include: \"here's the thing,\" \"let's be honest,\" \"the reality is,\" \"it's no secret that,\" or over-explaining simple concepts. One practitioner updates their taboo-phrases file every Monday by reviewing the previous week's output. They've caught 60+ phrases in six months. Your banned list becomes your brand voice firewall. The more specific it gets, the more Claude sounds like you. Update it religiously.",
        },
      ],
    },
    {
      id: 5,
      slug: "create-a-custom-style",
      title: "Create a Custom Style for Instant Voice Switching",
      emoji: "🎨",
      learningOutcome: "Build a custom Style in Claude that applies your voice rules with one click, without retyping instructions.",
      position: 5,
      cardCount: 4,
      estMinutes: 4,
      cards: [
        {
          id: 16,
          position: 1,
          headline: "Styles vs. Projects (and When to Use Each)",
          body: "Styles and Projects do different jobs. A Project loads permanent knowledge — your files, examples, context. A Style changes how Claude formats and writes responses. Think of Projects as \"what Claude knows\" and Styles as \"how Claude talks.\" You can use both together. Example: Your Brand Voice Project holds all your guidelines. Inside that Project, you switch Styles depending on the channel. One Style for LinkedIn posts (casual, short, punchy). Another Style for whitepapers (formal, long, evidence-heavy). Styles let you adapt tone without rebuilding context. You'll create one custom Style that encodes your default voice. Then you'll use it everywhere inside your Project.",
        },
        {
          id: 17,
          position: 2,
          headline: "Build Your Custom Style From a Sample",
          body: "Open Claude Settings. Click Styles. Click \"Create custom style.\" You have two options: upload a writing sample or write manual instructions. Start with a sample — it's faster and more accurate. Upload a PDF, DOC, or TXT file of your best writing. Pick something 500-1,000 words that represents your default voice. A blog post, an email sequence, a LinkedIn article. Claude analyzes it for sentence structure, word choice, rhythm, tone. It generates a Style automatically. Name it \"My Brand Voice.\" Now every time you start a chat, you can select this Style from the dropdown. Claude will match the patterns it found in your sample. Test it on three tasks immediately.",
        },
        {
          id: 18,
          position: 3,
          headline: "Refine With Manual Instructions (Advanced)",
          body: "If the sample-based Style isn't quite right, edit it manually. Click your custom Style. Click \"Use custom instructions (advanced).\" Now you write the rules yourself. Example: \"Write in short sentences. Average 12 words. Vary rhythm: some under 8 words, some 18-22, rarely over 25. Use contractions. Prefer active voice. Use simple words: 'use' not 'utilize,' 'help' not 'facilitate.' No rhetorical questions. No emojis. Explain concepts in one clear sentence, then give one concrete example. Match the tone of a smart friend, not a consultant.\" Be specific. Vague rules (\"be conversational\") still fail. Measurable rules (\"average 12 words per sentence\") work. Save it. Test again.",
        },
        {
          id: 19,
          position: 4,
          headline: "When Styles Break Down (and How to Fix It)",
          body: "Styles work beautifully for short, single-format tasks. But they don't prevent voice drift in long outputs. Generate 1,500+ words and quality still degrades, even with a custom Style. Why? Transformer models lose consistency over length. Fix this by breaking long content into sections. Write an outline first. Then generate each section separately, reapplying your Style instructions each time. Stitch the sections together afterward. Also, Styles don't override bad input. If you ask Claude to \"write a thought leadership piece\" with no talking points or examples, your Style won't save it. Styles amplify good process. They don't replace it. Use Styles for voice. Use Projects for knowledge. Combine both for best results.",
        },
      ],
    },
    {
      id: 6,
      slug: "build-a-two-pass-system",
      title: "Build a Two-Pass System for Humanized Output",
      emoji: "🔄",
      learningOutcome: "Set up a diagnosis-then-rewrite process that eliminates AI-isms automatically, with measurable quality checks.",
      position: 6,
      cardCount: 5,
      estMinutes: 5,
      cards: [
        {
          id: 20,
          position: 1,
          headline: "Why One-Pass Generation Fails",
          body: "You ask Claude to write something. It generates 500 words. Half of it sounds like you, half sounds like AI. You edit for 20 minutes. This happens because you're asking Claude to do too many things at once: understand the task, match your voice, avoid banned phrases, structure the argument, choose examples, format correctly. It's cognitive overload. The solution is a two-pass system. Pass one: Claude diagnoses the input or draft. It scans for problems — banned phrases, repetitive rhythm, vague language, missing facts. Pass two: Claude reconstructs the content, fixing every flagged issue. Separating diagnosis from rewriting prevents simultaneous overload. One marketer using this system dropped AI detection from 40% to under 8%. You'll build a simple version today.",
        },
        {
          id: 21,
          position: 2,
          headline: "Pass One — Diagnosis Checklist",
          body: "Create a new file called diagnosis-checklist.md in your Brand Voice Project. Paste this: \"Before rewriting, scan the draft and flag: 1) Any word from the banned phrases list. 2) Sentences over 25 words. 3) Three or more sentences in a row with identical structure. 4) Vague verbs (make, get, do, have) — suggest concrete replacements. 5) Any immutable facts (numbers, names, dates) — mark DO NOT CHANGE. 6) Audience and intent — who is this for and what should they do?\" Now add this instruction to your Project's Custom Instructions: \"Run diagnosis-checklist.md first. Output the flagged items. Then ask if I want you to rewrite.\" Save it. Test on a draft you've already written.",
        },
        {
          id: 22,
          position: 3,
          headline: "Pass Two — Reconstruction Rules",
          body: "Add a second file called reconstruction-rules.md. Paste this: \"When rewriting after diagnosis: 1) Preserve all flagged facts exactly. Change nothing marked DO NOT CHANGE. 2) Replace every banned phrase with a clearer alternative. 3) Vary sentence length naturally: mix 8-12 word sentences, 15-20 word sentences, and one 25+ word sentence per paragraph maximum. 4) Replace vague verbs with concrete ones (change 'make a decision' to 'decide'). 5) Cut formulaic structures (rhetorical questions, emoji openers, listicles unless requested). 6) Keep the original argument and examples. Only change how it's written, not what it says.\" Add to Custom Instructions: \"After diagnosis, rewrite using reconstruction-rules.md.\" Test it now.",
        },
        {
          id: 23,
          position: 4,
          headline: "Add Measurable Quality Thresholds",
          body: "Advanced move: Create rubric.md with measurable criteria. Paste this: \"Score the output on these eight criteria. Each scores 0-10. Minimum acceptable score: 7 on every criterion. 1) Banned phrase hits: 0 = score 10, 1-2 = score 5, 3+ = score 0. 2) Sentence length variance: 8-25 words with natural rhythm = score 10. 3) Fact preservation: 100% match = score 10, any change = score 0. 4) Concrete verbs: 80%+ = score 10. 5) Structural variety: no three identical sentence patterns in a row = score 10. 6) Readability: Flesch-Kincaid grade 7-9 = score 10. 7) No formulaic openers = score 10. 8) Matches example tone = score 10.\" Add to Custom Instructions: \"Score against rubric.md. If any score is below 7, flag it and offer to revise.\"",
        },
        {
          id: 24,
          position: 5,
          headline: "When to Use Two-Pass (and When to Skip It)",
          body: "Use two-pass for high-stakes content: whitepapers, launch emails, sales one-pagers, thought leadership posts, anything over 500 words. It adds 90 seconds but cuts editing time by 60-70%. Skip it for quick tasks: Slack messages, internal drafts, brainstorming, outline generation. Two-pass is overkill there. Also skip it if you're transforming your own written draft — Claude can rewrite in one pass because your voice is already in the input. Use two-pass when Claude generates from scratch or when you need measurable quality. One practitioner runs diagnosis, scores against the rubric, auto-rewrites if the rhythm score falls below 6, then delivers final output plus score summary. That's a production system. Start simpler: Just run diagnosis first, review flags, then rewrite.",
        },
      ],
    },
    {
      id: 7,
      slug: "advanced-skills-self-review-maintenance",
      title: "Advanced — Skills, Self-Review, and Maintenance",
      emoji: "🛠",
      learningOutcome: "Build a Claude Skill that automates voice checking, add self-review loops, and set up a weekly maintenance routine so your system improves over time.",
      position: 7,
      cardCount: 5,
      estMinutes: 5,
      cards: [
        {
          id: 25,
          position: 1,
          headline: "What Skills Do (and Who Can Use Them)",
          body: "Skills are available to all paid Claude subscribers as a preview feature. A Skill is a packaged workflow — think of it as a mini-app Claude runs automatically. You create a SKILL.md file that defines the task, instructions, and references. You upload supporting files (your rubric, banned phrases, examples). Claude follows the Skill automatically when triggered. Example: A \"Brand Voice Check\" Skill that scans output, flags banned phrases, scores against your rubric, and rewrites if needed — all without you typing instructions every time. Skills turn your two-pass system into one click. If you're on a free plan, skip this card. If you're paid, Skills are the most powerful voice tool available. You'll build one today.",
        },
        {
          id: 26,
          position: 2,
          headline: "Build a Simple Brand Voice Skill",
          body: "Paid users: Open Claude. Click Skills (preview). Click \"Create Skill.\" Name it \"Brand Voice Check.\" Describe what it does: \"Scan content for banned phrases, score against rubric, rewrite to match brand voice.\" Upload these files as references: brand-voice.md (banned phrases + voice rules), rubric.md (scoring criteria), examples.md (finished samples). In the Skill instructions field, paste: \"1) Scan input for banned phrases. Flag all hits. 2) Score against rubric. Report scores. 3) If any score is below 7, rewrite using examples as a model. Preserve all facts. 4) Output rewritten version plus score summary.\" Save the Skill. Toggle it on. Now open a chat, paste generic AI text, and watch Claude run the entire check automatically.",
        },
        {
          id: 27,
          position: 3,
          headline: "Add a Self-Review Loop (Focus Group Simulation)",
          body: "Advanced practitioners build self-review into Claude before it delivers output. Here's how: In your Project Custom Instructions, add this: \"Before delivering final output, simulate a focus group of three buyer personas. Persona 1: [describe your ideal customer]. Persona 2: [describe a skeptical prospect]. Persona 3: [describe a user who hates marketing fluff]. Each persona critiques the draft: what lands, what falls flat, what's unclear. Incorporate the highest-priority feedback. Then deliver the revised output plus a summary of changes.\" Example: If your ICP is a VP of Sales at a 50-200 person company, describe them specifically. Claude will critique its own work through their eyes, catch tone-deaf phrases, and revise before you see it. This adds 30 seconds but catches problems you'd spend 10 minutes fixing.",
        },
        {
          id: 28,
          position: 4,
          headline: "Weekly Maintenance Routine (10 Minutes)",
          body: "Your voice system degrades without maintenance. New AI-isms emerge. Your positioning shifts. Set a 10-minute weekly routine every Monday: 1) Review five outputs Claude generated last week. Highlight any phrase that sounds like AI, not you. Add it to your banned list in brand-voice.md. 2) Check if any facts or proof points changed. Update proof-points.md or about-me.md. 3) If your team launched new messaging, add one example of the new voice to examples.md. 4) If you caught Claude making the same mistake twice, add a specific rule to reconstruction-rules.md. 5) Re-upload updated files to your Project. That's it. Ten minutes keeps your system sharp. One practitioner caught 60+ new AI-isms in six months this way.",
        },
        {
          id: 29,
          position: 5,
          headline: "Transform, Don't Generate — The Core Principle",
          body: "The marketers with the best Claude outputs don't ask it to generate from nothing. They transform existing content. Amber Figlow: \"I always work from original content — transcripts, ideas, my own voice.\" Start with your talking points, a voice memo transcript, bullet points from a meeting, or a rough draft you wrote. Then ask Claude to restructure, expand, tighten, or reformat. Your voice is already in the input. Claude amplifies it. When you ask Claude to \"write a blog post about leadership,\" you get generic AI. When you give Claude your three-paragraph rough draft and say \"expand this to 800 words, match the voice in examples.md,\" you get you. This principle matters more than any Skill or Style. Transform your ideas. Don't outsource them.",
        },
      ],
    },
  ],
};

export const COURSES: LearnCourse[] = [BRAND_VOICE_COURSE];

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
