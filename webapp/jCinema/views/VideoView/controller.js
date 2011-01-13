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


// this controller takes care of all UI elements available
// while playing a video. the corresponding view is VideoView.html

jCinema.views.VideoViewController = function () {
	
	// private variables
	var controlsPanel;
	var seekSlider;
	var timePositionText;
	var statusIcon;
	
	var idleInterval = 200;
	var inactivityPeriodStart;
	var defaultOpacity;
	
	var timer;
	
	
	// private helper methods
	
	function resetInactivityPeriodStart() {
		inactivityPeriodStart = new Date().getTime();
	}
	function hasBeenInactiveForMilliSeconds(ms) {
		return (((new Date().getTime()) - inactivityPeriodStart) >= ms);
	}
	
	function showUI() {
		controlsPanel.css('opacity', defaultOpacity);
	}
	
	function hideUI() {
		controlsPanel.css('opacity', 0);
	}
	
	function idleHandler() {
		// update media information
		var mediaInfo = jCinema.IVideoControl.getMediaInfo();
		var mediaPos  = jCinema.IVideoControl.getCurrentPositionSeconds();
		var playMode  = jCinema.IVideoControl.getPlayMode();
		
		if (mediaInfo != null) {
			seekSlider.slider('option', 'max', mediaInfo.durationSeconds);
		}
		if (mediaPos != null) {
			seekSlider.slider('value', mediaPos);
			timePositionText.text(jCinema.Utils.convertSecondsToTimeCode(mediaPos, true));
		}
		if (playMode != null) {
			updatestatusIcon(playMode[0], playMode[1]);
		}
		
		// fade out UI after a time of inactivity, when playing
		if (playMode != null && playMode[0] == jCinema.IVideoControl.PlayMode.Playing) {
			if (hasBeenInactiveForMilliSeconds(5000)) {
				hideUI();
			}
		}
		
		// prepare next timer event
		timer = setTimeout(idleHandler, idleInterval);
	};
	
	function updatestatusIcon(mode, speed) {
		statusIcon.removeClass('icon-playing icon-paused icon-stopped icon-fastforward icon-reverse');
		switch (mode) {
			default:
			case jCinema.IVideoControl.PlayMode.Stopped:
				statusIcon.addClass('icon-stopped');
				break;
			case jCinema.IVideoControl.PlayMode.Playing:
				statusIcon.addClass('icon-playing');
				break;
			case jCinema.IVideoControl.PlayMode.Paused:
				statusIcon.addClass('icon-paused');
				break;
			case jCinema.IVideoControl.PlayMode.FastForward:
				statusIcon.addClass('icon-fastforward');
				break;
			case jCinema.IVideoControl.PlayMode.Reverse:
				statusIcon.addClass('icon-reverse');
				break;
		}
		
		if (mode == jCinema.IVideoControl.PlayMode.FastForward ||
			mode == jCinema.IVideoControl.PlayMode.Reverse) {
			$('.video-speed').html(speed + '&times;').css('visibility', 'visible');
		} else {
			$('.video-speed').css('visibility', 'hidden');
		}
	};
	
	function onStopKey() {
		// stop movie, and go back to browser
		jCinema.IVideoControl.stop();
		jCinema.ViewStack.popView();
	}
	
	function onPlayKey() {
		jCinema.IVideoControl.play();
	}
	
	function onPauseKey() {
		jCinema.IVideoControl.pause();
	}
	
	function onPlayPauseKey() {
		var playMode = jCinema.IVideoControl.getPlayMode();
		if (playMode[0] == jCinema.IVideoControl.PlayMode.Playing && playMode[1] == 1) {
			jCinema.IVideoControl.pause();
		} else {
			jCinema.IVideoControl.play();
		}
	};
	
	function findNextSpeed(speedArr, currentSpeed) {
		var index = speedArr.indexOf(currentSpeed);
		if (index >= 0) {
			index++;
			if (index >= speedArr.length) {
				// wrap back to the first speed
				index = 0;
			}
		} else {
			index = 0;
		}
		return speedArr[index];
	}
	
	function onFastForwardKey() {
		// switch to the next fastest forward speed available
		var playMode = jCinema.IVideoControl.getPlayMode();
		if (playMode !== null) {
			var speed = null;
			if (playMode[0] == jCinema.IVideoControl.PlayMode.FastForward) {
				speed = playMode[1];
			}
			var newSpeed = findNextSpeed(jCinema.IVideoControl.getAvailableFastForwardSpeeds(), speed);
			jCinema.debug('newSpeed = ' + newSpeed);
			if (newSpeed !== null) {
				if (playMode[0] == jCinema.IVideoControl.PlayMode.Paused) {
					// first go back to normal play mode
					jCinema.IVideoControl.play();
				}
				jCinema.IVideoControl.fastForward(newSpeed);
			}
		}
	}
	
	function onReverseKey() {
		// switch to the next fastest forward speed available
		var playMode = jCinema.IVideoControl.getPlayMode();
		if (playMode !== null) {
			var speed = null;
			if (playMode[0] == jCinema.IVideoControl.PlayMode.Reverse) {
				speed = playMode[1];
			}
			var newSpeed = findNextSpeed(jCinema.IVideoControl.getAvailableReverseSpeeds(), speed);
			jCinema.debug('newSpeed = ' + newSpeed);
			if (newSpeed !== null) {
				if (playMode[0] == jCinema.IVideoControl.PlayMode.Paused) {
					// first go back to normal play mode
					jCinema.IVideoControl.play();
				}
				jCinema.IVideoControl.reverse(newSpeed);
			}
		}
	}
	
	function onKey(keyEvt) {
		showUI();
		resetInactivityPeriodStart();
		
		switch (keyEvt.type) {
			case jCinema.IKeyHandler.KeyEvent.PlayPause:
				onPlayPauseKey();
				return false;
				
			case jCinema.IKeyHandler.KeyEvent.Play:
				onPlayKey();
				return false;
				
			case jCinema.IKeyHandler.KeyEvent.Pause:
				onPauseKey();
				return false;
				
			case jCinema.IKeyHandler.KeyEvent.Stop:
				onStopKey();
				return false;
				
			case jCinema.IKeyHandler.KeyEvent.FastForward:
				onFastForwardKey();
				return false;
				
			case jCinema.IKeyHandler.KeyEvent.Reverse:
				onReverseKey();
				return false;
				
			default:
				return true;
		}
	};
	
	// the main function called from the view (html)
	var begin = function (data) {
		// get references to the UI elements we need
		controlsPanel    = $('.video-controls');
		seekSlider       = $('.video-seek');
		timePositionText = $('.video-time');
		statusIcon       = $('.video-icon');
		
		// remember opacity as set in the css file
		defaultOpacity   = controlsPanel.css('opacity');
		
		// create the seek slider UI (jquery)
		seekSlider.slider();
		
		// we want to get key events
		jCinema.IKeyHandler.pushHandler(onKey);
		
		resetInactivityPeriodStart();
		
		timer = setTimeout(idleHandler, idleInterval);
	};
	
	var end = function () {
		clearTimeout(timer);
		jCinema.IKeyHandler.popHandler();
		jCinema.IVideoControl.stop();
	};
	
	return {
		begin: begin,
		end: end
	};
	
}();
