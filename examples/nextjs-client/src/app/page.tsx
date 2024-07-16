"use client";

import { useEffect, useState } from "react";
import { runtimeLint } from "runtime-lint";

type Post = {
  userId: number;
  id: number;
  title: string;
  body: string;
};

async function getPosts(): Promise<Post[]> {
  const postsRes = await fetch("https://jsonplaceholder.typicode.com/posts");
  const posts: Post[] = await postsRes.json();
  return posts
}

export default function Home() {
  runtimeLint({
    queryInLoop: {
      cb: (urls) => alert(`OH NO! It looks like you are calling ${urls.length} queries in a loop:\n${urls.join("\n")}`)
    }
  })

  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    getPosts().then(setPosts)
  }, [])
  
  return (
    <main>
      <ul>
      {posts.map((post) => (
        <Post key={post.id} post={post} />
      ))}
      </ul>
    </main>
  );
}

type Comment = {
  postId: number;
  id: number;
  name: string,
  email: string,
  body: string;
};

async function getPostComments(postId: number): Promise<Comment[]> {
  const commentsRes = await fetch(`https://jsonplaceholder.typicode.com/posts/${postId}/comments`);
  const comments: Comment[] = await commentsRes.json();
  return comments;
}

function Post({post}: {post: Post}) {
  const [comments, setComments] = useState<Comment[]>([]);
  useEffect(() => {
    getPostComments(post.id).then(setComments)
  }, [post.id])

  return <li>
    {post.title} | {comments.length}
  </li>
}
