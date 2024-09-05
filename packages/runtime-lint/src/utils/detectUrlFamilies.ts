const hasNumberRegex = /\d/;
export const urls: Set<URL> = new Set();
export function detectUrlFamilies(_url: string): string[] {
	const url = new URL(_url);
	urls.add(url);
	const families: string[] = [];
	for (const u of urls) {
		const family = detectUrlFamily(url, u);
		if (family && !families.includes(family)) {
			families.push(family);
		}
	}

	return families;
}

export function detectUrlFamily(url1: URL, url2: URL): string | undefined {
	if (url1.href === url2.href) return;
	if (url1.origin !== url2.origin) return;
	const urlSplit = url2.pathname.split("/");
	const uSplit = url1.pathname.split("/");
	if (uSplit.length !== urlSplit.length) return;

	const differencesAt = [];
	for (let i = 0; i < uSplit.length; i++) {
		// biome-ignore lint/style/noNonNullAssertion: This exists because of the way the loop is defined
		const currentPart = uSplit[i]!;
		// biome-ignore lint/style/noNonNullAssertion: This is not null because of the check in the start of the function
		const otherPart = urlSplit[i]!;
		if (currentPart === otherPart) {
			continue;
		}
		if (hasNumberRegex.test(currentPart) && hasNumberRegex.test(otherPart)) {
			differencesAt.push(i);
		}
	}
	if (differencesAt.length === 1) {
		// biome-ignore lint/style/noNonNullAssertion: <explanation>
		const differenceAt = differencesAt[0]!;
		const family = uSplit
			.map((part, i) => (i === differenceAt ? "{PARAM}" : part))
			.join("/");
		return `${url1.origin}${family}`;
	}

	return;
}
