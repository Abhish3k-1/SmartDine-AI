// ============================================================
// SmartDine AI — Admin Dashboard
// ============================================================

async function renderAdmin() {
    var app = document.getElementById('app');
    
    // Loading State
    app.innerHTML = '<section class="page-section"><div class="container"><div style="text-align:center; padding:100px;"><div style="font-size:3rem; animation:pulse 1s infinite;">📊</div><h3>Loading Analytics...</h3></div></div></section>';
    
    // Fetch from API
    var res = await SmartDineAPI.getOrders();
    if (res.error) {
        app.innerHTML = '<div class="container"><div class="empty-state"><h3>Error loading data</h3><p>'+res.error+'</p></div></div>';
        return;
    }
    
    var orders = res.data || [];
    
    // Stats calculation
    var totalRev = 0;
    var totalOrders = orders.length;
    var totalGuests = 0;
    
    orders.forEach(function(o) {
        totalRev += parseFloat(o.total_amount || o.total || 0);
        totalGuests += parseInt(o.guest_count || o.guestCount || 2);
    });
    
    var avgOrder = totalOrders > 0 ? (totalRev / totalOrders) : 0;
    
    // Recent orders HTML
    var recentOrders = orders.slice(0, 20); // API returns newest first usually
    var ordersHTML = '';
    
    if (recentOrders.length === 0) {
        ordersHTML = '<tr><td colspan="6" style="text-align:center; padding:32px;">No orders yet.</td></tr>';
    } else {
        ordersHTML = recentOrders.map(function(o) {
            // PostgREST returns nested order_items
            var itemsStr = 'Items hidden';
            if (o.order_items && o.order_items.length > 0) {
                itemsStr = o.order_items.map(function(i){return i.quantity + 'x ' + (i.menu_item_name || i.name);}).join(', ');
            } else if (o.items && o.items.length > 0) { // Fallback for emulator
                itemsStr = o.items.map(function(i){return i.quantity + 'x ' + i.name;}).join(', ');
            }
            if (itemsStr.length > 40) itemsStr = itemsStr.substring(0, 37) + '...';
            
            var statusBadge = '';
            if (o.status === 'placed') statusBadge = '<span class="badge badge-info">New</span>';
            else if (o.status === 'preparing') statusBadge = '<span class="badge badge-warning">Preparing</span>';
            else if (o.status === 'ready') statusBadge = '<span class="badge badge-success">Ready</span>';
            else statusBadge = '<span class="badge" style="background:#555;color:white;">Served</span>';
            
            return '<tr>' +
                '<td><strong style="color:var(--accent)">' + String(o.id).substring(0,8) + '</strong></td>' +
                '<td>' + (o.table_number || o.tableNum) + '</td>' +
                '<td>' + escapeHTML(itemsStr) + '</td>' +
                '<td>' + formatCurrency(o.total_amount || o.total || 0) + '</td>' +
                '<td>' + statusBadge + '</td>' +
                '<td>' + formatTime(o.created_at || o.timestamp) + '</td>' +
            '</tr>';
        }).join('');
    }

    var optionsHTML = '';
    for(var i=1; i<=20; i++) {
        optionsHTML += '<option value="' + i + '">Table ' + i + '</option>';
    }

    app.innerHTML = 
        '<section class="page-section">' +
            '<div class="container">' +
                '<div class="page-header">' +
                    '<h1 class="page-title">📊 Admin Dashboard</h1>' +
                '</div>' +
                
                '<div class="stats-grid">' +
                    renderStatCard('💰', 'Total Revenue', formatCurrency(totalRev), 'orange') +
                    renderStatCard('📈', 'Total Orders', totalOrders, 'blue') +
                    renderStatCard('👥', 'Total Guests', totalGuests, 'purple') +
                    renderStatCard('💎', 'Avg Order Value', formatCurrency(avgOrder), 'green') +
                '</div>' +
                
                '<div style="display:grid; grid-template-columns:1fr; gap:24px; margin-bottom:32px;">' +
                    '<div class="section-card">' +
                        '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">' +
                            '<h3>Recent Orders</h3>' +
                            '<button class="btn btn-secondary btn-sm" data-action="navigate" data-route="/analytics">View All Analytics</button>' +
                        '</div>' +
                        '<div class="table-responsive">' +
                            '<table class="data-table">' +
                                '<thead><tr><th>Order ID</th><th>Table</th><th>Items</th><th>Total</th><th>Status</th><th>Time</th></tr></thead>' +
                                '<tbody>' + ordersHTML + '</tbody>' +
                            '</table>' +
                        '</div>' +
                    '</div>' +
                '</div>' +

                '<div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(300px, 1fr)); gap:24px;">' +
                    '<div class="section-card">' +
                        '<h3>Quick Links</h3><br>' +
                        '<div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">' +
                            '<button class="btn btn-secondary" style="height:80px;" data-action="navigate" data-route="/inventory">📦 Inventory</button>' +
                            '<button class="btn btn-secondary" style="height:80px;" data-action="navigate" data-route="/analytics">📈 Analytics</button>' +
                            '<button class="btn btn-secondary" style="height:80px;" data-action="navigate" data-route="/menu">🍽️ Menu</button>' +
                            '<button class="btn btn-secondary" style="height:80px;" data-action="navigate" data-route="/settings">⚙️ Settings</button>' +
                        '</div>' +
                    '</div>' +
                    
                    '<div class="section-card" style="text-align:center;">' +
                        '<h3>QR Code Generator</h3>' +
                        '<p style="color:var(--text-secondary); font-size:0.9rem; margin-bottom:16px;">Generate and print table tent cards</p>' +
                        '<select id="qr-table-select" class="form-select" style="max-width:200px; margin:0 auto 24px auto;" onchange="updateAdminQRGenerator(this.value)">' +
                            optionsHTML +
                        '</select>' +
                        '<div id="qr-preview-container">' + getQRCardHTML(1) + '</div><br>' +
                        '<div style="display:flex; gap:12px; justify-content:center;">' +
                            '<button class="btn btn-primary" onclick="printQRCard()">Print Card</button>' +
                            '<button class="btn btn-secondary" onclick="printAllQRCards()">Print All (1-20)</button>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>' +
        '</section>';
}

function getQRCardHTML(tableNum) {
    var url = window.location.origin + window.location.pathname + '#/menu?table=' + tableNum;
    var qrSVG = getMockQRSVG(url);
    return '<div class="qr-tent-preview" id="current-qr-card">' +
        '<div style="text-align:center; margin-top:20px;">' +
            '<div style="font-size:24px; font-weight:700; color:#fff;">Smart<span style="color:#f59e0b">Dine</span></div>' +
            '<div style="color:#a3a3a3; font-size:12px; letter-spacing:2px; text-transform:uppercase; margin-top:4px;">Scan to Order</div>' +
        '</div>' +
        '<div style="font-size:64px; font-weight:800; color:#f59e0b; line-height:1;">' + tableNum + '</div>' +
        '<div style="background:#fff; padding:12px; border-radius:12px; display:inline-block;">' + qrSVG + '</div>' +
        '<div style="color:#fff; font-size:12px; font-weight:600; opacity:0.8; margin-bottom:20px;">No App Download Required</div>' +
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
    printWindow.document.write('<html><head><title>Print QR</title><style>body{display:flex;justify-content:center;align-items:center;height:100vh;margin:0;} .qr-tent-preview{width:300px;height:400px;background:#111;border-radius:16px;padding:24px;display:flex;flex-direction:column;align-items:center;justify-content:space-between;-webkit-print-color-adjust:exact;color-adjust:exact;}</style></head><body>');
    printWindow.document.write(card.outerHTML);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.onload = function() { printWindow.print(); };
}

function printAllQRCards() {
    var printWindow = window.open('', '_blank');
    printWindow.document.write('<html><head><title>Print All QR Cards</title><style>body{margin:0;padding:20px;display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:20px;} .qr-tent-preview{width:300px;height:400px;background:#111;border-radius:16px;padding:24px;display:flex;flex-direction:column;align-items:center;justify-content:space-between;-webkit-print-color-adjust:exact;color-adjust:exact;} @media print { .page-break { page-break-after: always; } }</style></head><body>');
    for(var i=1; i<=20; i++) printWindow.document.write(getQRCardHTML(i));
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.onload = function() { printWindow.print(); };
}

function getMockQRSVG(url) {
    var size = 150, rects = '', hash = 0;
    for (var k = 0; k < url.length; k++) hash = url.charCodeAt(k) + ((hash << 5) - hash);
    var blocks = 7, blockSize = size / blocks;
    function drawSquare(x, y) {
        return '<rect x="'+(x*blockSize)+'" y="'+(y*blockSize)+'" width="'+(blockSize*2)+'" height="'+(blockSize*2)+'" fill="#000"/>' +
               '<rect x="'+(x*blockSize+blockSize/2)+'" y="'+(y*blockSize+blockSize/2)+'" width="'+blockSize+'" height="'+blockSize+'" fill="#fff"/>';
    }
    rects += drawSquare(0, 0) + drawSquare(blocks-2, 0) + drawSquare(0, blocks-2);
    for(var i=0; i<blocks; i++) {
        for(var j=0; j<blocks; j++) {
            if((i<2 && j<2) || (i>blocks-3 && j<2) || (i<2 && j>blocks-3) || (i>=2 && i<=4 && j>=2 && j<=4)) continue;
            var val = Math.abs(Math.sin(hash * (i+1) * (j+1))) > 0.4;
            if (val) rects += '<rect x="'+(i*blockSize)+'" y="'+(j*blockSize)+'" width="'+(blockSize+0.5)+'" height="'+(blockSize+0.5)+'" fill="#000"/>';
        }
    }
    rects += '<rect x="'+(2*blockSize)+'" y="'+(2*blockSize)+'" width="'+(3*blockSize)+'" height="'+(3*blockSize)+'" fill="#fff"/>';
    rects += '<text x="'+(size/2)+'" y="'+(size/2 + 5)+'" font-family="Arial" font-size="20" font-weight="bold" fill="#f59e0b" text-anchor="middle">SD</text>';
    return '<svg width="'+size+'" height="'+size+'" xmlns="http://www.w3.org/2000/svg">' + rects + '</svg>';
}
