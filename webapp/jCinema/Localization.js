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


// use this wrapper function to indicate literal strings
// that require translation. the function itself does not
// apply translations, but it's an easy way to build a
// translation list if all code complies with this
// convention:
// 
// Example: jCinema.STR('Movies')
// 
jCinema.STR = function (str) { return str; };


jCinema.Localization = function () {
	
	var activeLocale = 'en';
	var dictionary = {};
	
	var loadDictionary = function (url, locale) {
		// by default load the dictionary for the current locale only
		if (locale === undefined) {
			locale = activeLocale;
		}
		
		// load translation file
		var locUrl = url + '/' + locale + '.json';
		var dict;
		try {
			// translation files are in JSON format:
			// a single map with a key/value pair for each entry
			jCinema.debug('Loading translation ' + locUrl);
			dict = $.parseJSON(jCinema.Utils.removeJSONComments(jCinema.Utils.loadUrl(locUrl)));
		} catch (e) {
			jCinema.error('Bad translation file: ' + locUrl + ' (' + e + ')');
		}
		if (dict === undefined) {
			return;
		}
		
		// prepare an empty entry for the locale if none exists
		if (dictionary[locale] === undefined) {
			dictionary[locale] = {};
		}
		
		// and merge the current dictionary with the newly loaded one
		$.extend(dictionary[locale], dict);
	};
	
	var setLocale = function (locale) {
		if (typeof locale !== 'string') {
			locale = 'en';
		}
		activeLocale = locale;
	};
	
	var localize = function (str) {
		var dict = dictionary[activeLocale];
		if (dict !== undefined) {
			if (typeof dict[str] === 'string') {
				// return translation
				return dict[str];
			}
		}
		
		// fallback: return untranslated
		return str;
	};
	
	return {
		loadDictionary: loadDictionary,
		setLocale: setLocale,
		localize: localize
	};
}();

// now hook our localization routine into the String class,
// so we can call it like 'Movies'.localize()
String.prototype.localize = function () {
	return jCinema.Localization.localize(this.valueOf());
};
