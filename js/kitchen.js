// ============================================================
// SmartDine AI - Kitchen Dashboard
// ============================================================

var kitchenRefreshInFlight = false;
var kitchenLastUpdatedAt = null;

function getKitchenOrderTime(order) {
    var raw = order.created_at || order.timestamp || order.placedAt;
    var time = raw ? new Date(raw).getTime() : 0;
    return isNaN(time) ? 0 : time;
}

function getKitchenOrderItems(order) {
    return order.order_items || order.items || [];
}

function getKitchenOrderTotal(order) {
    return Number(order.total_amount || order.total || 0);
}

function getKitchenOrderTable(order) {
    return order.table_number || order.tableNum || '-';
}

function getKitchenOrderWaiter(order) {
    return order.waiter_name || order.waiter || 'Unassigned';
}

function getKitchenElapsedMinutes(order) {
    var time = getKitchenOrderTime(order);
    if (!time) return 0;
    return Math.max(0, Math.floor((Date.now() - time) / 60000));
}

function sortKitchenOrders(orders) {
    return (orders || []).slice().sort(function(a, b) {
        return getKitchenOrderTime(a) - getKitchenOrderTime(b);
    });
}

function groupKitchenOrders(orders) {
    var grouped = {
        placed: [],
        preparing: [],
        ready: [],
        served: []
    };

    (orders || []).forEach(function(order) {
        var status = String(order.status || 'placed').toLowerCase();
        if (status === 'cancelled') {
            grouped.served.push(order);
        } else if (grouped[status]) {
            grouped[status].push(order);
        }
    });

    grouped.placed = sortKitchenOrders(grouped.placed);
    grouped.preparing = sortKitchenOrders(grouped.preparing);
    grouped.ready = sortKitchenOrders(grouped.ready);
    grouped.served = sortKitchenOrders(grouped.served).reverse();
    return grouped;
}

function renderKitchen() {
    var app = document.getElementById('app');

    app.innerHTML =
        '<section class="page-section kitchen-page">' +
            '<div class="kitchen-container">' +
                '<div class="kitchen-hero">' +
                    '<div>' +
                        '<span class="menu-eyebrow">Live operations</span>' +
                        '<h1 class="page-title">Kitchen Dashboard</h1>' +
                        '<p class="page-subtitle">Manage active orders from placement to service without losing long item details.</p>' +
                    '</div>' +
                    '<div class="kitchen-live-panel">' +
                        '<span>Auto refresh</span>' +
                        '<strong id="kitchen-refresh-status">Syncing...</strong>' +
                    '</div>' +
                '</div>' +
                '<div class="kitchen-stats" id="kitchen-stats"></div>' +
                '<div class="kitchen-board" id="kitchen-board"></div>' +
            '</div>' +
        '</section>';

    refreshKitchenBoard();

    if (!currentInterval) {
        currentInterval = setInterval(function() {
            if (window.location.hash.split('?')[0] === '#/kitchen') {
                refreshKitchenBoard();
            }
        }, 5000);
    }
}

async function refreshKitchenBoard() {
    if (kitchenRefreshInFlight) return;
    kitchenRefreshInFlight = true;

    var statusEl = document.getElementById('kitchen-refresh-status');
    if (statusEl) statusEl.textContent = 'Syncing...';

    try {
        var res = await SmartDineAPI.getOrders();
        if (res.error) {
            renderKitchenError(res.error);
            return;
        }

        var orders = res.data || [];
        var grouped = groupKitchenOrders(orders);
        renderKitchenStats(grouped);
        renderKitchenBoard(grouped);

        kitchenLastUpdatedAt = new Date();
        statusEl = document.getElementById('kitchen-refresh-status');
        if (statusEl) statusEl.textContent = 'Updated ' + formatTime(kitchenLastUpdatedAt.toISOString());
    } catch (err) {
        renderKitchenError(err && err.message ? err.message : 'Unable to refresh kitchen orders.');
    } finally {
        kitchenRefreshInFlight = false;
    }
}

function renderKitchenError(message) {
    var board = document.getElementById('kitchen-board');
    if (board) {
        board.innerHTML =
            '<div class="kitchen-error">' +
                '<h3>Kitchen sync failed</h3>' +
                '<p>' + escapeHTML(message || 'Please try again.') + '</p>' +
                '<button class="btn btn-primary btn-sm" onclick="refreshKitchenBoard()">Retry</button>' +
            '</div>';
    }

    var statusEl = document.getElementById('kitchen-refresh-status');
    if (statusEl) statusEl.textContent = 'Needs attention';
}

function renderKitchenStats(grouped) {
    var stats = document.getElementById('kitchen-stats');
    if (!stats) return;

    var activeCount = grouped.placed.length + grouped.preparing.length + grouped.ready.length;
    stats.innerHTML =
        '<div class="kitchen-stat kitchen-stat-new"><span>New</span><strong>' + grouped.placed.length + '</strong></div>' +
        '<div class="kitchen-stat kitchen-stat-cooking"><span>Cooking</span><strong>' + grouped.preparing.length + '</strong></div>' +
        '<div class="kitchen-stat kitchen-stat-ready"><span>Ready</span><strong>' + grouped.ready.length + '</strong></div>' +
        '<div class="kitchen-stat kitchen-stat-active"><span>Active queue</span><strong>' + activeCount + '</strong></div>';
}

function renderKitchenBoard(grouped) {
    var board = document.getElementById('kitchen-board');
    if (!board) return;

    board.innerHTML =
        renderKitchenColumn('New Orders', 'placed', grouped.placed, 'Orders waiting to start') +
        renderKitchenColumn('Preparing', 'preparing', grouped.preparing, 'Currently in the kitchen') +
        renderKitchenColumn('Ready', 'ready', grouped.ready, 'Needs pickup or service') +
        renderKitchenColumn('Closed', 'served', grouped.served, 'Served and cancelled orders');
}

function renderKitchenColumn(title, status, ordersList, subtitle) {
    var cardsHTML = '';

    if (!ordersList || ordersList.length === 0) {
        cardsHTML =
            '<div class="kitchen-empty">' +
                '<strong>No orders</strong>' +
                '<span>' + escapeHTML(subtitle) + '</span>' +
            '</div>';
    } else {
        cardsHTML = ordersList.map(function(order) {
            return renderKitchenCard(order, status);
        }).join('');
    }

    return '<section class="kitchen-col" data-status="' + status + '">' +
        '<div class="kitchen-col-header">' +
            '<div><span>' + escapeHTML(title) + '</span><small>' + escapeHTML(subtitle) + '</small></div>' +
            '<strong>' + (ordersList ? ordersList.length : 0) + '</strong>' +
        '</div>' +
        '<div class="kitchen-col-body">' + cardsHTML + '</div>' +
    '</section>';
}

function renderKitchenCard(order, columnStatus) {
    var status = String(order.status || columnStatus || 'placed').toLowerCase();
    var itemsList = getKitchenOrderItems(order);
    var elapsed = getKitchenElapsedMinutes(order);
    var elapsedClass = elapsed > 15 && status !== 'served' && status !== 'cancelled' ? ' kitchen-time-late' : '';
    var actionBtn = getKitchenActionButton(order, status);
    var isHistoryOrder = status === 'served' || status === 'cancelled';
    var total = getKitchenOrderTotal(order);

    var itemsStr = '';
    if (itemsList.length === 0) {
        itemsStr = '<li class="kitchen-item-empty">No item details</li>';
    } else {
        itemsList.forEach(function(item) {
            var qty = item.quantity || item.qty || 1;
            var name = item.menu_item_name || item.name || 'Menu item';
            var opts = [];

            if (item.portion && item.portion !== 'Regular') opts.push(item.portion);
            if (item.spice_level && item.spice_level !== 'Medium') opts.push(item.spice_level);
            if (item.spiceLevel && item.spiceLevel !== 'Medium') opts.push(item.spiceLevel);

            var note = item.special_instructions || item.specialInstructions || '';

            itemsStr += '<li class="kitchen-item">' +
                '<div class="kitchen-item-main">' +
                    '<span class="kitchen-item-qty">' + qty + 'x</span>' +
                    '<strong>' + escapeHTML(name) + '</strong>' +
                '</div>' +
                (opts.length ? '<div class="kitchen-item-options">' + escapeHTML(opts.join(' / ')) + '</div>' : '') +
                (note ? '<div class="special-instr">Note: ' + escapeHTML(note) + '</div>' : '') +
            '</li>';
        });
    }

    return '<article class="kitchen-order" data-status="' + status + '">' +
        '<div class="kitchen-order-header">' +
            '<span class="kitchen-order-id">#' + escapeHTML(String(order.id || '').substring(0, 10)) + '</span>' +
            '<div class="kitchen-order-header-actions">' +
                '<span class="kitchen-table-badge">Table ' + escapeHTML(String(getKitchenOrderTable(order))) + '</span>' +
                (isHistoryOrder ? actionBtn : '') +
            '</div>' +
        '</div>' +
        '<div class="kitchen-order-meta">' +
            '<span class="kitchen-time' + elapsedClass + '">' + elapsed + ' min</span>' +
            '<span>' + escapeHTML(getKitchenOrderWaiter(order)) + '</span>' +
            (total ? '<span>' + formatCurrency(total) + '</span>' : '') +
        '</div>' +
        '<ul class="kitchen-items">' + itemsStr + '</ul>' +
        '<div class="kitchen-order-footer">' +
            '<span class="kitchen-status-pill kitchen-status-' + status + '">' + escapeHTML(getKitchenStatusLabel(status)) + '</span>' +
            (isHistoryOrder ? '' : actionBtn) +
        '</div>' +
    '</article>';
}

function getKitchenStatusLabel(status) {
    var labels = {
        placed: 'New',
        preparing: 'Preparing',
        ready: 'Ready',
        served: 'Served',
        cancelled: 'Cancelled'
    };
    return labels[status] || status;
}

function getKitchenActionButton(order, status) {
    var id = escapeHTML(String(order.id || ''));
    if (status === 'placed') {
        return '<button class="btn btn-primary btn-sm kitchen-action-btn" data-action="update-order-status" data-id="' + id + '" data-status="preparing">Start</button>';
    }
    if (status === 'preparing') {
        return '<button class="btn btn-success btn-sm kitchen-action-btn" data-action="update-order-status" data-id="' + id + '" data-status="ready">Ready</button>';
    }
    if (status === 'ready') {
        return '<button class="btn btn-secondary btn-sm kitchen-action-btn" data-action="update-order-status" data-id="' + id + '" data-status="served">Serve</button>';
    }
    if (status === 'served' || status === 'cancelled') {
        return '<button class="btn btn-danger btn-sm kitchen-action-btn kitchen-delete-btn" data-action="delete-kitchen-history" data-id="' + id + '">Delete</button>';
    }
    return '';
}

async function updateOrderStatus(orderId, newStatus) {
    var res = await SmartDineAPI.updateOrderStatus(orderId, newStatus);
    if (res.error) {
        showToast('Error', 'Failed to update order status: ' + res.error, 'error');
        return;
    }

    showToast('Updated', 'Order status changed to ' + newStatus, 'success');
    refreshKitchenBoard();
}

async function deleteKitchenOrderHistory(orderId) {
    if (!Auth.isKitchen()) {
        showToast('Kitchen Only', 'Only kitchen staff can delete served order history.', 'warning');
        return;
    }

    var ordersRes = await SmartDineAPI.getOrders();
    if (ordersRes.error) {
        showToast('Delete Failed', 'Could not check this order right now.', 'error');
        return;
    }

    var order = null;
    var orders = ordersRes.data || [];
    for (var i = 0; i < orders.length; i++) {
        if (String(orders[i].id) === String(orderId)) {
            order = orders[i];
            break;
        }
    }

    if (!order) {
        showToast('Already Deleted', 'This order history is no longer available.', 'info');
        refreshKitchenBoard();
        return;
    }

    var status = String(order.status || '').toLowerCase();
    if (status !== 'served' && status !== 'cancelled') {
        showToast('Not Closed', 'Only served or cancelled orders can be deleted.', 'warning');
        return;
    }

    showDeleteKitchenHistoryModal(order);
}

function showDeleteKitchenHistoryModal(order) {
    var table = getKitchenOrderTable(order);
    var status = getKitchenStatusLabel(String(order.status || '').toLowerCase());
    var orderId = String(order.id || '');

    showModal(
        'Delete Order History',
        '<div class="delete-history-modal">' +
            '<div class="delete-history-mark">!</div>' +
            '<p>This will permanently remove the closed kitchen record for <strong>#' + escapeHTML(orderId.substring(0, 10)) + '</strong>.</p>' +
            '<div class="delete-history-details">' +
                '<span>Table ' + escapeHTML(String(table)) + '</span>' +
                '<span>' + escapeHTML(status) + '</span>' +
            '</div>' +
        '</div>',
        '<button class="btn btn-secondary" data-action="close-modal">Keep History</button>' +
        '<button class="btn btn-danger" data-action="confirm-delete-kitchen-history" data-id="' + escapeHTML(orderId) + '">Delete History</button>'
    );
}

async function confirmDeleteKitchenOrderHistory(orderId) {
    if (!Auth.isKitchen()) {
        showToast('Kitchen Only', 'Only kitchen staff can delete served order history.', 'warning');
        return;
    }

    var res = await SmartDineAPI.deleteOrder(orderId);
    if (res.error) {
        showToast('Delete Failed', res.error, 'error');
        return;
    }

    closeModal();
    showToast('History Deleted', 'Closed order removed from kitchen history.', 'success');
    refreshKitchenBoard();
}
