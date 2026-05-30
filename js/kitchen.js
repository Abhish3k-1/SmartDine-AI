// ============================================================
// SmartDine AI — Kitchen Dashboard (Async Refactor)
// ============================================================

async function renderKitchen() {
    var app = document.getElementById('app');
    
    var res = await SmartDineAPI.getOrders();
    if (res.error) {
        app.innerHTML = '<div class="container" style="padding-top:100px;"><div class="empty-state"><h3>Error loading kitchen data</h3><p>'+res.error+'</p></div></div>';
        return;
    }
    
    var orders = res.data || [];

    // Group orders by status
    var grouped = {
        placed: [],
        preparing: [],
        ready: [],
        served: []
    };

    orders.forEach(function(o) {
        if (grouped[o.status]) grouped[o.status].push(o);
    });

    var statsHTML = 
        '<div class="stats-grid">' +
            renderStatCard('🔥', 'New Orders', grouped.placed.length, 'orange') +
            renderStatCard('👨‍🍳', 'Preparing', grouped.preparing.length, 'blue') +
            renderStatCard('✅', 'Ready', grouped.ready.length, 'green') +
            renderStatCard('🍽️', 'Served', grouped.served.length, 'purple') +
        '</div>';

    var boardHTML = 
        '<div class="kitchen-board">' +
            renderKitchenColumn('New Orders', 'placed', grouped.placed, 'var(--info)') +
            renderKitchenColumn('Preparing', 'preparing', grouped.preparing, 'var(--warning)') +
            renderKitchenColumn('Ready', 'ready', grouped.ready, 'var(--success)') +
            renderKitchenColumn('Served', 'served', grouped.served, '#555') +
        '</div>';

    app.innerHTML = 
        '<section class="page-section" style="padding-bottom:0;">' +
            '<div class="container" style="max-width:100%;">' +
                '<div class="page-header" style="margin-bottom:20px;">' +
                    '<h1 class="page-title">👨‍🍳 Kitchen Dashboard</h1>' +
                '</div>' +
                statsHTML +
                boardHTML +
            '</div>' +
        '</section>';
        
    // Set auto-refresh
    if (!currentInterval) {
        currentInterval = setInterval(function() {
            if (window.location.hash.includes('#/kitchen')) {
                // To avoid flashing the whole screen, in a real app we'd selectively update DOM.
                // For this demo, we can just re-render.
                renderKitchen();
            }
        }, 5000);
    }
}

function renderKitchenColumn(title, status, ordersList, color) {
    var cardsHTML = '';
    
    if (ordersList.length === 0) {
        cardsHTML = '<div style="text-align:center; padding:32px; color:var(--text-muted); font-size:0.9rem;">No orders</div>';
    } else {
        // Sort oldest first
        ordersList.sort(function(a,b){ return new Date(a.created_at || a.timestamp) - new Date(b.created_at || b.timestamp); });
        cardsHTML = ordersList.map(function(o) { return renderKitchenCard(o, status); }).join('');
    }

    return '<div class="kitchen-col">' +
        '<div class="kitchen-col-header" style="border-bottom-color:'+color+'">' +
            '<span>' + title + '</span>' +
            '<span class="badge" style="background:'+color+'; color:#fff;">' + ordersList.length + '</span>' +
        '</div>' +
        '<div class="kitchen-col-body">' + cardsHTML + '</div>' +
    '</div>';
}

function renderKitchenCard(order, status) {
    var itemsStr = '';
    var itemsList = order.order_items || order.items || [];
    
    itemsList.forEach(function(i) {
        var opts = [];
        if (i.portion && i.portion !== 'Regular') opts.push(i.portion);
        if (i.spice_level && i.spice_level !== 'Medium') opts.push('🌶️'+i.spice_level);
        if (i.spiceLevel && i.spiceLevel !== 'Medium') opts.push('🌶️'+i.spiceLevel); // Fallback
        
        var name = i.menu_item_name || i.name;
        
        itemsStr += '<li><strong>' + i.quantity + 'x ' + name + '</strong>';
        if (opts.length > 0) itemsStr += '<div style="font-size:0.8rem; color:var(--text-secondary);">' + opts.join(', ') + '</div>';
        if (i.special_instructions || i.specialInstructions) itemsStr += '<div class="special-instr">Note: ' + escapeHTML(i.special_instructions || i.specialInstructions) + '</div>';
        itemsStr += '</li>';
    });

    var actionBtn = '';
    if (status === 'placed') actionBtn = '<button class="btn btn-primary btn-block btn-sm" data-action="update-order-status" data-id="' + order.id + '" data-status="preparing">🔥 Start Preparing</button>';
    else if (status === 'preparing') actionBtn = '<button class="btn btn-success btn-block btn-sm" data-action="update-order-status" data-id="' + order.id + '" data-status="ready">✅ Mark Ready</button>';
    else if (status === 'ready') actionBtn = '<button class="btn btn-secondary btn-block btn-sm" data-action="update-order-status" data-id="' + order.id + '" data-status="served">🍽️ Mark Served</button>';

    var timeAgo = Math.floor((new Date() - new Date(order.created_at || order.timestamp)) / 60000);
    var timeClass = timeAgo > 15 ? 'color:var(--danger)' : 'color:var(--text-secondary)';

    return '<div class="kitchen-order">' +
        '<div class="kitchen-order-header">' +
            '<span class="badge badge-info">#' + String(order.id).substring(0,6) + '</span>' +
            '<span class="badge" style="background:var(--accent); color:#000;">Table ' + (order.table_number || order.tableNum) + '</span>' +
        '</div>' +
        '<ul class="kitchen-items">' + itemsStr + '</ul>' +
        '<div style="display:flex; justify-content:space-between; font-size:0.8rem; margin-bottom:12px;">' +
            '<span style="'+timeClass+'">⏱️ ' + timeAgo + ' min ago</span>' +
            '<span style="color:var(--text-secondary);">👤 ' + (order.waiter_name || order.waiter || 'Unassigned') + '</span>' +
        '</div>' +
        actionBtn +
    '</div>';
}

async function updateOrderStatus(orderId, newStatus) {
    // Optimistic UI could be added here, but we'll just wait for API
    var res = await SmartDineAPI.updateOrderStatus(orderId, newStatus);
    if (res.error) {
        showToast('Error', 'Failed to update order status: ' + res.error, 'error');
        return;
    }
    
    showToast('Updated', 'Order status changed to ' + newStatus, 'success');
    renderKitchen(); // Re-fetch and render
}
