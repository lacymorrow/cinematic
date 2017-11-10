/* eslint-disable no-underscore-dangle, no-console */
let retries = 0;

/**
 * Fetches local storage data from the meteor-desktop-localstorage plugin.
 * Retries 5 times, then fails.
 */
function load() {
    Desktop.fetch('localStorage', 'getAll').then((storage) => {
        Meteor._localStorage.storage = storage;
    }).catch(() => {
        retries += 1;
        if (retries < 5) {
            load();
        } else {
            console.error('failed to load localStorage contents');
        }
    });
}

if (Meteor.isDesktop) {
    // Replace Meteor's localStorage with ours.
    Meteor._localStorage = {
        storage: {},

        getItem(key) {
            return this.storage[key];
        },

        setItem(key, value) {
            this.storage[key] = value;
            Desktop.send('localStorage', 'set', key, value);
        },

        clear() {
            this.storage = {};
            Desktop.send('localStorage', 'clear');
        },

        removeItem(key) {
            delete this.storage[key];
            Desktop.send('localStorage', 'remove', key);
        }
    };
    load();
}
