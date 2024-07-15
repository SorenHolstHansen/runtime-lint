import assert from "node:assert/strict";
import test from "node:test";
import { runtimeLint } from "../index.js";

test("Detects duplicate responses with the same responses", async () => {
	const onDuplicateResponseDetected = test.mock.fn();
	runtimeLint({
		duplicateResponses: {
			cb: onDuplicateResponseDetected,
		},
	});

	const res1 = await fetch("http://localhost:3000/todos/1");
	await res1.json();

	const res2 = await fetch("http://localhost:3000/todos/1");
	const jsonRes2 = await res2.json();

	jsonRes2.userId;

	assert.strictEqual(onDuplicateResponseDetected.mock.callCount(), 1);
});

test("Detects queries in loops", async () => {
	const onQueriesInLoopsDetected = test.mock.fn();
	runtimeLint({
		queryInLoop: {
			cb: onQueriesInLoopsDetected,
		},
	});

	await fetch("http://localhost:3000/todos/1");
	await fetch("http://localhost:3000/todos/2");
	await fetch("http://localhost:3000/todos/3");

	assert(onQueriesInLoopsDetected.mock.callCount() > 0);
});

test.todo(
	"Doesn't flag queries in loops when there is a reasonable amount of time between the calls",
	async () => {},
);
test.todo("Debounces query in loop flagging", () => {});
test("Detects simple overfetching of simple object (less than half of the keys have been used)", async () => {
	const onUnderuseOfResponseDetected = test.mock.fn();
	runtimeLint({
		overFetching: {
			cb: onUnderuseOfResponseDetected,
		},
	});

	const res = await fetch("http://localhost:3000/todos/5");
	const resJson = await res.json();
	resJson.id;

	setTimeout(() => {
		assert(onUnderuseOfResponseDetected.mock.callCount() > 0);
	}, 1500);
});

test("It doesn't flag overfetching if a lot of the fields are used", async () => {
	const onUnderuseOfResponseDetected = test.mock.fn();
	runtimeLint({
		overFetching: {
			cb: onUnderuseOfResponseDetected,
		},
	});

	const res = await fetch("http://localhost:3000/todos/6");
	const resJson = await res.json();
	resJson.id;
	resJson.title;
	resJson.completed;

	setTimeout(() => {
		assert(onUnderuseOfResponseDetected.mock.callCount() === 0);
	}, 1500);
});

test("Detects simple overfetching of array (too many array elements are being fetched, only the first few have been used)", async () => {
	const onUnderuseOfResponseDetected = test.mock.fn();
	runtimeLint({
		overFetching: {
			cb: onUnderuseOfResponseDetected,
		},
	});

	const res = await fetch("http://localhost:3000/todos");
	const resJson = await res.json();
	resJson[0];

	setTimeout(() => {
		assert(onUnderuseOfResponseDetected.mock.callCount() > 0);
	}, 1500);
});

test("It doesn't flag overfetching if a lot of the entries have been used", async () => {
	const onUnderuseOfResponseDetected = test.mock.fn();
	runtimeLint({
		overFetching: {
			cb: onUnderuseOfResponseDetected,
		},
	});

	const res = await fetch("http://localhost:3000/todos");
	const resJson = await res.json();
	for (let i = 0; i < resJson.length; i++) {
		resJson[i];
	}

	setTimeout(() => {
		assert(onUnderuseOfResponseDetected.mock.callCount() === 0);
	}, 1500);
});
