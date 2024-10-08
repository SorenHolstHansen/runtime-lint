import { detectUrlFamilies, urls } from "../../utils/detectUrlFamilies.js";
import { Loader } from "../../utils/loader.js";

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
	debounceMs: 500,
};

const urlFamilies: Record<string, Loader</* url */ string>> = {};

export function detectQueriesInLoops(url: string, config: QueryInLoopConfig) {
	const families = detectUrlFamilies(url);
	for (const family of families) {
		if (urlFamilies[family] == null) {
			const loader = new Loader<string>(config.debounceMs, (entries) => {
				if (entries.length + 1 >= config.threshold) {
					config.cb(entries);
					for (const entry of entries) {
						urls.delete(new URL(entry));
					}
					delete urlFamilies[family];
				}
			});
			loader.load(url);
			urlFamilies[family] = loader;
		} else {
			urlFamilies[family].load(url);
		}
	}
}
