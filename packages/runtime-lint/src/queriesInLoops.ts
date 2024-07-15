import { urlsDifferOnlyInOneParam } from "./detectUrlsThatDifferOnlyByParams.js";

export type QueryInLoopConfig = {
	/**
	 * Callback to run when we detect that queries might be running in a loop. Defaults to a console.warn log
	 */
	cb: (urls: string[]) => void;
	/**
	 * The amount of similar urls to see before calling the onQueriesInLoopsDetected. Default to 3
	 */
	threshold: number;
	/**
	 * The milliseconds to debounce the callback in between queries in loops
	 */
	debounceMs: number;
};

export const DEFAULT_QUERY_IN_LOOP_CONFIG: QueryInLoopConfig = {
	cb: (urls) => {
		console.warn(
			`It seems like you are fetching the same url, but with different id's, lots of times in a row. This might suggest you are fetching some resource in a loop e.g. fetching /todos/1, /todos/2, /todos/3 and so on. The URL's called are \n - ${urls.join("\n - ")}`,
		);
	},
	threshold: 3,
	debounceMs: 500
};

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
const store: Record<string, any> = {};

export function detectQueriesInLoops(currentUrl: string, config: QueryInLoopConfig) {
	store[currentUrl] = { ...store[currentUrl], lastCalledAt: new Date() };
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

	if (otherSimilarUrls.length >= config.threshold) {
		config.cb(otherSimilarUrls);
	}
}
