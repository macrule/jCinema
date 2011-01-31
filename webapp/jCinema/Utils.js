/* This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */

/**
 * @class
 * Wraps together some useful helper methods that
 * don't really fit or belong anywhere else.
 */
jCinema.Utils = function () {
	
	var timeCodeRegex = /^(\d\d)\:(\d\d)(?:\:(\d\d))?/i;
	
	/**
	 * Converts a time code string into seconds.
	 * 
	 * @memberOf jCinema.Utils
	 * @param {String} timeCode Time code with format HH:MM or HH:MM:SS
	 * @returns {int} Number of seconds equal to the timeCode
	 */
	var convertTimeCodeToSeconds = function (timeCode) {
		var match = timeCodeRegex.exec(timeCode);
		if (match.length < 3) {
			return 0;
		}
		
		var seconds = 0;
		seconds += parseInt(match[1], 10) * 3600; // hours
		seconds += parseInt(match[2], 10) * 60;   // minutes
		if (match.length == 4) {
			seconds += parseInt(match[3], 10);    // seconds
		}
		
		return seconds;
	};
	
	/**
	 * Converts a number of seconds into a time code string.
	 * 
	 * @memberOf jCinema.Utils
	 * @param {Number} seconds Number of seconds to convert
	 * @param {Boolean} [includeSeconds=false] If <code>true</code>, generates
	 * a string with format HH:MM:SS, otherwise HH:MM.
	 * @returns {String} Time code string equal to seconds.
	 */
	var convertSecondsToTimeCode = function (seconds, includeSeconds) {
		var hours = Math.floor(seconds / 3600);
		seconds -= (hours * 3600);
		
		var minutes = Math.floor(seconds / 60);
		seconds -= (minutes * 60);
		
		// build the string
		var timeCode = '';
		
		if (hours < 10) {
			timeCode += '0';
		}
		timeCode += hours;
		timeCode += ':';
		if (minutes < 10) {
			timeCode += '0';
		}
		
		timeCode += minutes;
		
		if (includeSeconds === true) {
			timeCode += ':';
			if (seconds < 10) {
				timeCode += '0';
			}
			timeCode += seconds;
		}
		
		return timeCode;
	};
	
	/**
	 * Loads the content at the passed in Url synchronously
	 * and returns it as a string.
	 * 
	 * @memberOf jCinema.Utils
	 * @param {String} url The Url to load.
	 * @returns {String} The loaded content or an empty string if it fails.
	 */
	var loadUrl = function (url) {
		var xhr = new XMLHttpRequest();
		xhr.open('GET', url, false);
		xhr.send();
		return xhr.responseText;
	};
	
	/**
	 * Dynamically loads the JavaScript file at the given url.
	 * 
	 * @memberOf jCinema.Utils
	 * @param {String} url The Url of the *.js file.
	 */
	var includeJS = function (url) {
		jCinema.debug('loading JS ' + url);
		eval(loadUrl(url));
	};
	
	/**
	 * Dynamically loads the CSS file at the given url. After loading,
	 * the specified handler is called.
	 * 
	 * In case of success the handler is called after a slight delay,
	 * to be sure enough that the CSS has been loaded and applied to
	 * the DOM.
	 * 
	 * But even if the CSS cannot be loaded the handler is called, to
	 * allow chaining of multiple (optional) loads.
	 * 
	 * @memberOf jCinema.Utils
	 * @param {String} url The Url of the *.css file.
	 * @param {Function} onComplete Handler to call after the file has been
	 * loaded.
	 */
	var includeCSS = function (url, onComplete) {
		jCinema.debug('loading CSS ' + url);
		// This is somewhat tricky:
		// We need to call onComplete, but not before the CSS has been loaded. we could
		// achieve that by loading the file and injecting it into "head". but then
		// relative url()'s in the css will fail.
		// by putting a <link> into "head" such url()'s work fine, but we never
		// know when the CSS is loaded.
		// So as a solution we now load the css, to make sure it's in the cache,
		// and then add the <link> tag and call our completion handler after a short
		// wait period.
		// We choose a dynamic filename, to ensure browsers always reload modified
		// CSS files during development.
		var dynamicName = url+'?'+(new Date().valueOf());
		$.get(dynamicName, function (data, textStatus, XMLHttpRequest) {
			if (data.length > 0) {
				$('head').append('<link type="text/css" rel="stylesheet" href="' + dynamicName + '" />');
				setTimeout(onComplete, 250);
			} else {
				onComplete();
			}
		});
	};
	
	/**
	 * Force reload the current page, including all its stylesheets.
	 * 
	 * @memberOf jCinema.Utils
	 */
	var reloadPageAndCss = function () {
		$('link[rel="stylesheet"][href]').each(function (index, elem) {
			var h = elem.href.replace(/(&|\?)forceReload=\d+/, '');
			elem.href = h + (h.indexOf('?') >= 0 ? '&' : '?') + 'forceReload=' + (new Date().valueOf());
		});
		location.reload(true);
	};
	
	/**
	 * Get the Url for an image based on the currently active style.
	 * 
	 * @memberOf jCinema.Utils
	 * @param {String} relImagePath The path to the image file, relative to a jCinema styles directory.
	 * @returns {String} The Url that can be used in the <code>src</code> attribute of an <code>img</code> tag. 
	 */
	var getStyledImageUrl = function (relImagePath) {
		return 'jCinema/styles/' + jCinema.options.Style + '/images/' + relImagePath;
	};
	
	var jsLineCommentRegex = /^\s*\/\/.*$/gm;
	var jsBlockCommentRegex = /\/\*(?:.|\n)*\*\//gm;
	
	/**
	 * Strip all JavaScript style comments from a JSON string, to make it acceptable
	 * by the parser. Regrettably, comments are not part of the JSON specification
	 * and make most parsers choke.
	 * 
	 * @memberOf jCinema.Utils
	 * @param {String} json String with JSON representation of data including
	 * non-standard JS comments.
	 * @returns {String} JSON String with all comments stripped.
	 */
	var removeJSONComments = function (json) {
		json = json.replace(jsBlockCommentRegex, '');
		json = json.replace(jsLineCommentRegex, '');
		return json;
	};
	
	/**
	 * Creates a sub class based on a super class. This is basic javascript inheritance,
	 * and functions similar to this can be found all over the internet and literature.
	 * 
	 * @param {Object} subClass The subclass to create.
	 * @param {Object} superClass The superclass to inherit the subclass from.
	 * 
	 * @example
	 * Pet = function(name) {
	 *     this.name = name;
	 * }
	 * 
	 * Cat = function(name) {
	 *    Pet.superclass.constructor.call(this, name);
	 * }
	 * jCinema.Utils.extendClass(Cat, Pet);
	 */
	var extendClass = function (subClass, superClass) {
		var F = function () {};
		F.prototype = superClass.prototype;
		
		subClass.prototype = new F();
		subClass.prototype.constructor = subClass;
		
		subClass.superclass = superClass.prototype;
		if (superClass.prototype.constructor == Object.prototype.constructor) {
			superClass.prototype.constructor = superClass;
		}
	};
	
	return {
		convertTimeCodeToSeconds: convertTimeCodeToSeconds,
		convertSecondsToTimeCode: convertSecondsToTimeCode,
		
		loadUrl: loadUrl,
		includeJS: includeJS,
		includeCSS: includeCSS,
		reloadPageAndCss: reloadPageAndCss,
		getStyledImageUrl: getStyledImageUrl,
		
		removeJSONComments: removeJSONComments,
		
		extendClass: extendClass
	};
	
}();
