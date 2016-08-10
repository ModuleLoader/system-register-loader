import RegisterLoader from 'es-module-loader/core/register-loader.js';
import { isBrowser, isNode, global, baseURI } from 'es-module-loader/core/common.js';
import { resolveUrlToParentIfNotPlain } from 'es-module-loader/core/resolve.js';
import { scriptLoad, nodeFetch } from 'es-module-loader/core/fetch.js';

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
  global.System.register = function() {
    loader.register.apply(loader, arguments);
  };
}
SystemRegisterLoader.prototype = Object.create(RegisterLoader.prototype);

// normalize is never given a relative name like "./x", that part is already handled
// so we just need to do plain name detect to throw as in the WhatWG spec
SystemRegisterLoader.prototype.normalize = function(key, parent, metadata) {
  if (key.indexOf(':') === -1)
    throw new RangeError('System.register loader does not resolve plain module names, resolving "' + key + '" to ' + parent);
  return key;
};

// instantiate just needs to run System.register
// so we load the module name as a URL, and expect that to run System.register
SystemRegisterLoader.prototype.instantiate = function(key, metadata) {
  var loader = this;

  return new Promise(function(resolve, reject) {
    if (isNode)
      nodeFetch(key, undefined, function(source) {
        eval(source);
        loader.processRegisterQueue(key);
        resolve();
      }, reject);
    else if (isBrowser)
      scriptLoad(key, function() {
        loader.processRegisterQueue(key);
        resolve();
      }, reject);
    else
      throw new Error('No fetch system defined for this environment.');
  });
};

export default SystemRegisterLoader;