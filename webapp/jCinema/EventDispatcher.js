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
 * jCinema.Event is the fundamental event class in jCinema. Listeners can subscribe
 * to receive events of specific types by using jCinema.EventDispatcher.
 * 
 * @constructor
 * 
 * @param {String} type An identifier for the event type.
 * @param {Object} [params] Any parameters to further specify the event.
 * @see jCinema.EventDispatcher
 */
jCinema.Event = function (type, params) {
	this.type = type;
	this.params = params || {};
};
jCinema.Event.prototype.post = function () {
	return jCinema.EventDispatcher.dispatchEvent(this);
};

/**
 * jCinema.Command is a subclass of jCinema.Event. It is worth noting
 * that there is no real distinction between event and command in jCinema.
 * Both are handled the same way by jCinema.EventDispatcher. The difference is
 * mainly in intent (commands instruct that something should happen, events
 * notify that something has happened or is about to happen).
 * 
 * To make sure event and command types don't clash, command type names are
 * prefixed with "Command." automatically in this constructor.
 * 
 * @constructor
 * @extends jCinema.Event
 * 
 * @param {String} type An identifier for the event type.
 * @param {Object} [params] Any parameters to further specify the event.
 * @see jCinema.EventDispatcher
 */
jCinema.Command = function (type, params) {
	// call super constructor, and prefix the type name
	jCinema.Command.superclass.constructor.call(this, 'Command.' + type, params);
};
jCinema.Utils.extendClass(jCinema.Command, jCinema.Event);

/**
 * @class
 * The EventDispatcher class is the central place for event delivery and
 * processing in jCinema.
 * 
 * Anyone interested in receiving events can subscribe to a certain type of
 * event, or to all events. Whenever an event is posted, all listeners for
 * that event type are in turn passed the event, using the handler function
 * they passed during registration.
 * 
 * A listener who handled the event can return true from their handler function
 * to ensure that no other handler is called, and can process the event a
 * second time.
 */
jCinema.EventDispatcher = function () {
	
	/**
	 * An array with object literals, storing each listener's handler function
	 * and the event type they subscribed to.
	 * @private
	 */
	var eventListeners = [];
	
	/**
	 * Add an event listener for all or a specific event type.
	 * 
	 * @memberOf jCinema.EventDispatcher
	 * @param {Function} handler Event handler that takes the event as single argument.
	 * @param {String} [evtType] Type of event to subscribe to, all event types if omitted.
	 */
	var addListener = function (handler, evtType) {
		// TODO: check for duplicate entry
		eventListeners.push({
			type: evtType || undefined,
			handler: handler
		});
	};
	
	/**
	 * Remove a listener that was previously added with addListener().
	 * 
	 * @memberOf jCinema.EventDispatcher
	 * @param {Function} handler The listener function to remove.
	 * @param {String} [evtType] If specified, only remove the listener if it was
	 * registered with that event type, otherwise remove all entries with that handler.
	 */
	var removeListener = function (handler, evtType) {
		// TODO
	};
	
	/**
	 * Dispatch an event to one or more registered event listeners. All
	 * event listeners matching the event type will be notified about the
	 * event in order of their subscription.
	 * 
	 * Event propagation stops at the first listener that returns <code>true</code>.
	 * 
	 * @memberOf jCinema.EventDispatcher
	 * @param {jCinema.Event} evt
	 */
	var dispatchEvent = function (evt) {
		for (var i = 0, len = eventListeners.length; i < len; i++) {
			var listener = eventListeners[i];
			if (listener.type === undefined || listener.type === evt.type) {
				if (listener.handler(evt) === true) {
					// event has been handled
					return true;
				}
			}
		}
		
		// event has not been handled
		jCinema.debug('Event was not be handled: ' + evt.type);
		return false;
	};
	
	return {
		dispatchEvent: dispatchEvent,
		addListener: addListener,
		removeListener: removeListener
	};
}();
