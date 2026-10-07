export const metadata = {
  title: "Event Experience – Cubiqo × MonicaLoov.ai",
  description: "En digital eventupplevelse direkt i mobilen. Digital Experience powered by MonicaLoov.ai.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#070a10",
};

export default function RootLayout({ children }) {
  return (
    <html lang="sv">
      <body style={{ margin: 0, background: "#070a10" }}>{children}</body>
    </html>
  );
}
