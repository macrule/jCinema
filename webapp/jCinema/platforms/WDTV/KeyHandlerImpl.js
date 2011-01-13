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


jCinema.WDTV.KeyHandlerImpl = function () {
	
	var mapKeyEventTojCinemaEvent = function (keyEvent) {
		if (keyEvent.originalEvent.keyIdentifier == 'U+F00F') return jCinema.IKeyHandler.KeyEvent.Power;
		if (keyEvent.keyCode == 36) return jCinema.IKeyHandler.KeyEvent.Home;
		
		if (keyEvent.keyCode == 38) return jCinema.IKeyHandler.KeyEvent.Up;
		if (keyEvent.keyCode == 40) return jCinema.IKeyHandler.KeyEvent.Down;
		if (keyEvent.keyCode == 37) return jCinema.IKeyHandler.KeyEvent.Left;
		if (keyEvent.keyCode == 39) return jCinema.IKeyHandler.KeyEvent.Right;
		if (keyEvent.keyCode == 41) return jCinema.IKeyHandler.KeyEvent.Enter;
		
		if (keyEvent.keyCode == 27) return jCinema.IKeyHandler.KeyEvent.Back;
		if (keyEvent.keyCode == 18) return jCinema.IKeyHandler.KeyEvent.Option;
		
		if (keyEvent.keyCode == 19) return jCinema.IKeyHandler.KeyEvent.PlayPause;
		if (keyEvent.originalEvent.keyIdentifier == 'U+1000081') return jCinema.IKeyHandler.KeyEvent.Stop;
		if (keyEvent.originalEvent.keyIdentifier == 'U+F05A') return jCinema.IKeyHandler.KeyEvent.FastForward;
		if (keyEvent.originalEvent.keyIdentifier == 'U+F059') return jCinema.IKeyHandler.KeyEvent.Reverse;
		
		if (keyEvent.originalEvent.keyIdentifier == 'U+1000082') return jCinema.IKeyHandler.KeyEvent.Previous;
		if (keyEvent.originalEvent.keyIdentifier == 'U+1000083') return jCinema.IKeyHandler.KeyEvent.Next;
		
		if (keyEvent.originalEvent.keyIdentifier == 'U+F057') return jCinema.IKeyHandler.KeyEvent.Eject;
		if (keyEvent.originalEvent.keyIdentifier == 'U+1000094') return jCinema.IKeyHandler.KeyEvent.Search;
		
		// for testing with normal keyboard
		if (keyEvent.keyCode == 13) return jCinema.IKeyHandler.KeyEvent.Enter;
		
		return null;
	};
	
	return {
		mapKeyEventTojCinemaEvent: mapKeyEventTojCinemaEvent
	};
	
}();
