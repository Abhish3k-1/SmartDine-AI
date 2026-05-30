// ============================================================
// SmartDine AI - Cart & Order Management
// ============================================================

function addToCart(itemId, options) {
    if (!Auth.isLoggedIn()) {
        showCustomerLoginModal();
        return;
    }

    options = options || {};
    options.portion = options.portion || 'Small';
    options.spiceLevel = options.spiceLevel || 'Medium';
    options.addOns = options.addOns || [];
    options.specialInstructions = options.specialInstructions || '';
    options.quantity = options.quantity || 1;

    var menu = [];
    if (window.APP_MENU && window.APP_MENU.length) {
        menu = window.APP_MENU;
    } else {
        menu = Storage.get('smartdine_menu', []);
    }
    var item = menu.find(function(i) { return String(i.id) === String(itemId); });
    if (!item) {
        showToast('Cart Error', 'Could not find this menu item. Refresh the menu and try again.', 'error');
        console.warn('[Cart] Menu item not found for id:', itemId, menu);
        return;
    }

    var cart = Storage.get('smartdine_cart', []);
    var multiplier = 1;
    if (item.portionOptions) {
        var pOpt = item.portionOptions.find(function(o) { return o.name === options.portion; });
        if (pOpt) multiplier = pOpt.priceMultiplier;
    }
    if (window.PORTION_CONFIG && PORTION_CONFIG[options.portion]) {
        multiplier = PORTION_CONFIG[options.portion].multiplier;
    }

    var addOnsTotal = 0;
    if (options.addOns) options.addOns.forEach(function(addon) { addOnsTotal += addon.price; });

    var baseItemPrice = (item.price * multiplier) + addOnsTotal;
    var existingIndex = cart.findIndex(function(cItem) {
        return String(cItem.id) === String(itemId) &&
            cItem.portion === options.portion &&
            cItem.spiceLevel === options.spiceLevel &&
            JSON.stringify(cItem.addOns) === JSON.stringify(options.addOns) &&
            cItem.specialInstructions === options.specialInstructions;
    });

    if (existingIndex >= 0) {
        cart[existingIndex].quantity += options.quantity;
        cart[existingIndex].itemTotal = cart[existingIndex].quantity * baseItemPrice;
    } else {
        cart.push({
            cartId: generateId(),
            id: item.id,
            name: item.name,
            price: item.price,
            image: item.image,
            quantity: options.quantity,
            portion: options.portion || 'Regular',
            portionMultiplier: multiplier,
            spiceLevel: options.spiceLevel || 'Medium',
            addOns: options.addOns || [],
            specialInstructions: options.specialInstructions || '',
            prepTime: item.prepTime,
            isVeg: item.isVeg,
            itemTotal: baseItemPrice * options.quantity
        });
    }

    Storage.set('smartdine_cart', cart);
    syncCartToDB();
    updateCartBadge();
    animateCartAdd(itemId);
    showToast('Added to Cart', item.name + ' added to your order.', 'success');
}

function updateQuantity(cartId, delta) {
    var cart = Storage.get('smartdine_cart', []);
    var idx = cart.findIndex(function(c) { 
        return String(c.cartId) === String(cartId) || String(c.id) === String(cartId); 
    });
    if (idx >= 0) {
        var oldQty = cart[idx].quantity;
        var newQty = oldQty + delta;
        if (newQty <= 0) {
            cart.splice(idx, 1);
        } else {
            var singlePrice = cart[idx].itemTotal / oldQty;
            cart[idx].quantity = newQty;
            cart[idx].itemTotal = singlePrice * newQty;
        }
        Storage.set('smartdine_cart', cart);
        syncCartToDB();
        renderCart();
        updateCartBadge();
    }
}

function removeFromCart(cartId) {
    var cart = Storage.get('smartdine_cart', []);
    var idx = cart.findIndex(function(c) { 
        return String(c.cartId) === String(cartId) || String(c.id) === String(cartId); 
    });
    if (idx >= 0) {
        cart.splice(idx, 1);
        Storage.set('smartdine_cart', cart);
        syncCartToDB();
        renderCart();
        updateCartBadge();
        showToast('Removed', 'Item removed from cart.', 'info');
    }
}

function getCartCount() {
    var cart = Storage.get('smartdine_cart', []);
    var count = 0;
    cart.forEach(function(item) { count += item.quantity; });
    return count;
}

function updateCartBadge() {
    var count = getCartCount();
    document.querySelectorAll('.cart-badge').forEach(function(badge) {
        badge.textContent = count;
        badge.style.display = count > 0 ? 'flex' : 'none';
    });
}

function animateCartAdd(itemId) {
    document.querySelectorAll('.cart-badge').forEach(function(badge) {
        badge.classList.remove('cart-bump');
        void badge.offsetWidth;
        badge.classList.add('cart-bump');
    });

    var card = document.querySelector('.menu-card[data-id="' + itemId + '"]');
    if (card) {
        card.classList.remove('cart-add-pop');
        void card.offsetWidth;
        card.classList.add('cart-add-pop');
        setTimeout(function() {
            card.classList.remove('cart-add-pop');
        }, 600);
    }
}

function buildTableOptions(selectedTable) {
    var html = '<option value="">Select table</option>';
    for (var i = 1; i <= 20; i++) {
        html += '<option value="' + i + '"' + (parseInt(selectedTable) === i ? ' selected' : '') + '>Table ' + i + '</option>';
    }
    return html;
}

function syncCartToDB() {
    var user = Auth.getUser();
    if (!user || !user.email || !window.SmartDineAPI) return;
    SmartDineAPI.saveCart(user.email, Storage.get('smartdine_cart', [])).catch(function(err) {
        console.warn('[Cart] Cloud cart sync skipped:', err);
    });
}

function renderCart() {
    var app = document.getElementById('app');
    var cart = Storage.get('smartdine_cart', []);
    var tableNum = Storage.get('smartdine_table', null);
    var guestCount = Storage.get('smartdine_guest_count', 2);

    if (cart.length === 0) {
        app.innerHTML =
            '<section class="page-section">' +
                '<div class="container">' +
                    '<div class="page-header"><h1 class="page-title">Your Cart</h1></div>' +
                    '<div class="empty-state">' +
                        '<div class="empty-state-icon">Cart</div>' +
                        '<h2>Your cart is empty</h2>' +
                        '<p>Looks like you have not added any delicious food yet.</p><br>' +
                        '<button class="btn btn-primary" data-action="navigate" data-route="/menu">Browse Menu</button>' +
                    '</div>' +
                '</div>' +
            '</section>';
        return;
    }

    var subtotal = 0;
    var cartItemsHTML = cart.map(function(item) {
        subtotal += item.itemTotal;
        var tagId = item.cartId || item.id;
        var tagsHTML = '';
        if (item.portion && item.portion !== 'Small' && item.portion !== 'Regular') tagsHTML += '<span class="cart-tag">' + item.portion + '</span>';
        if (item.spiceLevel !== 'Medium') tagsHTML += '<span class="cart-tag">' + item.spiceLevel + '</span>';
        item.addOns.forEach(function(a) { tagsHTML += '<span class="cart-tag">+' + escapeHTML(a.name) + '</span>'; });

        var instrHTML = item.specialInstructions
            ? '<div class="cart-note">Note: ' + escapeHTML(item.specialInstructions) + '</div>'
            : '';

        return (
            '<div class="cart-item">' +
                '<img src="' + item.image + '" alt="' + escapeHTML(item.name) + '" class="cart-item-img" onerror="this.onerror=null;this.src=getFallbackImage(\'Mains\')">' +
                '<div class="cart-item-details">' +
                    '<div class="cart-item-top">' +
                        '<h3 class="cart-item-title">' + escapeHTML(item.name) + '</h3>' +
                        '<span class="food-type-dot ' + (item.isVeg ? 'veg-dot' : 'nonveg-dot') + '"></span>' +
                    '</div>' +
                    '<div class="cart-customization-tags">' + (tagsHTML || '<span class="cart-tag">Regular</span>') + '</div>' +
                    instrHTML +
                    '<div class="cart-item-actions">' +
                        '<div class="cart-qty-controls">' +
                            '<button class="btn-qty" data-action="decrease-qty" data-id="' + tagId + '">-</button>' +
                            '<span>' + item.quantity + '</span>' +
                            '<button class="btn-qty" data-action="increase-qty" data-id="' + tagId + '">+</button>' +
                        '</div>' +
                        '<div class="cart-item-price">' + formatCurrency(item.itemTotal) + '</div>' +
                    '</div>' +
                '</div>' +
                '<button class="btn-remove" data-action="remove-from-cart" data-id="' + tagId + '">x</button>' +
            '</div>'
        );
    }).join('');

    var gst = subtotal * GST_RATE;
    var sc = subtotal * SERVICE_CHARGE_RATE;
    var total = subtotal + gst + sc;
    var tableWarning = tableNum
        ? '<div id="cart-table-warning" class="cart-warning" style="display:none;"></div>'
        : '<div id="cart-table-warning" class="cart-warning"><span>!</span><p>Please select a table before placing your order.</p></div>';
    var orderBtn = Auth.isLoggedIn()
        ? '<button class="btn btn-primary btn-block btn-lg" id="btn-place-order" data-action="place-order">Place Order</button>'
        : '<button class="btn btn-primary btn-block btn-lg" data-action="login-click">Login to Order</button>';

    app.innerHTML =
        '<section class="page-section cart-page">' +
            '<div class="container">' +
                '<div class="page-header cart-header">' +
                    '<span class="menu-eyebrow">Checkout</span>' +
                    '<h1 class="page-title">Your Cart</h1>' +
                    '<p class="page-subtitle">Review your customized dishes before sending the order to the kitchen.</p>' +
                '</div>' +
                '<div class="cart-layout">' +
                    '<div class="cart-items">' +
                        '<div class="cart-list-header"><strong>Selected Items</strong><span>' + cart.length + ' item' + (cart.length === 1 ? '' : 's') + '</span></div>' +
                        cartItemsHTML +
                    '</div>' +
                    '<aside class="cart-summary-wrap">' +
                        '<div class="cart-summary">' +
                            '<div class="summary-title-row"><h3>Order Summary</h3><span>Table service</span></div>' +
                            '<div class="cart-table-picker">' +
                                '<label for="cart-table-select">Table Number</label>' +
                                '<select id="cart-table-select" class="form-select">' + buildTableOptions(tableNum) + '</select>' +
                            '</div>' +
                            '<div class="summary-row"><span>Guests</span><div class="summary-stepper"><button class="summary-step-btn" onclick="adjustGuestCount(-1)">-</button><span id="guest-count-val">' + guestCount + '</span><button class="summary-step-btn" onclick="adjustGuestCount(1)">+</button></div></div>' +
                            '<div class="summary-divider"></div>' +
                            '<div class="summary-row"><span>Subtotal</span><span>' + formatCurrency(subtotal) + '</span></div>' +
                            '<div class="summary-row"><span>GST (5%)</span><span>' + formatCurrency(gst) + '</span></div>' +
                            '<div class="summary-row"><span>Service Charge (3%)</span><span>' + formatCurrency(sc) + '</span></div>' +
                            '<div class="summary-divider"></div>' +
                            '<div class="summary-total"><span>Total</span><span>' + formatCurrency(total) + '</span></div>' +
                            tableWarning +
                            orderBtn +
                        '</div>' +
                    '</aside>' +
                '</div>' +
            '</div>' +
        '</section>';
}

async function placeOrder() {
    if (!Auth.isLoggedIn()) return;

    var cart = Storage.get('smartdine_cart', []);
    var tableNum = Storage.get('smartdine_table', null);
    var guestCount = Storage.get('smartdine_guest_count', 2);

    if (cart.length === 0) return;
    if (!tableNum) {
        var warning = document.getElementById('cart-table-warning');
        var select = document.getElementById('cart-table-select');
        if (warning) {
            warning.innerHTML = '<span>!</span><p>Choose your table here before placing the order.</p>';
            warning.style.display = 'block';
        }
        if (select) {
            select.focus();
            select.classList.add('field-attention');
            setTimeout(function() { select.classList.remove('field-attention'); }, 700);
        }
        showToast('Select Table', 'Please choose your table number in the cart summary.', 'warning');
        return;
    }

    var btn = document.getElementById('btn-place-order');
    if (btn) {
        btn.innerHTML = 'Placing Order...';
        btn.disabled = true;
    }

    var subtotal = 0;
    cart.forEach(function(i) { subtotal += i.itemTotal; });
    var total = Math.round((subtotal + (subtotal * GST_RATE) + (subtotal * SERVICE_CHARGE_RATE)) * 100) / 100;
    var waiter = Auth.getWaiterByTable(tableNum);
    var user = Auth.getUser();

    var orderData = {
        id: generateId(),
        customerEmail: user ? user.email : null,
        tableNum: tableNum,
        guestCount: guestCount,
        items: cart,
        total: total,
        waiter: waiter || null
    };

    var res = await SmartDineAPI.placeOrder(orderData);
    if (res.error) {
        showToast('Error', 'Failed to place order: ' + res.error, 'error');
        if (btn) {
            btn.innerHTML = 'Place Order';
            btn.disabled = false;
        }
        return;
    }

    Storage.set('smartdine_cart', []);
    syncCartToDB();
    updateCartBadge();
    showToast('Order Placed!', 'Your order has been sent to the kitchen.', 'success');
    navigateTo('/track-order');
}
