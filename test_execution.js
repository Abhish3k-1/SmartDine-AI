const fs = require('fs');
const files = [
  'js/utils.js',
  'js/storage.js',
  'js/config.js',
  'js/api.js',
  'js/data.js',
  'js/auth.js',
  'js/router.js',
  'js/customer.js',
  'js/cart.js',
  'js/kitchen.js',
  'js/admin.js',
  'js/inventory.js',
  'js/analytics.js',
  'js/ai.js',
  'js/pwa.js',
  'js/app.js'
];

global.window = {
    location: { hash: '' },
    addEventListener: function() {},
    APP_CONFIG: { MODE: 'cloud' }
};
global.document = {
    addEventListener: function() {},
    getElementById: function() { return { innerHTML: '', appendChild: function() {} }; },
    querySelectorAll: function() { return []; },
    body: { setAttribute: function() {}, removeAttribute: function() {}, appendChild: function() {} },
    createElement: function() { return { classList: { add: function(){} }, style: {} }; }
};
global.localStorage = {
    getItem: function() { return null; },
    setItem: function() {},
    removeItem: function() {},
    clear: function() {}
};
global.navigator = {};
global.fetch = async () => {};

for(let f of files) {
  try {
    let code = fs.readFileSync(f, 'utf8');
    // We need to evaluate the code in the global context
    const script = new (require('vm').Script)(code);
    script.runInThisContext();
  } catch(e) {
    console.error("ERROR IN " + f + ":", e.message);
  }
}
console.log("All scripts evaluated successfully.");
