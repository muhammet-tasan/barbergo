import { ScrollViewStyleReset } from 'expo-router/html';
import { type PropsWithChildren } from 'react';

/**
 * Root HTML for the static web export (web only).
 * Keeps the page background dark everywhere (overscroll, address-bar resize, areas below the
 * app view on mobile browsers) so the white browser default never shows through.
 */
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="de" style={{ backgroundColor: '#0F172A' }}>
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover"
        />
        <meta name="theme-color" content="#0F172A" />
        <ScrollViewStyleReset />
        <style
          dangerouslySetInnerHTML={{
            __html: `
html, body { background-color: #0F172A; min-height: 100%; }
body { overscroll-behavior: none; }
#root { background-color: #0F172A; min-height: 100vh; min-height: 100dvh; }
@supports (height: 100dvh) { html, body, #root { height: 100dvh; } }
`,
          }}
        />
      </head>
      <body style={{ backgroundColor: '#0F172A' }}>{children}</body>
    </html>
  );
}
