import { objectStats } from "object-stats";
import { urlsDifferOnlyInOneParam } from "./detectUrlsThatDifferOnlyByParams.js";
import { deepEqual } from "./deepEqual.js";

type StoreValue = {
	lastCalledAt: Date;
	// biome-ignore lint/suspicious/noExplicitAny: Don't really care about the type here
	jsonResponse?: any;
};

const store: Record<string, StoreValue> = {};

/** 
 * A wrapper around a config that allows users to specify the config in a variety of ways
 * e.g. 
 * - "on" means use the default config
 * - "off" | null | undefined means not to use the rule
 * - Partial<T> allow users to specify parts of the config, and leave the rest of it as default
 */
type RuleConfig<T> = "on" | "off" | Partial<T> | null | undefined;

function setConfig<T>(cfg: RuleConfig<T>, dflt: T): T | undefined {
	if (cfg === "on") {
		return dflt;
	}
	if (cfg == null || cfg === "off") {
		return undefined;
	}

	return {...dflt, ...cfg}
}

type DuplicateResponseConfig = {
	cb: (url: string) => void;
}

const DEFAULT_DUPLICATE_RESPONSE_CONFIG: DuplicateResponseConfig = {
	/**
	 * Callback to run when we detect multiple calls to the same endpoint with the exact same response. Defaults to a console.warn log
	 */
	cb: (url) => {
		console.warn(
			`You have previously made the same call (url: ${url}) that got the exact same response. Perhaps consider a (better) cache solution, or remove the duplicate calls.`,
		);
	}
}

type Config = {
	duplicateResponses?: DuplicateResponseConfig;
	queryInLoop?: QueryInLoopConfig;
	overFetching?: OverFetchingConfig;
};
function networkJudge({
	duplicateResponses,
	queryInLoop,
	overFetching
}: { [Key in keyof Config]: RuleConfig<Config[Key]> }) {
	const config: Config = {
		duplicateResponses: setConfig(duplicateResponses, DEFAULT_DUPLICATE_RESPONSE_CONFIG),
		queryInLoop: setConfig(queryInLoop, DEFAULT_QUERY_IN_LOOP_CONFIG),
		overFetching: setConfig(overFetching, DEFAULT_OVERFETCHING_CONFIG)
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

		if (config.queryInLoop) {
			detectQueriesInLoops(url, config.queryInLoop);
		}
		store[url] = { ...store[url], lastCalledAt: new Date() };

		res.json = new Proxy(res.json, {
			async apply(target, thisArg, argumentsList) {
				const res = await Reflect.apply(target, thisArg, argumentsList);
				if (store[url] && deepEqual(store[url].jsonResponse, res)) {
					config.duplicateResponses?.cb(url);
				} else {
					store[url] = {
						// not strictly needed, but done to please ts
						lastCalledAt: new Date(),
						...store[url],
						jsonResponse: res,
					};
				}

				if (config.overFetching) {
					return detectUnderuseOfResponse(res, url, config.overFetching);
				}
				return res;
					
			},
		});

		return res;
	};
}

type OverFetchingConfig = {
	/**
	 * Callback to run whenever we detect a json response has been very underused, which could suggest overfetching.
	 */
	cb: (url: string) => void;
};

const DEFAULT_OVERFETCHING_CONFIG: OverFetchingConfig = {
	cb: (url) => {
		console.warn(
			`We detected a json response that was very under-utilized, this might suggest that you are overfetching your api. The url is ${url}`,
		);
	}
}

// biome-ignore lint/suspicious/noExplicitAny:
function detectUnderuseOfResponse<T extends any[] | Record<string, any>>(
	response: T,
	url: string,
	config: OverFetchingConfig,
): T {
	const statObject = objectStats(response);

	void new Promise((resolve) => {
		setTimeout(() => {
			if (Array.isArray(response)) {
				const arrayElemsUnused = Object.values(statObject.__stats).filter(
					(value) => value.count == null || value.count === 0,
				).length;
				if (arrayElemsUnused > response.length / 2) {
					config.cb(url);
				}
			} else {
				// Is a simple object. Only check top-level keys and check if under half of them have been used
				const numToplevelKeys = Object.keys(statObject).length;
				const unaccessKeysCount = Object.values(statObject.__stats).filter(
					(value) => value.count == null || value.count === 0,
				).length;
				if (unaccessKeysCount > numToplevelKeys / 2) {
					config.cb(url);
				}
			}
			resolve(undefined);
		}, 1000);
	});

	return statObject as T;
}

type QueryInLoopConfig = {
	/**
	 * Callback to run when we detect that queries might be running in a loop. Defaults to a console.warn log
	 */
	cb: (urls: string[]) => void;
	/**
	 * The amount of similar urls to see before calling the onQueriesInLoopsDetected. Default to 3
	 */
	threshold: number;
};

const DEFAULT_QUERY_IN_LOOP_CONFIG: QueryInLoopConfig = {
	cb: (urls) => {
		console.warn(
			`It seems like you are fetching the same url, but with different id's, lots of times in a row. This might suggest you are fetching some resource in a loop e.g. fetching /todos/1, /todos/2, /todos/3 and so on. The URL's called are \n - ${urls.join("\n - ")}`,
		);
	},
	threshold: 3,
	
}

function detectQueriesInLoops(
	currentUrl: string,
	config: QueryInLoopConfig,
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

	if (otherSimilarUrls.length >= config.threshold) {
		config.cb(otherSimilarUrls);
	}
}

export { networkJudge };
