import { Inconsolata } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../src/contexts/AuthContext";

const inconsolata = Inconsolata({
  variable: "--font-inconsolata",
  subsets: ["latin"],
});

export const metadata = {
  title: "bee lee · data & automation developer",
  description: "Brandon Lee Lawrence: business analyst and back-end developer specializing in data and automation for warehousing and fulfillment",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${inconsolata.variable} antialiased`}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}