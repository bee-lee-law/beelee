import { Inconsolata } from "next/font/google";
import "./globals.css";

const inconsolata = Inconsolata({
  variable: "--font-inconsolata",
  subsets: ["latin"],
});

export const metadata = {
  title: "Bee Lee",
  description: "Portfolio showcasing my work and projects",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${inconsolata.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}