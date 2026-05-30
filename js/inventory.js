// ============================================================
// SmartDine AI — Inventory Management (Async Refactor)
// ============================================================

async function renderInventory() {
    var app = document.getElementById('app');
    app.innerHTML = '<section class="page-section"><div class="container"><div style="text-align:center; padding:100px;"><div style="font-size:3rem; animation:pulse 1s infinite;">📦</div><h3>Loading Inventory...</h3></div></div></section>';
    
    var res = await SmartDineAPI.getInventory();
    if (res.error) {
        app.innerHTML = '<div class="container"><div class="empty-state"><h3>Error loading data</h3><p>'+res.error+'</p></div></div>';
        return;
    }
    var inventory = res.data || [];
    
    var rowsHTML = '';
    if (inventory.length === 0) {
        rowsHTML = '<tr><td colspan="6" style="text-align:center; padding:32px;">No items in inventory.</td></tr>';
    } else {
        rowsHTML = inventory.map(function(item) {
            var avail = item.available_stock || item.availableStock || 0;
            var used = item.used_stock || item.usedStock || 0;
            var name = item.item_name || item.name || '';
            var lowStockLimit = item.low_stock_limit || 20;
            
            var lowStock = avail < lowStockLimit;
            var trClass = lowStock ? 'class="low-stock-row"' : '';
            var statusBadge = lowStock ? '<span class="badge badge-danger">⚠️ Low Stock</span>' : '<span class="badge badge-success">In Stock</span>';
            var percent = Math.min(100, (avail / 100) * 100);
            var barColor = lowStock ? 'var(--danger)' : 'var(--success)';
            var stockBar = '<div style="width:100px; height:6px; background:var(--border-color); border-radius:3px; overflow:hidden; display:inline-block; vertical-align:middle; margin-left:8px;"><div style="width:' + percent + '%; height:100%; background:' + barColor + ';"></div></div>';
                           
            return '<tr ' + trClass + '>' +
                '<td><strong>' + escapeHTML(name) + '</strong></td>' +
                '<td>' + escapeHTML(item.category || '') + '</td>' +
                '<td>' + avail + stockBar + '</td>' +
                '<td>' + used + '</td>' +
                '<td>' + statusBadge + '</td>' +
                '<td>' +
                    '<button class="btn-icon btn-sm" style="margin-right:8px;" data-action="edit-inventory" data-id="' + item.id + '">✏️</button>' +
                    '<button class="btn-icon btn-sm" style="color:var(--danger);" data-action="delete-inventory" data-id="' + item.id + '">🗑️</button>' +
                '</td>' +
            '</tr>';
        }).join('');
    }

    app.innerHTML = '<section class="page-section"><div class="container"><div class="page-header"><h1 class="page-title">📦 Inventory Management</h1><button class="btn btn-primary" data-action="add-inventory">+ Add Item</button></div><div class="section-card"><div class="table-responsive"><table class="data-table"><thead><tr><th>Item Name</th><th>Category</th><th>Available Stock</th><th>Used Stock</th><th>Status</th><th>Actions</th></tr></thead><tbody>' + rowsHTML + '</tbody></table></div></div></div></section>';
}

// Keeping the rest of inventory modals standard for now as they are local UI logic.
// In a full implementation, `saveInventoryForm` would also call `SmartDineAPI.updateInventoryItem(...)`. 
// For this mockup, we only fetch dynamically since the prompt said the backend only handles certain endpoints.

function showAddInventoryModal() {
    var categoriesHTML = MENU_CATEGORIES.map(function(c){ return '<option value="'+c+'">'+c+'</option>'; }).join('');
    var body = '<form id="inventory-form"><input type="hidden" id="inv-id" value=""><div class="form-group"><label class="form-label">Item Name</label><input type="text" id="inv-name" class="form-input" required></div><div class="form-group"><label class="form-label">Category</label><select id="inv-category" class="form-select">' + categoriesHTML + '</select></div><div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;"><div class="form-group"><label class="form-label">Available Stock</label><input type="number" id="inv-available" class="form-input" min="0" value="50" required></div><div class="form-group"><label class="form-label">Used Stock</label><input type="number" id="inv-used" class="form-input" min="0" value="0" required></div></div></form>';
    var footer = '<button class="btn btn-secondary" data-action="close-modal">Cancel</button><button class="btn btn-primary" data-action="save-inventory">Save Item</button>';
    showModal('Add Inventory Item', body, footer);
}

function showEditInventoryModal(itemId) {
    var inventory = Storage.get('smartdine_inventory', []);
    var item = inventory.find(function(i) { return String(i.id) === String(itemId); });
    if (!item) return;
    
    var categoriesHTML = MENU_CATEGORIES.map(function(c){
        var sel = c === item.category ? 'selected' : '';
        return '<option value="'+c+'" '+sel+'>'+c+'</option>';
    }).join('');
    
    var body = '<form id="inventory-form"><input type="hidden" id="inv-id" value="' + item.id + '"><div class="form-group"><label class="form-label">Item Name</label><input type="text" id="inv-name" class="form-input" value="' + escapeHTML(item.item_name || item.name) + '" required></div><div class="form-group"><label class="form-label">Category</label><select id="inv-category" class="form-select">' + categoriesHTML + '</select></div><div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;"><div class="form-group"><label class="form-label">Available Stock</label><input type="number" id="inv-available" class="form-input" min="0" value="' + (item.available_stock || item.availableStock || 0) + '" required></div><div class="form-group"><label class="form-label">Used Stock</label><input type="number" id="inv-used" class="form-input" min="0" value="' + (item.used_stock || item.usedStock || 0) + '" required></div></div></form>';
    var footer = '<button class="btn btn-secondary" data-action="close-modal">Cancel</button><button class="btn btn-primary" data-action="save-inventory">Save Changes</button>';
    showModal('Edit Inventory Item', body, footer);
}

function saveInventoryForm() {
    var nameEl = document.getElementById('inv-name');
    var catEl = document.getElementById('inv-category');
    var avEl = document.getElementById('inv-available');
    var usedEl = document.getElementById('inv-used');
    var idEl = document.getElementById('inv-id');
    
    if (!nameEl.value || !avEl.value || !usedEl.value) {
        showToast('Error', 'Please fill all required fields.', 'error');
        return;
    }
    
    var inventory = Storage.get('smartdine_inventory', []);
    var isNew = !idEl.value;
    
    if (isNew) {
        inventory.push({
            id: generateId(),
            name: nameEl.value,
            category: catEl.value,
            availableStock: parseInt(avEl.value),
            usedStock: parseInt(usedEl.value)
        });
        showToast('Success', 'Item added to inventory.', 'success');
    } else {
        var idx = inventory.findIndex(function(i){ return String(i.id) === String(idEl.value); });
        if (idx >= 0) {
            inventory[idx].name = nameEl.value;
            inventory[idx].item_name = nameEl.value;
            inventory[idx].category = catEl.value;
            inventory[idx].availableStock = parseInt(avEl.value);
            inventory[idx].available_stock = parseInt(avEl.value);
            inventory[idx].usedStock = parseInt(usedEl.value);
            inventory[idx].used_stock = parseInt(usedEl.value);
            showToast('Success', 'Item updated successfully.', 'success');
        }
    }
    
    Storage.set('smartdine_inventory', inventory);
    closeModal();
    renderInventory();
}

function deleteInventoryItem(itemId) {
    var body = '<p>Are you sure you want to delete this item from inventory? This action cannot be undone.</p>';
    var footer = '<button class="btn btn-secondary" data-action="close-modal">Cancel</button><button class="btn btn-danger" onclick="confirmDeleteInventory(\'' + itemId + '\')">Delete</button>';
    showModal('Delete Item', body, footer);
}

window.confirmDeleteInventory = function(itemId) {
    var inventory = Storage.get('smartdine_inventory', []);
    var idx = inventory.findIndex(function(i){ return String(i.id) === String(itemId); });
    if (idx >= 0) {
        inventory.splice(idx, 1);
        Storage.set('smartdine_inventory', inventory);
        closeModal();
        renderInventory();
        showToast('Deleted', 'Item removed from inventory.', 'info');
    }
};
