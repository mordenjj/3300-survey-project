# Working Notes — BAIS:3300 Study Habits Survey

> **Internal document. Not public-facing. Do not commit sensitive credentials.
> Update this file at the end of every development session.**

---

## How to Use This File (For AI Assistants)

1. **Read this entire file first** before writing any code or making suggestions.
2. **Read `README.md` next** for the public-facing project summary, tech stack table, and deployment instructions.
3. **Do not change the folder structure or file naming conventions** without explicit discussion with the developer.
4. **Follow all conventions exactly** as described in the CONVENTIONS section below.
5. **Do not suggest anything listed in "What Was Tried and Rejected"** — those paths have already been explored and abandoned for documented reasons.
6. **Ask before making large structural changes** — this includes moving files, swapping libraries, or changing the routing strategy.
7. **This project was AI-assisted (vibe coded).** Refactor conservatively. Prefer targeted edits over rewrites. If a section of code works, leave it alone unless there is a specific, stated reason to change it.
8. **The color scheme is sea green / aquamarine by the developer's explicit request.** Do not suggest reverting to purple (`#8A3BDB`) or any other color. The current `--primary: 162 67% 27%` is intentional.

---

## Current State

**Last Updated:** 2026-03-26

The app is functional end-to-end. The home page, survey form, and results dashboard all render correctly. Supabase reads and writes are confirmed working with live data. The build (`vite build`) completes successfully without environment variables set, making it safe to run in Azure Static Web Apps CI. The `staticwebapp.config.json` routing fallback is in place.

### What Is Working
- [x] Home page (`/`) with "Take the Survey" and "View Results" navigation
- [x] Survey form (`/survey`) — 4 questions, Zod validation, accessible labels, `aria-describedby` error messages
- [x] Conditional "Other" text input that auto-focuses when the "Other" checkbox is checked
- [x] Supabase insert on form submission (`study_survey_results` table)
- [x] Confirmation / thank-you screen after submission with answers summary
- [x] Results dashboard (`/results`) fetching live data from Supabase
- [x] Three Recharts bar charts: Year in College, Most Popular Study Methods, Top Study Locations
- [x] `countFrequencies()` helper normalizes study method and location labels (trim + lowercase + title-case for display)
- [x] "Other" study method is expanded to its free-text value in the results charts
- [x] Total responses KPI card
- [x] Empty state, loading state, and error state with retry button on results page
- [x] Sea green / aquamarine color theme applied globally via CSS custom properties
- [x] `staticwebapp.config.json` — Azure SWA client-side routing fallback
- [x] `vite build` succeeds without `PORT` or `BASE_PATH` environment variables
- [x] `README.md` generated in project root
- [x] Footer: "Survey by Josh Morden, BAIS:3300 - spring 2026."

### What Is Partially Built
- [ ] `CustomTooltip` in `results.tsx` uses an `any` type for its props — needs proper Recharts `TooltipProps` typing
- [ ] Duplicate submission prevention — currently relies on a `localStorage` flag approach (described in OPEN QUESTIONS); no server-side guard exists

### What Is Not Started
- [ ] CSV export of raw responses for instructor use
- [ ] Instructor-only view for individual responses
- [ ] Dark mode (CSS variables are structured to support it, but no dark theme layer has been added)

---

## Current Task

The last active session focused on (1) recoloring the app from purple to sea green/aquamarine, (2) fixing `vite.config.ts` to not hard-crash on missing `PORT`/`BASE_PATH` so Azure builds succeed, and (3) removing the "Submit Another Response" button from the confirmation screen per developer request. The README.md and this WORKING_NOTES.md were also generated.

**Single next step:** Fix the `CustomTooltip` props type in `results.tsx` — replace `any` with the correct `TooltipProps<number, string>` from `recharts`.

---

## Architecture and Tech Stack

| Technology | Version | Why It Was Chosen |
|---|---|---|
| React | 18 (catalog) | Component model, wide ecosystem, required by Vite template |
| Vite | 7 (catalog) | Fast HMR, native ESM, straightforward static build output |
| TypeScript | 5.x (catalog) | Type safety across hooks, Supabase types, form schema |
| Tailwind CSS | v4 (catalog) | Utility-first; CSS custom property theming makes global recoloring trivial |
| Radix UI | Various (^1–2.x) | Accessible unstyled primitives — Select, RadioGroup, Checkbox, Label |
| Supabase JS | ^2.100.0 | Direct browser PostgreSQL client; eliminates the need for an Express backend |
| Recharts | ^2.15.4 | Composable, React-native chart library; good Tailwind integration via inline styles |
| React Hook Form | ^7.71.2 | Performant uncontrolled form state; pairs cleanly with Zod resolver |
| Zod | (catalog) | Schema validation; single source of truth for form shape and TypeScript types |
| TanStack Query | (catalog) | Server-state caching for Supabase queries and mutations |
| wouter | ^3.3.5 | ~2 KB client-side router; sufficient for a 3-page SPA |
| Framer Motion | (catalog) | Page entrance animations and the AnimatePresence conditional "Other" field |
| Lucide React | (catalog) | Consistent icon set already in template |

---

## Project Structure Notes

```
bais3300-study-survey/
├── artifacts/
│   └── survey-app/                        # The only user-facing artifact
│       ├── public/
│       │   └── staticwebapp.config.json   # Azure SWA SPA routing fallback — do not remove
│       ├── src/
│       │   ├── main.tsx                   # Entry; mounts <App /> with QueryClientProvider
│       │   ├── App.tsx                    # Router with WouterRouter base={BASE_URL}
│       │   ├── index.css                  # ALL theme tokens live here — single source of truth
│       │   ├── pages/
│       │   │   ├── home.tsx               # Landing page
│       │   │   ├── survey.tsx             # Form — all 4 questions, validation, success screen
│       │   │   ├── results.tsx            # Dashboard — 3 charts + KPI
│       │   │   └── not-found.tsx          # 404 fallback
│       │   ├── components/
│       │   │   ├── layout/
│       │   │   │   └── Footer.tsx         # Shared footer with course attribution
│       │   │   └── ui/                    # Radix-based primitives (generated template, do not hand-edit)
│       │   ├── hooks/
│       │   │   ├── use-survey.ts          # useSurveyResults + useSubmitSurvey (TanStack Query)
│       │   │   └── use-toast.ts           # Toast hook (template — not actively used)
│       │   └── lib/
│       │       ├── supabase.ts            # createClient + SurveyResult type
│       │       └── utils.ts              # cn() Tailwind class merge utility
│       ├── vite.config.ts                 # PORT/BASE_PATH have safe defaults — do not reintroduce hard throws
│       └── package.json
├── README.md                              # Public-facing project documentation
└── WORKING_NOTES.md                       # This file
```

**Non-obvious decisions:**
- `src/components/ui/` — generated Radix primitives from the Replit react-vite template. These are not hand-authored. Do not substantially restructure them; they will diverge from any future template updates.
- `countFrequencies()` in `results.tsx` is defined at module scope (not inside the component) to keep it out of the render cycle.
- `CustomTooltip` is defined inside the `Results` component function. This means it gets re-created on every render. It works, but the correct fix is to move it out and type it properly (see KNOWN ISSUES).
- The wouter `Router` in `App.tsx` uses `base={import.meta.env.BASE_URL.replace(/\/$/, "")}` to handle Replit's path-based routing and Azure's root-path deployment simultaneously.

**Files that must not be changed without discussion:**
- `public/staticwebapp.config.json` — removing or altering this breaks Azure SWA routing
- `src/index.css` `:root` block — all color tokens are here; changes propagate everywhere
- `vite.config.ts` — the PORT/BASE_PATH fallback behavior is intentional for Azure compatibility
- `src/lib/supabase.ts` — the `SurveyResult` type must match the actual Supabase table schema exactly

---

## Data / Database

**Provider:** Supabase (PostgreSQL), direct browser client, no Express backend.  
**Project URL:** stored in `VITE_SUPABASE_URL` environment variable.  
**Table:** `public.study_survey_results`

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | `bigint` (identity) | auto | Primary key, auto-generated |
| `created_at` | `timestamptz` | auto | Defaults to `now()` |
| `favorite_study_place` | `text` | yes | Free-text; normalized to title-case in results display only — raw value stored |
| `grade_level` | `text` | yes | One of: Freshman, Sophomore, Junior, Senior |
| `study_hours` | `text` | yes | One of: "Less than 1 hour", "1–2 hours", "2–3 hours", "More than 3 hours" |
| `study_methods` | `text[]` | yes | Array; "Other" is stored as the literal string "Other" |
| `other_study_method` | `text` | no | Nullable; only populated when study_methods includes "Other" |

**RLS Policies required:**
```sql
-- Allow anyone to insert
create policy "Allow public insert"
  on public.study_survey_results for insert with check (true);

-- Allow anyone to read (results are public)
create policy "Allow public select"
  on public.study_survey_results for select using (true);
```

**Supabase TypeScript type** is defined in `src/lib/supabase.ts` as `SurveyResult`. Keep it in sync with the actual table schema. If the schema changes, update the type.

---

## Conventions

### Naming Conventions
- **Files:** `kebab-case` for all files (`use-survey.ts`, `not-found.tsx`)
- **Components:** `PascalCase` named exports (`export default function Survey()`)
- **Hooks:** `use` prefix, camelCase (`useSurveyResults`, `useSubmitSurvey`)
- **Types:** PascalCase, co-located with the code that uses them (`SurveyResult` in `supabase.ts`, `InsertSurveyResult` in `use-survey.ts`)
- **CSS classes:** Tailwind utilities only; no custom class names except in `index.css`
- **Environment variables:** `VITE_` prefix for all browser-accessible vars; never hardcode values in source files

### Code Style
- Functional components only — no class components
- Arrow functions for callbacks; named `function` declarations for top-level components and hooks
- `const` by default; `let` only when reassignment is required
- No `any` types — use proper TypeScript types or create an interface/type alias
- Imports ordered: React → third-party → workspace (`@/`) → relative
- No `console.log` in committed code; `console.warn` is acceptable for environment checks (see `supabase.ts`)

### Framework Patterns
- **Forms:** React Hook Form + Zod resolver. Schema defined once with `z.object()`, inferred with `z.infer<typeof schema>`. `Controller` used only for controlled inputs (checkboxes). Native `register` for uncontrolled inputs.
- **Data fetching:** TanStack Query only. No raw `useEffect`/`useState` for server data.
- **Routing:** wouter `<Link>` for navigation, `useLocation` hook for programmatic navigation if needed.
- **Animations:** Framer Motion `<motion.div>` with `initial`/`animate`/`exit`. `<AnimatePresence mode="wait">` for conditional children.
- **Styling:** Tailwind utility classes. Color tokens via CSS custom properties (`hsl(var(--primary))`), not hardcoded hex values.

### Git Commit Style
```
type: short imperative description (≤72 chars)

Optional body paragraph if non-obvious.
```
Types: `feat`, `fix`, `style`, `refactor`, `docs`, `chore`

Examples:
- `feat: add conditional Other text input to study methods question`
- `fix: remove hard PORT/BASE_PATH throws from vite.config.ts`
- `style: recolor theme from purple to sea green/aquamarine`
- `docs: generate README.md and WORKING_NOTES.md`

---

## Decisions and Tradeoffs

- **No Express backend.** Supabase JS client is used directly from the browser with anonymous key + RLS. This keeps the deployment to pure static files (Azure Static Web Apps free tier). Do not suggest adding a backend unless the data model requires server-side secrets that cannot be in RLS.
- **wouter over React Router.** The app has 3 routes. React Router adds ~50 KB for functionality not needed here. Do not suggest migrating to React Router.
- **Sea green / aquamarine color scheme.** Developer explicitly changed from the original purple (`#8A3BDB`) to sea green (`hsl(162, 67%, 27%)`) with aquamarine tints. This is a permanent design decision.
- **`study_methods` stored as `text[]`.** This means "Other" is stored as the literal string "Other" and the free-text description goes in a separate column (`other_study_method`). The results page re-joins them for display. This allows structured querying of known methods while preserving free-text.
- **No server-side duplicate prevention.** A `localStorage` flag is the planned lightweight approach. A session-based or hash-based approach was considered but deferred (see OPEN QUESTIONS).
- **Build output in `dist/public`.** The `outDir` is set to `dist/public` (not the default `dist`) so the Azure SWA `output_location` can be set to `dist/public` while `app_location` is `artifacts/survey-app`. Do not change this path.
- **`vite.config.ts` uses safe defaults for PORT and BASE_PATH.** Previously hard-threw errors if these were missing. Changed to fallback to `5173` and `/` so `vite build` works in Azure CI without those vars. Do not reintroduce the hard throws.
- **Replit-specific plugins are gated on `REPL_ID`.** `runtimeErrorOverlay`, `cartographer`, and `devBanner` are only loaded when `process.env.REPL_ID` is defined. They are excluded from production Azure builds automatically.

---

## What Was Tried and Rejected

- **Express / Node.js backend** — eliminated early; Supabase RLS provides sufficient access control for a single-table public survey. Adding a backend would require a second Azure service (App Service or Container Apps) and is out of scope for a static survey.
- **Hard-throwing on missing `PORT`/`BASE_PATH` in `vite.config.ts`** — caused Azure CI builds to fail immediately. Replaced with safe defaults.
- **Purple accent color (`#8A3BDB` / `hsl(271, 68%, 54%)`)** — was the original template default. Developer explicitly replaced with sea green. Do not suggest reverting.
- **`Submit Another Response` button** — was present on the confirmation screen. Developer explicitly requested removal. Do not suggest adding it back.

---

## Known Issues and Workarounds

### `CustomTooltip` uses `any` type
**Problem:** `CustomTooltip` in `results.tsx` is typed as `(...: any)` to avoid fighting Recharts' tooltip prop types.  
**Workaround:** None currently — it functions correctly at runtime.  
**Fix needed:** Type the component as `React.FC<TooltipProps<number, string>>` from `'recharts'`. Do not remove this note until the fix is applied.  
**Do not remove the `CustomTooltip` itself** — it is used by all three charts.

### No duplicate submission guard
**Problem:** A student can submit the survey multiple times by revisiting `/survey`.  
**Workaround:** None currently. The confirmation screen no longer shows a "Submit Another Response" button (removed by developer), which reduces accidental re-submissions from the same session.  
**Planned fix:** Set a `localStorage` key on successful submission; redirect to a "You've already responded" screen on page load if the key exists.  
**Do not implement server-side duplicate detection** without discussing the approach first (see OPEN QUESTIONS).

### Results charts blank below 1 distinct value
**Problem:** Charts render but appear visually empty when fewer than 2 distinct values exist in a category.  
**Workaround:** None. The data is technically correct, just visually misleading.  
**Planned fix:** Add a minimum-data notice below each chart if its dataset has fewer than 2 entries.

### `study_methods` labels are case-normalized only at display time
**Problem:** If two respondents enter "flashcards" and "Flashcards" via the "Other" field, they are merged by `countFrequencies()`. However, the raw values in the database differ. This is by design but means the DB is not clean.  
**Workaround:** `countFrequencies()` lowercases before counting and title-cases for display. This is intentional.  
**Do not remove** the `toLowerCase().trim()` step in `countFrequencies()`.

---

## Browser / Environment Compatibility

### Front-End
- **Tested in:** Chrome 122+, Safari 17+, Firefox 124+ (Replit browser preview)
- **Expected support:** All modern evergreen browsers (ES2020+, CSS custom properties)
- **Known incompatibilities:** `has-[:checked]` CSS selector used for radio/checkbox row highlighting — not supported in Firefox < 121. Rows still function; only the background highlight is missing.
- **Mobile:** Responsive layout tested at 375px (iPhone SE) and 768px (iPad) breakpoints via browser DevTools.

### Back-End / Build Environment
- **OS:** Linux (NixOS on Replit; Ubuntu on Azure Static Web Apps CI runner)
- **Node.js:** 20+ (required by Vite 7)
- **Package manager:** pnpm 9+ (monorepo managed via `pnpm-workspace.yaml`)
- **Required env vars at build time:** `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (must be injected during `vite build`; they are baked into the static bundle — not available at runtime)
- **Optional env vars:** `PORT` (dev server, defaults to 5173), `BASE_PATH` (router base, defaults to `/`)

---

## Open Questions

- [ ] **Duplicate submission strategy:** Should the `localStorage` flag be keyed per-course-term (e.g., `bais3300_spring2026_submitted`) so that if the survey is reused next semester the flag doesn't carry over? Decide before implementing.
- [ ] **RLS row-level security for selects:** Currently anyone with the anon key can read all raw responses. Is that acceptable, or should the select policy be restricted to aggregates only? (Aggregates can't be enforced at the RLS level — would require a database view + separate policy.)
- [ ] **Azure deployment environment variables:** The `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` values must be added as **repository secrets** in GitHub Actions (not Azure application settings), because Vite bakes them in at build time. Confirm this with the developer before the first production deploy.
- [ ] **Study hours field type:** Currently stored as a text string ("1–2 hours"). If numeric analysis is ever needed (average study hours), this would need to be migrated to a numeric column or a lookup table. Decide before adding any analytics features.

---

## Session Log

### 2026-03-26
**Accomplished:**
- Recolored entire app from purple (`hsl(271, 68%, 54%)`) to sea green/aquamarine (`--primary: 162 67% 27%`), updating all CSS custom properties in `index.css` including background tint, borders, muted surfaces, and all 5 chart color tokens
- Fixed `vite.config.ts` to use safe defaults for `PORT` (5173) and `BASE_PATH` (`/`) instead of hard-throwing; gated all Replit-specific Vite plugins behind `REPL_ID` check; confirmed `vite build` succeeds without environment variables
- Removed "Submit Another Response" button from confirmation screen per developer request; cleaned up unused `handleReset`, `reset`, `useRef`, and `ArrowLeft` imports
- Generated `README.md` in project root with all 16 required sections
- Generated `WORKING_NOTES.md` (this file) in project root
- Answered developer question about Azure Static Web Apps deployment: explained that `VITE_*` env vars must be injected at build time via GitHub Actions secrets (not Azure application settings), and provided the workflow YAML pattern with `skip_app_build: true`

**Left incomplete:**
- `CustomTooltip` in `results.tsx` still uses `any` type — needs proper `TooltipProps<number, string>` typing
- `localStorage`-based duplicate submission guard not yet implemented

**Decisions made:**
- Sea green color scheme is permanent; do not suggest reverting
- No "Submit Another Response" button; this is intentional

**Next step:** Fix `CustomTooltip` typing in `results.tsx`.

---

## Useful References

- [Supabase JavaScript Client docs](https://supabase.com/docs/reference/javascript/introduction) — insert, select, RLS setup
- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security) — policy syntax
- [Recharts API](https://recharts.org/en-US/api) — BarChart, Bar, Cell, Tooltip, ResponsiveContainer props
- [Recharts `TooltipProps` type](https://github.com/recharts/recharts/blob/master/src/component/Tooltip.tsx) — needed to fix the `any` type in `CustomTooltip`
- [TanStack Query v5 docs](https://tanstack.com/query/latest/docs/framework/react/overview) — useQuery, useMutation, QueryClient
- [React Hook Form + Zod](https://react-hook-form.com/get-started#SchemaValidation) — zodResolver, Controller
- [wouter routing](https://github.com/molefrog/wouter) — Link, useLocation, Router base prop
- [Azure Static Web Apps — SPA routing](https://learn.microsoft.com/en-us/azure/static-web-apps/configuration#fallback-routes) — `navigationFallback` in `staticwebapp.config.json`
- [Azure Static Web Apps — GitHub Actions deploy](https://learn.microsoft.com/en-us/azure/static-web-apps/github-actions-workflow) — workflow YAML, `skip_app_build`, `output_location`
- [Tailwind CSS v4 — CSS custom properties](https://tailwindcss.com/docs/theme#using-css-variables) — `hsl(var(--primary))` pattern
- **AI tools used:** Replit AI (Claude) — initial scaffold, Recharts integration, Supabase hooks, Azure deployment guidance, README/WORKING_NOTES generation. All generated code was reviewed by the developer. Treat AI-generated sections (especially `src/components/ui/`) as generated artifacts, not hand-authored code.
