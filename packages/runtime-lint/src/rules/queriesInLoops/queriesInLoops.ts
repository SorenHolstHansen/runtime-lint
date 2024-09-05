import { urlsDifferOnlyInOneParam } from "../../utils/detectUrlsThatDifferOnlyByParams.js";
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

const urlFamilies: Loader</* url */ string>[] = [];

export function detectQueriesInLoops(url: string, config: QueryInLoopConfig) {
	let hasBeenInAFamily = false;
	for (const family of urlFamilies) {
		if (family.entries.includes(url)) {
			hasBeenInAFamily = true;
		} else if (urlIsInFamily(url, family.entries)) {
			hasBeenInAFamily = true;
			family.load(url);
		}
	}

	if (!hasBeenInAFamily) {
		const loader = new Loader<string>(
			config.debounceMs,
			(entries) => entries.length >= config.threshold && config.cb(entries),
		);
		loader.load(url);
		urlFamilies.push(loader);
	}
}

function urlIsInFamily(url: string, family: string[]): boolean {
	return family.every((u) =>
		urlsDifferOnlyInOneParam(u.split("/"), url.split("/")),
	);
}
