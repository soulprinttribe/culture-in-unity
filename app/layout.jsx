import "./globals.css";
import { Titan_One, Anton, Inter } from "next/font/google";
import { EVENT } from "@/lib/config";

const titan = Titan_One({ weight: "400", subsets: ["latin"], variable: "--font-display" });
const anton = Anton({ weight: "400", subsets: ["latin"], variable: "--font-label" });
const inter = Inter({ subsets: ["latin"], variable: "--font-body" });

export const metadata = {
  title: EVENT.name + " - " + EVENT.tagline,
  description: EVENT.frame + ". " + EVENT.dateLabel + ", " + EVENT.timeLabel + " at " + EVENT.venueName + ", " + EVENT.venueAddress + ". Hosted by " + EVENT.host + ".",
  openGraph: {
    title: EVENT.name + " - " + EVENT.tagline,
    description: "A 6-hour cultural celebration: meditation, film, fashion, food, dance, art & more. " + EVENT.dateLabel + ", Brooklyn.",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={titan.variable + " " + anton.variable + " " + inter.variable}>
        {children}
      </body>
    </html>
  );
}
