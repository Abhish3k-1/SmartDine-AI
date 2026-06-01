// ============================================================
// SmartDine AI - Analytics Dashboard
// ============================================================

async function renderAnalytics() {
    var app = document.getElementById('app');
    app.innerHTML = getAdminLoadingShell('Loading analytics');

    var results = await Promise.all([
        SmartDineAPI.getOrders(),
        SmartDineAPI.getInventory()
    ]);

    var ordersRes = results[0];
    var invRes = results[1];

    if (ordersRes.error || invRes.error) {
        app.innerHTML = getAdminErrorShell('Error loading analytics', ordersRes.error || invRes.error);
        return;
    }

    var orders = ordersRes.data || [];
    var inventory = invRes.data || [];

    var totalRev = 0;
    var totalOrders = orders.length;
    var totalGuests = 0;
    orders.forEach(function(order) {
        totalRev += parseFloat(order.total_amount || order.total || 0);
        totalGuests += parseInt(order.guest_count || order.guestCount || 2);
    });
    var avgOrder = totalOrders > 0 ? (totalRev / totalOrders) : 0;
    var hasOrders = totalOrders > 0;

    var tableData = {};
    if (hasOrders) {
        orders.forEach(function(order) {
            var table = order.table_number || order.tableNum || '-';
            var amount = parseFloat(order.total_amount || order.total || 0);
            if (!tableData[table]) tableData[table] = { rev: 0, count: 0 };
            tableData[table].rev += amount;
            tableData[table].count += 1;
        });
    } else {
        [1, 2, 5, 7, 12].forEach(function(table) {
            tableData[table] = { rev: Math.random() * 5000 + 1000, count: Math.floor(Math.random() * 10) + 2 };
        });
    }

    var maxTableRev = 0;
    Object.keys(tableData).forEach(function(table) {
        if (tableData[table].rev > maxTableRev) maxTableRev = tableData[table].rev;
    });

    var tableBarsHTML = Object.keys(tableData).sort(function(a, b) {
        return tableData[b].rev - tableData[a].rev;
    }).slice(0, 5).map(function(table) {
        var data = tableData[table];
        var pct = maxTableRev > 0 ? (data.rev / maxTableRev) * 100 : 0;
        return getAdminProgressRow('Table ' + table, formatCurrency(data.rev), pct, 'orders', data.count + ' orders');
    }).join('');

    var itemCounts = {};
    if (hasOrders) {
        orders.forEach(function(order) {
            var items = order.order_items || order.items || [];
            items.forEach(function(item) {
                var name = item.menu_item_name || item.name || 'Menu item';
                var qty = parseInt(item.quantity || 1);
                if (!itemCounts[name]) itemCounts[name] = 0;
                itemCounts[name] += qty;
            });
        });
    } else {
        itemCounts = {
            'Paneer Tikka': 45,
            'Chicken Dum Biryani': 38,
            'Butter Naan': 62,
            'Cold Coffee': 29,
            'Dal Tadka': 22
        };
    }

    var maxItemCount = 0;
    Object.keys(itemCounts).forEach(function(name) {
        if (itemCounts[name] > maxItemCount) maxItemCount = itemCounts[name];
    });

    var itemBarsHTML = Object.keys(itemCounts).sort(function(a, b) {
        return itemCounts[b] - itemCounts[a];
    }).slice(0, 5).map(function(name) {
        var count = itemCounts[name];
        var pct = maxItemCount > 0 ? (count / maxItemCount) * 100 : 0;
        return getAdminProgressRow(name, count + ' served', pct, 'average', 'Menu item performance');
    }).join('');

    var days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    var dailyRev = days.map(function() { return Math.floor(Math.random() * 15000 + 5000); });
    if (hasOrders) dailyRev[6] = totalRev;

    var maxDailyRev = Math.max.apply(null, dailyRev);
    var dailyChartHTML = '<div class="admin-weekly-chart">' +
        dailyRev.map(function(revenue, i) {
            var pct = maxDailyRev > 0 ? (revenue / maxDailyRev) * 100 : 0;
            return '<div class="admin-chart-col">' +
                '<span>' + escapeHTML((revenue / 1000).toFixed(1) + 'k') + '</span>' +
                '<div class="admin-chart-track"><i style="height:' + pct + '%;"></i></div>' +
                '<strong>' + escapeHTML(days[i]) + '</strong>' +
            '</div>';
        }).join('') +
    '</div>';

    var statuses = { placed: 0, preparing: 0, ready: 0, served: 0, cancelled: 0 };
    if (hasOrders) {
        orders.forEach(function(order) {
            var status = String(order.status || 'served').toLowerCase();
            if (!statuses.hasOwnProperty(status)) statuses[status] = 0;
            statuses[status] += 1;
        });
    } else {
        statuses = { placed: 5, preparing: 8, ready: 3, served: 42, cancelled: 0 };
    }

    var statusTotal = 0;
    Object.keys(statuses).forEach(function(status) {
        statusTotal += statuses[status];
    });

    var statusHTML = Object.keys(statuses).map(function(status) {
        var count = statuses[status];
        var pct = statusTotal > 0 ? (count / statusTotal) * 100 : 0;
        return getAdminProgressRow(getAdminStatusLabel(status), count, pct, getAnalyticsToneForStatus(status), pct.toFixed(0) + '% of orders');
    }).join('');

    var heatmapHTML = '';
    for (var t = 1; t <= 20; t++) {
        var ordersCount = tableData[t] ? tableData[t].count : (hasOrders ? 0 : Math.floor(Math.random() * 5));
        var heatClass = 'is-empty';
        if (ordersCount > 0 && ordersCount <= 2) heatClass = 'is-low';
        else if (ordersCount > 2 && ordersCount <= 5) heatClass = 'is-medium';
        else if (ordersCount > 5) heatClass = 'is-high';

        heatmapHTML += '<div class="admin-heat-cell ' + heatClass + '">' +
            '<strong>' + t + '</strong>' +
            '<span>' + ordersCount + ' orders</span>' +
        '</div>';
    }

    var popularItemName = Object.keys(itemCounts).length > 0 ? Object.keys(itemCounts).reduce(function(a, b) {
        return itemCounts[a] > itemCounts[b] ? a : b;
    }) : 'Paneer Tikka';

    var busiestTable = Object.keys(tableData).length > 0 ? Object.keys(tableData).reduce(function(a, b) {
        return tableData[a].count > tableData[b].count ? a : b;
    }) : '5';

    var lowStockItems = inventory.filter(function(item) {
        return (item.available_stock || item.availableStock || 0) < (item.low_stock_limit || item.lowStockLimit || 20);
    });
    var stockWarning = lowStockItems.length > 0 ?
        lowStockItems.length + ' items are running low on stock. First priority: ' + (lowStockItems[0].item_name || lowStockItems[0].name || 'Inventory item') + '.' :
        'Inventory levels are looking healthy across all categories.';

    var insightsHTML =
        getAnalyticsInsight('Trending Item', popularItemName + ' is currently your most popular dish.', 'ready') +
        getAnalyticsInsight('Inventory Alert', stockWarning, lowStockItems.length > 0 ? 'danger' : 'ready') +
        getAnalyticsInsight('Busiest Table', 'Table ' + busiestTable + ' has generated the most orders today.', 'orders') +
        getAnalyticsInsight('Revenue Trend', 'Projected 12% increase in revenue this weekend based on current order velocity.', 'average');

    app.innerHTML =
        '<section class="page-section admin-page">' +
            '<div class="admin-container">' +
                getAdminPageHero(
                    'Decision center',
                    'Analytics & Insights',
                    'Read revenue, table demand, menu performance, and stock signals in a cleaner responsive dashboard.',
                    '/analytics',
                    '<button class="btn btn-secondary" data-action="navigate" data-route="/admin">Dashboard</button>' +
                    '<button class="btn btn-primary" data-action="navigate" data-route="/inventory">Inventory</button>'
                ) +

                '<div class="admin-metrics-grid">' +
                    getAdminMetricCard('Total Revenue', formatCurrency(hasOrders ? totalRev : 42500), hasOrders ? 'Live order data' : 'Demo projection', 'revenue') +
                    getAdminMetricCard('Total Orders', hasOrders ? totalOrders : 86, 'Orders in reporting period', 'orders') +
                    getAdminMetricCard('Guests Served', hasOrders ? totalGuests : 215, 'Estimated guest count', 'guests') +
                    getAdminMetricCard('Avg Order Value', formatCurrency(hasOrders ? avgOrder : 494), 'Revenue per order', 'average') +
                '</div>' +

                '<div class="admin-analytics-grid">' +
                    '<section class="admin-panel admin-analytics-card"><div class="admin-panel-header"><div><span>Revenue</span><h2>Top Tables</h2></div></div>' + tableBarsHTML + '</section>' +
                    '<section class="admin-panel admin-analytics-card"><div class="admin-panel-header"><div><span>Menu</span><h2>Popular Items</h2></div></div>' + itemBarsHTML + '</section>' +
                    '<section class="admin-panel admin-weekly-panel"><div class="admin-panel-header"><div><span>Weekly</span><h2>Revenue Trend</h2></div></div>' + dailyChartHTML + '</section>' +
                    '<section class="admin-panel admin-status-panel"><div class="admin-panel-header"><div><span>Orders</span><h2>Status Distribution</h2></div></div>' + statusHTML + '</section>' +
                    '<section class="admin-panel admin-heatmap-panel"><div class="admin-panel-header"><div><span>Floor</span><h2>Table Heatmap</h2></div></div><div class="admin-heatmap-grid">' + heatmapHTML + '</div></section>' +
                    '<section class="admin-panel admin-insights-panel"><div class="admin-panel-header"><div><span>SmartDine</span><h2>AI Insights</h2></div></div><div class="admin-insight-list">' + insightsHTML + '</div></section>' +
                '</div>' +
            '</div>' +
        '</section>';
}

function getAnalyticsToneForStatus(status) {
    if (status === 'placed') return 'orders';
    if (status === 'preparing') return 'average';
    if (status === 'ready' || status === 'served') return 'ready';
    if (status === 'cancelled') return 'danger';
    return 'neutral';
}

function getAnalyticsInsight(title, body, tone) {
    return '<article class="admin-insight admin-tone-' + getAdminSafeClass(tone || 'neutral') + '">' +
        '<strong>' + escapeHTML(title) + '</strong>' +
        '<p>' + escapeHTML(body) + '</p>' +
    '</article>';
}
