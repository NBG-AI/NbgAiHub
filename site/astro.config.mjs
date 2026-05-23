// site/astro.config.mjs
//
// Astro 6 + Starlight 0.39 configuration for NbgAiHub.
// See docs/design/project-design.md §S.6.1 for the contract.

import { defineConfig, fontProviders } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  // CLAUDE.md → Ports: dev server pinned to 4321.
  // CLI flag `--port 4322` is the escape hatch on collision (don't edit this).
  server: { port: 4321, host: false },

  // The floating Astro dev dock interferes with UAT screenshots and isn't
  // useful in this project (we're not editing Astro internals live). Off.
  devToolbar: { enabled: false },

  // P4.B — Astro Fonts API. Stable since Astro 6.0.0 (we are on 6.3.5).
  // See docs/research/astro-fonts-api-experimental-stability.md and
  // project-design.md §S.13.3.
  // The CSS variables --nbg-font-body and --nbg-font-mono are referenced
  // by tokens/primitives.css (--nbg-ff-body / --nbg-ff-mono) and aliased
  // to --sl-font / --sl-font-mono in tokens/aliases.css so all Starlight
  // chrome inherits the new typography.
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: 'Inter',
      cssVariable: '--nbg-font-body',
      weights: ['100 900'],
      styles: ['normal', 'italic'],
      subsets: ['latin', 'latin-ext'],
      display: 'swap',
      variationSettings: "'opsz' 14",
      fallbacks: [
        'ui-sans-serif',
        'system-ui',
        '-apple-system',
        'BlinkMacSystemFont',
        'Segoe UI',
        'Roboto',
        'sans-serif',
      ],
      optimizedFallbacks: true,
    },
    {
      provider: fontProviders.fontsource(),
      name: 'JetBrains Mono',
      cssVariable: '--nbg-font-mono',
      weights: ['100 800'],
      styles: ['normal', 'italic'],
      subsets: ['latin', 'latin-ext'],
      display: 'swap',
      fallbacks: [
        'ui-monospace',
        'SFMono-Regular',
        'Menlo',
        'Monaco',
        'Consolas',
        'monospace',
      ],
      optimizedFallbacks: true,
    },
  ],

  integrations: [
    starlight({
      // Brand display name. The repo/package identifier remains `NbgAiHub`
      // (locked code-side), but every user-visible surface — sticky bar
      // brand, browser tab, SiteTitle on content-detail pages — renders
      // the spaced form "NBG AI Hub".
      title: 'NBG AI Hub',
      description: 'A field manual for newcomers to Claude Code.',
      customCss: [
        './src/styles/tokens/index.css',
        './src/styles/motion.css',
        './src/styles/content-prose.css',
        './src/styles/content-chrome.css',
      ],
      components: {
        // Header override (2026-05-19 unified-header refactor): on splash
        // pages, SplashAwareHeader renders ONE unified nbg-topnav (brand +
        // sections + Pagefind search + AuthControls + ThemeSelect + mobile
        // drawer + SignInModal). On content-detail pages it renders the
        // default Starlight Header markup, so SocialIcons is still slotted
        // there. Reverses the earlier "Header override rejected as fragile"
        // decision in project-design.md §S.13.14; new contract in §S.13.6.1.
        Header: './src/components/SplashAwareHeader.astro',
        // SocialIcons remains slotted into the default Starlight Header on
        // content-detail (non-splash) pages. On splash pages,
        // SocialIconsOverride internally short-circuits and renders nothing
        // because AuthControls + SignInModal are mounted by SplashAwareHeader.
        SocialIcons: './src/components/SocialIconsOverride.astro',
      },
      sidebar: [
        { label: 'Home', link: '/' },
        { label: 'My Pins', link: '/my-pins/' },
        {
          label: 'Start Here',
          collapsed: false,
          items: [
            { label: 'Day 1', link: '/start-here/day-1/' },
            { label: 'Week 1 (coming soon)', link: '/start-here/week-1/' },
          ],
        },
        { label: 'News', link: '/news/' },
        { label: 'Skills', link: '/skills/' },
        { label: 'Tips & Tricks', link: '/tips/' },
        { label: 'Glossary', link: '/glossary/' },
        { label: 'Reference', link: '/reference/' },
        {
          label: 'Contribute',
          collapsed: false,
          items: [
            { label: 'How to contribute', link: '/contribute/' },
            { label: 'Submit a Skill', link: '/submit-skill/' },
          ],
        },
      ],
    }),
  ],
});
