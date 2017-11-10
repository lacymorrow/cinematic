## Meteor Desktop localStorage

Because of `Electron` and `meteor-desktop` implementation the builtin `Chrome` localStorage works unreliably.
This package provides a working localStorage substitute for `meteor-desktop`.
Available as `Meteor._localStorage`.
API is [here](https://github.com/wojtkowiak/meteor-desktop-localstorage/blob/master/plugins/localstorage/localstorage.js#L14).
**This also makes Meteor autologin work properly in Electron.**

Works only when installed with a `meteor-desktop` plugin -> [`meteor-desktop-localstorage`](https://www.npmjs.com/package/meteor-desktop-localstorage) 
