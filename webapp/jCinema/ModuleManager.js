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

 
jCinema.Module = function () {};
jCinema.Module.prototype = {
	/**
	 * Name of the module. Should be unique across all modules.
	 */
	name: 'Unknown',
	
	/**
	 * Called right after loading the module. At this point
	 * the module can initialize itself. If for any reason
	 * the module cannot run, it should return false here.
	 *
	 * @param {Object} opts Global options passed to the module.
	 * @returns {Boolean} Returns true if setup succeeded.
	 */
	setUp: function(opts) {
		return true;
	},
	
	/**
	 * Called before a module is unloaded. It should properly clean
	 * up after itself here.
	 */
	tearDown: function() {
	},
	
	/**
	 * The module should install all menus it needs at this point.
	 *
	 * @param {jCinmea.Menu} mainMenu The main menu for adding entries to.
	 */
	installMenus: function(mainMenu) {
	}
};

jCinema.ModuleManager = function () {
	
	/**
	 * Array with all module instances, that have been registered.
	 * @private
	 */
	var registeredModules = [];
	
	/**
	 * Array with the loaded module instances.
	 * @private
	 */
	var loadedModules = [];
	
	/**
	 * Helper function to execute a function on all modules.
	 * 
	 * @private
	 * @param {jCinema.Module[]} list List of modules to apply the function to.
	 * @param {Function} f Function that takes the module as single arguemnt, and is called for each module. 
	 */
	function forEachModule(list, f) {
		for (var len = list.length, i = 0; i < len; i++) {
			var module = list[i];
			f(module);
		}
	}
	
	/**
	 * Loads a single module.
	 * 
	 * @param {jCinema.Module} module The registered module instance to load.
	 * @returns {Boolean} True if loading succeeded.
	 */
	function loadModule(module) {
		// set up the module
		jCinema.debug('Calling setUp on module ' + module.name);
		if (module.setUp(jCinema.options) === true) {
			loadedModules.push(module);
			
			// load the localization dict as well
			jCinema.Localization.loadDictionary('jCinema/modules/' + module.name + '/locale');
			
			// let the module install its menus
			module.installMenus(jCinema.MenuHandler.getMainMenu());
			
			jCinema.debug('Loaded module ' + module.name);
			return true;
		} else {
			jCinema.debug('setUp on module ' + module.name + ' failed');
		}
		
		return false;
	}
	
	/**
	 * Returns a new module instance, by first creating a subclass of
	 * jCinema.Module (extended by the passed in object literal), and
	 * then instantiating that subclass once.
	 * 
	 * @memberOf jCinema.ModuleManager
	 * @param {Object} moduleDesc Object literal that is used to override properties in jCinema.Module
	 * @returns {jCinema.Module} A new module instance.
	 */
	var createModule = function (moduleDesc) {
		var module = new jCinema.Module();
		$.extend(module, moduleDesc);
		return module;
	};
	
	/**
	 * Registers the passed in module instance, which should normally be
	 * created with createModule().
	 * 
	 * @memberOf jCinema.ModuleManager
	 * @param {jCinema.Module} module The module to register for loading.
	 */
	var registerModule = function(module) {
		registeredModules.push(module);
	};
	
	/**
	 * Load all registered modules. Should be called only once during
	 * startup of the application.
	 * 
	 * @memberOf jCinema.ModuleManager
	 */
	var loadModules = function() {
		// load all registered modules
		forEachModule(registeredModules, function (m) { loadModule(m); });
	};
	
	return {
		createModule: createModule,
		registerModule: registerModule,
		loadModules: loadModules
	};
}();
