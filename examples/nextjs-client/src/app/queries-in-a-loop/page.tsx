"use client";

import React from "react";
import { useEffect, useState } from "react";
import type { Comment, Post } from "../../types";

async function getPosts(): Promise<Post[]> {
  const postsRes = await fetch("https://jsonplaceholder.typicode.com/posts");
  const posts: Post[] = await postsRes.json();
  return posts
}

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    getPosts().then(setPosts)
  }, [])
  
  return (
    <main>
      <ul>
      {posts.map((post) => (
        <PostComponent key={post.id} post={post} />
      ))}
      </ul>
    </main>
  );
}

async function getPostComments(postId: number): Promise<Comment[]> {
  const commentsRes = await fetch(`https://jsonplaceholder.typicode.com/posts/${postId}/comments`);
  const comments: Comment[] = await commentsRes.json();
  // Doing this weird loop just to access the fields of the comments so an overFetching alert is not shown
  for (const comment of comments) {
    comment.body;
    comment.email;
    comment.id;
  }
  return comments;
}

function PostComponent({post}: {post: Post}) {
  const [comments, setComments] = useState<Comment[]>([]);
  useEffect(() => {
    getPostComments(post.id).then(setComments)
  }, [post.id])

  return <li>
    {post.title} {post.id} {post.userId} | {comments.length}
  </li>
}
