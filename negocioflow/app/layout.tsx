import "./globals.css";

export const metadata = {
  title: "NegocioFlow — Entiende cuánto realmente gana tu negocio",
  description: "Registra tus ventas, controla tus gastos y descubre dónde está realmente tu dinero.",
};

export const viewport = {
  themeColor: "#059669",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ fontFamily: "'Inter', -apple-system, sans-serif", margin: 0 }}>{children}</body>
    </html>
  );
}
