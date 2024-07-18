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
		getPost().then(setPost);
	}, []);

	return (
		<main>
			<h1>Using too little of the response</h1>
			{post?.title}
		</main>
	);
}
