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


// This interface defines all the platform specific functions
// necessary to get video playing working. An implementation
// must be provided for each platform.

jCinema.IVideoControl = function () {
	
	var init = function (opts) {
		return true;
	};
	
	// ----------------------------------------------
	// Enums
	
	var PlayMode = {
		Playing:     'Playing',
		Stopped:     'Stopped',
		Paused:      'Paused',
		FastForward: 'FastForward',
		Reverse:     'Reverse'
	};
	
	
	// ----------------------------------------------
	// Control methods
	
	var select = function(uri) {
		// unimplemented, override per platform
		jCinema.notImplemented('jCinema.IVideoControl.select');
		return false;
	};
	
	var play = function () {
		// unimplemented, override per platform
		jCinema.notImplemented('jCinema.IVideoControl.play');
		return false;
	};
	
	var stop = function () {
		// unimplemented, override per platform
		jCinema.notImplemented('jCinema.IVideoControl.stop');
		return false;
	};
	
	var pause = function () {
		// unimplemented, override per platform
		jCinema.notImplemented('jCinema.IVideoControl.pause');
		return false;
	};
	
	var fastForward = function (speed) {
		// unimplemented, override per platform
		jCinema.notImplemented('jCinema.IVideoControl.fastForward');
		return false;
	};
	
	var reverse = function (speed) {
		// unimplemented, override per platform
		jCinema.notImplemented('jCinema.IVideoControl.reverse');
		return false;
	};
	
	
	// ----------------------------------------------
	// Query methods
	
	// return a list of speeds that can be used with fastForward()
	var getAvailableFastForwardSpeeds = function () {
		// unimplemented, override per platform
		jCinema.notImplemented('jCinema.IVideoControl.getAvailableForwardSpeeds');
		return [];
	};
	
	// return a list of speeds that can be used with reverse()
	var getAvailableReverseSpeeds = function () {
		// unimplemented, override per platform
		jCinema.notImplemented('jCinema.IVideoControl.getAvailableReverseSpeeds');
		return [];
	};
	
	// return the current status as an array with two
	// elements [PlayMode, Speed]
	var getPlayMode = function () {
		// unimplemented, override per platform
		jCinema.notImplemented('jCinema.IVideoControl.getPlayMode');
		return [ PlayMode.Stopped, 0 ];
	};
	
	// returns the current position of the seek head
	// in seconds.
	var getCurrentPositionSeconds = function () {
		// unimplemented, override per platform
		jCinema.notImplemented('jCinema.IVideoControl.getCurrentPositionSeconds');
		return undefined;
	};
	
	// returns a dictionary with meta data on the
	// currently playing/loaded medium
	var getMediaInfo = function() {
		// unimplemented, override per platform
		jCinema.notImplemented('jCinema.IVideoControl.getMediaInfo');
		return {
			durationSeconds: undefined,
			fileName:        undefined,
			filePath:        undefined,
			title:           undefined
		};
	};
	
	
	// ----------------------------------------------
	// return all public interfaces
	return {
		init: init,
		
		PlayMode: PlayMode,
		
		select: select,
		play: play,
		stop: stop,
		pause: pause,
		fastForward: fastForward,
		reverse: reverse,
		
		getAvailableFastForwardSpeeds: getAvailableFastForwardSpeeds,
		getAvailableReverseSpeeds: getAvailableReverseSpeeds,
		getPlayMode : getPlayMode,
		getCurrentPositionSeconds: getCurrentPositionSeconds,
		getMediaInfo: getMediaInfo
	};
}();

