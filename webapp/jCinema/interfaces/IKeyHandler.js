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


jCinema.IKeyHandler = function () {
	
	var init = function (opts) {
		// install key handler
		$(document).keydown(jCinema.IKeyHandler.processKeyEvent);
		return true;
	};
	
	var KeyEvent = {
		Unknown:     'jCinema.KeyEvent.Unknown',
		
		Stop:        'jCinema.KeyEvent.Stop',
		PlayPause:   'jCinema.KeyEvent.PlayPause',
		Play:        'jCinema.KeyEvent.Play',
		Pause:       'jCinema.KeyEvent.Pause',
		FastForward: 'jCinema.KeyEvent.FastForward',
		Reverse:     'jCinema.KeyEvent.Reverse',
		Eject:       'jCinema.KeyEvent.Eject',
		
		Previous:    'jCinema.KeyEvent.Previous',
		Next:        'jCinema.KeyEvent.Next',
		
		Up:          'jCinema.KeyEvent.Up',
		Down:        'jCinema.KeyEvent.Down',
		Left:        'jCinema.KeyEvent.Left',
		Right:       'jCinema.KeyEvent.Right',
		Enter:       'jCinema.KeyEvent.Enter',
		
		Home:        'jCinema.KeyEvent.Home',
		Back:        'jCinema.KeyEvent.Back',
		Option:      'jCinema.KeyEvent.Option',
		Search:      'jCinema.KeyEvent.Search',
		
		Power:       'jCinema.KeyEvent.Power',
	};
	
	var eventHandlerStack = [
		{
			handler: function (evt) { return jCinema.IKeyHandler.defaultHandler(evt); },
			filter:  undefined
		}
	];
	
	var pushHandler = function (h, f) {
		var ffunc;
		if (typeof f == 'string') {
			// use a function that tests for the type
			ffunc = function (evt) { return (evt.type === f); };
		} else if (typeof f == 'function') {
			// pass on the filter function unchanged
			ffunc = f;
		}
		eventHandlerStack.push({ handler:h, filter:ffunc });
	};
	
	var popHandler = function () {
		eventHandlerStack.pop();
	};
	
	var defaultHandler = function (evt) {
		// handlers return true to pass the event
		// on to the next handler, and false to
		// stop handling.
		return true;
	};
	
	
	var mapKeyEventTojCinemaEvent = function (keyEvent) {
		// implement per platform to identify a key and
		// return the proper KeyEvent
		jCinema.notImplemented('jCinema.IKeyHandler.mapKeyEventTojCinemaEvent');
		return null;
	};
	
	var processKeyEvent = function (keyEvent) {
		var customEvent = jCinema.IKeyHandler.mapKeyEventTojCinemaEvent(keyEvent);
		if (customEvent == null) {
			customEvent = jCinema.IKeyHandler.KeyEvent.Unknown;
		}
		
		jCinema.debug('Recognized key: ' + customEvent);
		
		keyEvent.type = customEvent;
		
		for (var i = eventHandlerStack.length - 1; i >= 0; i--) {
			var h = eventHandlerStack[i];
			if (!(typeof h.filter == 'function') || h.filter(keyEvent) === true) {
				if (h.handler(keyEvent) === false) {
					// event has been handled and suppresses further handling
					keyEvent.preventDefault();
					return false;
				}
			}
		}
	};
	
	
	return {
		init: init,
		
		KeyEvent: KeyEvent,
		
		mapKeyEventTojCinemaEvent: mapKeyEventTojCinemaEvent,
		processKeyEvent: processKeyEvent,
		pushHandler: pushHandler,
		popHandler: popHandler,
		defaultHandler: defaultHandler
	};
	
}();
