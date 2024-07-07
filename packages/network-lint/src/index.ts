import { objectStats } from "object-stats";
import { urlsDifferOnlyInOneParam } from "./detectUrlsThatDifferOnlyByParams.js";

// biome-ignore lint/suspicious/noExplicitAny: Don't really care about the type here
function deepEqual(x: any, y: any) {
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

type StoreValue = {
	lastCalledAt: Date;
	// biome-ignore lint/suspicious/noExplicitAny: Don't really care about the type here
	jsonResponse?: any;
};

const store: Record<string, StoreValue> = {};

type NetworkJudgeOptions = {
	/**
	 * Callback to run when we detect multiple calls to the same endpoint with the exact same response. Defaults to a console.warn log
	 */
	onDuplicateResponseDetected?: (url: string) => void;
	/**
	 * Callback to run when we detect that queries might be running in a loop. Defaults to a console.warn log
	 */
	onQueriesInLoopsDetected?: (urls: string[]) => void;
	/**
	 * The amount of similar urls to see before calling the onQueriesInLoopsDetected. Default to 3
	 */
	queryInLoopThreshold?: number;
};
function networkJudge({
	onDuplicateResponseDetected = (url) => {
		console.warn(
			`You have previously made the same call (url: ${url}) that got the exact same response. Perhaps consider a (better) cache solution, or remove the duplicate calls.`,
		);
	},
	onQueriesInLoopsDetected = (urls) => {
		console.warn(
			`It seems like you are fetching the same url, but with different id's, lots of times in a row. This might suggest you are fetching some resource in a loop e.g. fetching /todos/1, /todos/2, /todos/3 and so on. The URL's called are \n - ${urls.join("\n - ")}`,
		);
	},
	queryInLoopThreshold = 3,
}: NetworkJudgeOptions) {
	const options: Required<NetworkJudgeOptions> = {
		onDuplicateResponseDetected,
		onQueriesInLoopsDetected,
		queryInLoopThreshold,
	};
	const origFetch = fetch;

	// biome-ignore lint/suspicious/noGlobalAssign: This is sort of the whole point
	// @ts-ignore
	fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
		const res = await origFetch(input, init);
		const url =
			input instanceof URL
				? input.toString()
				: typeof input === "string"
					? input
					: input.url;

		detectQueriesInLoops(url, options);
		store[url] = { ...store[url], lastCalledAt: new Date() };

		res.json = new Proxy(res.json, {
			async apply(target, thisArg, argumentsList) {
				const res = await Reflect.apply(target, thisArg, argumentsList);
				if (store[url] && deepEqual(store[url].jsonResponse, res)) {
					options.onDuplicateResponseDetected(url);
				} else {
					store[url] = {
						// not strictly needed, but done to please ts
						lastCalledAt: new Date(),
						...store[url],
						jsonResponse: res,
					};
				}

				const resWithStats = objectStats(res);

				return resWithStats;
			},
		});

		return res;
	};
}

function detectQueriesInLoops(
	currentUrl: string,
	options: Required<NetworkJudgeOptions>,
) {
	const otherSimilarUrls: string[] = [];
	const splitCurrentUrl = currentUrl.split("/");
	for (const [url, _value] of Object.entries(store)) {
		if (url === currentUrl) continue;
		const splitUrl = url.split("/");
		if (urlsDifferOnlyInOneParam(splitCurrentUrl, splitUrl)) {
			otherSimilarUrls.push(url);
		}
	}

	otherSimilarUrls.push(currentUrl);

	if (otherSimilarUrls.length >= options.queryInLoopThreshold) {
		options.onQueriesInLoopsDetected(otherSimilarUrls);
	}
}

export { networkJudge };
