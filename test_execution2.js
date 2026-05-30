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

const context = {
    window: { 
        location: { hash: '', replace: function(h) { this.hash = h; } },
        scrollTo: function() {},
        addEventListener: function() {},
        APP_CONFIG: { MODE: 'cloud' }
    },
    document: {
        addEventListener: function(evt, cb) {
            if (evt === 'DOMContentLoaded') {
                this._domReady = cb;
            }
        },
        getElementById: function(id) { 
            return { 
                id: id, 
                innerHTML: '', 
                appendChild: function() {}, 
                classList: { remove: function(){} } 
            }; 
        },
        querySelectorAll: function() { return []; },
        body: { setAttribute: function() {}, removeAttribute: function() {}, appendChild: function() {} },
        createElement: function() { return { classList: { add: function(){} }, style: {} }; }
    },
    localStorage: {
        getItem: function() { return null; },
        setItem: function() {},
        removeItem: function() {},
        clear: function() {}
    },
    navigator: {},
    fetch: async () => {},
    console: console,
    setTimeout: function(cb) { cb(); },
    setInterval: function() { return 1; },
    clearInterval: function() {},
    requestAnimationFrame: function(cb) { cb(); }
};

// Bind context window
context.window.document = context.document;
for (let k in context) {
    if (k !== 'window') context.window[k] = context[k];
}

const vm = require('vm');
vm.createContext(context);

try {
    for(let f of files) {
        let code = fs.readFileSync(f, 'utf8');
        vm.runInContext(code, context);
    }
    console.log("Scripts loaded.");
    
    // Simulate DOMContentLoaded
    if (context.document._domReady) {
        console.log("Running init()...");
        context.document._domReady();
        console.log("init() finished successfully.");
    }
} catch(e) {
    console.error("RUNTIME ERROR:", e.stack);
}
