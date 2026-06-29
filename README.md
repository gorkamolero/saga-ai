# Saga AI

Agentic video-story creation studio. Saga turns a raw idea into a structured content project: idea, script, voiceover, transcript, visual asset plan, generated assets, and a Remotion editing/rendering surface.

This is the productized version of the earlier `saga-agentic-ai` experiment. The Python repo explored a multi-agent writing room; this repo turns that direction into a full-stack web application with auth, persistence, content entities, AI function calls, media generation, and an editor.

## What It Proves

- End-to-end AI product architecture: chat, function calls, database state, media APIs, generated assets, and video composition.
- Creative workflow design: the app guides the user through idea capture, writer style, script generation, voice selection, voiceover, transcript-aware image planning, and video assembly.
- Practical full-stack range: Next.js, React Server Components, tRPC, Drizzle, PostgreSQL, Supabase auth, S3-style storage, and Remotion.
- Strong prompt/product judgment: the AI is not a generic chatbot; it is constrained into named production roles such as Architect, Scriptwriter, and visual asset planner.
- Media pipeline awareness: voiceover, word-level transcript timing, asset timing, image generation, image animation, and vertical-video composition are modeled as first-class workflow objects.

## Product Model

```text
User idea
  -> Architect chat
  -> saved idea
  -> writer style
  -> generated or imported script
  -> voice model
  -> generated voiceover
  -> transcript with word timings
  -> visual asset plan
  -> generated images / animations
  -> Remotion editor
  -> video project
```

## Core Workflow

1. The user starts with a video idea or asks the Architect to shape one.
2. The AI saves the idea as structured state.
3. The user chooses or defines a writing style.
4. The Scriptwriter generates a video script.
5. The user chooses a voice model.
6. The app generates a voiceover and transcript.
7. The Architect maps transcript timing to visual moments.
8. Assets are generated, attached to the project, and shown in the editor.
9. Remotion composes the project into a vertical video preview.

## Current Features

- AI chat flow using Vercel AI SDK RSC helpers and OpenAI function calls.
- Structured tool/function surface for idea saving, content recall, script saving, voice model selection, voiceover generation, visual asset generation, channel saving, and video creation.
- PostgreSQL schema for users, conversations, ideas, writers, artists, scripts, voiceovers, visual assets, videos, and channels.
- tRPC routers for the core content entities.
- Supabase auth integration.
- Voiceover and transcript generation hooks.
- Unsplash search integration for open image assets.
- LemonFox/OpenAI-style image generation path.
- S3/presigned URL storage utilities.
- Remotion player/editor with transcript captions and timed visual assets.
- Resizable editor layout: video preview, transcript, asset grid, and bottom player.

## Architecture

Key files:

```text
src/app/action.tsx                         AI state, function calls, and workflow orchestration
src/server/db/schema.ts                    content and video production data model
src/server/api/routers                     tRPC API for users, ideas, scripts, videos, assets
src/lib/prompts                            Architect, Scriptwriter, and visual planner prompts
src/lib/ai                                 script, voiceover, transcript, asset, image helpers
src/components/chat.tsx                    conversational creation surface
src/components/editor.tsx                  video editor shell
src/components/editor/remotion-player.tsx  Remotion preview integration
src/lib/integrations/remotion              video composition, captions, transitions
src/utils/supabase                         auth/server/client helpers
```

System shape:

```text
Next.js app
  -> Supabase auth
  -> AI SDK RSC chat
  -> OpenAI/OpenRouter/LemonFox/AssemblyAI/Unsplash/S3 integrations
  -> tRPC API
  -> Drizzle/PostgreSQL state
  -> Remotion editor and renderer
```

## Related Repo

[`saga-agentic-ai`](https://github.com/gorkamolero/saga-agentic-ai) is the earlier Python/CrewAI prototype. It decomposes script production into agents for brief, research, outline, draft, critique, final script, and archive. This app is the fuller product expression of that idea.

## Quick Start

Requirements:

- Node.js
- pnpm
- PostgreSQL
- Supabase project for auth
- API keys for the providers you enable

Install:

```bash
pnpm install
cp .env.example .env
```

Fill the local `.env` with database, auth, AI, media, and storage credentials.

Run:

```bash
pnpm dev
```

Database:

```bash
pnpm db:push
```

Build:

```bash
pnpm build
```

## Environment

The app expects credentials for:

- PostgreSQL / Drizzle
- Supabase
- OpenAI
- OpenRouter
- AssemblyAI
- Unsplash
- LemonFox
- Remotion AWS
- S3-compatible storage
- Leia image animation

Use `.env.example` as the template. Do not commit real provider credentials.

## Status

This is a prototype of a full creative-production workflow, not a polished SaaS product.

Working or substantially implemented:

- content data model
- conversational workflow orchestration
- idea/script/voiceover/video entity flow
- prompt system for content creation roles
- transcript-aware visual planning
- Remotion preview/editor structure
- auth and persistence scaffolding

Needs public packaging work:

- Remove or replace any stale public mock media URLs before heavy promotion.
- Add screenshots of the chat flow, saved idea/script UI, and Remotion editor.
- Add a short demo clip from idea to rendered preview.
- Clarify which external providers are required for the current happy path.
- Add seed data or mocked provider adapters for local portfolio review.
- Update package metadata if this remains a public repository despite `"private": true`.

## Portfolio Context

Saga is the strongest storytelling/content-generation proof in the public set. It shows how to turn an open-ended creative process into a constrained production pipeline with roles, state, media artifacts, and an editor.

It belongs next to Sidekick and Anima in the creative AI section: Sidekick is for music producers, Anima is for interactive story worlds, and Saga is for short-form video/story production.

## Built With

- Next.js
- React
- TypeScript
- Vercel AI SDK
- OpenAI / OpenRouter
- tRPC
- Drizzle
- PostgreSQL
- Supabase
- Remotion
- AssemblyAI
- Unsplash
- S3
