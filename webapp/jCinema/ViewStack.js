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
 * 
 * The ViewStack is the core of the jCinema view layer. All views are organized
 * in a stack onto which new views can be pushed, and later popped. This way it's
 * easy to get a flow through multiple UI screens as is necessary for remote
 * controlled devices.
 * 
 * When a view becomes top of the stack, it receives a begin() message. This can
 * be the result of being pushed, as well as all other views above it having been
 * popped. The begin message can include a data object that is private to the view.
 * 
 * When a view loses the top spot on the stack (and thus the screen), it receives an
 * end() message. The view can return a data object as result of that message. When
 * the view later again becomes visible that same data object will be passed as part
 * of its begin() message.
 * 
 * Using such data objects views can easily retain (or at least restore) their internal
 * state. But be warned that that data should not be excessive, as we are running
 * in embedded systems and often have to trade space for time.
 * 
 * The ViewStack also installs a key handler for the currently active view, and uninstalls
 * it when no longer needed. A view that has a onKey(keyEvt) method will automatically
 * receive key events.
 */
jCinema.ViewStack = function () {
	
	/**
	 * The actual stack on which views and their state are stored. Each
	 * item on the stack is an object with these properties:
	 * 
	 * <ul>
	 * <li>data: the data object passed in begin() and end() messages</li>
	 * <li>viewName: the name of the type of view</li>
	 * </ul>
	 * 
	 * @private
	 */
	var stack = [];
	
	/**
	 * ViewNamingStrategy is a helper class that returns Urls to required
	 * view resources, based on a specific naming strategy. This way the
	 * actual layout of files on disk is better decoupled from the rest
	 * of this class.
	 * @constructor
	 * 
	 * @private
	 * @param {String} viewName The name of the view for which to return names and urls.
	 */
	var ViewNamingStrategy = function (viewName) {
		var viewBaseUrl;
		var moduleName;
		var parts = viewName.split('.');
		if (parts.length == 1) {
			// this is a core view, stored directly in jCinema/views
			viewBaseUrl = 'jCinema/views/' + viewName;
		} else if (parts.length == 2) {
			// this is a module view, stored in a module directory
			moduleName = parts[0];
			viewName = parts[1];
			viewBaseUrl = 'jCinema/modules/' + moduleName + '/views/' + parts[1];
		} else {
			throw 'Illegal view name ' + viewName + ': Use format "ViewName" or "ModuleName.ViewName"';
		}
		
		return {
			getControllerClass: function () {
				return jCinema.views[viewName + 'Controller'];
			},
			getViewJSUrl: function () {
				return viewBaseUrl + '/controller.js';
			},
			getViewHtmlUrl: function () {
				return viewBaseUrl + '/view.html';
			},
			getViewCSSUrl: function () {
				return viewBaseUrl + '/view.css';
			},
			getViewStyleCSSUrl: function () {
				return 'jCinema/styles/' + jCinema.options.Style + '/' + viewName + '.css';
			},
			getViewLocaleUrl: function () {
				return viewBaseUrl + '/locale';
			}
		};
	};
	
	/**
	 * Helper function to make a view begin its work after it's been pushed onto
	 * the stack or after all views above it have been popped.
	 * 
	 * It installs a key handler for the view (or a dummy one, so we can unconditionally
	 * remove it later), and as final step it sends the begin() message to the view along
	 * with the data object as parameter.
	 * 
	 * @private
	 * @param {String} viewName The name of the view. This is used to find the controller class.
	 * @param {Object} data Private data object. Only the respective view knows what's inside.
	 */
	function beginView(viewName, data) {
		// push a key handler for the view
		var controller = ViewNamingStrategy(viewName).getControllerClass();
		if (controller.onKey) {
			jCinema.IKeyHandler.pushHandler(controller.onKey);
		} else {
			// a dummy key handler, so we can pop it later unconditionally
			jCinema.IKeyHandler.pushHandler(function () { return true; });
		}
		
		// and let it begin its work
		controller.begin(data);
	}
	
	/**
	 * Helper function to make the current top view end its work because it's
	 * being popped from the stack, or a new view is pushed on top of it.
	 * 
	 * It removes the key handler that beginView() has installed, and stores the
	 * result of the view's end() message on the view's stack entry. It will be
	 * passed to it in begin() when it's becoming active again next time.
	 * 
	 * This function also guards against the last view being popped, as this must
	 * never happen.
	 * 
	 * @private
	 */
	function endCurrentView() {
		// end the current view first
		if (stack.length > 0) {
			// pop the key handler we installed
			jCinema.IKeyHandler.popHandler();
			
			// let the end() function provide data,
			// that will be passed to begin() next
			// time
			var current = stack[stack.length - 1];
			current.data = ViewNamingStrategy(current.viewName).getControllerClass().end();
		}
	}
	
	/**
	 * Prepares a view of a certain type for display. This includes loading its contoller
	 * class, stylesheet, and localization.
	 * 
	 * @private
	 * @param {String} viewName The name of the view to prepare.
	 * @param {Function} onComplete Called when preparation is finished, and the view can be used.
	 */
	function prepareView(viewName, onComplete) {
		var vns = ViewNamingStrategy(viewName);
		jCinema.Utils.includeCSS(vns.getViewCSSUrl(), function () {
			// try to load a custom css from the styles directory
			jCinema.Utils.includeCSS(vns.getViewStyleCSSUrl(), function () {
				jCinema.Utils.includeJS(vns.getViewJSUrl());
				
				// load the localization dict as well
				jCinema.Localization.loadDictionary(vns.getViewLocaleUrl());
				
				onComplete();
			});
		});
	}
	
	
	/**
	 * Puts a view actually on the screen.
	 * 
	 * @private
	 * @param {String} viewName The name of the view.
	 * @param {Object} data The data object to pass to the view's begin() method.
	 */
	function showView(viewName, data) {
		$('#view-container').load(ViewNamingStrategy(viewName).getViewHtmlUrl(), function () {
			// run the new view
			beginView(viewName, data);
		});
	}
	
	/**
	 * Pushes a new view onto the stack, thus making it the currently displayed
	 * view. The state of the previously current view is retained, and restored
	 * as soon as this view is popped from the stack.
	 * 
	 * @memberOf jCinema.ViewStack
	 * @param {String} viewName The name of the view to push.
	 * @param {Object} [data] An object containing data to configure the view. This is
	 * passed directly to the view controller's begin() method.
	 */
	var pushView = function (viewName, data) {
		jCinema.log('Pushing view ' + viewName);
		
		// first end the current view
		endCurrentView();
		
		// put the next view on the stack
		stack.push({
			viewName: viewName,
			data: data
		});
		
		// we MUST NOT run this directly because the CSS may not be
		// fully loaded at that point to make layout calculations.
		function doLoad() {
			showView(viewName, data);
		}
		
		// load the view if necessary
		if (ViewNamingStrategy(viewName).getControllerClass() === undefined) {
			// pass our doLoad function down as completion handler
			prepareView(viewName, doLoad);
		} else {
			// call doLoad directly, everything has been loaded before
			doLoad();
		}
	};
	
	/**
	 * Pops the currently top view from the stack. Its state is lost
	 * and the previous view is restored to its previous state. By
	 * default this method is directly linked to the "Back" key event.
	 * 
	 * Should the view have forgotten to remove the wait indicator
	 * from the screen, it will be done now as well.
	 * 
	 * @memberOf jCinema.ViewStack
	 */
	var popView = function () {
		// never pop the first view
		if (stack.length <= 1) {
			return;
		}
		
		// first end the current view and pop it from the stack
		endCurrentView();
		var popped = stack.pop();
		jCinema.log('Popping view ' + popped.viewName);
		
		// call begin() on the previous view (we know it's loaded)
		var current = stack[stack.length - 1];
		showView(current.viewName, current.data);
		
		// hide the wait indicator, in case the view forgot
		waitIndicator(false);
	};
	
	/**
	 * Shows or hides the wait indicator. This is a globally available
	 * UI element indicating to the user that some action can take a
	 * while, but everything is alright. The wait indicator is visually
	 * on top of all other UI elements.
	 * 
	 * @memberOf jCinema.ViewStack
	 * @param {Boolean} [show=true] Controls if the wait indicator is to be
	 * shown or hidden.
	 */
	var waitIndicator = function (show) {
		if (show === true || show === undefined) {
			$('#waiting-view').show();
		} else {
			$('#waiting-view').hide();
		}
	};
	
	return {
		pushView: pushView,
		popView:  popView,
		
		waitIndicator: waitIndicator
	};
	
}();
