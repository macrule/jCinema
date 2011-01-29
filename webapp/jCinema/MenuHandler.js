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
 * Creates a menu with the given title, and items. If an icon url is given,
 * the view layer can use it in combination with the title.
 * @constructor
 *
 * @param {String} title The title of this menu.
 * @param {jCinema.MenuEntry[]} items Array of items contained in
 * this menu.
 * @param {String} [iconUrl] Url to an image for this menu.
 */
jCinema.Menu = function(title, items, iconUrl) {
	this.title = title;
	this.items = items || [];
	this.iconUrl = iconUrl;
};

/**
 * Appends a menu entry to the list of entries of the menu.
 *
 * @param {jCinema.MenuEntry} entry The entry which to append to a menu.
 */
jCinema.Menu.prototype.append = function(entry) {
	entry.parentMenu = this;
	this.items.push(entry);
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
 * @param {String} title The title of this menu entry.
 * @param {jCinema.Menu} [nextMenu] The next menu to show when this
 * entry is activated.
 * @param {Function} [onAction] A handler to call when this entry is activated.
 * It this handler returns <code>false</code>, the nextMenu will not be shown.
 * @param {String} [iconUrl] Url to an image for this menu entry.
 */
jCinema.MenuEntry = function(title, nextMenu, onAction, iconUrl) {
	this.title = title;
	this.parentMenu = undefined;
	this.nextMenu = nextMenu;
	this.onAction = onAction;
	this.iconUrl = iconUrl;
};

/**
 * Activates a menu entry. This is to be called by the view layer if a user has clicked
 * that menu entry, and now is the time to execute whatever action is tied to it.
 *
 * @returns {Boolean} True if action was taken, false if nothing happened.
 */
jCinema.MenuEntry.prototype.activate = function() {
	// execute the optional handler
	if (this.onAction) {
		if (this.onAction(this) === false) {
			// handler vetoed
			return false;
		}
	}
	
	if (!this.nextMenu) {
		return false;
	}
	
	// go to that menu
	jCinema.MenuHandler.showMenu(this.nextMenu);
	return true;
};


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
 * var menu2 = new jCinema.Menu('menu2');
 * menu2.append(new jCinema.MenuEntry('a'));
 * menu2.append(new jCinema.MenuEntry('b'));
 * menu2.append(new jCinema.MenuEntry('c'));
 * 
 * var menu1 = new jCinema.Menu('menu1');
 * menu1.append(new jCinema.MenuEntry('1'));
 * menu1.append(new jCinema.MenuEntry('2', menu2));
 * menu1.append(new jCinema.MenuEntry('3'));
 * menu1.append(new jCinema.MenuEntry('Movies', undefined,
 *   function () { jCinema.ViewStack.pushView('VideoBrowser'); },
 *   'jCinema/images/video-icon.png'));
 * jCinema.MenuHandler.showMenu(menu1);
 * 
 */
jCinema.MenuHandler = function () {
	
	/**
	 * Show a menu on screen. This should normally only be used
	 * to show the main menu as first action. After that new menus
	 * are automatically handled by <code>jCinema.MenuEntry.activate()</code>.
	 * 
	 * @memberOf jCinema.MenuHandler
	 * @param {jCinema.MenuHandler.Menu} menu The menu to show on screen.
	 */
	var showMenu = function (menu) {
		// show the menu view for the next menu
		jCinema.ViewStack.pushView('MenuView', {
			menu: menu
		});
	};
	
	return {
		showMenu: showMenu
	};
	
}();
