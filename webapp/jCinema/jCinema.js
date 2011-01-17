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


// Gloabl Namespace for this project
var jCinema = {};
jCinema.platform = {};
jCinema.views = {};


// we use these lists to load all necessary javascript files
jCinema.interfaceNames = [ 'VideoControl', 'KeyHandler', 'MediaDirectory' ];
jCinema.otherClasses = [ 'Utils', 'UPnP', 'ViewStack' ];


// logging
jCinema.log = function () {
	// just pass on arguments
	console.log.apply(console, arguments);
};
jCinema.debug = function () {
	// just pass on arguments
	console.debug.apply(console, arguments);
};
jCinema.info = function () {
	// just pass on arguments
	console.info.apply(console, arguments);
};
jCinema.warn = function () {
	// just pass on arguments
	console.warn.apply(console, arguments);
};
jCinema.error = function () {
	// just pass on arguments
	console.error.apply(console, arguments);
};



// for unimplemented interfaces
jCinema.notImplemented = function (n) {
	throw 'Not implemented '+n;
};


// this function dynamically loads the given js file
jCinema.includeJS = function (file) {
	jCinema.debug('loading JS ' + file);
	var xhr = new XMLHttpRequest();
	xhr.open('GET', file, false);
	xhr.send();
	eval(xhr.responseText);
	
}

// this function dynamically loads the given css file
jCinema.includeCSS = function (file, onComplete) {
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
}

// override the dummy interface functions with a specific implementation
jCinema.initPlatform = function (name, opts) {
	// include the platform main file
	jCinema.includeJS('jCinema/platforms/' + name + '/Main.js');
	
	// first load the implementation files
	for (var i = 0; i < jCinema.interfaceNames.length; i++) {
		jCinema.includeJS('jCinema/platforms/' + name + '/' + jCinema.interfaceNames[i] + 'Impl.js');
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
jCinema.includeJS('jCinema/external/jquery-1.4.4.min.js');
jCinema.includeJS('jCinema/external/jquery-ui-1.8.7.custom.min.js');
for (var i = 0; i < jCinema.otherClasses.length; i++) {
	jCinema.includeJS('jCinema/' + jCinema.otherClasses[i] + '.js');
}
for (var i = 0; i < jCinema.interfaceNames.length; i++) {
	jCinema.includeJS('jCinema/interfaces/I' + jCinema.interfaceNames[i] + '.js');
}

// unless overridden, the back button pops a view
jCinema.IKeyHandler.pushHandler(jCinema.ViewStack.popView, jCinema.IKeyHandler.KeyEvent.Back);

// for debugging: reload page on power key press
jCinema.IKeyHandler.pushHandler(jCinema.Utils.reloadPageAndCss, jCinema.IKeyHandler.KeyEvent.Power);


// this launches everything when the main html has loaded
$(function() {
	// load default options
	jCinema.options = {};
	jCinema.includeJS('jCinema/config.defaults.js');
	
	// allow overriding options in config
	jCinema.includeJS('config.js');
	
	$('#loading-screen').append('<h3>Platform: '+jCinema.options.Platform+'</h3>');
	
	jCinema.initPlatform(jCinema.options.Platform, jCinema.options);
	jCinema.ViewStack.pushView('VideoBrowser');
});

