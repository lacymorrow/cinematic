Package.describe({
    name: 'omega:meteor-desktop-localstorage',
    summary: 'Persistent localStorage for meteor-desktop',
    version: '0.0.11',
    git: 'https://github.com/wojtkowiak/meteor-desktop-localstorage',
    documentation: 'README.md'
});

Package.onUse(function onUse(api) { // eslint-disable-line prefer-arrow-callback
    api.versionsFrom('METEOR@1.2.1');
    api.use('ecmascript', 'client');
    api.addFiles('localstorage.js', 'client');
});
