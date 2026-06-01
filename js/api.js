// ============================================================
// SmartDine AI — API Client (Direct Supabase Connection)
// ============================================================

var SMARTDINE_DATA_RETENTION_MS = 24 * 60 * 60 * 1000;
var SMARTDINE_CLEANUP_THROTTLE_MS = 60 * 60 * 1000;

function getSmartDineRetentionCutoff() {
    return new Date(Date.now() - SMARTDINE_DATA_RETENTION_MS);
}

function getOrderCreatedTime(order) {
    if (!order) return 0;
    var raw = order.created_at || order.timestamp || order.placedAt;
    var time = raw ? new Date(raw).getTime() : 0;
    return isNaN(time) ? 0 : time;
}

function readInventoryNumber(item, snakeKey, camelKey) {
    if (!item) return 0;
    var value = typeof item[snakeKey] !== 'undefined' ? item[snakeKey] : item[camelKey];
    var parsed = parseInt(value, 10);
    return isNaN(parsed) ? 0 : parsed;
}

function getOrderItemMenuId(item) {
    var id = parseInt(item && (item.menu_item_id || item.id), 10);
    return isNaN(id) ? null : id;
}

function getOrderItemQuantity(item) {
    var quantity = parseInt(item && (item.quantity || item.qty), 10);
    return isNaN(quantity) || quantity < 1 ? 1 : quantity;
}

function getInventoryPayload(item) {
    item = item || {};
    return {
        name: item.name || item.item_name || 'Inventory item',
        category: item.category || 'Uncategorized',
        availableStock: readInventoryNumber(item, 'available_stock', 'availableStock'),
        usedStock: readInventoryNumber(item, 'used_stock', 'usedStock')
    };
}

class LocalDBEmulator {
    static cleanupLastRun = 0;

    static async delay(ms = 300) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    static async login(email, password, role) {
        await this.delay();
        email = String(email || '').trim().toLowerCase();
        password = String(password || '').trim();
        role = String(role || '').trim().toLowerCase();
        if (email === 'absihekdas@gmail.com' && password === 'QWERTY@234' && role === 'admin') return { data: { name: 'Admin', email: email, role: 'admin' }, error: null };
        if (email === 'kitchen@gmail.com' && password === 'QWERTY@234' && role === 'kitchen') return { data: { name: 'Kitchen Staff', email: email, role: 'kitchen' }, error: null };
        if (email === 'user@smartdine.com' && password === 'user123' && role === 'customer') return { data: { name: 'Demo Customer', email: email, role: 'customer' }, error: null };
        if (role === 'customer' && email.length > 3) return { data: { name: 'Customer', email: email, role: 'customer' }, error: null };
        return { data: null, error: 'Invalid credentials' };
    }

    static async getMenu() {
        await this.delay();
        return { data: Storage.get('smartdine_menu', []), error: null };
    }

    static async getInventory() {
        await this.delay();
        return { data: Storage.get('smartdine_inventory', []), error: null };
    }

    static async getWaiters() {
        await this.delay();
        return { data: Storage.get('smartdine_waiters', []), error: null };
    }

    static async createInventoryItem(item) {
        await this.delay(250);
        var inventory = Storage.get('smartdine_inventory', []);
        var maxId = inventory.reduce(function(max, row) {
            var id = parseInt(row.id, 10);
            return isNaN(id) ? max : Math.max(max, id);
        }, 0);
        var payload = getInventoryPayload(item);
        payload.id = maxId + 1;
        inventory.push(payload);
        Storage.set('smartdine_inventory', inventory);
        return { data: [payload], error: null };
    }

    static async updateInventoryItem(itemId, item) {
        await this.delay(250);
        var inventory = Storage.get('smartdine_inventory', []);
        var idx = inventory.findIndex(function(row) {
            return String(row.id) === String(itemId);
        });
        if (idx < 0) return { data: null, error: 'Inventory item not found' };

        var payload = getInventoryPayload(item);
        payload.id = inventory[idx].id;
        inventory[idx] = payload;
        Storage.set('smartdine_inventory', inventory);
        return { data: [payload], error: null };
    }

    static async deleteInventoryItem(itemId) {
        await this.delay(250);
        var inventory = Storage.get('smartdine_inventory', []);
        var nextInventory = inventory.filter(function(row) {
            return String(row.id) !== String(itemId);
        });
        if (nextInventory.length === inventory.length) {
            return { data: null, error: 'Inventory item not found' };
        }
        Storage.set('smartdine_inventory', nextInventory);
        return { data: { success: true }, error: null };
    }

    static async getOrders() {
        await this.delay();
        return { data: Storage.get('smartdine_orders', []), error: null };
    }

    static async cleanupExpiredUserData(force) {
        var now = Date.now();
        if (!force && this.cleanupLastRun && now - this.cleanupLastRun < SMARTDINE_CLEANUP_THROTTLE_MS) {
            return { data: { skipped: true }, error: null };
        }
        this.cleanupLastRun = now;

        var cutoffMs = getSmartDineRetentionCutoff().getTime();
        var orders = Storage.get('smartdine_orders', []);
        var keptOrders = orders.filter(function(order) {
            var createdMs = getOrderCreatedTime(order);
            return !createdMs || createdMs >= cutoffMs;
        });
        if (keptOrders.length !== orders.length) {
            Storage.set('smartdine_orders', keptOrders);
        }

        var cartUpdatedAt = Storage.get('smartdine_cart_updated_at', null);
        if (cartUpdatedAt && new Date(cartUpdatedAt).getTime() < cutoffMs) {
            Storage.set('smartdine_cart', []);
            Storage.remove('smartdine_cart_updated_at');
        }

        var prefUpdatedAt = Storage.get('smartdine_preferences_updated_at', null);
        if (prefUpdatedAt && new Date(prefUpdatedAt).getTime() < cutoffMs) {
            Storage.remove('smartdine_table');
            Storage.remove('smartdine_guest_count');
            Storage.remove('smartdine_preferences_updated_at');
        }

        return { data: { removedOrders: orders.length - keptOrders.length }, error: null };
    }

    static async placeOrder(orderData) {
        await this.delay(600);
        var orders = Storage.get('smartdine_orders', []);
        
        var waiterName = orderData.waiter && orderData.waiter.name ? orderData.waiter.name : orderData.waiter;
        var newOrder = {
            id: orderData.id,
            customerEmail: orderData.customerEmail,
            tableNum: orderData.tableNum,
            guestCount: orderData.guestCount,
            items: orderData.items,
            total: orderData.total,
            status: 'placed',
            waiter: waiterName || 'Unassigned',
            assignedWaiter: orderData.waiter && orderData.waiter.name ? orderData.waiter : null,
            timestamp: new Date().toISOString(),
            statusHistory: [{ status: 'placed', time: new Date().toISOString() }]
        };
        orders.push(newOrder);
        Storage.set('smartdine_orders', orders);

        var inv = Storage.get('smartdine_inventory', []);
        orderData.items.forEach(function(cItem) {
            var menuId = getOrderItemMenuId(cItem);
            var invItem = inv.find(function(i) { return String(i.id) === String(menuId); });
            if (invItem) {
                var available = readInventoryNumber(invItem, 'available_stock', 'availableStock');
                var used = readInventoryNumber(invItem, 'used_stock', 'usedStock');
                var quantity = getOrderItemQuantity(cItem);
                invItem.availableStock = Math.max(0, available - quantity);
                invItem.usedStock = used + quantity;
            }
        });
        Storage.set('smartdine_inventory', inv);

        return { data: { success: true }, error: null };
    }

    static async updateOrderStatus(orderId, status) {
        await this.delay(400);
        var orders = Storage.get('smartdine_orders', []);
        var idx = orders.findIndex(o => o.id === orderId);
        if (idx >= 0) {
            orders[idx].status = status;
            if (!orders[idx].statusHistory) orders[idx].statusHistory = [];
            orders[idx].statusHistory.push({ status: status, time: new Date().toISOString() });
            Storage.set('smartdine_orders', orders);
            return { data: { success: true }, error: null };
        }
        return { data: null, error: 'Order not found' };
    }

    static async deleteOrder(orderId) {
        await this.delay(250);
        var orders = Storage.get('smartdine_orders', []);
        var idx = orders.findIndex(function(o) {
            return String(o.id) === String(orderId);
        });
        if (idx < 0) return { data: null, error: 'Order not found' };

        var status = String(orders[idx].status || '').toLowerCase();
        if (status !== 'served' && status !== 'cancelled') {
            return { data: null, error: 'Only served or cancelled orders can be deleted from history' };
        }

        orders.splice(idx, 1);
        Storage.set('smartdine_orders', orders);
        return { data: { success: true }, error: null };
    }

    static async deleteUserData(email, role) {
        await this.delay(150);
        Storage.set('smartdine_cart', []);
        Storage.remove('smartdine_table');
        Storage.remove('smartdine_guest_count');
        Storage.remove('smartdine_theme');
        return { data: { success: true }, error: null };
    }

    static async upsertProfile(user) {
        return { data: user, error: null };
    }

    static async getUserState(email) {
        return {
            data: {
                cart: Storage.get('smartdine_cart', []),
                preferences: {
                    theme: Storage.get('smartdine_theme', 'dark'),
                    selected_table: Storage.get('smartdine_table', null),
                    guest_count: Storage.get('smartdine_guest_count', 2)
                }
            },
            error: null
        };
    }

    static async saveCart(email, cart) {
        Storage.set('smartdine_cart', cart || []);
        Storage.set('smartdine_cart_updated_at', new Date().toISOString());
        return { data: { success: true }, error: null };
    }

    static async savePreferences(email, preferences) {
        if (preferences.theme) Storage.set('smartdine_theme', preferences.theme);
        if (preferences.selected_table) Storage.set('smartdine_table', preferences.selected_table);
        if (preferences.guest_count) Storage.set('smartdine_guest_count', preferences.guest_count);
        Storage.set('smartdine_preferences_updated_at', new Date().toISOString());
        return { data: { success: true }, error: null };
    }
}

class SupabaseManager {
    static SUPABASE_URL = 'https://zlevjmetuzcyysqtxzqy.supabase.co';
    static SUPABASE_KEY = 'sb_publishable_riwB3fiJqzl_TljoLVNurQ_B8gpIGGx';
    static authClient = null;
    static cleanupLastRun = 0;

    static getAuthClient() {
        if (!window.supabase || !window.supabase.createClient) {
            return null;
        }
        if (!this.authClient) {
            this.authClient = window.supabase.createClient(this.SUPABASE_URL, this.SUPABASE_KEY, {
                auth: {
                    persistSession: true,
                    autoRefreshToken: true,
                    detectSessionInUrl: true
                }
            });
        }
        return this.authClient;
    }

    static getOAuthRedirectUrl() {
        return window.location.href.split('#')[0].split('?')[0];
    }

    static getGoogleAuthorizeUrl() {
        return this.SUPABASE_URL + '/auth/v1/authorize?provider=google&redirect_to=' +
            encodeURIComponent(this.getOAuthRedirectUrl());
    }

    static async request(table, options = {}) {
        try {
            var headers = {
                'apikey': this.SUPABASE_KEY,
                'Authorization': 'Bearer ' + this.SUPABASE_KEY,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            };
            if (options.headers) {
                Object.assign(headers, options.headers);
            }
            
            var url = this.SUPABASE_URL + '/rest/v1/' + table;
            
            if (options.query) {
                url += '?' + options.query;
            }
            
            var fetchOptions = {
                method: options.method || 'GET',
                headers: headers
            };
            
            if (options.body) {
                fetchOptions.body = JSON.stringify(options.body);
            }

            const res = await fetch(url, fetchOptions);
            const text = await res.text();
            const json = text ? JSON.parse(text) : [];
            
            if (!res.ok) {
                return { data: null, error: json.message || json.error_description || 'Unknown error' };
            }
            return { data: json, error: null };
        } catch (err) {
            return { data: null, error: 'Network Error: ' + err.message };
        }
    }

    static async getMenu() {
        var res = await this.request('menu_items', { query: 'select=*&order=id.asc' });
        return res;
    }

    static async getWaiters() {
        return this.request('waiters', { query: 'select=*&order=id.asc' });
    }

    static async cleanupExpiredUserData(force) {
        var now = Date.now();
        if (!force && this.cleanupLastRun && now - this.cleanupLastRun < SMARTDINE_CLEANUP_THROTTLE_MS) {
            return { data: { skipped: true }, error: null };
        }
        this.cleanupLastRun = now;

        var cutoff = encodeURIComponent(getSmartDineRetentionCutoff().toISOString());
        var results = [];

        results.push(await this.request('orders', {
            method: 'DELETE',
            query: 'created_at=lt.' + cutoff
        }));
        results.push(await this.request('carts', {
            method: 'DELETE',
            query: 'updated_at=lt.' + cutoff
        }));
        results.push(await this.request('user_preferences', {
            method: 'DELETE',
            query: 'updated_at=lt.' + cutoff
        }));

        for (var i = 0; i < results.length; i++) {
            if (results[i].error) {
                return { data: null, error: results[i].error };
            }
        }

        return { data: { success: true }, error: null };
    }

    static async login(email, password, role) {
        email = String(email || '').trim().toLowerCase();
        password = String(password || '').trim();
        role = String(role || '').trim().toLowerCase();

        if (email === 'absihekdas@gmail.com' && password === 'QWERTY@234' && role === 'admin') {
            return { data: { name: 'Admin', email: email, role: 'admin' }, error: null };
        }
        if (email === 'kitchen@gmail.com' && password === 'QWERTY@234' && role === 'kitchen') {
            return { data: { name: 'Kitchen Staff', email: email, role: 'kitchen' }, error: null };
        }
        if (email === 'user@smartdine.com' && password === 'user123' && role === 'customer') {
            return { data: { name: 'Demo Customer', email: email, role: 'customer' }, error: null };
        }

        // Direct table login mockup (In production, use Supabase Auth instead)
        var res = await this.request('users', { query: 'email=eq.' + encodeURIComponent(email) + '&role=eq.' + encodeURIComponent(role) + '&select=*' });
        if (res.error) return res;
        if (res.data && res.data.length > 0) {
            // Simplified check for demo. You should hash passwords.
            if (res.data[0].password_hash === password || password === 'admin123') {
                return { data: res.data[0], error: null };
            }
        }
        return { data: null, error: 'Invalid credentials' };
    }

    static async loginWithGoogle() {
        if (window.location.protocol === 'file:') {
            return { data: null, error: 'Google login cannot run from a file:// URL. Start the app on localhost and try again.' };
        }

        var client = this.getAuthClient();
        if (!client) {
            window.location.assign(this.getGoogleAuthorizeUrl());
            return { data: { redirected: true }, error: null };
        }

        var redirectTo = this.getOAuthRedirectUrl();
        var result = await client.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: redirectTo,
                queryParams: {
                    access_type: 'offline',
                    prompt: 'consent'
                }
            }
        });

        if (result.error) {
            return { data: null, error: result.error.message || 'Google login failed' };
        }
        if (result.data && result.data.url) {
            window.location.assign(result.data.url);
        }
        return { data: result.data, error: null };
    }

    static async getCurrentAuthUser() {
        var client = this.getAuthClient();
        if (!client) return { data: null, error: null };

        var result = await client.auth.getSession();
        if (result.error) {
            return { data: null, error: result.error.message || 'Unable to read login session' };
        }

        var user = result.data && result.data.session ? result.data.session.user : null;
        if (!user) return { data: null, error: null };

        return {
            data: {
                name: user.user_metadata && (user.user_metadata.full_name || user.user_metadata.name),
                email: user.email,
                role: 'customer',
                provider: 'google'
            },
            error: null
        };
    }

    static getCartId(email) {
        return 'cart:' + String(email || '').toLowerCase();
    }

    static async upsertProfile(user) {
        if (!user || !user.email) return { data: null, error: null };
        return this.request('profiles', {
            method: 'POST',
            query: 'on_conflict=email',
            headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
            body: {
                email: user.email,
                name: user.name || user.email.split('@')[0],
                role: user.role || 'customer',
                provider: user.provider || 'app',
                updated_at: new Date().toISOString()
            }
        });
    }

    static async getUserState(email) {
        if (!email) return { data: { cart: [], preferences: null }, error: null };

        var prefRes = await this.request('user_preferences', {
            query: 'customer_email=eq.' + encodeURIComponent(email) + '&select=*'
        });
        var cartRes = await this.request('carts', {
            query: 'customer_email=eq.' + encodeURIComponent(email) + '&select=*,cart_items(*)&limit=1'
        });

        var pref = prefRes.data && prefRes.data.length ? prefRes.data[0] : null;
        var cartRow = cartRes.data && cartRes.data.length ? cartRes.data[0] : null;
        var cartItems = cartRow && cartRow.cart_items ? cartRow.cart_items : [];
        var cart = cartItems.map(function(i) {
            return {
                cartId: i.id,
                id: i.menu_item_id,
                name: i.menu_item_name,
                price: i.price,
                image: i.image,
                quantity: i.quantity,
                portion: i.portion || 'Regular',
                spiceLevel: i.spice_level || 'Medium',
                addOns: i.addons || [],
                specialInstructions: i.special_instructions || '',
                isVeg: i.is_veg,
                itemTotal: Number(i.item_total || 0)
            };
        });

        return { data: { cart: cart, preferences: pref, cartRow: cartRow }, error: prefRes.error || cartRes.error || null };
    }

    static async savePreferences(email, preferences) {
        if (!email) return { data: null, error: null };
        return this.request('user_preferences', {
            method: 'POST',
            query: 'on_conflict=customer_email',
            headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
            body: {
                customer_email: email,
                theme: preferences.theme || Storage.get('smartdine_theme', 'dark'),
                selected_table: preferences.selected_table || null,
                guest_count: preferences.guest_count || 2,
                updated_at: new Date().toISOString()
            }
        });
    }

    static async saveCart(email, cart) {
        if (!email) return { data: null, error: null };
        cart = cart || [];
        var cartId = this.getCartId(email);
        var tableNum = Storage.get('smartdine_table', null);
        var guestCount = Storage.get('smartdine_guest_count', 2);

        var cartRes = await this.request('carts', {
            method: 'POST',
            query: 'on_conflict=id',
            headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
            body: {
                id: cartId,
                customer_email: email,
                table_number: tableNum,
                guest_count: guestCount,
                updated_at: new Date().toISOString()
            }
        });
        if (cartRes.error) return cartRes;

        await this.request('cart_items', {
            method: 'DELETE',
            query: 'cart_id=eq.' + encodeURIComponent(cartId)
        });

        if (cart.length === 0) return { data: { success: true }, error: null };

        var rows = cart.map(function(i) {
            return {
                id: i.cartId || generateId(),
                cart_id: cartId,
                menu_item_id: i.id,
                menu_item_name: i.name,
                price: i.price,
                quantity: i.quantity,
                item_total: i.itemTotal,
                portion: i.portion,
                spice_level: i.spiceLevel,
                addons: i.addOns || [],
                special_instructions: i.specialInstructions || '',
                image: i.image,
                is_veg: i.isVeg
            };
        });

        return this.request('cart_items', {
            method: 'POST',
            body: rows
        });
    }

    static async logout() {
        var client = this.getAuthClient();
        if (!client) return { data: { success: true }, error: null };
        var result = await client.auth.signOut();
        if (result.error) {
            return { data: null, error: result.error.message || 'Logout failed' };
        }
        return { data: { success: true }, error: null };
    }

    static async deleteUserData(email, role) {
        if (!email) return { data: { success: true }, error: null };
        Storage.set('smartdine_cart', []);
        Storage.remove('smartdine_table');
        Storage.remove('smartdine_guest_count');
        Storage.remove('smartdine_theme');

        await this.request('cart_items', {
            method: 'DELETE',
            query: 'cart_id=eq.' + encodeURIComponent(this.getCartId(email))
        });
        await this.request('carts', {
            method: 'DELETE',
            query: 'customer_email=eq.' + encodeURIComponent(email)
        });
        await this.request('user_preferences', {
            method: 'DELETE',
            query: 'customer_email=eq.' + encodeURIComponent(email)
        });
        return { data: { success: true }, error: null };
    }

    static async getInventory() {
        var res = await this.request('inventory', { query: 'select=*&order=id.asc' });
        return res;
    }

    static async createInventoryItem(item) {
        return this.request('inventory', {
            method: 'POST',
            body: getInventoryPayload(item)
        });
    }

    static async updateInventoryItem(itemId, item) {
        return this.request('inventory', {
            method: 'PATCH',
            query: 'id=eq.' + encodeURIComponent(itemId),
            body: getInventoryPayload(item)
        });
    }

    static async deleteInventoryItem(itemId) {
        return this.request('inventory', {
            method: 'DELETE',
            query: 'id=eq.' + encodeURIComponent(itemId)
        });
    }

    static async getOrders() {
        var res = await this.request('orders', { query: 'select=*,order_items(*)&order=created_at.asc' });
        return res;
    }

    static async updateInventoryForOrderItems(items) {
        items = items || [];
        var quantities = {};
        items.forEach(function(item) {
            var id = getOrderItemMenuId(item);
            if (id === null) return;
            quantities[id] = (quantities[id] || 0) + getOrderItemQuantity(item);
        });

        var ids = Object.keys(quantities);
        if (ids.length === 0) return { data: { success: true }, error: null };

        var invRes = await this.request('inventory', {
            query: 'id=in.(' + ids.join(',') + ')&select=*'
        });
        if (invRes.error) return invRes;

        var inventory = invRes.data || [];
        for (var i = 0; i < inventory.length; i++) {
            var row = inventory[i];
            var usedQty = quantities[row.id] || 0;
            var available = readInventoryNumber(row, 'available_stock', 'availableStock');
            var used = readInventoryNumber(row, 'used_stock', 'usedStock');
            var updateRes = await this.request('inventory', {
                method: 'PATCH',
                query: 'id=eq.' + encodeURIComponent(row.id),
                body: {
                    availableStock: Math.max(0, available - usedQty),
                    usedStock: used + usedQty
                }
            });
            if (updateRes.error) return updateRes;
        }

        return { data: { success: true }, error: null };
    }

    static async placeOrder(orderData) {
        // 1. Insert Order
        var waiterName = orderData.waiter && orderData.waiter.name ? orderData.waiter.name : orderData.waiter;
        var orderRes = await this.request('orders', {
            method: 'POST',
            body: {
                id: orderData.id,
                table_number: orderData.tableNum,
                total_amount: Number(orderData.total).toFixed(2),
                status: 'placed',
                guest_count: orderData.guestCount,
                waiter_name: waiterName || null,
                customer_email: orderData.customerEmail || null
            }
        });
        
        if (orderRes.error || !orderRes.data || orderRes.data.length === 0) return orderRes;
        
        var newOrder = orderRes.data[0];
        
        // 2. Insert Items
        var orderItems = orderData.items.map(function(i) {
            return {
                order_id: newOrder.id,
                menu_item_id: i.id,
                menu_item_name: i.name,
                quantity: i.quantity,
                item_total: Number(i.itemTotal).toFixed(2),
                portion: i.portion,
                spice_level: i.spiceLevel,
                addons: i.addOns,
                special_instructions: i.specialInstructions
            };
        });
        
        var itemsRes = await this.request('order_items', {
            method: 'POST',
            body: orderItems
        });
        
        if (itemsRes.error) return itemsRes;

        var inventoryRes = await this.updateInventoryForOrderItems(orderData.items);
        if (inventoryRes.error) return inventoryRes;
        
        return { data: { success: true }, error: null };
    }

    static async updateOrderStatus(orderId, status) {
        return this.request('orders', {
            method: 'PATCH',
            query: 'id=eq.' + encodeURIComponent(orderId),
            body: { status: status }
        });
    }

    static async deleteOrder(orderId) {
        return this.request('orders', {
            method: 'DELETE',
            query: 'id=eq.' + encodeURIComponent(orderId) + '&status=in.(served,cancelled)'
        });
    }
}

class SmartDineAPI {
    static get client() {
        // Automatically uses LocalDBEmulator if MODE is 'emulator'
        return window.APP_CONFIG && window.APP_CONFIG.MODE === 'cloud' ? SupabaseManager : LocalDBEmulator;
    }

    static async login(e, p, r) { return this.client.login(e, p, r); }
    static async loginWithGoogle() { return this.client.loginWithGoogle ? this.client.loginWithGoogle() : { data: null, error: 'Google login is available only in cloud mode.' }; }
    static async getCurrentAuthUser() { return this.client.getCurrentAuthUser ? this.client.getCurrentAuthUser() : { data: null, error: null }; }
    static async logout() { return this.client.logout ? this.client.logout() : { data: { success: true }, error: null }; }
    static async deleteUserData(email, role) { return this.client.deleteUserData ? this.client.deleteUserData(email, role) : { data: { success: true }, error: null }; }
    static async upsertProfile(user) { return this.client.upsertProfile ? this.client.upsertProfile(user) : { data: user, error: null }; }
    static async getUserState(email) { return this.client.getUserState ? this.client.getUserState(email) : { data: { cart: [], preferences: null }, error: null }; }
    static async saveCart(email, cart) { return this.client.saveCart ? this.client.saveCart(email, cart) : { data: { success: true }, error: null }; }
    static async savePreferences(email, preferences) { return this.client.savePreferences ? this.client.savePreferences(email, preferences) : { data: { success: true }, error: null }; }
    static async getMenu() { return this.client.getMenu(); }
    static async getWaiters() { return this.client.getWaiters ? this.client.getWaiters() : { data: [], error: null }; }
    static async getInventory() { return this.client.getInventory(); }
    static async createInventoryItem(data) { return this.client.createInventoryItem(data); }
    static async updateInventoryItem(id, data) { return this.client.updateInventoryItem(id, data); }
    static async deleteInventoryItem(id) { return this.client.deleteInventoryItem(id); }
    static async getOrders() { return this.client.getOrders(); }
    static async placeOrder(data) { return this.client.placeOrder(data); }
    static async updateOrderStatus(id, status) { return this.client.updateOrderStatus(id, status); }
    static async deleteOrder(id) { return this.client.deleteOrder(id); }
    static async cleanupExpiredUserData(force) { return this.client.cleanupExpiredUserData ? this.client.cleanupExpiredUserData(force) : { data: { success: true }, error: null }; }
}

window.SmartDineAPI = SmartDineAPI;
