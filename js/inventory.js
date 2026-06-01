// ============================================================
// SmartDine AI - Inventory Management
// ============================================================

async function renderInventory() {
    var app = document.getElementById('app');
    app.innerHTML = getAdminLoadingShell('Loading inventory');

    var res = await SmartDineAPI.getInventory();
    if (res.error) {
        app.innerHTML = getAdminErrorShell('Error loading inventory', res.error);
        return;
    }

    var inventory = res.data || [];
    var totalAvailable = 0;
    var totalUsed = 0;
    var lowStockCount = 0;
    var categories = {};

    inventory.forEach(function(item) {
        var available = parseInt(item.available_stock || item.availableStock || 0);
        var used = parseInt(item.used_stock || item.usedStock || 0);
        var limit = parseInt(item.low_stock_limit || item.lowStockLimit || 20);
        var category = item.category || 'Uncategorized';

        totalAvailable += available;
        totalUsed += used;
        if (available < limit) lowStockCount += 1;
        categories[category] = true;
    });

    var rowsHTML = '';
    if (inventory.length === 0) {
        rowsHTML = '<tr><td colspan="6" class="admin-table-empty">No items in inventory.</td></tr>';
    } else {
        rowsHTML = inventory.map(function(item) {
            var available = parseInt(item.available_stock || item.availableStock || 0);
            var used = parseInt(item.used_stock || item.usedStock || 0);
            var name = item.item_name || item.name || 'Inventory item';
            var category = item.category || 'Uncategorized';
            var lowStockLimit = parseInt(item.low_stock_limit || item.lowStockLimit || 20);
            var lowStock = available < lowStockLimit;
            var percent = Math.min(100, (available / 100) * 100);
            var statusBadge = lowStock ?
                '<span class="admin-pill admin-status admin-status-cancelled">Low Stock</span>' :
                '<span class="admin-pill admin-status admin-status-ready">In Stock</span>';

            return '<tr class="' + (lowStock ? 'admin-low-stock-row' : '') + '">' +
                '<td data-label="Item"><strong class="admin-item-name">' + escapeHTML(name) + '</strong></td>' +
                '<td data-label="Category"><span class="admin-pill">' + escapeHTML(category) + '</span></td>' +
                '<td data-label="Available">' +
                    '<div class="admin-stock-cell">' +
                        '<strong>' + available + '</strong>' +
                        '<div class="admin-stock-meter ' + (lowStock ? 'is-low' : '') + '"><span style="width:' + percent + '%;"></span></div>' +
                    '</div>' +
                '</td>' +
                '<td data-label="Used">' + used + '</td>' +
                '<td data-label="Status">' + statusBadge + '</td>' +
                '<td data-label="Actions">' +
                    '<div class="admin-table-actions">' +
                        '<button type="button" class="admin-icon-btn" data-action="edit-inventory" data-id="' + escapeHTML(String(item.id || '')) + '">Edit</button>' +
                        '<button type="button" class="admin-icon-btn admin-icon-danger" data-action="delete-inventory" data-id="' + escapeHTML(String(item.id || '')) + '">Delete</button>' +
                    '</div>' +
                '</td>' +
            '</tr>';
        }).join('');
    }

    var stockHealth = inventory.length > 0 ? Math.round(((inventory.length - lowStockCount) / inventory.length) * 100) + '%' : '0%';

    app.innerHTML =
        '<section class="page-section admin-page">' +
            '<div class="admin-container">' +
                getAdminPageHero(
                    'Stock control',
                    'Inventory Management',
                    'Track ingredients and menu stock with clear low-stock signals and fast item actions.',
                    '/inventory',
                    '<button class="btn btn-primary" data-action="add-inventory">Add Item</button>'
                ) +

                '<div class="admin-metrics-grid">' +
                    getAdminMetricCard('Inventory Items', inventory.length, Object.keys(categories).length + ' categories', 'orders') +
                    getAdminMetricCard('Available Stock', totalAvailable, 'Units ready for service', 'ready') +
                    getAdminMetricCard('Used Stock', totalUsed, 'Units consumed', 'average') +
                    getAdminMetricCard('Stock Health', stockHealth, lowStockCount + ' low-stock items', lowStockCount > 0 ? 'danger' : 'ready') +
                '</div>' +

                '<div class="admin-inventory-layout">' +
                    '<section class="admin-panel admin-inventory-register">' +
                        '<div class="admin-panel-header">' +
                            '<div><span>Inventory</span><h2>Stock Register</h2></div>' +
                            '<button class="btn btn-primary btn-sm" data-action="add-inventory">Add Item</button>' +
                        '</div>' +
                        '<div class="admin-table-wrap">' +
                            '<table class="admin-data-table admin-inventory-table">' +
                                '<thead><tr><th>Item Name</th><th>Category</th><th>Available Stock</th><th>Used Stock</th><th>Status</th><th>Actions</th></tr></thead>' +
                                '<tbody>' + rowsHTML + '</tbody>' +
                            '</table>' +
                        '</div>' +
                    '</section>' +

                    '<section class="admin-panel admin-stock-watch-panel">' +
                        '<div class="admin-panel-header">' +
                            '<div><span>Priority</span><h2>Stock Watch</h2></div>' +
                        '</div>' +
                        '<div class="admin-watch-list">' +
                            getInventoryWatchList(inventory) +
                        '</div>' +
                    '</section>' +
                '</div>' +
            '</div>' +
        '</section>';
}

function getInventoryWatchList(inventory) {
    var lowItems = (inventory || []).filter(function(item) {
        var available = parseInt(item.available_stock || item.availableStock || 0);
        var limit = parseInt(item.low_stock_limit || item.lowStockLimit || 20);
        return available < limit;
    }).slice(0, 6);

    if (lowItems.length === 0) {
        return '<div class="admin-empty-panel compact"><strong>All clear</strong><span>No low-stock items right now.</span></div>';
    }

    return lowItems.map(function(item) {
        var name = item.item_name || item.name || 'Inventory item';
        var available = parseInt(item.available_stock || item.availableStock || 0);
        var limit = parseInt(item.low_stock_limit || item.lowStockLimit || 20);
        var percent = limit > 0 ? (available / limit) * 100 : 0;

        return getAdminProgressRow(name, available + ' left', percent, 'danger', 'Target minimum: ' + limit);
    }).join('');
}

function getInventoryCategoryOptions(selectedCategory) {
    return MENU_CATEGORIES.filter(function(category) {
        return category !== 'All';
    }).map(function(category) {
        var selected = category === selectedCategory ? ' selected' : '';
        return '<option value="' + escapeHTML(category) + '"' + selected + '>' + escapeHTML(category) + '</option>';
    }).join('');
}

function showAddInventoryModal() {
    var body =
        '<form id="inventory-form" class="admin-form">' +
            '<input type="hidden" id="inv-id" value="">' +
            '<div class="form-group">' +
                '<label class="form-label">Item Name</label>' +
                '<input type="text" id="inv-name" class="form-input" required>' +
            '</div>' +
            '<div class="form-group">' +
                '<label class="form-label">Category</label>' +
                '<select id="inv-category" class="form-select">' + getInventoryCategoryOptions('Starters') + '</select>' +
            '</div>' +
            '<div class="admin-form-grid">' +
                '<div class="form-group">' +
                    '<label class="form-label">Available Stock</label>' +
                    '<input type="number" id="inv-available" class="form-input" min="0" value="50" required>' +
                '</div>' +
                '<div class="form-group">' +
                    '<label class="form-label">Used Stock</label>' +
                    '<input type="number" id="inv-used" class="form-input" min="0" value="0" required>' +
                '</div>' +
            '</div>' +
        '</form>';
    var footer = '<button class="btn btn-secondary" data-action="close-modal">Cancel</button><button class="btn btn-primary" data-action="save-inventory">Save Item</button>';
    showModal('Add Inventory Item', body, footer);
}

async function showEditInventoryModal(itemId) {
    var res = await SmartDineAPI.getInventory();
    if (res.error) {
        showToast('Inventory Error', res.error, 'error');
        return;
    }

    var inventory = res.data || [];
    var item = inventory.find(function(i) { return String(i.id) === String(itemId); });
    if (!item) {
        showToast('Not Found', 'This inventory item is no longer available.', 'warning');
        renderInventory();
        return;
    }

    var body =
        '<form id="inventory-form" class="admin-form">' +
            '<input type="hidden" id="inv-id" value="' + escapeHTML(String(item.id)) + '">' +
            '<div class="form-group">' +
                '<label class="form-label">Item Name</label>' +
                '<input type="text" id="inv-name" class="form-input" value="' + escapeHTML(item.item_name || item.name) + '" required>' +
            '</div>' +
            '<div class="form-group">' +
                '<label class="form-label">Category</label>' +
                '<select id="inv-category" class="form-select">' + getInventoryCategoryOptions(item.category) + '</select>' +
            '</div>' +
            '<div class="admin-form-grid">' +
                '<div class="form-group">' +
                    '<label class="form-label">Available Stock</label>' +
                    '<input type="number" id="inv-available" class="form-input" min="0" value="' + (item.available_stock || item.availableStock || 0) + '" required>' +
                '</div>' +
                '<div class="form-group">' +
                    '<label class="form-label">Used Stock</label>' +
                    '<input type="number" id="inv-used" class="form-input" min="0" value="' + (item.used_stock || item.usedStock || 0) + '" required>' +
                '</div>' +
            '</div>' +
        '</form>';
    var footer = '<button class="btn btn-secondary" data-action="close-modal">Cancel</button><button class="btn btn-primary" data-action="save-inventory">Save Changes</button>';
    showModal('Edit Inventory Item', body, footer);
}

async function saveInventoryForm() {
    var nameEl = document.getElementById('inv-name');
    var catEl = document.getElementById('inv-category');
    var avEl = document.getElementById('inv-available');
    var usedEl = document.getElementById('inv-used');
    var idEl = document.getElementById('inv-id');

    if (!nameEl.value || !avEl.value || !usedEl.value) {
        showToast('Error', 'Please fill all required fields.', 'error');
        return;
    }

    var isNew = !idEl.value;
    var payload = {
        name: nameEl.value.trim(),
        category: catEl.value,
        availableStock: parseInt(avEl.value, 10) || 0,
        usedStock: parseInt(usedEl.value, 10) || 0
    };

    var saveBtn = document.querySelector('[data-action="save-inventory"]');
    if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.textContent = isNew ? 'Saving...' : 'Updating...';
    }

    var res = isNew ?
        await SmartDineAPI.createInventoryItem(payload) :
        await SmartDineAPI.updateInventoryItem(idEl.value, payload);

    if (res.error) {
        showToast('Inventory Error', res.error, 'error');
        if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.textContent = isNew ? 'Save Item' : 'Save Changes';
        }
        return;
    }

    closeModal();
    showToast('Success', isNew ? 'Item added to inventory.' : 'Item updated successfully.', 'success');
    renderInventory();
}

function deleteInventoryItem(itemId) {
    var body =
        '<div class="delete-history-modal">' +
            '<div class="delete-history-mark">!</div>' +
            '<p>Are you sure you want to delete this item from inventory? This action cannot be undone.</p>' +
        '</div>';
    var footer = '<button class="btn btn-secondary" data-action="close-modal">Cancel</button><button class="btn btn-danger" onclick="confirmDeleteInventory(\'' + escapeHTML(String(itemId)) + '\')">Delete Item</button>';
    showModal('Delete Item', body, footer);
}

window.confirmDeleteInventory = async function(itemId) {
    var res = await SmartDineAPI.deleteInventoryItem(itemId);
    if (res.error) {
        showToast('Delete Failed', res.error, 'error');
        return;
    }

    closeModal();
    renderInventory();
    showToast('Deleted', 'Item removed from inventory.', 'info');
};
