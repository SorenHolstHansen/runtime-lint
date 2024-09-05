import assert from "node:assert/strict";
import test from "node:test";
import { detectUrlFamilies, detectUrlFamily } from "../detectUrlFamilies.js";

function testUrlFamily(
	url1: string,
	url2: string,
	expected: string | undefined,
) {
	assert.equal(detectUrlFamily(new URL(url1), new URL(url2)), expected);
}

test("Detects similar urls, where only the last url part differ, and they are numbers", () => {
	testUrlFamily(
		"https://www.example.com/todos/1",
		"https://www.example.com/todos/2",
		"https://www.example.com/todos/{PARAM}",
	);
});

test("Urls that differ multiple places are not flagged", () => {
	testUrlFamily(
		"https://www.example.com/users/1/todos/1",
		"https://www.example.com/users/2/todos/2",
		undefined,
	);
});

test("Identical urls are not flagged", () => {
	testUrlFamily(
		"https://www.example.com/todos/identical",
		"https://www.example.com/todos/identical",
		undefined,
	);
});

test("Urls that differ only one place, but where the difference is a normal word is not flagged", () => {
	testUrlFamily(
		"https://www.example.com/todos/hi",
		"https://www.example.com/todos/there",
		undefined,
	);
});

test("Urls that differ only one place, and where the ids are uuid are flagged", () => {
	testUrlFamily(
		"https://www.example.com/todos/f56bea37-21cb-4511-b330-e8a7d41b4764",
		"https://www.example.com/todos/2432e2b2-60a7-4b5f-8237-51c52c15134f",
		"https://www.example.com/todos/{PARAM}",
	);
});

test.skip("Urls that have different base url is not flagged", () => {
	testUrlFamily(
		"https://www.example.com/todos/1",
		"https://jsonplaceholder2.typicode.com/todos/1",
		undefined,
	);
});
