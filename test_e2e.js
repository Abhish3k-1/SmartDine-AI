const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

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

const db = {
  menu_items: [
    { id: 1, name: 'Paneer Tikka', category: 'Starters', price: 100, description: 'Test item', image: 'paneer.png', isVeg: true, prepTime: '10 min', spiceLevel: 'Medium', available: true }
  ],
  inventory: [
    { id: 1, name: 'Paneer Tikka', category: 'Starters', availableStock: 50, usedStock: 5 }
  ],
  waiters: [
    { id: 1, name: 'Ananya Rao', avatar: 'assets/images/avatars/ananya.png', rating: 4.9, status: 'Active', tables: [1, 2, 3, 4], description: 'Senior server' }
  ],
  users: [
    { email: 'user@smartdine.com', password_hash: 'user123', role: 'customer', name: 'Demo Customer' }
  ],
  profiles: [],
  user_preferences: [],
  carts: [],
  cart_items: [],
  orders: [],
  order_items: []
};

function jsonResponse(data, ok) {
  return {
    ok: ok !== false,
    text: async function() {
      return JSON.stringify(data);
    }
  };
}

function decodeFilterValue(value, prefix) {
  return decodeURIComponent(String(value || '').slice(prefix.length));
}

function matchesFilters(row, params) {
  for (const [key, value] of params.entries()) {
    if (['select', 'order', 'limit', 'on_conflict'].includes(key)) continue;
    if (value.indexOf('eq.') === 0 && String(row[key]) !== decodeFilterValue(value, 'eq.')) return false;
    if (value.indexOf('in.(') === 0) {
      const values = value.slice(4, -1).split(',').map(String);
      if (!values.includes(String(row[key]))) return false;
    }
    if (value.indexOf('lt.') === 0) return false;
  }
  return true;
}

function rowsForGet(table, params) {
  let rows = (db[table] || []).filter(function(row) {
    return matchesFilters(row, params);
  });

  if (table === 'orders') {
    rows = rows.map(function(order) {
      return Object.assign({}, order, {
        order_items: db.order_items.filter(function(item) {
          return item.order_id === order.id;
        })
      });
    });
  }

  if (table === 'carts') {
    rows = rows.map(function(cart) {
      return Object.assign({}, cart, {
        cart_items: db.cart_items.filter(function(item) {
          return item.cart_id === cart.id;
        })
      });
    });
  }

  return rows;
}

function upsertRow(table, row, conflictKey) {
  const key = conflictKey || 'id';
  const rows = db[table];
  const idx = rows.findIndex(function(existing) {
    return String(existing[key]) === String(row[key]);
  });
  if (idx >= 0) rows[idx] = Object.assign({}, rows[idx], row);
  else rows.push(row);
  return idx >= 0 ? rows[idx] : row;
}

async function mockFetch(url, options) {
  options = options || {};
  const parsed = new URL(url);
  const table = parsed.pathname.split('/').pop();
  const params = parsed.searchParams;
  const method = options.method || 'GET';
  const body = options.body ? JSON.parse(options.body) : null;

  if (!db[table]) return jsonResponse({ message: 'Unknown table ' + table }, false);

  if (method === 'GET') {
    return jsonResponse(rowsForGet(table, params));
  }

  if (method === 'POST') {
    const rows = Array.isArray(body) ? body : [body];
    const saved = rows.map(function(row) {
      const next = Object.assign({}, row);
      if ((table === 'inventory' || table === 'order_items') && !next.id) {
        next.id = db[table].reduce(function(max, existing) {
          return Math.max(max, Number(existing.id) || 0);
        }, 0) + 1;
      }
      if (table === 'orders' && !next.created_at) next.created_at = new Date().toISOString();

      const conflictKey =
        table === 'profiles' ? 'email' :
        table === 'user_preferences' ? 'customer_email' :
        table === 'carts' ? 'id' :
        table === 'inventory' ? 'id' :
        null;

      if (conflictKey) return upsertRow(table, next, conflictKey);
      db[table].push(next);
      return next;
    });
    return jsonResponse(saved);
  }

  if (method === 'PATCH') {
    const updated = [];
    db[table].forEach(function(row) {
      if (matchesFilters(row, params)) {
        Object.assign(row, body);
        updated.push(row);
      }
    });
    return jsonResponse(updated);
  }

  if (method === 'DELETE') {
    const deleted = [];
    db[table] = db[table].filter(function(row) {
      const remove = matchesFilters(row, params);
      if (remove) deleted.push(row);
      return !remove;
    });
    if (table === 'orders') {
      deleted.forEach(function(order) {
        db.order_items = db.order_items.filter(function(item) {
          return item.order_id !== order.id;
        });
      });
    }
    return jsonResponse(deleted);
  }

  return jsonResponse({ message: 'Unsupported method ' + method }, false);
}

function createElementStub(id) {
  return {
    id: id || '',
    innerHTML: '',
    textContent: '',
    disabled: false,
    style: {},
    className: '',
    classList: { add: function() {}, remove: function() {}, toggle: function() {} },
    appendChild: function() {},
    remove: function() {},
    setAttribute: function() {},
    querySelector: function() { return null; }
  };
}

(async function run() {
  const storage = {};
  const elements = {
    app: createElementStub('app'),
    'toast-container': createElementStub('toast-container')
  };

  const context = {
    window: {
      location: { hash: '', href: 'http://localhost/#/', origin: 'http://localhost', pathname: '/' },
      addEventListener: function() {},
      scrollTo: function() {},
      APP_CONFIG: { MODE: 'cloud' }
    },
    document: {
      documentElement: createElementStub('html'),
      body: createElementStub('body'),
      addEventListener: function() {},
      getElementById: function(id) { return elements[id] || null; },
      querySelector: function() { return null; },
      querySelectorAll: function() { return []; },
      createElement: function() { return createElementStub(); }
    },
    localStorage: {
      getItem: function(key) { return Object.prototype.hasOwnProperty.call(storage, key) ? storage[key] : null; },
      setItem: function(key, value) { storage[key] = String(value); },
      removeItem: function(key) { delete storage[key]; },
      clear: function() {
        Object.keys(storage).forEach(function(key) { delete storage[key]; });
      }
    },
    navigator: {},
    fetch: mockFetch,
    console: console,
    setTimeout: function(fn) { if (typeof fn === 'function') fn(); return 1; },
    clearTimeout: function() {},
    setInterval: function() { return 1; },
    clearInterval: function() {},
    requestAnimationFrame: function(fn) { if (typeof fn === 'function') fn(); },
    URL: URL,
    Blob: function() {}
  };
  context.window.window = context.window;
  Object.keys(context).forEach(function(key) {
    if (key !== 'window') context.window[key] = context[key];
  });

  vm.createContext(context);
  files.forEach(function(file) {
    vm.runInContext(fs.readFileSync(file, 'utf8'), context, { filename: file });
  });

  await context.init();
  assert.strictEqual(context.Storage.get('smartdine_waiters', [])[0].name, 'Ananya Rao');
  assert.ok(context.Storage.get('smartdine_waiters', [])[0].avatar.indexOf('<img') === 0);

  const menuRes = await context.window.SmartDineAPI.getMenu();
  assert.strictEqual(menuRes.data[0].name, 'Paneer Tikka');

  const created = await context.window.SmartDineAPI.createInventoryItem({
    name: 'Test Stock',
    category: 'Starters',
    availableStock: 12,
    usedStock: 1
  });
  assert.ifError(created.error);
  const createdId = created.data[0].id;
  await context.window.SmartDineAPI.updateInventoryItem(createdId, {
    name: 'Test Stock Updated',
    category: 'Starters',
    availableStock: 10,
    usedStock: 3
  });
  assert.strictEqual(db.inventory.find(function(item) { return item.id === createdId; }).usedStock, 3);
  await context.window.SmartDineAPI.deleteInventoryItem(createdId);
  assert.strictEqual(db.inventory.some(function(item) { return item.id === createdId; }), false);

  context.Storage.set('smartdine_user', { email: 'user@smartdine.com', role: 'customer', name: 'Demo Customer' });
  context.Storage.set('smartdine_table', 1);
  context.Storage.set('smartdine_guest_count', 2);
  context.Storage.set('smartdine_cart', [{
    cartId: 'cart-line-1',
    id: 1,
    name: 'Paneer Tikka',
    price: 100,
    image: 'paneer.png',
    quantity: 2,
    portion: 'Small',
    spiceLevel: 'Medium',
    addOns: [],
    specialInstructions: '',
    isVeg: true,
    itemTotal: 200
  }]);

  await context.syncCartToDB();
  assert.strictEqual(db.cart_items.length, 1);

  await context.placeOrder();
  assert.strictEqual(db.orders.length, 1);
  assert.strictEqual(db.order_items.length, 1);
  assert.strictEqual(db.inventory[0].availableStock, 48);
  assert.strictEqual(db.inventory[0].usedStock, 7);
  assert.strictEqual(db.cart_items.length, 0);
  assert.strictEqual(context.Storage.get('smartdine_cart', []).length, 0);

  const orderId = db.orders[0].id;
  await context.window.SmartDineAPI.updateOrderStatus(orderId, 'served');
  assert.strictEqual(db.orders[0].status, 'served');
  await context.window.SmartDineAPI.deleteOrder(orderId);
  assert.strictEqual(db.orders.length, 0);
  assert.strictEqual(db.order_items.length, 0);

  console.log('E2E Supabase-backed operations passed.');
})().catch(function(err) {
  console.error(err && err.stack ? err.stack : err);
  process.exit(1);
});
