"use client";
import "runtime-lint";
import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ul>
          <li>
            <a href="/">Home</a>
          </li>
          <li>
            <a href="/queries-in-a-loop">Queries in a loop</a>
          </li>
          <li>
            <a href="/duplicate-responses">Duplicate responses</a>
          </li>
          <li>
            <a href="/over-fetching">Over fetching</a>
          </li>
        </ul>
        {children}
      </body>
    </html>
  );
}
