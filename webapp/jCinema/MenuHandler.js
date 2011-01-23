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
 * 
 * This class stores the menu hierarchy, and controls the
 * view that displays the menu. It also provides the
 * necessary methods for the view to call, so it doesn't
 * need to have too much insight into the way menus are
 * implemented.
 * 
 * @example
 * var mh = jCinema.MenuHandler;
 * var menu2 = mh.Menu('menu2');
 * mh.appendMenuEntry(menu2, mh.MenuEntry('a'));
 * mh.appendMenuEntry(menu2, mh.MenuEntry('b'));
 * mh.appendMenuEntry(menu2, mh.MenuEntry('c'));
 * 
 * var menu1 = mh.Menu('menu1');
 * mh.appendMenuEntry(menu1, mh.MenuEntry('1'));
 * mh.appendMenuEntry(menu1, mh.MenuEntry('2', menu2));
 * mh.appendMenuEntry(menu1, mh.MenuEntry('3'));
 * mh.appendMenuEntry(menu1, mh.MenuEntry('Movies', undefined,
 *   function () { jCinema.ViewStack.pushView('VideoBrowser'); },
 *   'jCinema/images/video-icon.png'));
 * mh.showMenu(menu1);
 * 
 */
jCinema.MenuHandler = function () {
	
	/**
	 * Creates a menu with the given title, and items. If an icon url is given,
	 * the view layer can use it in combination with the title.
	 * @constructor
	 * 
	 * @memberOf jCinema.MenuHandler
	 * @param {String} title The title of this menu.
	 * @param {jCinema.MenuHandler.MenuEntry[]} items Array of items contained in
	 * this menu.
	 * @param {String} [iconUrl] Url to an image for this menu.
	 */
	var Menu = function (title, items, iconUrl) {
		if (items === undefined) {
			items = [];
		}
		var menu = {
			title: title,
			items: items,
			iconUrl: iconUrl
		};
		
		return menu;
	};
	
	/**
	 * Creates a menu entry with the given title. If an icon url is given,
	 * the view layer can use it in combination with the title. Usually a
	 * nextMenu should be given, so navigation in the menu hierarchy can be
	 * handled automatically and without pain.
	 * 
	 * For leaf nodes of the menu hierarchy, nextMenu can be left to
	 * <code>undefined</code> and an onAction handler can be used that
	 * triggers a different action.
	 * 
	 * Such handler can also be used to veto moving to nextMenu by returning
	 * <code>false</code>. The handler is always called before going to nextMenu.
	 * 
	 * @constructor
	 * 
	 * @memberOf jCinema.MenuHandler
	 * @param {String} title The title of this menu entry.
	 * @param {jCinema.MenuHandler.Menu} [nextMenu] The next menu to show when this
	 * entry is activated.
	 * @param {Function} [onAction] A handler to call when this entry is activated.
	 * It this handler returns <code>false</code>, the nextMenu will not be shown. 
	 * @param {String} [iconUrl] Url to an image for this menu entry.
	 */
	var MenuEntry = function (title, nextMenu, onAction, iconUrl) {
		var entry = {
			title:      title,
			parentMenu: undefined,
			nextMenu:   nextMenu,
			onAction:   onAction,
			iconUrl:    iconUrl
		};
		
		return entry;
	};
	
	
	/**
	 * Show a menu on screen. This should normally only be used
	 * to show the main menu as first action. After that new menus
	 * are automatically handled by <code>jCinema.MenuHandler.activateMenuEntry</code>.
	 * 
	 * @memberOf jCinema.MenuHandler
	 * @param {Menu} menu The menu to show on screen.
	 */
	var showMenu = function (menu) {
		// show the menu view for the next menu
		jCinema.ViewStack.pushView('MenuView', {
			menu: menu
		});
	};
	
	/**
	 * Appends a menu entry to the list of entries of a menu.
	 * 
	 * @memberOf jCinema.MenuHandler
	 * @param {jCinema.MenuHandler.Menu} parentMenu The menu to which to append this entry.
	 * @param {jCinema.MenuHandler.MenuEntry} entry The entry which to append to a menu.
	 */
	var appendMenuEntry = function (parentMenu, entry) {
		entry.parentMenu = parentMenu;
		parentMenu.items.push(entry);
	};
	
	/**
	 * Activates a menu entry. This is to be called by the view layer if a user has clicked
	 * that menu entry, and now is the time to execute whatever action is tied to it.
	 * 
	 * @memberOf jCinema.MenuHandler
	 * @param {jCinema.MenuHandler.MenuEntry} entry The menu entry to activate.
	 */
	var activateMenuEntry = function (entry) {
		if (entry === undefined) {
			return false;
		}
		
		// execute the optional handler
		if (entry.onAction != null) {
			if (entry.onAction(entry) === false) {
				// handler vetoed
				return false;
			}
		}
		
		if (entry.nextMenu == null) {
			return false;
		}
		
		// go to that menu
		showMenu(entry.nextMenu);
		return true;
	};
	
	return {
		Menu: Menu,
		MenuEntry: MenuEntry,
		showMenu: showMenu,
		appendMenuEntry: appendMenuEntry,
		activateMenuEntry: activateMenuEntry
	};
	
}();
