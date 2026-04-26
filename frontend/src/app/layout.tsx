import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FuelFlow | Autonomous Logistics",
  description: "Purely on-chain fuel distribution and logistics automation layer",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased selection:bg-blue-500/30">
        {children}
      </body>
    </html>
  );
}
