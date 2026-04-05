# Krux Learn Design System

## Scope

This document captures the reusable UI library extracted from:

- `IIRWl` - `Krux Learn - Course Grid v2`
- `GqmF1` - `Krux Learn - Course Detail v2`
- `bY2ai` - `Krux Learn - Card Reader v2`
- `dJSAD` - `Krux Learn - Card Reader v2`
- `UAyhv` - `Krux Learn - Completion v2`
- `yE8HA` - `Krux Learn - Course Detail v2 - In Progress State`
- `7v1NI` - `Implementation Entry - Iteration A`
- `BJoTY` - `Implementation Entry - Iteration B`
- `Ev10o` - `Step 1 - LinkedIn URL`
- `UjLYR` - `Step 2 - Post URLs`
- `6o02A` - `Step 3 - Preferences`
- `ykKvI` - `Step 4 - Analyze Writing Style`
- `gxjXb` - `Step 5 - Generate Documents`
- `5yuAR` - `Step 6 - Review Documents`
- `xFVYD` - `Step 7 - Setup`
- `t0BDO` - `File Preview - Voice Profile`
- `fdOGO` - `File Preview - Banned Phrases`

The reusable source library now lives inside `course-design-iterations.pen` in:

- `N686u` - `Krux Learn Component Library`

## Product Pattern

Krux Learn is a mobile-first course product with three core flows:

1. Discovery
   Course grid and course cards.
2. Consumption
   Course detail, lesson list, and card reader states.
3. Payoff
   Implementation entry and completion states.

The design language is built around dark editorial surfaces, compact educational cards, and clear CTA hierarchy.

## Core Design Rules

- Use a dark gradient page background for all primary screens.
- Keep mobile frame width at `390`.
- Use `Geist` for primary product text.
- Use `IBM Plex Mono` for labels, metadata, and progress/status markers.
- Use `#3B82F6` as the primary action color.
- Use `#0F172A` and adjacent blue-black surfaces for cards.
- Use stronger visual weight only for payoff moments:
  implementation, completion, and primary CTA areas.

## Library Components

### Foundations

- `2dtuW` - `Component/Status Bar`
  Use at the top of all mobile app screens.

- `WFDks` - `Component/Screen Header`
  Use for list and overview pages with page title and supporting description.

- `lD6ZU` - `Component/Button/Primary`
  Default full-width primary action button.

### Course Surfaces

- `mdVhs` - `Component/Course Card/Default`
  Standard active course card for the grid.

- `1J8AW` - `Component/Course Card/Locked`
  Secondary or unavailable course card state.

- `jtXdT` - `Component/Summary Card`
  Two-column course status summary used in detail screens.

- `Wzibn` - `Component/Lesson Row/Default`
  Standard lesson item for the course detail page.

### Flow Components

- `gx3op` - `Component/Lesson Row/Completed`
  Completed lesson state used in progress detail screens.

- `U6p7N` - `Component/Implementation Card`
  Lightweight implementation entry block. Current copy:
  `Build your own LinkedIn system` with inline CTA `Start Building Now`.

- `hZg8S` - `Component/Completion Hero`
  End-of-section success state with strong emotional payoff.

- `7rUXj` - `Component/Next Step Card`
  Suggested follow-up block after completion.

### Implementation Flow Components

- `0O1UT` - `Component/Processing Card`
  Progress/status card used in the analyze and generate steps.

- `kWDDc` - `Component/File Row`
  Reusable file entry with icon, title, supporting text, and chevron.

- `Jip1w` - `Component/Recommendation Card`
  Highlight card for the recommended setup path.

- `dggpf` - `Component/File Preview Actions`
  Footer action strip for file preview screens:
  back, edit file, and download.

## Screen Composition

### Course Grid

Use:

- `Component/Status Bar`
- `Component/Screen Header`
- `Component/Course Card/Default`
- `Component/Course Card/Locked`

Pattern:

- Page title and description at top.
- Vertical list of course cards.
- First card can carry progress and primary continue action.

### Course Detail

Use:

- `Component/Status Bar`
- back button pattern from `GqmF1`
- hero title and course description
- `Component/Summary Card`
- `Component/Lesson Row/Default`
- `Component/Implementation Card`
- `Component/Button/Primary`

Pattern:

- Hero and summary first.
- Lesson list next.
- Implementation card should be treated as payoff, not as utility chrome.
- Primary course CTA last unless the implementation path is intentionally promoted.

### In Progress Detail

Use:

- `Component/Summary Card`
- `Component/Lesson Row/Completed`
- `Component/Lesson Row/Default`
- `Component/Button/Primary`

Pattern:

- Show completed lessons with the green completed styling.
- Keep upcoming lessons in the default dark surface.

### Completion

Use:

- `Component/Completion Hero`
- `Component/Next Step Card`
- `Component/Button/Primary`

Pattern:

- Completion hero is the visual center.
- Next step card clarifies where the learner goes next.
- CTA remains explicit and singular.

### Implementation Flow

Use:

- `Component/Processing Card`
- `Component/File Row`
- `Component/Recommendation Card`
- `Component/File Preview Actions`
- `Component/Button/Primary`
- `Component/Next Step Card`

Pattern:

- Steps 1-5 keep the same shell:
  top bar, thin progress bar, single dominant content column, sticky CTA.
- Review and setup should keep generated files visible and actionable.
- File rows should communicate `preview`, `edit`, and `download`.
- File preview screens should preserve the same shell, then switch to a
  reading surface with explicit footer actions.

## Implementation Entry Guidance

There are three implementation directions in the file:

- `U6p7N` - reusable lightweight implementation card
- `2lxnB` - implementation-first explanatory iteration
- `yUxuF` - dual-path implementation iteration

Recommended usage:

- Use `U6p7N` when implementation is a secondary but always-available action.
- Use the `yUxuF` direction when the screen needs to present two explicit paths:
  learn first vs build now.
- Use the `2lxnB` direction when implementation should feel like the core payoff
  but still preserve a learning-first narrative.

## Source Screens

These remain the canonical references for full-screen behavior:

- `IIRWl` - course grid
- `GqmF1` - default course detail
- `yE8HA` - in-progress course detail
- `bY2ai` - card reader
- `dJSAD` - card reader alternate
- `UAyhv` - completion
- `Ev10o` - LinkedIn URL capture
- `UjLYR` - post capture
- `6o02A` - preferences
- `ykKvI` - analyze writing style
- `gxjXb` - generate documents
- `5yuAR` - review documents
- `xFVYD` - setup
- `t0BDO` - file preview: voice profile
- `fdOGO` - file preview: banned phrases

## Next Use

When building new screens:

1. Start from `N686u` reusable components.
2. Prefer component instances over fresh duplication.
3. Promote new repeated patterns back into the library instead of leaving them screen-local.
