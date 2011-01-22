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

/*
 * Example use:
	var mh = jCinema.MenuHandler;
	var menu2 = mh.createMenu('menu2');
	mh.appendMenuEntry(menu2, mh.createMenuEntry('a'));
	mh.appendMenuEntry(menu2, mh.createMenuEntry('b'));
	mh.appendMenuEntry(menu2, mh.createMenuEntry('c'));
	
	var menu1 = mh.createMenu('menu1');
	mh.appendMenuEntry(menu1, mh.createMenuEntry('1'));
	mh.appendMenuEntry(menu1, mh.createMenuEntry('2', menu2));
	mh.appendMenuEntry(menu1, mh.createMenuEntry('3'));
	mh.appendMenuEntry(menu1, mh.createMenuEntry('Movies', undefined, function () { jCinema.ViewStack.pushView('VideoBrowser'); }, 'jCinema/images/video-icon.png'));
	mh.showMenu(menu1);
*/

jCinema.MenuHandler = function () {
	
	var showMenu = function (menu) {
		// show the menu view for the next menu
		jCinema.ViewStack.pushView('MenuView', {
			menu: menu
		});
	};
	
	var createMenu = function (title, items, iconUrl) {
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
	
	var createMenuEntry = function (title, nextMenu, onAction, iconUrl) {
		var entry = {
			title:      title,
			parentMenu: undefined,
			nextMenu:   nextMenu,
			onAction:   onAction,
			iconUrl:    iconUrl
		};
		
		return entry;
	};
	
	var appendMenuEntry = function (parentMenu, entry) {
		entry.parentMenu = parentMenu;
		parentMenu.items.push(entry);
	};
	
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
		showMenu: showMenu,
		createMenu: createMenu,
		createMenuEntry: createMenuEntry,
		appendMenuEntry: appendMenuEntry,
		activateMenuEntry: activateMenuEntry
	};
	
}();
