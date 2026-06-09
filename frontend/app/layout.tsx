import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";

export const metadata: Metadata = {
  title: "Acabar PLC | សេវាកម្មប្រឹក្សាយោបល់ឥណទាន និងហិរញ្ញវត្ថុជាន់ខ្ពស់",
  description: "សេវាកម្មប្រឹក្សាយោបល់ឥណទាន និងហិរញ្ញវត្ថុជាន់ខ្ពស់ ជួយសម្រួលការរៀបចំកញ្ចប់ថវិកា និងយុទ្ធសាស្ត្រគ្រប់គ្រងហានិភ័យប្រកបដោយទំនួលខុសត្រូវ។",
  icons: {
    icon: '/acabar-logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="km" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        {/* Tailwind CSS CDN */}
        <script src="https://cdn.tailwindcss.com"></script>
        <script dangerouslySetInnerHTML={{
          __html: `
            tailwind.config = {
              darkMode: 'class',
              theme: {
                extend: {
                  colors: {
                    brand: {
                      dark: 'var(--foreground)',    /* Slate 900 */
                      navy: '#1e293b',    /* Slate 800 */
                      accent: 'var(--success-text)',  /* Emerald 600 */
                      accentHover: 'var(--success-text)', /* Emerald 700 */
                      muted: 'var(--text-muted)'    /* Slate 500 */
                    }
                  },
                  fontFamily: {
                    sans: ['Kantumruy Pro', 'Inter', 'sans-serif'],
                  }
                }
              }
            }
          `
        }} />
        <script dangerouslySetInnerHTML={{
          __html: `
            try {
              if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                document.documentElement.classList.add('dark');
              } else {
                document.documentElement.classList.remove('dark');
              }
            } catch (_) {}
          `
        }} />
        {/* Google Fonts: Kantumruy Pro for premium Khmer typography */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Kantumruy+Pro:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-slate-50 text-slate-900 font-sans antialiased">
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
