const hasNumberRegex = /\d/;

/**
 * Detects whether two urls are the same upto a difference of one param.
 * In practive, this can be quite hard, as we don't know what parts of a url is a param, and so on.
 * 
 * @param {string[]} url1Split 
 * @param {string[]} url2Split 
 * @returns {bool}
 */
module.exports = function urlsDifferOnlyInOneParam(url1Split, url2Split) {
  if (url1Split.length !== url2Split.length) return false;
  let differences = 0;
  for (let i = 0; i < url1Split.length; i++) {
    let currentPart = url1Split[i];
    let otherPart = url2Split[i];
    if (currentPart === otherPart) {
      continue;
    };
    if (hasNumberRegex.test(currentPart) && hasNumberRegex.test(otherPart)) {
      differences += 1;
    }
  }

  return differences === 1;
}
