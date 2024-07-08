import { objectStats } from "object-stats";
import { urlsDifferOnlyInOneParam } from "./detectUrlsThatDifferOnlyByParams.js";
import { deepEqual } from "./deepEqual.js";

type StoreValue = {
	lastCalledAt: Date;
	// biome-ignore lint/suspicious/noExplicitAny: Don't really care about the type here
	jsonResponse?: any;
};

const store: Record<string, StoreValue> = {};

type Config = {
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
	/**
	 * Callback to run whenever we detect a json response has been very underused, which could suggest overfetching.
	 */
	onUnderuseOfResponseDetected?: (url: string) => void;
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
	onUnderuseOfResponseDetected = (url) => {
		console.warn(
			`We detected a json response that was very under-utilized, this might suggest that you are overfetching your api. The url is ${url}`,
		);
	},
}: Config) {
	const options: Required<Config> = {
		onDuplicateResponseDetected,
		onQueriesInLoopsDetected,
		queryInLoopThreshold,
		onUnderuseOfResponseDetected,
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

				const resWithStats = detectUnderuseOfResponse(res, url, options);

				return resWithStats;
			},
		});

		return res;
	};
}

// biome-ignore lint/suspicious/noExplicitAny:
function detectUnderuseOfResponse<T extends any[] | Record<string, any>>(
	response: T,
	url: string,
	options: Required<Config>,
): T {
	const statObject = objectStats(response);

	void new Promise((resolve) => {
		setTimeout(() => {
			if (Array.isArray(response)) {
				const arrayElemsUnused = Object.values(statObject.__stats).filter(
					(value) => value.count == null || value.count === 0,
				).length;
				if (arrayElemsUnused > response.length / 2) {
					options.onUnderuseOfResponseDetected(url);
				}
			} else {
				// Is a simple object. Only check top-level keys and check if under half of them have been used
				const numToplevelKeys = Object.keys(statObject).length;
				const unaccessKeysCount = Object.values(statObject.__stats).filter(
					(value) => value.count == null || value.count === 0,
				).length;
				if (unaccessKeysCount > numToplevelKeys / 2) {
					options.onUnderuseOfResponseDetected(url);
				}
			}
			resolve(undefined);
		}, 1000);
	});

	return statObject as T;
}

function detectQueriesInLoops(
	currentUrl: string,
	options: Required<Config>,
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
