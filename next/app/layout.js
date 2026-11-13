import './globals.css';

export const metadata = {
  title: 'LK-TECH | Construire, digitaliser et connecter vos projets',
  description:
    "LK-TECH accompagne vos projets en construction, solutions digitales et énergie renouvelable. Goma, Nord-Kivu, RDC.",
  icons: { icon: '/favicon.svg' }
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
