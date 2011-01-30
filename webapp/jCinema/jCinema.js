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
 * Global namespace for the jCinema project.
 * @namespace
 */
var jCinema = {};

/**
 * Each platform creates a namespace below jCinema.platform for its
 * implementations.
 * @namespace
 */
jCinema.platform = {};

/**
 * All view classes need to be located in the jCinema.views namespace,
 * because that is expected for automatic loading by their name.
 * @namespace
 * 
 * @see jCinema.ViewStack
 */
jCinema.views = {};


// we use these lists to load all necessary javascript files
jCinema.interfaceNames = [ 'VideoControl', 'KeyHandler', 'MediaDirectory' ];
jCinema.otherClasses = [ 'BackEndProxy', 'Localization', 'MenuHandler', 'ModuleManager', 'UPnP', 'ViewStack' ];
jCinema.moduleNames = ['Movies'];


/**
 * Wrapper for console.log, so we can turn off debugging messages easily. 
 */
jCinema.log = function () {
	// just pass on arguments
	console.log.apply(console, arguments);
};
/** @see jCinema.log */
jCinema.debug = function () {
	// just pass on arguments
	console.debug.apply(console, arguments);
};
/** @see jCinema.log */
jCinema.info = function () {
	// just pass on arguments
	console.info.apply(console, arguments);
};
/** @see jCinema.log */
jCinema.warn = function () {
	// just pass on arguments
	console.warn.apply(console, arguments);
};
/** @see jCinema.log */
jCinema.error = function () {
	// just pass on arguments
	console.error.apply(console, arguments);
};



/**
 * Used to declare pure abstract methods that need to be overridden in actual
 * implementations of an interface.
 * 
 * @param {String} n Name of the unimplemented method, should be fully qualified.
 * @throws {String} An exception like 'Not implemented IVideoControl.method'
 */
jCinema.notImplemented = function (n) {
	throw 'Not implemented '+n;
};



/**
 * For bootstrapping we cannot use jCinema.Utils.includeJS because it hasn't
 * been loaded yet. So we have to duplicate the code to dynamically use
 * JavaScript files for at least Utils.
 * 
 * @param {String} url URL to the *.js file.
 * @deprecated do not use, anywhere but in jCinema.js
 * @see jCinema.Utils.includeJS
 */ 
jCinema.includeJS = function (url) {
	jCinema.debug('bootstrap loading JS ' + url);
	var xhr = new XMLHttpRequest();
	xhr.open('GET', url, false);
	xhr.send();
	eval(xhr.responseText);
};
jCinema.includeJS('jCinema/Utils.js');



/**
 * Override the dummy interface functions with a specific implementation.
 * 
 * @private
 * @param {String} name Name of the platform to use.
 * @param {Object} opts Options to pass on to interface init() methods.
 * Normally you want to use jCinema.options here.
 */
jCinema.initPlatform = function (name, opts) {
	// include the platform main file
	jCinema.Utils.includeJS('jCinema/platforms/' + name + '/Main.js');
	
	// first load the implementation files
	for (var i = 0; i < jCinema.interfaceNames.length; i++) {
		jCinema.Utils.includeJS('jCinema/platforms/' + name + '/' + jCinema.interfaceNames[i] + 'Impl.js');
	}
	
	var implementation = jCinema.platform[name];
	if (implementation === undefined) {
		jCinema.error('Illegal platform value: ' + name);
		return false;
	}
	
	// install interface implementations
	for (var i = 0; i < jCinema.interfaceNames.length; i++) {
		var intf = jCinema.interfaceNames[i];
		for (f in implementation[intf + 'Impl']) {
			jCinema['I' + intf][f] = implementation[intf + 'Impl'][f];
		}
		
		// initialize with options
		if (jCinema['I' + intf].init) {
			jCinema['I' + intf].init(opts);
		}
	}
	
	// give the interface a chance to initialize itself
	jCinema.platform[name].init(opts);
};

// include all necessary js files
jCinema.Utils.includeJS('jCinema/external/jquery-1.4.4.min.js');
jCinema.Utils.includeJS('jCinema/external/jquery-ui-1.8.7.custom.min.js');
for (var i = 0; i < jCinema.otherClasses.length; i++) {
	jCinema.Utils.includeJS('jCinema/' + jCinema.otherClasses[i] + '.js');
}
for (var i = 0; i < jCinema.interfaceNames.length; i++) {
	jCinema.Utils.includeJS('jCinema/interfaces/I' + jCinema.interfaceNames[i] + '.js');
}
for (var i = 0; i < jCinema.moduleNames.length; i++) {
	jCinema.Utils.includeJS('jCinema/modules/' + jCinema.moduleNames[i] + '/' + jCinema.moduleNames[i] + '.js');
}

// unless overridden, the back button pops a view
jCinema.IKeyHandler.pushHandler(jCinema.ViewStack.popView, jCinema.IKeyHandler.KeyEvent.Back);

// for debugging: reload page on power key press
jCinema.IKeyHandler.pushHandler(jCinema.Utils.reloadPageAndCss, jCinema.IKeyHandler.KeyEvent.Power);


// this launches everything when the main html has loaded
$(function() {
	// load default options
	jCinema.Utils.includeJS('jCinema/config.defaults.js');
	
	// allow overriding options in config
	jCinema.Utils.includeJS('config.js');
	
	$('#loading-screen').append('<h3>Platform: '+jCinema.options.Platform+'</h3>');
	
	jCinema.initPlatform(jCinema.options.Platform, jCinema.options);
	
	// if a different style from default is selected, load its base.css now
	jCinema.Utils.includeCSS('jCinema/styles/' + jCinema.options.Style + '/base.css');
	
	// load core localizations
	jCinema.Localization.setLocale(jCinema.options.Locale);
	jCinema.Localization.loadDictionary('jCinema/locale');
	
	// load all registered modules
	jCinema.ModuleManager.loadModules();
	
	// install a Menu, that for now only has two entries, of which
	// only one works so far.
	var mainMenu = jCinema.MenuHandler.getMainMenu();
	mainMenu.append(new jCinema.MenuEntry(jCinema.STR('Settings')));
	jCinema.MenuHandler.showMenu(mainMenu);
});

