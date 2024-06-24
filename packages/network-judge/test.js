const { networkJudge } = require("./index");
const test = require("node:test");
const assert = require("node:assert").strict;

test("Detects duplicate responses with the same responses", async () => {
	const onDuplicateResponseDetected = test.mock.fn();
	networkJudge({
		onDuplicateResponseDetected,
		// Just to silence the console log
		queryInLoopThreshold: () => { },
	});

	const res1 = await fetch("https://jsonplaceholder.typicode.com/todos/1");
	await res1.json();

	const res2 = await fetch("https://jsonplaceholder.typicode.com/todos/1");
	const jsonRes2 = await res2.json();

	jsonRes2.userId;

	assert.strictEqual(onDuplicateResponseDetected.mock.callCount(), 1);
});

test("Detects queries in loops", async () => {
	const onQueriesInLoopsDetected = test.mock.fn();
	networkJudge({ onQueriesInLoopsDetected });

	await fetch("https://jsonplaceholder.typicode.com/todos/1");
	await fetch("https://jsonplaceholder.typicode.com/todos/2");
	await fetch("https://jsonplaceholder.typicode.com/todos/3");

	assert(onQueriesInLoopsDetected.mock.callCount() > 0);
});

// test("Doesn't flag queries in loops when there is a reasonable amount of time between the calls", async () => { });
// test("Debounces query in loop flagging", () => { });
// test("Detects simple overfetching of array (too many array elements are being fetched, only the first few have been used)", () => { });
// test("Detects simple overfetching of simple object (only half of the keys have been used)", () => { });
// test("", () => { });
