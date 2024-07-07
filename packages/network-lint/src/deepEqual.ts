// biome-ignore lint/suspicious/noExplicitAny: Don't really care about the type here
export function deepEqual(x: any, y: any) {
	if (x === y) {
		return true;
	}

	if (
		typeof x === "object" &&
		x != null &&
		typeof y === "object" &&
		y != null
	) {
		if (Object.keys(x).length !== Object.keys(y).length) return false;

		for (const prop in x) {
			// biome-ignore lint/suspicious/noPrototypeBuiltins:
			if (y.hasOwnProperty(prop)) {
				if (!deepEqual(x[prop], y[prop])) return false;
			} else return false;
		}

		return true;
	}

	return false;
}
