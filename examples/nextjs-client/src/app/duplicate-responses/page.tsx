"use client";

import React, { useEffect, useState } from "react";
import type { Post } from "../../types";

async function getPost() {
    const postRes = await fetch("https://jsonplaceholder.typicode.com/posts/1");
    const post: Post = await postRes.json();
    return post;
}

export default function DuplicateResponses() {
    const [post, setPost] = useState<Post | undefined>();

    useEffect(() => {
        getPost().then(setPost)
    }, []);

    const [post2, setPost2] = useState<Post | undefined>();

    useEffect(() => {
        getPost().then(setPost2)
    }, []);

  return (
    <main>
    <h1>First post</h1>
        {post?.id}
      {post?.title}
      {post?.body}

      <h1>Second post</h1>
        {post2?.id}
        {post2?.title}
        {post2?.body}
    </main>
  );
}
