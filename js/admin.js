// ============================================================
// SmartDine AI - Admin Dashboard
// ============================================================

function getAdminSafeClass(value) {
    return String(value || '').toLowerCase().replace(/[^a-z0-9-]/g, '');
}

function getAdminLoadingShell(label) {
    return '<section class="page-section admin-page">' +
        '<div class="admin-container">' +
            '<div class="admin-loading-card">' +
                '<span class="admin-loading-mark"></span>' +
                '<strong>' + escapeHTML(label || 'Loading admin data') + '</strong>' +
                '<small>Please wait while SmartDine syncs the latest records.</small>' +
            '</div>' +
        '</div>' +
    '</section>';
}

function getAdminErrorShell(title, message) {
    return '<section class="page-section admin-page">' +
        '<div class="admin-container">' +
            '<div class="admin-empty-panel">' +
                '<strong>' + escapeHTML(title || 'Unable to load data') + '</strong>' +
                '<span>' + escapeHTML(message || 'Please try again.') + '</span>' +
            '</div>' +
        '</div>' +
    '</section>';
}

function getAdminRouteTabs(activeRoute) {
    var routes = [
        { route: '/admin', label: 'Dashboard' },
        { route: '/inventory', label: 'Inventory' },
        { route: '/analytics', label: 'Analytics' }
    ];

    return '<nav class="admin-route-tabs" aria-label="Admin sections">' +
        routes.map(function(item) {
            var isActive = item.route === activeRoute;
            return '<button type="button" class="admin-route-tab' + (isActive ? ' is-active' : '') + '" data-action="navigate" data-route="' + item.route + '"' + (isActive ? ' aria-current="page"' : '') + '>' +
                escapeHTML(item.label) +
            '</button>';
        }).join('') +
    '</nav>';
}

function getAdminPageHero(eyebrow, title, subtitle, activeRoute, actionsHTML) {
    return '<div class="admin-hero">' +
        '<div class="admin-hero-copy">' +
            '<span class="admin-eyebrow">' + escapeHTML(eyebrow) + '</span>' +
            '<h1 class="admin-title">' + escapeHTML(title) + '</h1>' +
            '<p class="admin-subtitle">' + escapeHTML(subtitle) + '</p>' +
            getAdminRouteTabs(activeRoute) +
        '</div>' +
        (actionsHTML ? '<div class="admin-hero-actions">' + actionsHTML + '</div>' : '') +
    '</div>';
}

function getAdminMetricCard(label, value, meta, tone) {
    return '<article class="admin-metric admin-tone-' + getAdminSafeClass(tone || 'neutral') + '">' +
        '<span>' + escapeHTML(label) + '</span>' +
        '<strong>' + escapeHTML(String(value)) + '</strong>' +
        '<small>' + escapeHTML(meta || '') + '</small>' +
    '</article>';
}

function getAdminStatusLabel(status) {
    var labels = {
        placed: 'New',
        preparing: 'Preparing',
        ready: 'Ready',
        served: 'Served',
        cancelled: 'Cancelled'
    };
    return labels[String(status || '').toLowerCase()] || (status || 'Unknown');
}

function getAdminStatusBadge(status) {
    var normalized = String(status || 'served').toLowerCase();
    return '<span class="admin-pill admin-status admin-status-' + getAdminSafeClass(normalized) + '">' +
        escapeHTML(getAdminStatusLabel(normalized)) +
    '</span>';
}

function getAdminOrderItemsText(order) {
    var items = order.order_items || order.items || [];
    if (!items || items.length === 0) return 'Items hidden';

    return items.map(function(item) {
        var qty = item.quantity || item.qty || 1;
        var name = item.menu_item_name || item.name || 'Menu item';
        return qty + 'x ' + name;
    }).join(', ');
}

function getAdminOrderTime(order) {
    var raw = order.created_at || order.timestamp || order.placedAt;
    var time = raw ? new Date(raw).getTime() : 0;
    return isNaN(time) ? 0 : time;
}

function getAdminProgressRow(label, value, percent, tone, meta) {
    var safePercent = Math.max(0, Math.min(100, Number(percent) || 0));
    return '<div class="admin-progress-row admin-tone-' + getAdminSafeClass(tone || 'neutral') + '">' +
        '<div class="admin-progress-top">' +
            '<span>' + escapeHTML(label) + '</span>' +
            '<strong>' + escapeHTML(String(value)) + '</strong>' +
        '</div>' +
        '<div class="admin-progress-track"><span style="width:' + safePercent + '%;"></span></div>' +
        (meta ? '<small>' + escapeHTML(meta) + '</small>' : '') +
    '</div>';
}

async function renderAdmin() {
    var app = document.getElementById('app');
    app.innerHTML = getAdminLoadingShell('Loading dashboard');

    var res = await SmartDineAPI.getOrders();
    if (res.error) {
        app.innerHTML = getAdminErrorShell('Error loading dashboard', res.error);
        return;
    }

    var orders = res.data || [];
    var totalRev = 0;
    var totalOrders = orders.length;
    var totalGuests = 0;
    var activeOrders = 0;

    orders.forEach(function(order) {
        var status = String(order.status || '').toLowerCase();
        totalRev += parseFloat(order.total_amount || order.total || 0);
        totalGuests += parseInt(order.guest_count || order.guestCount || 2);
        if (status === 'placed' || status === 'preparing' || status === 'ready') activeOrders += 1;
    });

    var avgOrder = totalOrders > 0 ? (totalRev / totalOrders) : 0;
    var recentOrders = orders.slice().sort(function(a, b) {
        return getAdminOrderTime(b) - getAdminOrderTime(a);
    }).slice(0, 20);

    var ordersHTML = '';
    if (recentOrders.length === 0) {
        ordersHTML = '<tr><td colspan="6" class="admin-table-empty">No orders yet.</td></tr>';
    } else {
        ordersHTML = recentOrders.map(function(order) {
            var id = String(order.id || '-');
            var table = order.table_number || order.tableNum || '-';
            var itemsText = getAdminOrderItemsText(order);
            var total = formatCurrency(order.total_amount || order.total || 0);
            var status = order.status || 'served';
            var time = order.created_at || order.timestamp;

            return '<tr>' +
                '<td data-label="Order ID"><strong class="admin-order-id">#' + escapeHTML(id.substring(0, 10)) + '</strong></td>' +
                '<td data-label="Table"><span class="admin-pill">Table ' + escapeHTML(String(table)) + '</span></td>' +
                '<td data-label="Items"><span class="admin-table-note">' + escapeHTML(itemsText) + '</span></td>' +
                '<td data-label="Total"><strong class="admin-money">' + total + '</strong></td>' +
                '<td data-label="Status">' + getAdminStatusBadge(status) + '</td>' +
                '<td data-label="Time">' + escapeHTML(formatTime(time)) + '</td>' +
            '</tr>';
        }).join('');
    }

    var optionsHTML = '';
    for (var i = 1; i <= 20; i++) {
        optionsHTML += '<option value="' + i + '">Table ' + i + '</option>';
    }

    app.innerHTML =
        '<section class="page-section admin-page">' +
            '<div class="admin-container">' +
                getAdminPageHero(
                    'Manager workspace',
                    'Admin Dashboard',
                    'Monitor revenue, recent orders, quick navigation, and table QR cards from one responsive control room.',
                    '/admin',
                    '<button class="btn btn-secondary" data-action="navigate" data-route="/inventory">Inventory</button>' +
                    '<button class="btn btn-primary" data-action="navigate" data-route="/analytics">Analytics</button>'
                ) +

                '<div class="admin-metrics-grid">' +
                    getAdminMetricCard('Total Revenue', formatCurrency(totalRev), 'Across all recorded orders', 'revenue') +
                    getAdminMetricCard('Total Orders', totalOrders, activeOrders + ' currently active', 'orders') +
                    getAdminMetricCard('Total Guests', totalGuests, 'Estimated seated guests', 'guests') +
                    getAdminMetricCard('Avg Order Value', formatCurrency(avgOrder), 'Revenue per order', 'average') +
                '</div>' +

                '<div class="admin-main-grid">' +
                    '<section class="admin-panel admin-panel-wide">' +
                        '<div class="admin-panel-header">' +
                            '<div><span>Live Orders</span><h2>Recent Orders</h2></div>' +
                            '<button class="btn btn-secondary btn-sm" data-action="navigate" data-route="/analytics">View Analytics</button>' +
                        '</div>' +
                        '<div class="admin-table-wrap">' +
                            '<table class="admin-data-table">' +
                                '<thead><tr><th>Order ID</th><th>Table</th><th>Items</th><th>Total</th><th>Status</th><th>Time</th></tr></thead>' +
                                '<tbody>' + ordersHTML + '</tbody>' +
                            '</table>' +
                        '</div>' +
                    '</section>' +

                    '<section class="admin-panel">' +
                        '<div class="admin-panel-header">' +
                            '<div><span>Shortcuts</span><h2>Quick Actions</h2></div>' +
                        '</div>' +
                        '<div class="admin-action-grid">' +
                            '<button class="admin-action-card" data-action="navigate" data-route="/inventory"><strong>Inventory</strong><span>Review stock and item usage</span></button>' +
                            '<button class="admin-action-card" data-action="navigate" data-route="/analytics"><strong>Analytics</strong><span>Open revenue and table insights</span></button>' +
                            '<button class="admin-action-card" data-action="navigate" data-route="/menu"><strong>Menu</strong><span>Preview the customer ordering view</span></button>' +
                            '<button class="admin-action-card" data-action="navigate" data-route="/settings"><strong>Settings</strong><span>Adjust app preferences</span></button>' +
                        '</div>' +
                    '</section>' +

                    '<section class="admin-panel admin-qr-panel">' +
                        '<div class="admin-panel-header">' +
                            '<div><span>Tables</span><h2>QR Generator</h2></div>' +
                        '</div>' +
                        '<p class="admin-panel-copy">Generate table cards for scan-to-order service.</p>' +
                        '<select id="qr-table-select" class="form-select admin-qr-select" onchange="updateAdminQRGenerator(this.value)">' +
                            optionsHTML +
                        '</select>' +
                        '<div id="qr-preview-container">' + getQRCardHTML(1) + '</div>' +
                        '<div class="admin-button-row">' +
                            '<button class="btn btn-primary" onclick="printQRCard()">Print Card</button>' +
                            '<button class="btn btn-secondary" onclick="printAllQRCards()">Print All</button>' +
                        '</div>' +
                    '</section>' +
                '</div>' +
            '</div>' +
        '</section>';
}

function getQRCardHTML(tableNum) {
    var url = window.location.origin + window.location.pathname + '#/menu?table=' + tableNum;
    var qrSVG = getMockQRSVG(url);
    return '<div class="qr-tent-preview admin-qr-card" id="current-qr-card">' +
        '<div class="admin-qr-brand">' +
            '<strong>Smart<span>Dine</span></strong>' +
            '<small>Scan to Order</small>' +
        '</div>' +
        '<div class="admin-qr-table">' + tableNum + '</div>' +
        '<div class="admin-qr-code">' + qrSVG + '</div>' +
        '<div class="admin-qr-footer">No app download required</div>' +
    '</div>';
}

function updateAdminQRGenerator(tableNum) {
    var container = document.getElementById('qr-preview-container');
    if (container) container.innerHTML = getQRCardHTML(tableNum);
}

function printQRCard() {
    var card = document.getElementById('current-qr-card');
    if (!card) return;
    var printWindow = window.open('', '_blank');
    printWindow.document.write('<html><head><title>Print QR</title><style>body{display:flex;justify-content:center;align-items:center;height:100vh;margin:0;} .qr-tent-preview{width:300px;height:400px;background:#111;border-radius:16px;padding:24px;display:flex;flex-direction:column;align-items:center;justify-content:space-between;-webkit-print-color-adjust:exact;color-adjust:exact;} .admin-qr-brand,.admin-qr-footer{color:#fff;text-align:center}.admin-qr-brand strong{font-size:24px}.admin-qr-brand span,.admin-qr-table{color:#f59e0b}.admin-qr-brand small{display:block;color:#a3a3a3;font-size:12px;letter-spacing:2px;text-transform:uppercase;margin-top:4px}.admin-qr-table{font-size:64px;font-weight:800;line-height:1}.admin-qr-code{background:#fff;padding:12px;border-radius:12px;display:inline-block}.admin-qr-footer{font-size:12px;font-weight:600;opacity:.8}</style></head><body>');
    printWindow.document.write(card.outerHTML);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.onload = function() { printWindow.print(); };
}

function printAllQRCards() {
    var printWindow = window.open('', '_blank');
    printWindow.document.write('<html><head><title>Print All QR Cards</title><style>body{margin:0;padding:20px;display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:20px;} .qr-tent-preview{width:300px;height:400px;background:#111;border-radius:16px;padding:24px;display:flex;flex-direction:column;align-items:center;justify-content:space-between;-webkit-print-color-adjust:exact;color-adjust:exact;} .admin-qr-brand,.admin-qr-footer{color:#fff;text-align:center}.admin-qr-brand strong{font-size:24px}.admin-qr-brand span,.admin-qr-table{color:#f59e0b}.admin-qr-brand small{display:block;color:#a3a3a3;font-size:12px;letter-spacing:2px;text-transform:uppercase;margin-top:4px}.admin-qr-table{font-size:64px;font-weight:800;line-height:1}.admin-qr-code{background:#fff;padding:12px;border-radius:12px;display:inline-block}.admin-qr-footer{font-size:12px;font-weight:600;opacity:.8} @media print { .page-break { page-break-after: always; } }</style></head><body>');
    for (var i = 1; i <= 20; i++) printWindow.document.write(getQRCardHTML(i));
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.onload = function() { printWindow.print(); };
}

function getMockQRSVG(url) {
    var size = 150, rects = '', hash = 0;
    for (var k = 0; k < url.length; k++) hash = url.charCodeAt(k) + ((hash << 5) - hash);
    var blocks = 7, blockSize = size / blocks;

    function drawSquare(x, y) {
        return '<rect x="' + (x * blockSize) + '" y="' + (y * blockSize) + '" width="' + (blockSize * 2) + '" height="' + (blockSize * 2) + '" fill="#000"/>' +
            '<rect x="' + (x * blockSize + blockSize / 2) + '" y="' + (y * blockSize + blockSize / 2) + '" width="' + blockSize + '" height="' + blockSize + '" fill="#fff"/>';
    }

    rects += drawSquare(0, 0) + drawSquare(blocks - 2, 0) + drawSquare(0, blocks - 2);
    for (var i = 0; i < blocks; i++) {
        for (var j = 0; j < blocks; j++) {
            if ((i < 2 && j < 2) || (i > blocks - 3 && j < 2) || (i < 2 && j > blocks - 3) || (i >= 2 && i <= 4 && j >= 2 && j <= 4)) continue;
            var val = Math.abs(Math.sin(hash * (i + 1) * (j + 1))) > 0.4;
            if (val) rects += '<rect x="' + (i * blockSize) + '" y="' + (j * blockSize) + '" width="' + (blockSize + 0.5) + '" height="' + (blockSize + 0.5) + '" fill="#000"/>';
        }
    }
    rects += '<rect x="' + (2 * blockSize) + '" y="' + (2 * blockSize) + '" width="' + (3 * blockSize) + '" height="' + (3 * blockSize) + '" fill="#fff"/>';
    rects += '<text x="' + (size / 2) + '" y="' + (size / 2 + 5) + '" font-family="Arial" font-size="20" font-weight="bold" fill="#f59e0b" text-anchor="middle">SD</text>';
    return '<svg width="' + size + '" height="' + size + '" xmlns="http://www.w3.org/2000/svg">' + rects + '</svg>';
}
