Mother APP

app/
├── (marketing)/           # Group for public-facing routes
│   ├── layout.tsx         # Main header/footer wrapper
│   ├── page.tsx           # Homepage (your hero + stats)
│   ├── web/
│   │   ├── page.tsx       # /web (grid listing all web projects)
│   │   └── [slug]/
│   │       └── page.tsx   # /web/nova-studio (dynamic case study)
│   ├── it/
│   │   ├── page.tsx       # /it (services overview + Cat6+ details)
│   │   └── [slug]/        # Optional: deeper IT case studies
│   └── mobile/
│       ├── page.tsx       # /mobile (app showcase)
│       └── [slug]/
├── (dashboard)/           # Optional: future client portal (protected)
│   └── ...
├── api/
│   └── webhook/           # For Sanity/Contentful if you use a CMS
├── actions/
│   └── contact.ts         # Server Actions for form handling
├── components/
│   ├── ui/                # Reusable: Button, Card, Glass-morphism wrapper
│   ├── sections/          # Hero, ServicesGrid, PortfolioGrid
│   └── forms/             # ContactForm component
└── lib/
    ├── content/           # Functions to read MDX files
    └── db/                # Drizzle schema & client
￼

For **Soho Success**, the smartest move is a **hybrid, content-driven architecture** that leverages Next.js 13’s App Router to its fullest. You need a system that makes your portfolio easy to update, your IT service pages highly rankable, and your contact form fully functional—without over-engineering it.

Here’s the award-winning, production-ready architecture I recommend:

---

### 1. The Core Stack (Foundation)
- **Framework**: Next.js 14 (App Router) – since you mentioned 13, the patterns are identical, but 14 is the stable production standard.
- **Language**: TypeScript (strict mode) – catches bugs before they ship and makes your code self-documenting for future collaborators.
- **Styling**: Tailwind CSS + `clsx`/`tailwind-merge` – keeps the polished design you already have, with utility-first speed. Use `next/font` to load Inter (or your chosen font) locally for zero layout shift.
- **Deployment**: Vercel – gives you automatic ISR (Incremental Static Regeneration) and edge functions for global speed.

---

### 2. Data & Content Layer (The "Portfolio Engine")
Since you'll be adding websites, IT projects, and mobile apps, hardcoding them in JSX is a maintenance nightmare. Instead:

- **Content Source**: Use **local MDX files** (via `@next/mdx` or `contentlayer2`) for your case studies. 
- **Why?** You write a single `project.mdx` file with frontmatter (title, category, image, tech stack) and the long-form case study content. Next.js generates the pages at build time.
- **Alternative**: If you want a client-editable dashboard, swap MDX for **Sanity.io** (headless CMS). It has a real-time preview environment that integrates seamlessly with Next.js 13's draft mode.

**Architecture Pattern**: 
`/content/projects/web/nova-studio.mdx` → `generateStaticParams()` → statically renders `/web/nova-studio`. When you add a new project, you just add a new MDX file and rebuild/deploy.

---

### 3. Server Actions (For the Contact & Lead Form)
Instead of creating separate API routes, use **Server Actions** (a stable feature in Next.js 13+).

- **Pattern**: Define an async function in `app/actions/contact.ts` that uses `'use server'`.
- **Validation**: Use **Zod** to validate the form data (name, email, message).
- **Submission**: On form submit, call the Server Action. It securely sends the email via **Resend** (or Nodemailer) and stores the lead in a database.
- **Database**: Use **Vercel Postgres** (powered by Neon) or **Supabase** with **Drizzle ORM**. Drizzle is lighter and works perfectly in edge runtimes, unlike Prisma’s heavy client.

---

### 4. Folder Structure Blueprint (App Router)
Here’s exactly how to organize it to keep your Web, IT, and Mobile sections distinct yet reusable:

```text
app/
├── (marketing)/           # Group for public-facing routes
│   ├── layout.tsx         # Main header/footer wrapper
│   ├── page.tsx           # Homepage (your hero + stats)
│   ├── web/
│   │   ├── page.tsx       # /web (grid listing all web projects)
│   │   └── [slug]/
│   │       └── page.tsx   # /web/nova-studio (dynamic case study)
│   ├── it/
│   │   ├── page.tsx       # /it (services overview + Cat6+ details)
│   │   └── [slug]/        # Optional: deeper IT case studies
│   └── mobile/
│       ├── page.tsx       # /mobile (app showcase)
│       └── [slug]/
├── (dashboard)/           # Optional: future client portal (protected)
│   └── ...
├── api/
│   └── webhook/           # For Sanity/Contentful if you use a CMS
├── actions/
│   └── contact.ts         # Server Actions for form handling
├── components/
│   ├── ui/                # Reusable: Button, Card, Glass-morphism wrapper
│   ├── sections/          # Hero, ServicesGrid, PortfolioGrid
│   └── forms/             # ContactForm component
└── lib/
    ├── content/           # Functions to read MDX files
    └── db/                # Drizzle schema & client
```

---

### 5. Key Architectural Decisions (The "Award-Winning" Touch)

- **Partial Prerendering (PPR)**: If you use Next.js 14 canary/stable, enable PPR. The static shell (header/footer) loads instantly, while the dynamic portfolio list (if connected to a CMS) streams in. This gives you the best of static + dynamic.
- **Metadata API for SEO**: For every `[slug]` page, use `generateMetadata()` to dynamically inject the project title, description, and Open Graph images based on the MDX frontmatter. This guarantees perfect social sharing for your IT and Web case studies.
- **Route Groups for ISR**: If your IT pages change rarely, set `revalidate: 3600` (1 hour) in the `fetch` options inside `it/page.tsx`. This means you don't rebuild the entire site for one small text change—it updates incrementally.
- **Image Component with Remote Patterns**: Configure `next.config.js` to allow remote images from your CMS (if used). For local project screenshots, place them in `/public/projects/` and use the `<Image>` component with `fill` and `sizes` attributes to guarantee perfect Lighthouse scores.

---

### 6. What to Absolutely Avoid
- ❌ **Don't use `'use client'` everywhere**. Keep your landing page, blog, and portfolio listing as Server Components. Only use Client Components for the mobile hamburger menu, the contact form validation (use `useFormState`), and interactive animations.
- ❌ **Don't fetch data on the client for the portfolio**. Use `generateStaticParams` + `fetch` in Server Components. This pre-renders the HTML at build time, so search engines see the full content immediately.

---

### Summary: Why this wins
This architecture is **content-first** (easy to add new mobile apps or IT projects), **SEO-native** (server-rendered metadata and images), and **secure** (Server Actions handle sensitive email logic without exposing API keys). It scales from a solo founder's portfolio to a multi-service agency site, and best of all, it keeps the beautiful glass-morphism design you already have perfectly intact.

Would you like me to outline the exact code for the `generateStaticParams` + MDX reader, or the Server Action for the contact form?
