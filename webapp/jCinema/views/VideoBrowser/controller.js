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
// in the video browser. the corresponding view is VideoBrowser.html

jCinema.views.VideoBrowserController = function () {
	
	// private variables
	var coversUl;
	var numColumns;
	var numRows;
	var items;
	var currentBrowsePath;
	var currentFirstItem;
	
	// private helper methods
	
	function getCellSize() {
		// make sure there are enough li's present
		coversUl.append('<li class="tmp"><img src=""/></li>');
		
		var cellWidth = $('li.tmp', coversUl).outerWidth();
		var cellHeight = $('li.tmp', coversUl).outerHeight();
		
		// and remove the tmp li again
		$('li.tmp', coversUl).remove();
		
		return { width: cellWidth, height: cellHeight };
	}
	
	function getNumColumns() {
		if (numColumns === undefined) {
			// calculate number of columns
			numColumns = Math.floor(coversUl.outerWidth() / getCellSize().width);
		}
		return numColumns;
	}
	
	function getNumRows() {
		if (numRows === undefined) {
			// calculate number of columns
			numRows = Math.floor($(window).height() / getCellSize().height);
		}
		return numRows;
	}
	
	function populateCoverGrid(startIndex) {
		// handle the case of "no items" first
		if (items.length == 0) {
			numRows = numColumns = currentFirstItem = undefined;
			coversUl.empty();
			
			// (ab)use the tooltip to tell user about no images being available
			$('#title-tooltip > h3').text(jCinema.STR('No movies available').localize());
			$('#title-tooltip').css({
				left: ($('#VideoBrowser').outerWidth() - $('#title-tooltip').outerWidth())/2,
				top:  ($('#VideoBrowser').outerHeight() - $('#title-tooltip').outerHeight())/2,
			});
			return;
		}
		
		// sanitize the start index
		var totalNumRows = Math.ceil(items.length / getNumColumns());
		var maxStartIndex = (totalNumRows - getNumRows()) * getNumColumns();
		startIndex = Math.min(startIndex, maxStartIndex);
		startIndex = Math.max(startIndex, 0);
		
		// endIndex is really +1 the last shown index
		var endIndex = startIndex + (getNumRows() * getNumColumns());
		endIndex = Math.min(endIndex, items.length);
		
		if (currentFirstItem !== undefined) {
			// delete all li's up to start index
			for (var i = currentFirstItem; i < startIndex; i++) {
				$('li[data-item-index="' + i + '"]', coversUl).remove();
			}
			
			// delete all li's after end index
			$('li[data-item-index="' + endIndex + '"] ~ li', coversUl).remove();
		}
		
		// add li's after start index, unless they exist already
		for (var i = startIndex; i < endIndex; i++) {
			if ($('li[data-item-index="' + i + '"]', coversUl).size() > 0) {
				continue;
			}
			
			var liTag = '<li data-item-index="' + i + '"><img src=""/></li>';
			if (currentFirstItem === undefined || startIndex > currentFirstItem) {
				coversUl.append(liTag);
			} else {
				$(liTag).insertBefore($('li[data-item-index="' + currentFirstItem + '"]', coversUl));
			}
			
			// always start with the default icon
			var item = getItem(i);
			var img = $('li[data-item-index="' + i + '"]>img', coversUl);
			if (item.type == 'folder') {
				img.attr('src', jCinema.Utils.getStyledImageUrl('folder-icon.png'));
			} else if (item.type == 'file') {
				img.attr('src', jCinema.Utils.getStyledImageUrl('video-icon.png'));
			}
			
			// and exchange it with the real one as as soon as it's loaded.
			// this is to prevent "empty" pages if the images are slow to load.
			if (item.thumbnailImageUrl != null) {
				$('<img />').attr('src', item.thumbnailImageUrl).addClass('cover').load(function(i) {
					// we have to define the function this way, to make
					// sure the current(!) value of "i" becomes part of
					// the anonymous function, and not the value at time
					// of function execution.
					return function () {
						var tmpImg = $('li[data-item-index="' + i + '"]>img', coversUl);
						tmpImg.attr('src', $(this).attr('src')).addClass($(this).attr('className'));
					};
				}(i));
			}
		}
		
		// make the ul just wide enough to fit all columns
		coversUl.width(getNumColumns() * getCellSize().width);
		
		currentFirstItem = startIndex;
	}
	
	function selectItemAt(index) {
		if (index < 0) {
			index = 0;
		} else if (index >= items.length) {
			if (items.length == 0) {
				return;
			}
			index = items.length - 1;
		}
		$('img.selected', coversUl).removeClass('selected');
		$('li[data-item-index="' + index + '"] img', coversUl).addClass('selected');
		
		// show the tooltip on the bottom end of the li
		var item = getItem(index);
		if (item == null) {
			return;
		}
		var li = $('li[data-item-index="' + index + '"]');
		$('#title-tooltip > h3').text(item.title);
		$('#title-tooltip').css({
			left: li.position().left,
			top:  li.position().top + li.outerHeight() - $('#title-tooltip').outerHeight(),
			width: li.outerWidth()
		});
	}
	
	function getSelectedItemIndex() {
		return parseInt($('img.selected', coversUl).parent().data('item-index'), 10);
	}
	
	function getSelectedItemRowCol() {
		var pos = $('img.selected', coversUl).position();
		var cellSize = getCellSize();
		return {
			row: Math.floor(pos.top  / cellSize.height),
			col: Math.floor(pos.left / cellSize.width)
		};
	}
	
	function getItem(index) {
		return items[index];
	};
	
	function activateItemAt(index) {
		var item = getItem(index);
		if (item.type == 'folder') {
			jCinema.ViewStack.pushView('VideoBrowser', { browsePath: item.url });
		} else if (item.type == 'file') {
			showMovieSheet(item);
		}
	};
	
	function showMovieSheet(item) {
		if (item.movieSheetImageUrl == null) {
			// if there is no movie sheet, play the item directly
			if (jCinema.IVideoControl.select(item.url) &&
				jCinema.IVideoControl.play()) {
				jCinema.ViewStack.pushView('VideoView');
			}
			return;
		}
		
		jCinema.IKeyHandler.pushHandler(function (keyEvt) {
			var goBack = false;
			if (keyEvt.type === jCinema.IKeyHandler.KeyEvent.Enter ||
				keyEvt.type === jCinema.IKeyHandler.KeyEvent.Play ||
				keyEvt.type === jCinema.IKeyHandler.KeyEvent.PlayPause) {
				// enter and play button plays
				if (jCinema.IVideoControl.select(item.url) &&
					jCinema.IVideoControl.play()) {
					jCinema.IKeyHandler.popHandler(); // get rid of this keyhandler
					jCinema.ViewStack.pushView('VideoView');
				}
			} else if (keyEvt.type === jCinema.IKeyHandler.KeyEvent.Back) {
				// back button aborts
				goBack = true;
			}
			
			if (goBack) {
				$('#movie-sheet img').attr('src', '');
				$('#movie-sheet').css({visibility: 'hidden'});
				jCinema.IKeyHandler.popHandler();
				
				// if the back button is pressed before the image has loaded
				jCinema.ViewStack.waitIndicator(false);
			}
			
			// don't let anyone else handle key events
			return false;
		});
		
		// show wait indicator
		jCinema.ViewStack.waitIndicator(true);
		
		// hide the actual image before it's loaded
		var img = $('#movie-sheet img');
		img.hide();
		
		// show the backdrop
		$('#movie-sheet').css({visibility: 'visible'});
		
		// load the image, and show it when ready
		img.attr('src', item.movieSheetImageUrl).load(function () {
			img.show();
			
			// hide the wait indicator
			jCinema.ViewStack.waitIndicator(false);
		});
	}
	
	function onNavigate(dCols, dRows) {
		// must call getSelectedItemIndex() before we repopulate the grid
		var newIndex = getSelectedItemIndex() + dCols + (getNumColumns() * dRows);
		
		// move the page up or down if necessary
		var selRowCol = getSelectedItemRowCol();
		var firstRow = 0;
		var lastRow = (getNumRows() - 1);
		if (dRows < 0 && selRowCol.row + dRows < firstRow) {
			populateCoverGrid(currentFirstItem + (dRows * getNumColumns()));
		} else if (dRows > 0 && selRowCol.row + dRows > lastRow) {
			populateCoverGrid(currentFirstItem + (dRows * getNumColumns()));
		} else if (dCols < 0 && selRowCol.row == firstRow && selRowCol.col < -dCols) {
			populateCoverGrid(currentFirstItem - getNumColumns());
		} else if (dCols > 0 && selRowCol.row == lastRow && selRowCol.col + dCols >= getNumColumns()) {
			populateCoverGrid(currentFirstItem + getNumColumns());
		}
		
		selectItemAt(newIndex);
	}
	
	// ViewStack installs a handler for this
	var onKey = function (keyEvt) {
		switch (keyEvt.type) {
			case jCinema.IKeyHandler.KeyEvent.Up:
				onNavigate( 0, -1);
				return false;
			case jCinema.IKeyHandler.KeyEvent.Down:
				onNavigate( 0, +1);
				return false;
			case jCinema.IKeyHandler.KeyEvent.Left:
				onNavigate(-1,  0);
				return false;
			case jCinema.IKeyHandler.KeyEvent.Right:
				onNavigate(+1,  0);
				return false;
			case jCinema.IKeyHandler.KeyEvent.Previous:
				onNavigate( 0, -getNumRows());
				return false;
			case jCinema.IKeyHandler.KeyEvent.Next:
				onNavigate( 0, +getNumRows());
				return false;
				
			case jCinema.IKeyHandler.KeyEvent.Enter:
				activateItemAt(getSelectedItemIndex());
				return false;
				
			default:
				return true;
		}
	};
	
	// the main function called when the view becomes active
	var begin = function (data) {
		coversUl = $('#covers-area ul:first');
		
		// make sure we recalculate our layout on resize
		$(window).resize(function () {
			numColumns = numRows = undefined;
			
			// lift the constrain on width, or no resizing will happen
			coversUl.width('');
			
			var index = getSelectedItemIndex();
			populateCoverGrid(currentFirstItem);
			selectItemAt(index);
		});
		
		// merge passed in data with defaults
		data = $.extend({
			browsePath: undefined,
			startIndex: 0,
			selectedIndex: 0
		}, data);
		
		// get the available movies
		jCinema.ViewStack.waitIndicator(true);
		currentBrowsePath = data.browsePath;
		items = jCinema.IMediaDirectory.getMovieList(data.browsePath);
		if (items == null) {
			items = [];
		}
		jCinema.ViewStack.waitIndicator(false);
		
		// initialize the view
		currentFirstItem = undefined;
		populateCoverGrid(data.startIndex);
		selectItemAt(data.selectedIndex);
	};
	
	// the main function called when the view becomes inactive
	var end = function () {
		// return current selection and startIndex, so we
		// can restore it after video play
		return {
			browsePath:    currentBrowsePath,
			startIndex:    currentFirstItem,
			selectedIndex: getSelectedItemIndex()
		};
	};
	
	return {
		begin: begin,
		end:   end,
		onKey: onKey
	};
	
}();
