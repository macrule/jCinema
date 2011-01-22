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

jCinema.views.MenuViewController = function() {
	
	// private vars
	var currentMenu;
	var menuUl;
	var menuContainer;
	var menuIcon;
	
	function setMenu(menu) {
		currentMenu = menu;
		
		// set menu title and icon
		$('#menutitle').text(currentMenu.title);
		$('#menutitleicon').attr('src', currentMenu.iconUrl);
		
		// set menu items
		menuUl.empty();
		for (var i = 0, len = currentMenu.items.length; i < len; i++) {
			menuUl.append('<li>' + currentMenu.items[i].title +'<span>&gt;</span></li>');
		}
	}
	
	function getSelectedItemIndex() {
		var sel = getSelectedItem();
		if (sel.length !== 0) {
			return $('li', menuUl).index(sel);
		} else {
			return 0;
		}
	}
	
	function getSelectedItem() {
		return $('li.selected', menuUl);
	}
	
	function selectItemAt(index) {
		var items = $('li', menuUl);
		
		// sanitize input
		index = Math.max(index, 0);
		index = Math.min(index, items.length);
		
		selectItem(items.eq(index));
	}
	
	function selectItem(liItem) {
		if (liItem !== undefined && liItem.length !== 0) {
			getSelectedItem().removeClass('selected');
			liItem.addClass('selected');
			scrollToItem(liItem);
			updateIcon();
		}
	}
	
	function updateIcon() {
		var iconUrl;
		
		// try to get icon for selected menu item
		var menuItem = currentMenu.items[getSelectedItemIndex()];
		iconUrl = menuItem.iconUrl;
		
		// fall back to menu icon
		if (iconUrl === undefined) {
			iconUrl = currentMenu.iconUrl;
		}
		
		if (iconUrl !== undefined) {
			menuIcon.attr('src', iconUrl);
			menuIcon.css('visibility', 'visible');
		} else {
			menuIcon.attr('src', '');
			menuIcon.css('visibility', 'hidden');
		}
	}
	
	function scrollToItem(liItem) {
		var containerHeight = menuContainer.innerHeight();
		var menuHeight = menuUl.outerHeight();
		
		var top = 0;
		if (menuHeight > containerHeight) {
			var containerCenter = containerHeight / 2;
			var itemHeight = liItem.outerHeight();
			var itemCenter = liItem.position().top + (itemHeight / 2);
			
			top = (containerCenter - itemCenter) - (itemHeight / 2);
			top = Math.min(top, 0);
			top = Math.max(top, containerHeight - menuHeight);
			top = Math.floor(top / itemHeight) * itemHeight;
		}
		
		menuUl.css('top', top);
	}
	
	function activateSelectedItem() {
		var index = getSelectedItemIndex();
		if (index >= 0 && index < currentMenu.items.length) {
			jCinema.MenuHandler.activateMenuEntry(currentMenu.items[index]);
		}
	}
	
	// ViewStack installs a handler for this
	var onKey = function (keyEvt) {
		var sel = getSelectedItem();
		
		switch (keyEvt.type) {
			case jCinema.IKeyHandler.KeyEvent.Up:
				selectItem(sel.prev());
				return false;
			case jCinema.IKeyHandler.KeyEvent.Down:
				selectItem(sel.next());
				return false;
			case jCinema.IKeyHandler.KeyEvent.Previous:
				selectItemAt(0);
				return false;
			case jCinema.IKeyHandler.KeyEvent.Next:
				selectItemAt(currentMenu.items.length - 1);
				return false;
				
			case jCinema.IKeyHandler.KeyEvent.Enter:
				activateSelectedItem();
				return false;
				
			default:
				return true;
		}
	};
	
	// the main function called when the view becomes active
	var begin = function (data) {
		menuContainer =  $('.menucontainer');
		menuUl = $('ul.menu', menuContainer);
		menuIcon = $('#menuicon');
		
		// merge passed in data with defaults
		data = $.extend({
			menu: undefined,
			selectedIndex: 0
		}, data);
		
		// initialize the view
		setMenu(data.menu);
		selectItemAt(data.selectedIndex);
	};
	
	// the main function called when the view becomes inactive
	var end = function () {
		return {
			menu: currentMenu,
			selectedIndex: getSelectedItemIndex()
		};
	};
	
	return {
		begin: begin,
		end:   end,
		onKey: onKey
	};
	
}();
