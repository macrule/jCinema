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


// Implementation of jCinema.IVideoControl for use with the
// WDTV media player.

jCinema.WDTV.VideoControlImpl = function () {
	
	var init = function (opts) {
		return true;
	};
	
	
	// ----------------------------------------------
	// Control methods
	
	var select = function(uri) {
		var result = jCinema.UPnP.executeCommand('AVTransport', 'SetAVTransportURI', { InstanceID: 0, CurrentURI: uri, CurrentURIMetaData: '' });
		return (result !== null);
	};
	
	var play = function () {
		var result = jCinema.UPnP.executeCommand('AVTransport', 'Play', { InstanceID: 0, Speed: 1 });
		return (result !== null);
	};
	
	var stop = function () {
		var result = jCinema.UPnP.executeCommand('AVTransport', 'Stop', { InstanceID: 0 });
		return (result !== null);
	};
	
	var pause = function () {
		var result = jCinema.UPnP.executeCommand('AVTransport', 'Pause', { InstanceID: 0 });
		return (result !== null);
	};
	
	var fastForward = function (speed) {
		var result = jCinema.UPnP.executeCommand('AVTransport', 'Play', { InstanceID: 0, Speed: speed });
		return (result !== null);
	};
	
	var reverse = function (speed) {
		var result = jCinema.UPnP.executeCommand('AVTransport', 'Play', { InstanceID: 0, Speed: -speed });
		return (result !== null);
	};
	
	
	// ----------------------------------------------
	// Query methods
	
	// return a list of speeds that can be used with fastForward()
	var getAvailableFastForwardSpeeds = function () {
		return [ 2, 4, 8, 16, 32, 64 ];
	}
	
	// return a list of speeds that can be used with reverse()
	var getAvailableReverseSpeeds = function () {
		return [ 2, 4, 8, 16, 32, 64 ];
	}
	
	// return the current status as an array with two
	// elements [PlayMode, Speed]
	var getPlayMode = function () {
		var result = jCinema.UPnP.executeCommand('AVTransport', 'GetTransportInfo', { InstanceID: 0 });
		if (result == null) {
			return [ jCinema.IVideoControl.PlayMode.Stopped, 0 ];
		}
		
		var status;
		switch (result.CurrentTransportState) {
			case 'PAUSED_PLAYBACK':
				status = jCinema.IVideoControl.PlayMode.Paused;
				break;
				
			case 'PLAYING':
				result.CurrentSpeed = parseInt(result.CurrentSpeed, 10);
				if (getAvailableFastForwardSpeeds().indexOf(result.CurrentSpeed) >= 0) {
					status = jCinema.IVideoControl.PlayMode.FastForward;
				} else if (getAvailableReverseSpeeds().indexOf(-result.CurrentSpeed) >= 0) {
					status = jCinema.IVideoControl.PlayMode.Reverse;
					result.CurrentSpeed = -result.CurrentSpeed;
				} else {
					status = jCinema.IVideoControl.PlayMode.Playing;
				}
				break;
				
			default:
			case 'STOPPED':
				status = jCinema.IVideoControl.PlayMode.Stopped;
				break;
		}
		
		return [ status, result.CurrentSpeed ];
	};
	
	// returns the current position of the seek head
	// in seconds.
	var getCurrentPositionSeconds = function () {
		var positionInfo = jCinema.UPnP.executeCommand('AVTransport', 'GetPositionInfo', { InstanceID: 0 });
		if (positionInfo === null) {
			return 0;
		}
		return jCinema.Utils.convertTimeCodeToSeconds(positionInfo.RelTime);
	};
	
	// returns a dictionary with meta data on the
	// currently playing/loaded medium
	var getMediaInfo = function() {
		// call the UPNP server
		var mediaInfo = jCinema.UPnP.executeCommand('AVTransport', 'GetMediaInfo', { InstanceID: 0 });
		if (mediaInfo === null) {
			return null;
		}
		
		return {
			durationSeconds: jCinema.Utils.convertTimeCodeToSeconds(mediaInfo.MediaDuration),
			fileName:        undefined,	// TODO
			filePath:        undefined,	// TODO
			title:           mediaInfo.title,
		};
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
		getMediaInfo: getMediaInfo
	};
	
}();

