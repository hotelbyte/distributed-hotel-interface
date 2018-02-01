/**
 @module DHIAPI
 */

(function () {
    'use strict';

    var postMessage = function(payload) {
        if(typeof payload === 'object') {
            payload = JSON.stringify(payload);
        }

        window.postMessage(payload, (!location.origin || location.origin === "null" ) ? '*' : location.origin);
    };

    var queue = [];

    const prefix = 'entry_';
    const MIST_SUBMENU_LIMIT = 100;

    // todo: error handling
    const filterAdd = function(options) {
        if (!(options instanceof Object)) { return false; }

        return ['name'].every(e => e in options);
    };

    // filterId the id to only contain a-z A-Z 0-9
    const filterId = function(str) {
        const filteredStr = String(str);
        let newStr = '';
        if (filteredStr) {
            for (let i = 0; i < filteredStr.length; i += 1) {
                if (/[a-zA-Z0-9_-]/.test(filteredStr.charAt(i))) {
                    newStr += filteredStr.charAt(i);
                }
            }
        }
        return newStr;
    };

    /**
     DHI API

     Provides an API for all dapps, which specifically targets features from the DHI browser

     @class dhi
     @constructor
     */
    const dhi = {
        callbacks: {},
        version: '__version__',
        license: '__license__',
        platform: '__platform__',
        requestAccount(callback) {
            if (callback) {
                if (!this.callbacks.connectAccount) {
                    this.callbacks.connectAccount = [];
                }
                this.callbacks.connectAccount.push(callback);
            }

            postMessage({
                type: 'dhiAPI_requestAccount'
            });
        },
        solidity: {
            version: '__solidityVersion__',
        },
        sounds: {
            bip: function playSound() {
                postMessage({
                    type: 'dhiAPI_sound',
                    message: 'bip'
                });
            },
            bloop: function playSound() {
                postMessage({
                    type: 'dhiAPI_sound',
                    message: 'bloop'
                });
            },
            invite: function playSound() {
                postMessage({
                    type: 'dhiAPI_sound',
                    message: 'invite'
                });
            },
        },
        menu: {
            entries: {},
            /**
             Sets the badge text for the apps menu button

             Example

             dhi.menu.setBadge('Some Text')

             @method setBadge
             @param {String} text
             */
            setBadge(text) {
                postMessage({
                    type: 'dhiAPI_setBadge',
                    message: text
                });
            },
            /**
             Adds/Updates a menu entry

             Example

             dhi.menu.add('tkrzU', {
                    name: 'My Meny Entry',
                    badge: 50,
                    position: 1,
                    selected: true
                }, function(){
                    // Router.go('/chat/1245');
                })

             @method add
             @param {String} id          The id of the menu, has to be the same accross page reloads.
             @param {Object} options     The menu options like {badge: 23, name: 'My Entry'}
             @param {Function} callback  Change the callback to be called when the menu is pressed.
             */
            add(id, options, callback) {
                const args = Array.prototype.slice.call(arguments);
                callback = (typeof args[args.length - 1] === 'function') ? args.pop() : null;
                options = (typeof args[args.length - 1] === 'object') ? args.pop() : null;
                id = (typeof args[args.length - 1] === 'string') || isFinite(args[args.length - 1]) ? args.pop() : null;

                if (!filterAdd(options)) { return false; }

                const filteredId = prefix + filterId(id);

                // restricting to 100 menu entries
                if (!(filteredId in this.entries) &&
                    Object.keys(this.entries).length >= MIST_SUBMENU_LIMIT) {
                    return false;
                }

                const entry = {
                    id: filteredId || 'dhi_defaultId',
                    position: options.position,
                    selected: !!options.selected,
                    name: options.name,
                    badge: options.badge,
                };

                queue.push({
                    action: 'addMenu',
                    entry,
                });

                if (callback) {
                    entry.callback = callback;
                }

                this.entries[filteredId] = entry;
                return true;
            },
            /**
             Updates a menu entry from the dhi sidebar.

             @method update
             @param {String} id          The id of the menu, has to be the same accross page reloads.
             @param {Object} options     The menu options like {badge: 23, name: 'My Entry'}
             @param {Function} callback  Change the callback to be called when the menu is pressed.
             */
            update() {
                this.add.apply(this, arguments);
            },
            /**
             Removes a menu entry from the dhi sidebar.

             @method remove
             @param {String} id
             @param {String} id          The id of the menu, has to be the same accross page reloads.
             @param {Object} options     The menu options like {badge: 23, name: 'My Entry'}
             @param {Function} callback  Change the callback to be called when the menu is pressed.
             */
            remove(id) {
                const filteredId = prefix + filterId(id);

                delete this.entries[filteredId];

                queue.push({
                    action: 'removeMenu',
                    filteredId,
                });
            },
            /**
             Marks a menu entry as selected

             @method select
             @param {String} id
             */
            select(id) {
                const filteredId = prefix + filterId(id);
                queue.push({ action: 'selectMenu', id: filteredId });

                for (const e in this.entries) {
                    if ({}.hasOwnProperty.call(this.entries, e)) {
                        this.entries[e].selected = (e === filteredId);
                    }
                }
            },
            /**
             Removes all menu entries.

             @method clear
             */
            clear() {
                this.entries = {};
                queue.push({ action: 'clearMenu' });
            },
        },
    };


    // Wait for response messages
    window.addEventListener('message', function(event) {
        var data;
        try {
            data = JSON.parse(event.data);
        } catch(e){
            data = event.data;
        }

        if(typeof data !== 'object') {
            return;
        }

        if (data.type === 'dhiAPI_callMenuFunction') {
            var id = data.message;

            if (dhi.menu.entries[id] && dhi.menu.entries[id].callback) {
                dhi.menu.entries[id].callback();
            }

        } else if (data.type === 'uiAction_windowMessage') {
            var params = data.message;

            if (dhi.callbacks[params.type]) {
                dhi.callbacks[params.type].forEach(function(cb) {
                    cb(params.error, params.value);
                });
                delete dhi.callbacks[params.type];
            }
        }
    });


    // work up queue every 500ms
    setInterval(function() {
        if (queue.length > 0) {

            postMessage({
                type: 'dhiAPI_menuChanges',
                message: queue
            });

            queue = [];
        }
    }, 500);


    window.dhi = dhi;
})();
