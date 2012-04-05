/* See license.txt for terms of usage */

define([
    "lib/trace",
    "app/tabWatcher",
    "chrome/window",
    "chrome/menu",
    "net/netMonitor",
],
function(FBTrace, TabWatcher, Win, Menu, NetMonitor) {

// ********************************************************************************************* //
// Constants

const Cc = Components.classes;
const Ci = Components.interfaces;

// ********************************************************************************************* //
// Implementation

/**
 * HttpMonitor represents the main application object.
 */
var HttpMonitor = 
{
    initialize: function(win)
    {
        // The parent XUL window.
        this.win = win;

        // Update current tab label.
        this.updateLabel();

        this.tabWatcher = new TabWatcher(this.getPanelDocument());

        // Initialize NetMonitor module.
        NetMonitor.initialize();
        NetMonitor.initializeUI();
    },

    destroy: function()
    {
        NetMonitor.shutdown();
    },

    // * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * //
    // Context Menu

    onContextShowing: function()
    {
        // xxxHonza: Net panel context menu.
    },

    // * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * //
    // List of tabs

    onTabListMenuShowing: function(popup)
    {
        var tabs = [];
        Win.iterateBrowserWindows("navigator:browser", function(win)
        {
            Win.iterateBrowserTabs(win, function(tab)
            {
                tabs.push(tab);
            });
        });

        // Populate the popup menu with entries (list of tab titles).
        for (var i=0; i<tabs.length; ++i)
        {
            var tab = tabs[i];
            var item = {
                nol10n: true,
                label: tab.label,
                type: "radio",
                checked: this.currentTab == tab,
                command: this.onSelectTab.bind(this, tab)
            };
            Menu.createMenuItem(popup, item);
        }

        // Yep, show the menu.
        return true;
    },

    onTabListMenuHidden: function(popup)
    {
        while (popup.childNodes.length > 0)
            popup.removeChild(popup.lastChild);
    },

    updateLabel: function()
    {
        var button = this.win.document.getElementById("currentTab");
        button.setAttribute("label", "Select Browser Tab ");

        if (this.currentTab)
            button.setAttribute("label", this.currentTab.label + " ");
    },

    onSelectTab: function(tab)
    {
        if (this.currentTab == tab)
            return;

        this.currentTab = tab;
        this.updateLabel();

        if (!this.currentTab)
            return;

        // Start watching the new tab (the previsous one, if any, is unwatched automatically).
        this.tabWatcher.watchTab(tab);
    },

    getPanelDocument: function()
    {
        var browser = this.win.document.getElementById("content");
        return browser.contentDocument;
    },
}

// ********************************************************************************************* //
// Registration

return HttpMonitor;

// ********************************************************************************************* //
});