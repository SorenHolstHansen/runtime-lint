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
