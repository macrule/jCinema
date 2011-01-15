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


jCinema.platform.Desktop.KeyHandlerImpl = function () {
	
	var mapKeyEventTojCinemaEvent = function (keyEvent) {
		// do not map key presses with Ctrl or Cmd (Apple) key pressed
		if (keyEvent.ctrlKey || keyEvent.metaKey) {
			return null;
		}
		
		if (keyEvent.keyCode == 38) return jCinema.IKeyHandler.KeyEvent.Up;
		if (keyEvent.keyCode == 40) return jCinema.IKeyHandler.KeyEvent.Down;
		if (keyEvent.keyCode == 37) return jCinema.IKeyHandler.KeyEvent.Left;
		if (keyEvent.keyCode == 39) return jCinema.IKeyHandler.KeyEvent.Right;
		if (keyEvent.keyCode == 13) return jCinema.IKeyHandler.KeyEvent.Enter;
		
		// Esc or Backspace work as back key
		if (keyEvent.keyCode == 27 || keyEvent.keyCode == 8) return jCinema.IKeyHandler.KeyEvent.Back;
		
		// Space bar is Play/Pause button
		if (keyEvent.keyCode == 32) return jCinema.IKeyHandler.KeyEvent.PlayPause;
		
		if (keyEvent.keyCode == 'O'.charCodeAt(0)) return jCinema.IKeyHandler.KeyEvent.Option;
		
		if (keyEvent.keyCode == 'P'.charCodeAt(0)) return jCinema.IKeyHandler.KeyEvent.Power;
		if (keyEvent.keyCode == 'H'.charCodeAt(0)) return jCinema.IKeyHandler.KeyEvent.Home;
		
		if (keyEvent.keyCode == 'T'.charCodeAt(0)) return jCinema.IKeyHandler.KeyEvent.Stop;
		if (keyEvent.keyCode == 'F'.charCodeAt(0)) return jCinema.IKeyHandler.KeyEvent.FastForward;
		if (keyEvent.keyCode == 'R'.charCodeAt(0)) return jCinema.IKeyHandler.KeyEvent.Reverse;
		
		if (keyEvent.keyCode == 'B'.charCodeAt(0)) return jCinema.IKeyHandler.KeyEvent.Previous;
		if (keyEvent.keyCode == 'N'.charCodeAt(0)) return jCinema.IKeyHandler.KeyEvent.Next;
		
		if (keyEvent.keyCode == 'E'.charCodeAt(0)) return jCinema.IKeyHandler.KeyEvent.Eject;
		if (keyEvent.keyCode == 'S'.charCodeAt(0)) return jCinema.IKeyHandler.KeyEvent.Search;
		
		// Home key also works
		if (keyEvent.keyCode == 36) return jCinema.IKeyHandler.KeyEvent.Home;
		
		// Page Down/Up works as Prev/Next
		if (keyEvent.keyCode == 33) return jCinema.IKeyHandler.KeyEvent.Previous;
		if (keyEvent.keyCode == 34) return jCinema.IKeyHandler.KeyEvent.Next;
		
		return null;
	};
	
	return {
		mapKeyEventTojCinemaEvent: mapKeyEventTojCinemaEvent
	};
	
}();
