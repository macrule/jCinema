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


jCinema.IMediaDirectory = function () {
	
	var init = function (opts) {
		return true;
	};
	
	
	var getMovieList = function(path) {
		// default implementation, using the default backend code
		if (path == null || path == '') {
			path = jCinema.options.MediaSearchPath;
		}
		return jCinema.Utils.callBackEnd('listMovies', {
			searchPath: path,
			folderImagePathPattern:     jCinema.options.FolderImagePathPattern,
			thumbnailImagePathPattern:  jCinema.options.ThumbnailImagePathPattern,
			movieSheetImagePathPattern: jCinema.options.MovieSheetImagePathPattern,
			patternSeparator:	    	jCinema.options.PatternSeparator,
		});
	};
	
	
	return {
		init: init,
		
		getMovieList: getMovieList,
	};
	
}();
