import { type ObjectWithStats, objectStats } from "../../utils/objectStats.js";

export type OverFetchingConfig = {
	/**
	 * Callback to run whenever we detect a json response has been very underused, which could suggest overfetching.
	 */
	cb: (url: string) => void;
	/**
	 * Heuristic to apply to a json response after a certian time to determine if it has been underused or not. Return true if it is underused.
	 */
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	heuristic: <T extends any[] | Record<string, any>>(
		response: T,
		responseWithStats: ObjectWithStats<T>,
	) => boolean;
};

export const DEFAULT_OVERFETCHING_CONFIG: OverFetchingConfig = {
	cb: (url) => {
		console.warn(
			`We detected a json response that was very under-utilized, this might suggest that you are overfetching your api. The url is ${url}`,
		);
	},
	heuristic: (response, responseWithStats) => {
		if (Array.isArray(response)) {
			const arrayElemsUnused = Object.values(responseWithStats.__stats).filter(
				(value) => value.count == null || value.count === 0,
			).length;
			if (arrayElemsUnused > response.length / 2) {
				return true;
			}
		} else {
			// Is a simple object. Only check top-level keys and check if under half of them have been used
			const numToplevelKeys = Object.keys(responseWithStats).length;
			const unaccessKeysCount = Object.values(responseWithStats.__stats).filter(
				(value) => value.count == null || value.count === 0,
			).length;
			if (unaccessKeysCount > numToplevelKeys / 2) {
				return true;
			}
		}

		return false;
	},
};

// biome-ignore lint/suspicious/noExplicitAny:
export function detectOverfetching<T extends any[] | Record<string, any>>(
	response: T,
	url: string,
	config: OverFetchingConfig,
): T {
	const statObject = objectStats(response);

	setTimeout(() => {
		if (config.heuristic(response, statObject)) {
			config.cb(url);
		}
	}, 1000);

	return statObject as T;
}
