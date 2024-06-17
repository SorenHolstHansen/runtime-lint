const test = require("node:test");
const assert = require("node:assert").strict;
const urlsDifferOnlyInOneParam = require("./detectUrlsThatDifferOnlyByParams");

test("Detects similar urls, where only the last url part differ, and they are numbers", () => {
	assert(
		urlsDifferOnlyInOneParam(
			"https://jsonplaceholder.typicode.com/todos/1".split("/"),
			"https://jsonplaceholder.typicode.com/todos/2".split("/"),
		),
	);
});

test("Urls that differ multiple places are not flagged", () => {
	assert(
		!urlsDifferOnlyInOneParam(
			"https://jsonplaceholder.typicode.com/users/1/todos/1".split("/"),
			"https://jsonplaceholder.typicode.com/users/2/todos/2".split("/"),
		),
	);
});

test("Identical urls are not flagged", () => {
	assert(
		!urlsDifferOnlyInOneParam(
			"https://jsonplaceholder.typicode.com/todos/1".split("/"),
			"https://jsonplaceholder.typicode.com/todos/1".split("/"),
		),
	);
});

test("Urls that differ only one place, but where the difference is a normal word is not flagged", () => {
	assert(
		!urlsDifferOnlyInOneParam(
			"https://jsonplaceholder.typicode.com/todos/hi".split("/"),
			"https://jsonplaceholder.typicode.com/todos/there".split("/"),
		),
	);
});

test("Urls that differ only one place, and where the ids are uuid are flagged", () => {
	assert(
		urlsDifferOnlyInOneParam(
			"https://jsonplaceholder.typicode.com/todos/f56bea37-21cb-4511-b330-e8a7d41b4764".split(
				"/",
			),
			"https://jsonplaceholder.typicode.com/todos/2432e2b2-60a7-4b5f-8237-51c52c15134f".split(
				"/",
			),
		),
	);
});

test("Urls that have different base url is not flagged", () => {
	assert(
		!urlsDifferOnlyInOneParam(
			"https://jsonplaceholder.typicode.com/todos/1".split("/"),
			"https://jsonplaceholder2.typicode.com/todos/1".split("/"),
		),
	);
});
