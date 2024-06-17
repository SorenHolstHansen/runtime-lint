const objectStats = require("./index");
const test = require("node:test");
const assert = require("node:assert").strict;

test("Simple index test", () => {
	const a = objectStats({
		foo: "bar",
	});

	const iter = 10;
	for (let i = 0; i < iter; i++) {
		a.foo;
	}

	assert.strictEqual(a.__stats.foo.count, iter);
});

test("nested objects", () => {
	const a = objectStats({
		foo: {
			bar: "baz",
		},
	});

	a.foo.bar;

	assert.deepEqual(a.__stats.foo.inner.bar.count, 1);
});

test("__stats is 'distributive'", () => {
	// We test that calling __stats on the root object and then traversing down to the path gives the same result as traversing down to the path, then asking for __stats
	const a = objectStats({
		foo: {
			bar: "baz",
		},
	});

	a.foo.bar;

	assert.deepEqual(a.__stats.foo.inner.bar, a.foo.__stats.bar);
});

test("__stats show stats of keys not present in the original object", () => {
	const a = objectStats({
		foo: "bar",
	});

	a.baz;

	assert.strictEqual(a.__stats.baz.count, 1);
});

test("Arrays work", () => {
	const a = objectStats([1, 2, 3]);

	a[1];

	assert.strictEqual(a.__stats[1].count, 1);
});

test("Arrays oj objects work", () => {
	const a = objectStats([{ foo: "bar" }, 1, { a: 2 }]);

	a[0].foo;

	assert.strictEqual(a.__stats[0].inner.foo.count, 1);
});
