import RegisterLoader from 'es-module-loader/core/register-loader.js';
import { isBrowser, isNode, global, baseURI, fileUrlToPath } from 'es-module-loader/core/common.js';
import { resolveUrlToParentIfNotPlain } from 'es-module-loader/core/resolve.js';

/*
 * Example System Register loader
 *
 * Loads modules in the browser and Node as System.register modules
 * Uses <script> injection in the browser, and fs in Node
 * If the module does not call System.register, an error will be thrown
 */
function SystemRegisterLoader(baseKey) {
  baseKey = resolveUrlToParentIfNotPlain(baseKey || (isNode ? process.cwd() : '.'), baseURI) || baseKey;
  RegisterLoader.call(this, baseKey);

  var loader = this;
  
  // ensure System.register is available
  global.System = global.System || {};
  if (typeof global.System.register == 'function')
    var prevRegister = global.System.register;
  global.System.register = function() {
    loader.register.apply(loader, arguments);
    if (prevRegister)
      prevRegister.apply(this, arguments);
  };
}
SystemRegisterLoader.prototype = Object.create(RegisterLoader.prototype);

// normalize is never given a relative name like "./x", that part is already handled
// so we just need to do plain name detect to throw as in the WhatWG spec
SystemRegisterLoader.prototype.normalize = function(key, parent, metadata) {
  var resolved = RegisterLoader.prototype.normalize.call(this, key, parent, metadata);
  if (!resolved)
    throw new RangeError('System.register loader does not resolve plain module names, resolving "' + key + '" to ' + parent);
  return resolved;
};

var fs;

// instantiate just needs to run System.register
// so we load the module name as a URL, and expect that to run System.register
SystemRegisterLoader.prototype.instantiate = function(key, metadata) {
  var thisLoader = this;

  return new Promise(function(resolve, reject) {
    if (isNode)
      Promise.resolve(fs || (fs = typeof require !== 'undefined' ? require('fs') : loader.import('fs').then(function(m){ return m.default })))
      .then(function(fs) {
        fs.readFile(fileUrlToPath(key), function(err, source) {
          if (err)
            return reject(err);

          // Strip Byte Order Mark out if it's the leading char
          var sourceString = source.toString();
          if (sourceString[0] === '\ufeff')
            sourceString = sourceString.substr(1);

          (0, eval)(sourceString);
          thisLoader.processRegisterContext(key);
          resolve();
        });
      });
    else if (isBrowser)
      scriptLoad(key, function() {
        thisLoader.processRegisterContext(key);
        resolve();
      }, reject);
    else
      throw new Error('No fetch system defined for this environment.');
  });
};

function scriptLoad(src, resolve, reject) {
  var script = document.createElement('script');
  script.type = 'text/javascript';
  script.charset = 'utf-8';
  script.async = true;

  script.addEventListener('load', load, false);
  script.addEventListener('error', error, false);

  script.src = src;
  document.head.appendChild(script);

  function load() {
    resolve();
    cleanup();
  }

  function error(err) {
    cleanup();
    reject(new Error('Fetching ' + src));
  }

  function cleanup() {
    script.removeEventListener('load', load, false);
    script.removeEventListener('error', error, false);
    document.head.removeChild(script);
  }
}

export default SystemRegisterLoader;
