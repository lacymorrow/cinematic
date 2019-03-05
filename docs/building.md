

# Running & Developing Cinematic _(from source)_

Anyone else can run Cinematic on any OS by downloading or cloning the repo `lacymorrow/cinematic`. 

You will need to have [nodejs](http://nodejs.org), NPM, and [Meteor](https://www.meteor.com/install) installed.

```bash
cd cinematic
npm install    # or `yarn install`!
npm start         # http://localhost:3000
```

Running `meteor` from the `cinematic` directory quickstarts the application on [http://localhost:3000](http://localhost:3000).

### Packaging

To package Cinematic for your machine architecture:

###### YOU MUST HAVE A METEOR INSTANCE RUNNING WITH MOBILE ARCHITECTURE ENABLED IN A SEPARATE TERMINAL

`npm run serve` - _is an alias for: `meteor --mobile-server=127.0.0.1:3000`_

#### Build and test Desktop version. 

In your main terminal:

`npm run desktop`


#### Full Cross-platform build

To build for a Windows target from a MacOS host, you must have wine and [XQuartz](https://www.xquartz.org/) installed
```bash
# Using Homebrew
brew cask install xquartz && brew install wine
```


```bash
# The magic script. Builds for macOS and ia32 and x64 for Windows and Linux.
# Get some coffee, this takes awhile.

npm run build 
# alias: npm run desktop -- build-installer --buil-meteor --all-archs --win --mac --linux --production

# Or, to build for a specific platform:

npm run build-mac
# alias: npm run desktop -- build-installer --build-meteor --mac --production"

npm build-win
# alias: npm run desktop -- build-installer --build-meteor --all-archs --win --production"

npm run build-linux
# alias: npm run desktop -- build-installer --build-meteor --all-archs --linux --production"
```

To only build for current architecture: `npm run build-current`


##### Other Notes

```
# deploy server for hosted media server use
DEPLOY_HOSTNAME=galaxy.meteor.com meteor deploy myapp.meteorapp.com --settings settings.json

# build the project for the local machine, with a connection to the production server
meteor --settings settings.json --mobile-server https://myapp.meteorapp.com  
```


See [wojtkowiak/meteor-desktop](https://github.com/wojtkowiak/meteor-desktop) for more information.

_As of v1.1.0, we no longer use [arboleya/electrify](https://github.com/arboleya/electrify) for packaging_
