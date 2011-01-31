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
 * Predefined command types should be put in this namespace.
 * @namespace
 */
jCinema.commands = {};

/**
 * Post this command to show a video browser starting at the given file url.
 * 
 * @constructor
 * @param {String} url The url to browse videos at.
 */
jCinema.commands.BrowseVideosAtFileUrl = function (url) {
	return new jCinema.Command('BrowseVideosAtFileUrl', {url: url});
};

/**
 * Post this command to start playing the video at the given file url.
 *  
 * @constructor
 * @param {String} url The url of the video to play.
 */
jCinema.commands.StartVideo = function (url) {
	return new jCinema.Command('StartVideo', {url: url});
};
