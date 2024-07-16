"use client";

import { runtimeLint } from "runtime-lint";
import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  runtimeLint({
    queryInLoop: {
      cb: (urls) => alert(`OH NO! It looks like you are calling ${urls.length} queries in a loop:\n${urls.join("\n")}`)
    },
    duplicateResponses: {
      cb: (url) => alert("OH NO! You called the same url twice and got the exact same response. Perhaps consider another approach, or a better caching solution")
    },
    overFetching: {
      cb: (url) => alert(`OH NO! You are using very few properties of the response from url ${url}, which means you are fetching unneccessary data.`)
    }
  })
  return (
    <html lang="en">
      <body>
        <ul>
          <li><a href="/">Home</a></li>
          <li><a href="/queries-in-a-loop">Queries in a loop</a></li>
          <li><a href="/duplicate-responses">Duplicate responses</a></li>
          <li><a href="/over-fetching">Over fetching</a></li>
        </ul>
        {children}
        </body>
    </html>
  );
}
