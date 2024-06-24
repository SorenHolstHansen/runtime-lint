export default async function Home() {
  const data = await fetch("https://jsonplaceholder.typicode.com/posts");
  const posts = await data.json();
  return (
    <main>
      <ul>
        {posts.map((post, i) => i < 10 && (
          <Post post={post} key={post.id} />
        ))}
      </ul>
    </main>
  );
}

async function Post({ post }: { post: any }) {
  const data = await fetch(`https://jsonplaceholder.typicode.com/posts/${post.id}/comments`);
  const comments = await data.json();

  return (
    <li>{post.title} {comments.length}</li>
  )

}
