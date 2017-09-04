const inArray = require('in-array');

class UtilsHelper {
	ucfirst(string) {
		return string.charAt(0).toUpperCase() + string.slice(1);
	}

	inArray(needle, haystack) {
		return inArray(haystack, needle)
	}

	makeTimestamp() {
		return Math.floor(Date.now() / 1000);
	}

	cloneObject(obj) {
		return JSON.parse(JSON.stringify(obj));
	}
}

const Utils = new UtilsHelper;
export default Utils;