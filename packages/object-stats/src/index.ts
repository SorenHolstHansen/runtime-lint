// biome-ignore lint/suspicious/noExplicitAny:
type ObjectStatsObject = Record<string, any> | any[];
// biome-ignore lint/suspicious/noExplicitAny:
type StatsOfType<T> = T extends (infer Inner)[] ? {count: number, inner: StatsOfType<Inner>}[] : T extends Record<string, any> ? {[Property in keyof T]: {count: number, inner: StatsOfType<T[Property]>} } : never;
// biome-ignore lint/suspicious/noExplicitAny:
type ObjectWithStats<T> = T extends (infer S)[] ? ObjectWithStats<S>[] & {__stats: StatsOfType<T>} : T extends Record<string, any> ? {[Property in keyof T]: ObjectWithStats<T[Property]>} & {__stats: StatsOfType<T>} : T;

type A = {
	foo: string;
	bar: {
		baz: string
	}
}
type B = ObjectWithStats<A>;
type C = {foo: string, bar: {baz: string}}[];
type D = ObjectWithStats<C>

export function objectStats<T extends ObjectStatsObject>(
	inner: T,
): ObjectWithStats<T> {
	if (typeof inner !== "object") return inner;
	const counter = {};

	for (const key of Object.keys(inner)) {
		inner[key] = objectStats(inner[key]);
	}

	const stats = () => {
		const stats = {};
		for (const key of Object.keys(counter)) {
			stats[key] = { count: counter[key] };
		}
		for (const key of Object.keys(inner)) {
			const s = inner[key].__stats;
			if (stats[key]) {
				stats[key].inner = s;
			} else {
				stats[key] = {
					inner: s,
				};
			}
		}
		return stats;
	};

	const handler: ProxyHandler<T> = {
		get(target, prop, receiver) {
			if (prop === "__stats") {
				return stats();
			}
			counter[prop] = (counter[prop] ?? 0) + 1;
			return Reflect.get(target, prop, receiver);
		},
		set(target, prop, value) {
			counter[prop] = (counter[prop] ?? 0) + 1;
			return Reflect.set(target, prop, value);
		},
	};

	const proxy = new Proxy(inner, handler);

	return proxy as any;
}
