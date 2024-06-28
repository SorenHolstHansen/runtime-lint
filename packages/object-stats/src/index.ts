// biome-ignore lint/suspicious/noExplicitAny:
type ObjectStatsObject = Record<string, any> | any[];
// biome-ignore lint/suspicious/noExplicitAny:
type StatsOfType<T> = T extends (infer Inner)[] ? {count: number, inner: StatsOfType<Inner>}[] : T extends Record<string, any> ? {[Property in keyof T]: {count: number, inner: StatsOfType<T[Property]>} } : never;
// biome-ignore lint/suspicious/noExplicitAny:
export type ObjectWithStats<T> = T extends (infer S)[] ? ObjectWithStats<S>[] & {__stats: StatsOfType<T>} : T extends Record<string, any> ? {[Property in keyof T]: ObjectWithStats<T[Property]>} & {__stats: StatsOfType<T>} : T;

export function objectStats<T extends ObjectStatsObject>(
	inner: T,
): ObjectWithStats<T> {
	if (typeof inner !== "object") return inner;
	const counter: Record<string | symbol, number> = {};

	for (const key of Object.keys(inner)) {
		// biome-ignore lint/suspicious/noExplicitAny:
		inner[key as keyof T] = objectStats(inner[key as keyof T] as any);
	}

	const stats = () => {
			// biome-ignore lint/suspicious/noExplicitAny:
		const stats: Record<string, {count?: number, inner?: any}> = {};
		for (const key of Object.keys(counter)) {
			stats[key] = { count: counter[key] };
		}
		for (const _key of Object.keys(inner)) {
			const key = _key as keyof T;
			// biome-ignore lint/suspicious/noExplicitAny:
			const s = (inner[key] as any).__stats;
			if (stats[_key]) {
				// biome-ignore lint/style/noNonNullAssertion:
				stats[_key]!.inner = s;
			} else {
				stats[_key] = {
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

	// biome-ignore lint/suspicious/noExplicitAny:
	return proxy as any;
}
