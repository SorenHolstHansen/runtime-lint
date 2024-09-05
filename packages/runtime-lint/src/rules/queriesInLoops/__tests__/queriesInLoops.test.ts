import assert from "node:assert/strict";
import test from "node:test";
import { runtimeLint } from "../../../index.js";

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

	setTimeout(() => {
		assert(onQueriesInLoopsDetected.mock.callCount() > 0);
	}, 1500);
});

test.todo(
	"Doesn't flag queries in loops when there is a reasonable amount of time between the calls",
	async () => {},
);
test.todo("Debounces query in loop flagging", () => {});
