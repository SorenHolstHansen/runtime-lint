import assert from "node:assert/strict";
import test from "node:test";
import { runtimeLint } from "../../../index.js";

test("It doesn't flag overfetching if a lot of the fields are used for the default heuristic", async () => {
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

test("Detects simple overfetching of array (too many array elements are being fetched, only the first few have been used) for the default heuristic", async () => {
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

test("It doesn't flag overfetching if a lot of the entries have been used for the default heuristic", async () => {
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
