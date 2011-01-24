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
 * All configuration options for the jCinema project are in this namespace.
 * 
 * config.default.js contains the default option values for jCinema. All values
 * can be overridden in the file config.js next to jCinema.html.
 * This file (config.default.js), however, should never be modified to actually
 * configure an installation. Copy what you need to config.js and modify there.
 * 
 * @namespace
 */
jCinema.options = {
	/**
	 * The current locale used by the UI.
	 * @default en
	 */
	Locale: 'en',
	
	/**
	 * The current UI style.
	 * @default default
	 */
	Style: 'default',
	
	/**
	 * The platform on which jCinema is being run. Currently allowed
	 * values are WDTV and Desktop.
	 * @default Desktop unless run from a QtEmbedded based browser, in which case WDTV is assumed.
	 */
	Platform:		(navigator.userAgent.indexOf('QtEmbedded') != -1) ? 'WDTV' : 'Desktop',
	
	/**
	 * The host and port on which the backend daemon is listening.
	 * Unless you modified the daemon itself leave this as is.
	 * @default 127.0.0.1:8080
	 */
	BackEndHost:	'127.0.0.1:8080',
	
	/**
	 * The root path which will be first shown in the video browser.
	 * @default /tmp/media/usb
	 */
	MediaSearchPath: '/tmp/media/usb',
	
	/**
	 * Defines the search paths used to find thumbnails to be used for a folder.
	 * Multiple patterns can be used, the first one that matches will be used.
	 * 
	 * These macros are available to construct patterns:
	 * <ul>
	 * <li>{path}:   full path to folder or movie</li>
	 * <li>{dir}:    full path to parent directory of folder or movie</li>
	 * <li>{name}:   file name without suffix</li>
	 * <li>{suffix}: file suffix including the dot</li>
	 * </ul>
	 * 
	 * @see jCinema.options.PatternSeparator
	 * @default {path}/{name}.jpg;{path}/folder.jpg
	 */
	FolderImagePathPattern:     '{path}/{name}.jpg;{path}/folder.jpg',
	
	/**
	 * Defines the search paths used to find thumbnails to be used for a movie.
	 * @see jCinema.options.FolderImagePathPattern
	 * @default {dir}/_MovieSheets/{name}/thumb.jpg;{dir}/{name}.jpg;{dir}/folder.jpg
	 */
	ThumbnailImagePathPattern:  '{dir}/_MovieSheets/{name}/thumb.jpg;{dir}/{name}.jpg;{dir}/folder.jpg',
	
	/**
	 * Defines the search paths used to find thumbnails to be used for a movie.
	 * @see jCinema.options.FolderImagePathPattern
	 * @default {dir}/_MovieSheets/{name}/sheet.jpg;{dir}/{name}{suffix}_sheet.jpg;{dir}/wd_tv.jpg
	 */
	MovieSheetImagePathPattern: '{dir}/_MovieSheets/{name}/sheet.jpg;{dir}/{name}{suffix}_sheet.jpg;{dir}/wd_tv.jpg',
	
	/**
	 * Defines the pattern separator.
	 * @see jCinema.options.FolderImagePathPattern
	 * @see jCinema.options.ThumbnailImagePathPattern
	 * @see jCinema.options.MovieSheetImagePathPattern
	 * @default ;
	 */
	PatternSeparator:           ';'
};
