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
 * @class
 * There's a stub function for every RPC method implemented in the backend
 * daemon. Platforms that implement new methods that are of no use to other
 * platforms should append their methods to jCinema.BackEndProxy from their
 * platform specific Main.js code, instead of adding it here.
 */

jCinema.BackEndProxy = function() {
	
	/**
	 * Use this to communicate with the JSON-RPC backend server, that is part of jCinema
	 * This automatically takes care of calling the correct platform-specific RPC module.
	 * 
	 * @memberOf jCinema.BackEndProxy
	 * @param {String} method Name of the RPC method to call.
	 * @param {Array|Object} params Positional or named parameters passed to the RPC method.
	 * @param {Function} [success] Handler executed if the call succeeds.
	 * @param {Function} [error] Handler executed if the call fails.
	 * @returns {Object} Result that the specific RPC you called generated.
	 */
	var execRPC = function (method, params, success, error) {
		var opts = {
			async: false,
			url: 'http://' + jCinema.options.BackEndHost + '/jCinemaRPC/' + jCinema.options.Platform,
			type: 'POST',
			cache: false,
			processData: false,
			dataType: 'json',
			data: JSON.stringify({
				version: '1.1',
				method: method,
				params: params || []
			}),
			success: function (result) { if (success) success(result.result); },
			error: error
		};
		
		var result = $.ajax(opts);
		if (result) {
			var json = $.parseJSON(result.responseText);
			if (json && json.result) {
				return json.result;
			}
		}
		
		return null;
	};
	
	/**
	 * Ask the backend server to search for movie files in the given directory. Only movie
	 * files and folder that are immediate children of searchPath are returned, no recursive
	 * search is done.
	 * 
	 * The backend returns an Array of Objects, each describing a single file or folder. The
	 * list is sorted alphabetically by movie title, but folders come first in the list.
	 * 
	 * Each item has these properties:
	 * <ul>
	 * <li>type: 'file' or 'folder'</li>
	 * <li>url: Url to the file or folder</li>
	 * <li>title: title of the movie or folder</li>
	 * <li>thumbnailImageUrl: Url to the image to show in a browser</li>
	 * <li>movieSheetImageUrl: Url to a movie sheet image with more details (only for type=file)</li>
	 * </ul>
	 * 
	 * @memberOf jCinema.BackEndProxy
	 * @param {String} searchPath The file path to search for movie files in.
	 * @param {String} [folderImagePathPattern=jCinema.options.FolderImagePathPattern]
	 * @param {String} [thumbnailImagePathPattern=jCinema.options.ThumbnailImagePathPattern]
	 * @param {String} [movieSheetImagePathPattern=jCinema.options.MovieSheetImagePathPattern]
	 * @param {String} [patternSeparator=jCinema.options.PatternSeparator]
	 * @returns {Object[]} List of objects, one per file/folder found.
	 */
	var listMovies = function(searchPath, folderImagePathPattern, thumbnailImagePathPattern, movieSheetImagePathPattern, patternSeparator) {
		var opts = jCinema.options;
		return execRPC('listMovies', {
			searchPath: searchPath,
			folderImagePathPattern:     (folderImagePathPattern || opts.FolderImagePathPattern),
			thumbnailImagePathPattern:  (thumbnailImagePathPattern || opts.ThumbnailImagePathPattern),
			movieSheetImagePathPattern: (movieSheetImagePathPattern || opts.MovieSheetImagePathPattern),
			patternSeparator:           (patternSeparator || opts.PatternSeparator)
		});
	};
	
	/**
	 * Ask the backend server for the UPnP host and port running on the current device. This
	 * is useful because from JavaScript it's impossible to do UPnP discovery, but on some
	 * platforms (at least on the WDTV) media control is done via the local UPnP server.
	 * 
	 * @memberOf jCinema.BackEndProxy
	 * @returns {String} Platform UPnP server in format 'host:port'
	 */
	var getUPnPHost = function() {
		return execRPC('getUPnPHost');
	};
	
	return {
		execRPC: execRPC,
		listMovies: listMovies,
		getUPnPHost: getUPnPHost
	};
 }();
