import type { Metadata } from "next";
import "./globals.css";
import RootShell from "@/components/layout/RootShell";

export const metadata: Metadata = {
  title: "CloudNote - 당신의 아이디어를 클라우드에",
  description: "생각을 정리하는 새로운 방법",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@200;300;400;500;600;700;800&family=Noto+Sans+KR:wght@100;300;400;500;700;900&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block"
          rel="stylesheet"
        />
      </head>
      <body>
        <RootShell>{children}</RootShell>
      </body>
    </html>
  );
}
