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


jCinema.Utils = function () {
	
	var timeCodeRegex = /^(\d\d)\:(\d\d)(?:\:(\d\d))?/i;
	
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
	
	var convertSecondsToTimeCode = function (seconds, includeSeconds) {
		var hours = Math.floor(seconds / 3600);
		seconds -= (hours * 3600);
		
		var minutes = Math.floor(seconds / 60);
		seconds -= (minutes * 60);
		
		// build the string
		var timeCode = '';
		if (hours < 10) timeCode += '0';
		timeCode += hours;
		timeCode += ':';
		if (minutes < 10) timeCode += '0';
		timeCode += minutes;
		if (includeSeconds == true) {
			timeCode += ':';
			if (seconds < 10) timeCode += '0';
			timeCode += seconds;
		}
		
		return timeCode;
	};
	
	var callBackEnd = function (method, params, success, error) {
		var opts = {
			async: false,
			url: 'http://' + jCinema.options.BackEndHost + '/jCinemaRPC/' + jCinema.options.Platform,
			type: 'POST',
			cache: false,
			processData: false,
			dataType: 'json',
			data: JSON.stringify({
				version: '1.1',
				method: method,
				params: params || []
			}),
			success: function (result) { if (success) success(result.result); },
			error: error
		};
		
		var result = $.ajax(opts);
		if (result) {
			var json = $.parseJSON(result.responseText);
			if (json && json.result) {
				return json.result;
			}
		}
		
		return null;
	};
	
	var loadUrl = function (url) {
		var xhr = new XMLHttpRequest();
		xhr.open('GET', url, false);
		xhr.send();
		return xhr.responseText;
	};
	
	// this function dynamically loads the given js file
	var includeJS = function (file) {
		jCinema.debug('loading JS ' + file);
		eval(loadUrl(file));
	};
	
	// this function dynamically loads the given css file
	var includeCSS = function (file, onComplete) {
		jCinema.debug('loading CSS ' + file);
		// This is somewhat tricky:
		// We need to call onComplete only when the CSS has been loaded. we could
		// achieve that by loading the file and injecting it into "head". but then
		// relative url()'s in the css will fail.
		// by putting a <link> into "head" such url()'s work fine, but we never
		// know when the CSS is loaded.
		// So as a solution we now load the css, to make sure it's in the cache,
		// and then add the <link> tag and call our completion handler after a short
		// wait period.
		// We choose a dynamic filename, to ensure browsers always reload modified
		// CSS files during development.
		var dynamicName = file+'?'+(new Date().valueOf());
		$.get(dynamicName, function () {
			$('head').append('<link type="text/css" rel="stylesheet" href="'+dynamicName+'" />');
			setTimeout(onComplete, 250);
		});
	};
	
	var reloadPageAndCss = function () {
		$('link[rel="stylesheet"][href]').each(function (index, elem) {
			var h = elem.href.replace(/(&|\?)forceReload=\d+/, '');
			elem.href = h + (h.indexOf('?') >= 0 ? '&' : '?') + 'forceReload=' + (new Date().valueOf());
		});
		location.reload(true);
	};
	
	
	return {
		convertTimeCodeToSeconds: convertTimeCodeToSeconds,
		convertSecondsToTimeCode: convertSecondsToTimeCode,
		callBackEnd: callBackEnd,
		
		loadUrl: loadUrl,
		includeJS: includeJS,
		includeCSS: includeCSS,
		reloadPageAndCss: reloadPageAndCss,
	};
	
}();
