# BAIS:3300 Study Habits Survey

## Description

A web-based survey application that collects and visualizes study habit data from undergraduate business students enrolled in BAIS:3300 at the University of Iowa. Students answer four short questions about where they study, their year in school, how many hours they study per day, and which study methods they rely on. Responses are stored in a live PostgreSQL database and aggregated into interactive charts on a public results dashboard — giving both the instructor and students an at-a-glance view of class-wide study patterns.

## Badges

![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Azure](https://img.shields.io/badge/Azure_Static_Web_Apps-0078D4?style=for-the-badge&logo=microsoftazure&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

## Features

- **Four-question survey** covering study location, grade level, daily study hours, and preferred study methods — completable in under two minutes
- **"Other" study method** — selecting the Other checkbox reveals a free-text field that auto-focuses so students can describe their own method without leaving the keyboard
- **Client-side validation** powered by Zod and React Hook Form, with accessible error messages linked to each input via `aria-describedby`
- **Live results dashboard** that fetches all responses from Supabase in real time and renders three Recharts visualizations: Year in College (vertical bar), Most Popular Study Methods (horizontal bar), and Top Study Locations (horizontal bar)
- **No login required** — students open the link and respond immediately; the public Supabase anon key is scoped by Row-Level Security policies
- **Accessible UI** — all form controls have associated `<label>` elements, keyboard-navigable radio/checkbox groups, and WCAG AA–compliant sea green color contrast
- **Azure Static Web Apps ready** — `staticwebapp.config.json` configures client-side routing fallback so direct links to `/survey` and `/results` never 404 in production
- **Instant page transitions** using Framer Motion, giving the app a polished, app-like feel without a full framework

## Tech Stack

| Technology | Purpose |
|---|---|
| React 18 | Component-based UI |
| Vite 6 | Build tool and dev server |
| TypeScript | Static typing across all source files |
| Tailwind CSS v4 | Utility-first styling with CSS variable theming |
| Radix UI | Accessible, unstyled primitive components (Select, RadioGroup, Checkbox, Label) |
| Supabase JS v2 | Browser-side PostgreSQL client — inserts and selects without a backend |
| Recharts 2 | Composable chart library for bar charts on the results page |
| React Hook Form + Zod | Form state management and schema validation |
| TanStack Query | Server-state caching for Supabase data fetching and mutations |
| wouter | Lightweight client-side router (~2 KB) |
| Framer Motion | Page entrance animations |
| Lucide React | Icon set |
| Azure Static Web Apps | Hosting and CDN for the production build |

## Getting Started

### Prerequisites

- [Node.js 20+](https://nodejs.org/en/download) — JavaScript runtime
- [pnpm 9+](https://pnpm.io/installation) — Package manager used by this monorepo
- A [Supabase](https://supabase.com) project with the `study_survey_results` table created (SQL provided below)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/joshmorden/bais3300-study-survey.git
   cd bais3300-study-survey
   ```

2. **Install dependencies** (installs all workspace packages at once)
   ```bash
   pnpm install
   ```

3. **Set environment variables** — create `artifacts/survey-app/.env.local`:
   ```bash
   VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
   VITE_SUPABASE_ANON_KEY=<your-anon-key>
   ```

4. **Create the Supabase table** — run the following SQL in the Supabase SQL editor:
   ```sql
   create table public.study_survey_results (
     id            bigint generated always as identity primary key,
     created_at    timestamptz default now() not null,
     favorite_study_place text not null,
     grade_level   text not null,
     study_hours   text not null,
     study_methods text[] not null,
     other_study_method text
   );

   -- Allow anyone to insert a response
   alter table public.study_survey_results enable row level security;
   create policy "Allow public insert"
     on public.study_survey_results for insert
     with check (true);

   -- Allow anyone to read aggregated results
   create policy "Allow public select"
     on public.study_survey_results for select
     using (true);
   ```

5. **Start the development server**
   ```bash
   pnpm --filter @workspace/survey-app run dev
   ```

   The app is now running at `http://localhost:5173`.

## Usage

| Route | Description |
|---|---|
| `/` | Home page — introduction and navigation to survey and results |
| `/survey` | Four-question survey form; submits to Supabase on completion |
| `/results` | Aggregated results dashboard with three Recharts bar charts |

**Configuration options** are controlled entirely via the two environment variables in `.env.local`. No other runtime config is needed for the frontend. To point to a different Supabase project (e.g., a staging environment), swap those two values and restart the dev server.

**Build for production:**
```bash
pnpm --filter @workspace/survey-app run build
# Output lands in artifacts/survey-app/dist/
```

**Deploy to Azure Static Web Apps:**  
The `public/staticwebapp.config.json` file is included and configures the `/*` → `/index.html` fallback route. Connect the repo to an Azure Static Web App resource and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as application settings in the Azure portal.

## Project Structure

```
bais3300-study-survey/
├── artifacts/
│   └── survey-app/                   # React + Vite frontend artifact
│       ├── public/
│       │   └── staticwebapp.config.json  # Azure SWA client-side routing fallback
│       ├── src/
│       │   ├── main.tsx              # React DOM entry point
│       │   ├── App.tsx               # Root component with wouter Router and QueryClientProvider
│       │   ├── index.css             # Global CSS variables (sea green/aquamarine theme) + Tailwind
│       │   ├── pages/
│       │   │   ├── home.tsx          # Landing page with navigation CTAs
│       │   │   ├── survey.tsx        # Four-question survey form with validation
│       │   │   ├── results.tsx       # Live results dashboard with three bar charts
│       │   │   └── not-found.tsx     # 404 fallback page
│       │   ├── components/
│       │   │   ├── layout/
│       │   │   │   └── Footer.tsx    # "Survey by Josh Morden, BAIS:3300 - spring 2026."
│       │   │   └── ui/               # Radix-based primitive components (button, input, select…)
│       │   ├── hooks/
│       │   │   ├── use-survey.ts     # TanStack Query hooks: useSubmitSurvey + useSurveyResults
│       │   │   └── use-toast.ts      # Toast notification hook
│       │   └── lib/
│       │       ├── supabase.ts       # Supabase browser client initialisation
│       │       └── utils.ts          # Tailwind class merging utility (cn)
│       ├── package.json              # Workspace package manifest
│       └── vite.config.ts            # Vite config with Tailwind plugin and base path
├── package.json                      # pnpm workspace root
├── pnpm-workspace.yaml               # Workspace glob definitions
└── README.md                         # This file
```

## Changelog

### v1.0.0 — 2026-03-26

- Initial release of the BAIS:3300 Study Habits Survey app
- Four-question survey form with Zod validation, accessible labels, and conditional "Other" text input
- Live Supabase PostgreSQL integration — no backend server required
- Results dashboard with three Recharts visualizations (grade level, study methods, study locations)
- Sea green and aquamarine color theme applied across all pages
- Azure Static Web Apps routing configuration included
- Framer Motion page transitions and Radix UI accessible primitives

## Known Issues / To-Do

- [ ] The results charts show a blank state if fewer than two distinct responses exist — add a minimum-data notice so it's clear the charts will populate once more students respond
- [ ] The "Other" free-text study method is currently stored as a raw string; normalization (trimming, lowercasing) happens only on the client display, not at the database level
- [ ] No duplicate-submission prevention — a student can submit the survey multiple times; consider adding a `localStorage` flag or a session-based guard to discourage repeat entries
- [ ] The results page is fully public; there is no instructor-only view for raw individual responses

## Roadmap

- **Export to CSV** — let the instructor download a spreadsheet of all raw responses directly from the results page
- **Demographic breakdowns** — cross-tabulate study hours against grade level so the instructor can spot patterns by year
- **Anonymous response toggle** — optionally capture a hashed student ID to prevent duplicate submissions without storing personally identifiable information
- **Dark mode** — respect the `prefers-color-scheme` media query; CSS variables are already structured for an easy dark-mode layer
- **Shareable results link** — generate a short URL that pre-selects a specific chart for sharing on social media or in a class presentation

## Contributing

This project was built for a single course section, but improvements and bug fixes are welcome. Please open an issue to discuss any significant changes before submitting a pull request. All contributions should maintain the existing accessibility standards and Supabase-only architecture (no Express backend).

1. Fork the repository on GitHub
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes and run `pnpm --filter @workspace/survey-app run typecheck` to verify types
4. Commit with a descriptive message: `git commit -m "feat: describe your change"`
5. Push to your fork: `git push origin feature/your-feature-name`
6. Open a Pull Request against the `main` branch and describe what you changed and why

## License

This project is licensed under the [MIT License](LICENSE). You are free to use, copy, modify, and distribute this software for any purpose, including commercial use, provided the original copyright notice is retained.

## Author

**Josh Morden**  
University of Iowa — Tippie College of Business  
BAIS:3300 — Business Analytics and Information Systems, Spring 2026

## Contact

GitHub: [github.com/joshmorden](https://github.com/joshmorden)

## Acknowledgements

- [Supabase](https://supabase.com/docs) — documentation for the JavaScript client, Row-Level Security policies, and the free-tier PostgreSQL database
- [Recharts](https://recharts.org) — composable chart components that made the results dashboard straightforward to build
- [Radix UI](https://www.radix-ui.com) — accessible, unstyled primitives that handle keyboard navigation and ARIA roles out of the box
- [TanStack Query](https://tanstack.com/query) — server-state management that simplified the Supabase fetch/mutate lifecycle
- [Tailwind CSS](https://tailwindcss.com) — utility classes and the CSS variable theming system used for the sea green/aquamarine color scheme
- [shields.io](https://shields.io) — badge generation for this README
- [Azure Static Web Apps documentation](https://learn.microsoft.com/en-us/azure/static-web-apps/) — guidance on the `staticwebapp.config.json` routing fallback
- **Replit AI (Claude)** — assisted with scaffolding the initial component structure, Supabase hook patterns, and Recharts configuration
