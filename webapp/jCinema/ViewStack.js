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


jCinema.ViewStack = function () {
	
	var stack = [];
	
	function beginView(viewName, data) {
		// push a key handler for the view
		var controller = jCinema.views[viewName + 'Controller'];
		if (controller.onKey) {
			jCinema.IKeyHandler.pushHandler(controller.onKey);
		} else {
			// a dummy key handler, so we can pop it later unconditionally
			jCinema.IKeyHandler.pushHandler(function () { return true; });
		}
		
		// and let it begin its work
		controller.begin(data);
	};
	
	function endCurrentView() {
		// end the current view first
		if (stack.length > 0) {
			// pop the key handler we installed
			jCinema.IKeyHandler.popHandler();
			
			// let the end() function provide data,
			// that will be passed to begin() next
			// time
			var current = stack[stack.length - 1];
			current.data = jCinema.views[current.viewName + 'Controller'].end();
		}
	};
	
	// load a view's contoller and stylesheet
	function prepareView(viewName, onComplete) {
		var baseUrl = 'jCinema/views/' + viewName + '/';
		jCinema.Utils.includeCSS(baseUrl + 'view.css', function () {
			// try to load a custom css from the styles directory
			jCinema.Utils.includeCSS('jCinema/styles/' + jCinema.options.Style + '/' + viewName + '.css', function () {
				jCinema.Utils.includeJS(baseUrl + 'controller.js');
				
				// load the localization dict as well
				jCinema.Localization.loadDictionary(baseUrl + 'locale');
				
				onComplete();
			});
		});
	};
	
	
	function showView(viewName, data) {
		$('#view-container').load('jCinema/views/' + viewName + '/view.html', function () {
			// run the new view
			beginView(viewName, data);
		});
	};
	
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
		if (jCinema.views[viewName + 'Controller'] === undefined) {
			// pass our doLoad function down as completion handler
			prepareView(viewName, doLoad);
		} else {
			// call doLoad directly, everything has been loaded before
			doLoad();
		}
	};
	
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
