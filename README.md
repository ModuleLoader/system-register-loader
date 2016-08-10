System Register Loader
===

Only loads System.register modules, as described in https://github.com/ModuleLoader/es-module-loader/blob/master/docs/system-register.md.

Follows the WhatWG loader resolution algorithm, throwing when loading plain / bare names like "lodash".

Built with the ES Module Loader polyfill 1.0 branch at https://github.com/ModuleLoader/es-module-loader.

### Installation

```
npm install system-register-loader
```

### Browser Usage

```html
<script src="dist/system-register-loader.js"></script>
<script>
  var loader = new SystemRegisterLoader();

  // relative path or URL syntax is necessary as plain resolution throws
  loader.import('./path/to/file.js').then(function(m) {
    // ...
  });
</script>
```

### Node Usage

```javascript
var SystemRegisterLoader = require('system-register-loader');

var loader = new SystemRegisterLoader();

loader.import('./path').then(function(m) {
  // ...
});
```

LICENSE
---

MIT