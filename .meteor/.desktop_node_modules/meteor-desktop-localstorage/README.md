# Meteor Desktop localStorage [![npm version](https://img.shields.io/npm/v/meteor-desktop-localstorage.svg)](https://npmjs.org/package/meteor-desktop-localstorage)
<sup>Travis</sup> [![Travis Build Status](https://travis-ci.org/wojtkowiak/meteor-desktop-localstorage.svg?branch=master)](https://travis-ci.org/wojtkowiak/meteor-desktop-localstorage) <sup>AppVeyor</sup> [![Build status](https://ci.appveyor.com/api/projects/status/c4faa7b42yhgjgo1?svg=true)](https://ci.appveyor.com/project/wojtkowiak/meteor-desktop-localstorage) <sup>CircleCI</sup> [![CircleCI](https://circleci.com/gh/wojtkowiak/meteor-desktop-localstorage.svg?style=svg)](https://circleci.com/gh/wojtkowiak/meteor-desktop-localstorage)

---
> This is a [Meteor Desktop](https://github.com/wojtkowiak/meteor-desktop) plugin. 
  
Because of `Electron` and `meteor-desktop` implementation the builtin `Chrome` localStorage works unreliably.  
This package provides a working `localStorage` substitute. Available as `Meteor._localStorage`.  
API is [here](https://github.com/wojtkowiak/meteor-desktop-localstorage/blob/master/plugins/localstorage/localstorage.js#L14).   
**This also makes Meteor autologin work properly in Electron.**

### Usage

In your `.desktop/settings.json` add this package to your plugins list:
```json
{
    "plugins": {
       "meteor-desktop-localstorage": {
            "version": "0.0.11"
        }
    }
}
```
It will also add `omega:meteor-desktop-localstorage` package to your Meteor project. 
### Settings

You can pass custom settings to the plugin, for example:
```json
{
    "plugins": {
       "meteor-desktop-localstorage": {
            "version": "0.0.11",
            "fileName": "myCustomName.json"
        }
    }
}
```

### Contribution

PRs are always welcome. Be sure to update the tests.

For smooth developing process you need to open two terminals. In the first one type `npm run build-watch` and in the second `npm run test-watch`. 

Tests are run by [AVA](https://github.com/avajs).
