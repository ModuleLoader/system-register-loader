var SystemRegisterLoader = require('../dist/system-register-loader.js');

var loader = new SystemRegisterLoader(__filename);

loader.import('./register.js').then(function(m) {
  console.log(m);
})
.catch(function(err) {
  setTimeout(function() {
    throw err;
  });
});
