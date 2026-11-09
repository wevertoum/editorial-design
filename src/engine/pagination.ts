/**
 * Pagination stays outside React. Replace this descriptor together with
 * scripts/build-pdf.ts when adopting another engine.
 * Flags listed here were read from Vivliostyle CLI 11.4.0 `build --help`.
 */
export const paginationEngine = {
  id: 'vivliostyle-cli',
  packageName: '@vivliostyle/cli',
  digitalCommand: 'npm run pdf:digital',
  printCommand: 'npm run pdf:print',
  limitations: [
    'Digital and print PDFs are both rendered by Vivliostyle CLI through Chromium.',
    'The PDF input is static HTML prerendered from the React tree. Vivliostyle does not reflow a root filled in later by a client script.',
    'The print command adds crop marks and the bleed distance declared in src/styles/print.css. It does not convert RGB to CMYK, does not embed an ICC profile, and does not run PDF/X preflight.',
    'The CLI documents --press-ready and --cmyk. This project does not pass them, and a successful build is not a print certification.',
  ],
} as const
