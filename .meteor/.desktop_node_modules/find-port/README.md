# find-port [![Build Status](https://secure.travis-ci.org/kessler/find-port.png?branch=master)](http://travis-ci.org/kessler/find-port)

[![NPM](https://nodei.co/npm/find-port.png)](https://nodei.co/npm/find-port/)
[![NPM](https://nodei.co/npm-dl/find-port.png)](https://nodei.co/npm/find-port/)

find an unused port in your localhost

```js
	var findPort = require('find-port')

	// scan a range
	findPort('127.0.0.1', 8000, 8003, function(ports) {
		console.log(ports)
	})

	// scan explicitly
	findPort('127.0.0.1', [8000, 8011], function(ports) {
		console.log(ports)
	})
```

- Since version 2.0.0 a local interface must be specified
- This module is not designed to scan remote ports only local ones.