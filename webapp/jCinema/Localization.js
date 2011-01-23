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
 * Use this wrapper function to indicate literal strings
 * that require translation.
 * 
 * The function itself does not apply translations, but it's
 * an easy way to build a translation list if all code complies
 * with this convention.
 * 
 * Define literals like <code>jCinema.STR('Movies')</code>
 * and later use them like <code>stringVar.localize()</code> in
 * your view code.
 * 
 * @example
 * var myStr = jCinema.STR('Movies');
 * $('h1').text(myStr.localize());
 * 
 * @param {String} str
 * @returns {String} The unaltered string, this is a no-op.
 */
jCinema.STR = function (str) { return str; };


/**
 * @class
 * Keeps track of the currently active locale, and provides methods
 * to localize strings anywhere in the application.
 * 
 * Locale names should be the usual two-letter ISO names (en for English,
 * de for German, etc.).
 */
jCinema.Localization = function () {
	
	/**
	 * The currently active locale, used for localization.
	 * @private
	 */
	var activeLocale = 'en';
	
	/**
	 * Contains all loaded translations. It's a two level map:
	 * First level contains locale names as keys and the translation
	 * map for that locale as value.
	 * @private
	 */
	var dictionary = {};
	
	/**
	 * Load a dictionary for a locale (or the currently active locale
	 * if omitted). Dictionaries are JSON files containing a single
	 * map with key/value pairs for the translations.
	 * 
	 * Contrary to the strict JSON standard, we do allow JavaScript
	 * comments in those files as a means to help translators where
	 * necessary.
	 * 
	 * Loading multiple dictionaries for the same locale will build a
	 * union dictionary from all of them. Previously defined entries
	 * can be overwritten, too.
	 * 
	 * @memberOf jCinema.Localization
	 * @param {String} url The url to the *.json file containing the
	 * translation dictionary.
	 * @param {String} [locale=active locale] The locale for which the
	 * translations are.
	 */
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
	
	/**
	 * Sets the active locale to use for translations.
	 * 
	 * @memberOf jCinema.Localization
	 * @param {String} locale The locale to set.
	 */
	var setLocale = function (locale) {
		if (typeof locale !== 'string') {
			locale = 'en';
		}
		activeLocale = locale;
	};
	
	/**
	 * Translate a string for the currently active locale.
	 * If no translation is available, the original is
	 * returned as fallback.
	 * 
	 * @memberOf jCinema.Localization
	 * @param {String} str The string to localize.
	 * @returns {String} The translated string.
	 */
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

/**
 * We hook our localization routine into the String class,
 * so we can call it like <code>'Movies'.localize()</code>.
 * @see jCinema.STR
 */
String.prototype.localize = function () {
	return jCinema.Localization.localize(this.valueOf());
};
