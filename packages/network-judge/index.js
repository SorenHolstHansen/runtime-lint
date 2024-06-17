const objectStats = require("object-stats");
const urlsDifferOnlyInOneParam = require("./detectUrlsThatDifferOnlyByParams");

function deepEqual(x, y) {
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

/**
 * @typedef {Object} StoreValue
 * @property {Date} lastCalledAt
 * @property {any} jsonResponse
 */

/**
 * @type {Record<string, StoreValue>}
 */
const store = {};

/**
 * @typedef {Object} NetworkJudgeOptions
 * @property {(url: string) => void} onDuplicateResponseDetected - Callback to run when networkJudge detects multiple calls to the same endpoint with the exact same response. Defaults to a console.warn log
 * @property {(urls: string[]) => void} onQueriesInLoopsDetected - Callback to run when networkJudge detects that queries might be running in a loop. Defaults to a console.warn log
 * @property {number} queryInLoopThreshold - The amount of similar urls to see before calling the onQueriesInLoopsDetected. Default to 3
 */

/**
 * @param {NetworkJudgeOptions} opt
 */
module.exports = function networkJudge(opt) {
	const options = {
		onDuplicateResponseDetected: (url) => {
			console.warn(
				`You have previously made the same call (url: ${url}) that got the exact same response. Perhaps consider a (better) cache solution, or remove the duplicate calls.`,
			);
		},
		onQueriesInLoopsDetected: (urls) => {
			console.warn(
				`It seems like you are fetching the same url, but with different id's, lots of times in a row. This might suggest you are fetching some resource in a loop. e.g. fetching /todos/1, /todos/2, /todos/3 and so on. The URL's called are \n - ${urls.join("\n - ")}`,
			);
		},
		queryInLoopThreshold: 3,
		...opt,
	};
	const origFetch = fetch;

	/**
	 * @param {RequestInfo | URL} input
	 * @param {RequestInit | undefined} init
	 */
	// biome-ignore lint/suspicious/noGlobalAssign: This is sort of the whole point
	fetch = async (input, init) => {
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
					store[url] = { ...store[url], jsonResponse: res };
				}

				const resWithStats = objectStats(res);

				return resWithStats;
			},
		});

		return res;
	};
};

/**
 * @param {string} currentUrl
 * @param {NetworkJudgeOptions} options
 */
function detectQueriesInLoops(currentUrl, options) {
	const otherSimilarUrls = [];
	const splitCurrentUrl = currentUrl.split("/");
	for (const [url, value] of Object.entries(store)) {
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
