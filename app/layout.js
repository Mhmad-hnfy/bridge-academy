import { Cairo } from "next/font/google";
import "./globals.css";
import HeaderWrapper from "@/_Components/HeaderWrapper";
import WhatsAppButton from "@/Components/WhatsAppButton";
import { GlobalProvider } from "@/lib/store";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata = {
  title: "Bridge Academy — Faculty of Engineering",
  description: "Your path to excellence in Engineering Mathematics",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <link rel="icon" href="/icon.png" />
      <body className={`${cairo.className} antialiased`}>
        <GlobalProvider>
          <HeaderWrapper />
          {children}
          <WhatsAppButton />
        </GlobalProvider>
      </body>
    </html>
  );
}
