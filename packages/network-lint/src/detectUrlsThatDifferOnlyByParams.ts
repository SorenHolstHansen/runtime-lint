const hasNumberRegex = /\d/;

/**
 * Detects whether two urls are the same upto a difference of one param,
 * as in a url of the form <base_url>/some/path/with/{param}/somewhere where `{param}` is replaced by two different values.
 * In practice, this can be quite hard, as we don't know what parts of a url is a param, and so on.
 */
function urlsDifferOnlyInOneParam(
	url1Split: string[],
	url2Split: string[],
): boolean {
	if (url1Split.length !== url2Split.length) return false;
	let differences = 0;
	for (let i = 0; i < url1Split.length; i++) {
		// biome-ignore lint/style/noNonNullAssertion: This exists because of the way the loop is defined
		const currentPart = url1Split[i]!;
		// biome-ignore lint/style/noNonNullAssertion: This is not null because of the check in the start of the function
		const otherPart = url2Split[i]!;
		if (currentPart === otherPart) {
			continue;
		}
		if (hasNumberRegex.test(currentPart) && hasNumberRegex.test(otherPart)) {
			differences += 1;
		}
	}

	return differences === 1;
}

export { urlsDifferOnlyInOneParam };
