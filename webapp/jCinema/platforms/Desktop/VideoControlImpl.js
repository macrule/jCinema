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


// Implementation of jCinema.IVideoControl for testing and development
// on normal desktop computers.

jCinema.platform.Desktop.VideoControlImpl = function () {
	
	var init = function (opts) {
		return true;
	};
	
	// private state variables
	var currentMediaSrc;
	var playPending;
	var videoElement;
	
	
	// ----------------------------------------------
	// Control methods
	
	var select = function(uri) {
		currentMediaSrc = uri;
		return true;
	};
	
	var play = function () {
		if (videoElement) {
			if (videoElement.attr('src') != currentMediaSrc) {
				videoElement.attr('src', currentMediaSrc);
			}
			videoElement.get(0).play();
			videoElement.attr('volume', 0);
		} else {
			playPending = true;
		}
		return true;
	};
	
	var stop = function () {
		videoElement.get(0).pause();
		videoElement.attr('src', '');
		return true;
	};
	
	var pause = function () {
		videoElement.get(0).pause();
		return true;
	};
	
	var fastForward = function (speed) {
		return false;
	};
	
	var reverse = function (speed) {
		return false;
	};
	
	
	// ----------------------------------------------
	// Query methods
	
	// return a list of speeds that can be used with fastForward()
	var getAvailableFastForwardSpeeds = function () {
		return [ ];
	}
	
	// return a list of speeds that can be used with reverse()
	var getAvailableReverseSpeeds = function () {
		return [ ];
	}
	
	// return the current status as an array with two
	// elements [PlayMode, Speed]
	var getPlayMode = function () {
		if (videoElement.attr('paused')) {
			return [ jCinema.IVideoControl.PlayMode.Paused, 0 ];
		} else {
			return [ jCinema.IVideoControl.PlayMode.Playing, 1 ];
		}
	};
	
	// returns the current position of the seek head
	// in seconds.
	var getCurrentPositionSeconds = function () {
		return parseInt(videoElement.attr('currentTime'), 10);
	};
	
	// returns a dictionary with meta data on the
	// currently playing/loaded medium
	var getMediaInfo = function() {
		return {
			durationSeconds: parseInt(videoElement.attr('duration'), 10),
			fileName:        undefined,	// TODO
			filePath:        undefined,	// TODO
			title:           '',
		};
	};
	
	
	var setVideoElement = function (elem) {
		videoElement = elem;
		if (playPending === true) {
			play();
			playPending = false;
		}
	};
	
	// ----------------------------------------------
	// return all public interfaces
	return {
		init: init,
		
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
		getMediaInfo: getMediaInfo,
		
		setVideoElement: setVideoElement
	};
	
}();

