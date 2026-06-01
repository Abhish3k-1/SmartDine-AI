// ============================================================
// SmartDine AI — Customer-Facing Page Rendering (customer.js)
// Loaded after: utils.js, storage.js, data.js, auth.js
// ============================================================

// Fallback constants for pages that are opened without the normal script order.
if (typeof MENU_CATEGORIES === 'undefined') {
  var MENU_CATEGORIES = ['All', 'Starters', 'Main Course', 'Desserts', 'Beverages'];
}
if (typeof SERVICE_CHARGE_RATE === 'undefined') {
  var SERVICE_CHARGE_RATE = 0.03;
}

// Enrichment data for menu items (addOns, rating, bestseller/chef tags)
var MENU_ENRICHMENT = {
  1:  { rating: 4.5, addOns: [{ name: 'Extra Paneer', price: 49 }, { name: 'Mint Chutney', price: 19 }], tags: ['bestseller'] },
  2:  { rating: 4.8, addOns: [{ name: 'Extra Chicken', price: 79 }, { name: 'Raita', price: 29 }, { name: 'Boiled Egg', price: 19 }], tags: ['bestseller', 'chef-recommended'] },
  3:  { rating: 4.2, addOns: [{ name: 'Extra Veggies', price: 29 }, { name: 'Schezwan Sauce', price: 19 }], tags: [] },
  4:  { rating: 4.6, addOns: [{ name: 'Extra Sambar', price: 19 }, { name: 'Ghee', price: 15 }], tags: ['bestseller'] },
  5:  { rating: 4.0, addOns: [{ name: 'Cheese Dip', price: 29 }, { name: 'Peri Peri Sprinkle', price: 19 }], tags: [] },
  6:  { rating: 4.3, addOns: [{ name: 'Extra Ice Cream Scoop', price: 39 }, { name: 'Chocolate Syrup', price: 19 }], tags: [] },
  7:  { rating: 4.7, addOns: [{ name: 'Vanilla Ice Cream', price: 39 }, { name: 'Whipped Cream', price: 19 }], tags: ['chef-recommended'] },
  8:  { rating: 4.1, addOns: [{ name: 'Extra Mint', price: 10 }], tags: [] },
  9:  { rating: 4.4, addOns: [{ name: 'Garlic Topping', price: 15 }, { name: 'Cheese Stuffing', price: 29 }], tags: [] },
  10: { rating: 4.3, addOns: [{ name: 'Extra Tadka', price: 19 }, { name: 'Papad', price: 15 }], tags: [] },
  11: { rating: 4.6, addOns: [{ name: 'Extra Leg Piece', price: 69 }, { name: 'Mint Chutney', price: 19 }], tags: ['bestseller'] },
  12: { rating: 4.0, addOns: [{ name: 'Sweet Chilli Sauce', price: 15 }], tags: [] },
  13: { rating: 4.5, addOns: [{ name: 'Extra Mango Pulp', price: 29 }], tags: [] },
  14: { rating: 4.2, addOns: [{ name: 'Extra Cheese', price: 39 }, { name: 'Jalapeños', price: 19 }], tags: [] },
  15: { rating: 4.7, addOns: [{ name: 'Extra Gravy', price: 39 }, { name: 'Butter Naan', price: 49 }], tags: ['bestseller', 'chef-recommended'] },
  16: { rating: 4.4, addOns: [{ name: 'Extra Syrup', price: 10 }], tags: [] },
  17: { rating: 4.3, addOns: [{ name: 'Extra Mint', price: 10 }, { name: 'Ginger Shot', price: 15 }], tags: [] },
  18: { rating: 4.6, addOns: [{ name: 'Extra Paneer', price: 49 }, { name: 'Butter Naan', price: 49 }], tags: ['chef-recommended'] },
  19: { rating: 4.4, addOns: [{ name: 'Extra Chicken', price: 59 }, { name: 'Fried Rice', price: 69 }], tags: [] },
  20: { rating: 4.8, addOns: [{ name: 'Ice Cream Scoop', price: 39 }, { name: 'Chocolate Sauce', price: 19 }], tags: ['chef-recommended'] },
  21: { rating: 4.1, addOns: [{ name: 'Schezwan Dip', price: 19 }], tags: [] },
  22: { rating: 4.5, addOns: [{ name: 'Extra Gravy', price: 49 }, { name: 'Naan', price: 49 }], tags: ['chef-recommended'] },
  23: { rating: 4.3, addOns: [{ name: 'Chole', price: 29 }, { name: 'Green Chutney', price: 10 }], tags: [] },
  24: { rating: 4.6, addOns: [{ name: 'Extra Fudge', price: 29 }, { name: 'Nuts Topping', price: 19 }], tags: [] },
  41: { rating: 4.8, addOns: [{ name: 'Extra Grilled Prawns', price: 99 }, { name: 'Garlic Dip', price: 29 }], tags: ['bestseller', 'chef-recommended'] },
  42: { rating: 4.9, addOns: [{ name: 'Truffle Shavings', price: 149 }, { name: 'Garlic Bread', price: 39 }], tags: ['bestseller'] },
  43: { rating: 4.9, addOns: [{ name: 'Spicy Mayo Dip', price: 29 }, { name: 'Avocado Roll', price: 79 }], tags: ['chef-recommended'] },
  44: { rating: 4.6, addOns: [{ name: 'Poached Egg', price: 39 }, { name: 'Smoked Salmon', price: 99 }], tags: ['bestseller'] },
  45: { rating: 4.7, addOns: [{ name: 'Espresso Shot', price: 39 }, { name: 'Oat Milk substitute', price: 29 }], tags: [] }
};

// Helper to get enrichment for an item
function getEnrichment(itemId) {
  return MENU_ENRICHMENT[itemId] || { rating: 4.0, addOns: [], tags: [] };
}

// Filter state
var menuFilters = { category: 'All', dietary: null, spicy: false, budget: false, bestseller: false, search: '' };

// Portion multipliers
var PORTION_CONFIG = {
  'Small':  { label: 'Small',  multiplier: 1.0 },
  'Medium': { label: 'Medium', multiplier: 1.3 },
  'Large':  { label: 'Large',  multiplier: 1.6 },
  'Family Pack': { label: 'Family Pack', multiplier: 2.2 },
  'Regular': { label: 'Small', multiplier: 1.0 }
};

// ========================
// LANDING PAGE
// ========================

function renderLanding() {
  var app = document.getElementById('app');
  app.innerHTML =
    '<section class="landing-redesign">' +
      '<section class="smart-hero">' +
        '<div class="smart-hero-copy">' +
          '<div class="hero-badge">AI-Powered Dining Experience</div>' +
          '<h1 class="hero-title">Smart Dining Starts at Your Table</h1>' +
          '<p class="hero-subtitle">Scan, explore, customize, and track your restaurant order with AI-powered recommendations and real-time kitchen updates.</p>' +
          '<div class="hero-actions">' +
            '<button class="btn btn-primary btn-lg" data-action="navigate" data-route="/menu">Browse Menu</button>' +
            '<button class="btn btn-secondary btn-lg" data-action="navigate" data-route="/track-order">Track Order</button>' +
          '</div>' +
          '<button class="hero-text-link" onclick="document.getElementById(\'how-it-works\').scrollIntoView({behavior:\'smooth\'})">See how it works</button>' +
        '</div>' +
        '<div class="hero-mockup" aria-label="SmartDine live order preview">' +
          '<img src="assets/images/dum_biryani_premium.png" alt="Premium biryani order preview" loading="lazy">' +
          '<div class="hero-mockup-gradient"></div>' +
          '<div class="hero-mockup-caption">' +
            '<span>Chef Special</span>' +
            '<strong>Dum Biryani</strong>' +
            '<small>Ready in 18 min</small>' +
          '</div>' +
          '<div class="float-card float-card-table"><span>Table</span><strong>12</strong></div>' +
          '<div class="float-card float-card-ready"><span>Status</span><strong>Order Ready</strong></div>' +
          '<div class="float-card float-card-ai"><span>AI Suggestion</span><strong>Try Mango Lassi</strong></div>' +
          '<div class="float-card float-card-sync"><span>Kitchen Sync</span><strong>Live</strong></div>' +
        '</div>' +
      '</section>' +
    '</section>' +

    '<section class="section signature-section">' +
      '<div class="section-header">' +
        '<h2 class="section-title">Signature Dishes</h2>' +
        '<p class="section-subtitle">A premium gallery of guest favorites, ready from the table menu.</p>' +
      '</div>' +
      '<div class="signature-grid">' +
        renderSignatureDish('signature-featured', 'assets/images/dum_biryani_premium.png', 'Chicken Dum Biryani', 'Biryani') +
        renderSignatureDish('', 'assets/images/paneer_tikka_premium.png', 'Paneer Tikka', 'Starters') +
        renderSignatureDish('', 'assets/images/butter_chicken_premium.png', 'Butter Chicken', 'Main Course') +
        renderSignatureDish('', 'assets/images/truffle_mushroom_pasta.png', 'Truffle Pasta', 'Chef Pick') +
        renderSignatureDish('', 'assets/images/chocolate_brownie_premium.png', 'Chocolate Brownie', 'Dessert') +
      '</div>' +
    '</section>' +

    '<section class="section why-section">' +
      '<div class="section-header">' +
        '<h2 class="section-title">Why SmartDine</h2>' +
        '<p class="section-subtitle">Everything a modern restaurant table needs, from ordering to kitchen operations.</p>' +
      '</div>' +
      '<div class="features-grid">' +
        renderFeatureCard('QR', 'QR Table Ordering', 'Guests scan once and order directly from their table.') +
        renderFeatureCard('AI', 'AI Food Recommendations', 'Menu-aware suggestions for taste, budget, protein, carbs, and mood.') +
        renderFeatureCard('LIVE', 'Live Kitchen Tracking', 'Customers see every stage from placed to ready.') +
        renderFeatureCard('CART', 'Digital Cart', 'Customize portions, spice, add-ons, and table details before checkout.') +
        renderFeatureCard('STOCK', 'Smart Inventory', 'Staff can monitor stock and act before items run out.') +
        renderFeatureCard('DATA', 'Analytics Dashboard', 'Admins get clean revenue, order, table, and dish insights.') +
      '</div>' +
    '</section>' +

    '<section class="section section-alt" id="how-it-works">' +
      '<div class="section-header">' +
        '<h2 class="section-title">How It Works</h2>' +
        '<p class="section-subtitle">A smooth order path from table scan to served food.</p>' +
      '</div>' +
      '<div class="workflow-grid modern-timeline">' +
        renderWorkflowStep('1', 'QR', 'Scan QR', 'Open the table menu instantly on your phone.') +
        renderWorkflowStep('2', 'MENU', 'Browse Menu', 'Explore dishes, filters, and popular picks.') +
        renderWorkflowStep('3', 'EDIT', 'Customize Food', 'Choose portion, spice level, add-ons, and notes.') +
        renderWorkflowStep('4', 'PAY', 'Place Order', 'Send the final cart directly to the kitchen.') +
        renderWorkflowStep('5', 'FIRE', 'Kitchen Prepares', 'Staff manage the order in the kitchen dashboard.') +
        renderWorkflowStep('6', 'DONE', 'Track & Enjoy', 'Follow the live status and enjoy your meal.') +
      '</div>' +
    '</section>' +

    '<footer class="footer modern-footer">' +
      '<div class="footer-content">' +
        '<div class="footer-brand">' +
          '<div class="footer-logo-row"><span class="footer-mark">SD</span><span class="logo-text">Smart<span class="logo-accent">Dine</span></span></div>' +
          '<p class="footer-desc">Premium QR ordering with AI recommendations and real-time restaurant operations.</p>' +
        '</div>' +
        '<div class="footer-links">' +
          '<a href="#/menu" data-action="navigate" data-route="/menu">Menu</a>' +
          '<a href="#/track-order" data-action="navigate" data-route="/track-order">Track Order</a>' +
          '<a href="#/staff-login" data-action="navigate" data-route="/staff-login">Staff</a>' +
        '</div>' +
        '<div class="footer-copy">&copy; 2026 SmartDine AI. All rights reserved.</div>' +
      '</div>' +
    '</footer>';
}

// ========================
// REUSABLE COMPONENTS
// ========================

function renderFeatureCard(icon, title, desc) {
  return (
    '<div class="feature-card">' +
      '<div class="feature-icon">' + escapeHTML(icon) + '</div>' +
      '<h3 class="feature-title">' + title + '</h3>' +
      '<p class="feature-desc">' + desc + '</p>' +
    '</div>'
  );
}

function renderWorkflowStep(num, icon, title, desc) {
  return (
    '<div class="workflow-step">' +
      '<div class="workflow-number">' + num + '</div>' +
      '<div class="workflow-icon">' + escapeHTML(icon) + '</div>' +
      '<h3>' + title + '</h3>' +
      '<p>' + desc + '</p>' +
    '</div>'
  );
}

function renderSignatureDish(extraClass, image, name, category) {
  return (
    '<figure class="signature-card ' + extraClass + '">' +
      '<img src="' + image + '" alt="' + escapeHTML(name) + '" loading="lazy">' +
      '<figcaption>' +
        '<span>' + escapeHTML(category) + '</span>' +
        '<strong>' + escapeHTML(name) + '</strong>' +
      '</figcaption>' +
    '</figure>'
  );
}

// ========================
// MENU PAGE
// ========================

window.APP_MENU = window.APP_MENU || [];

async function renderMenu() {
  if (window.APP_MENU.length === 0) {
      var app = document.getElementById('app');
      if (app) app.innerHTML = '<section class="page-section"><div style="text-align:center; padding:100px;"><h3>Loading Menu...</h3></div></section>';
      var res = await SmartDineAPI.getMenu();
      if (res.error) {
        if (app) {
          app.innerHTML =
            '<section class="page-section">' +
              '<div class="empty-state">' +
                '<h2>Menu Sync Failed</h2>' +
                '<p>' + escapeHTML(res.error) + '</p>' +
                '<button class="btn btn-primary" data-action="navigate" data-route="/menu">Retry</button>' +
              '</div>' +
            '</section>';
        }
        return;
      }
      window.APP_MENU = normalizeMenuItems(res.data || []);
  }
  
  var menu = window.APP_MENU;
  var tableNum = Storage.get('smartdine_table', 1);

  // Reset filters on page load
  menuFilters = { category: 'All', dietary: null, spicy: false, budget: false, bestseller: false, search: '' };

  var tableOptions = '';
  for (var i = 1; i <= 20; i++) {
    tableOptions += '<option value="' + i + '"' + (i === tableNum ? ' selected' : '') + '>Table ' + i + '</option>';
  }

  // Build filter tags
  var filterTagsHTML = '';
  for (var c = 0; c < MENU_CATEGORIES.length; c++) {
    filterTagsHTML += renderFilterTag(MENU_CATEGORIES[c], 'category', MENU_CATEGORIES[c], MENU_CATEGORIES[c] === 'All');
  }
  filterTagsHTML += renderFilterTag('<span class="veg-dot"></span> Veg', 'dietary', 'veg', false);
  filterTagsHTML += renderFilterTag('<span class="nonveg-dot"></span> Non-Veg', 'dietary', 'non-veg', false);
  filterTagsHTML += renderFilterTag('Spicy', 'spicy', 'true', false);
  filterTagsHTML += renderFilterTag('Budget', 'budget', 'true', false);
  filterTagsHTML += renderFilterTag('Bestseller', 'bestseller', 'true', false);

  var app = document.getElementById('app');
  app.innerHTML =
    '<section class="page-section menu-page">' +
      '<div class="container menu-container">' +
        '<div class="menu-hero">' +
          '<div class="menu-hero-copy">' +
            '<span class="menu-eyebrow">Fresh from the kitchen</span>' +
            '<h1 class="page-title">Explore Menu</h1>' +
            '<p class="page-subtitle">Freshly prepared dishes for <strong>Table #' + tableNum + '</strong>.</p>' +
            '<div class="menu-header-actions">' +
              '<span class="menu-table-badge" id="menu-table-badge">Table ' + tableNum + '</span>' +
              '<div class="table-selector">' +
                '<label for="table-select">Change table</label>' +
                '<select id="table-select" class="form-select">' + tableOptions + '</select>' +
              '</div>' +
            '</div>' +
          '</div>' +
          '<button class="menu-ai-card" data-action="toggle-ai-chat" data-prompt="Recommend something popular with protein and a drink">' +
            '<span>SmartDine AI</span>' +
            '<strong>Need help choosing?</strong>' +
            '<small>Ask for high protein, low carb, spicy, budget, or dessert picks.</small>' +
          '</button>' +
        '</div>' +

        '<div class="menu-filter-shell">' +
          '<div class="search-box menu-search-box">' +
            '<span class="search-icon">Search</span>' +
            '<input type="text" id="menu-search" class="form-input" placeholder="Search dishes, cuisines, drinks...">' +
          '</div>' +
          '<div class="filter-tags" id="filter-tags">' + filterTagsHTML + '</div>' +
        '</div>' +

        '<div class="menu-grid" id="menu-grid">' +
          renderMenuCards(menu) +
        '</div>' +
      '</div>' +
    '</section>' +

    // AI floating button
    '<button class="ai-float-btn" data-action="toggle-ai-chat" title="AI Assistant"></button>' +

    // AI chat panel
    '';

  // Table selector change
  var tableSelect = document.getElementById('table-select');
  if (tableSelect) {
    tableSelect.addEventListener('change', function () {
      Storage.set('smartdine_table', parseInt(this.value));
      // Update subtitle
      var subtitle = document.querySelector('.page-subtitle strong');
      if (subtitle) subtitle.textContent = 'Table #' + this.value;
      var tableBadge = document.getElementById('menu-table-badge');
      if (tableBadge) tableBadge.textContent = 'Table ' + this.value;
    });
  }
}

function normalizeMenuItems(items) {
  items = items || [];
  return items.map(function(item) {
    return {
      id: item.id,
      name: item.name || item.item_name || 'Untitled Dish',
      category: item.category || 'Main Course',
      price: Number(item.price || item.amount || 0),
      description: item.description || '',
      image: item.image || item.image_url || 'assets/images/food/placeholder_main.jpg',
      rating: Number(item.rating || 4.5),
      prepTime: item.prepTime || item.prep_time || '15 min',
      isVeg: typeof item.isVeg === 'boolean' ? item.isVeg : (typeof item.is_veg === 'boolean' ? item.is_veg : true),
      spiceLevel: item.spiceLevel || item.spice_level || 'Medium',
      isSpicy: item.isSpicy || item.is_spicy || ['Hot', 'Extra Hot'].indexOf(item.spiceLevel || item.spice_level) !== -1,
      tags: item.tags || [],
      available: item.available !== false,
      addOns: item.addOns || item.addons || [],
      portionOptions: item.portionOptions || [{ name: 'Regular', priceMultiplier: 1 }]
    };
  }).filter(function(item) {
    return item.available !== false && item.name;
  });
}

function renderFilterTag(label, filter, value, isActive) {
  return '<button class="filter-tag' + (isActive ? ' active' : '') + '" data-action="filter-menu" data-filter="' + filter + '" data-value="' + value + '" aria-pressed="' + (isActive ? 'true' : 'false') + '">' + label + '</button>';
}

// ========================
// MENU CARDS
// ========================

function renderMenuCards(items) {
  if (!items || items.length === 0) {
    return '<div class="empty-state"><div class="empty-state-icon"></div><h3>No dishes found</h3><p>Try adjusting your filters or search query</p></div>';
  }

  var user = Auth.getUser();
  var html = '';

  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    var enrich = getEnrichment(item.id);

    var vegBadge = item.isVeg
      ? '<span class="food-type-dot veg-dot" title="Veg"></span>'
      : '<span class="food-type-dot nonveg-dot" title="Non-Veg"></span>';

    // Tags (bestseller / chef recommended)
    var tagHTML = '';
    if (enrich.tags.indexOf('bestseller') !== -1) {
      tagHTML += '<span class="menu-tag menu-tag-bestseller">Bestseller</span>';
    }
    if (enrich.tags.indexOf('chef-recommended') !== -1) {
      tagHTML += '<span class="menu-tag menu-tag-chef">Chef Pick</span>';
    }

    // Spice level dots
    var spiceHTML = '';
    if (item.isSpicy) {
      spiceHTML = '<span class="meta-tag">Spicy</span>';
    }

    // Rating
    var ratingHTML = '&#9733; ' + enrich.rating.toFixed(1);

    // Action button
    var actionBtnHTML = user
      ? '<button class="btn btn-primary btn-sm menu-add-btn" data-action="show-food-detail" data-id="' + item.id + '">Add</button>'
      : '<button class="btn btn-secondary btn-sm menu-add-btn animate-pulse-light" data-action="login-click">Login</button>';

    html +=
      '<article class="menu-card" data-action="show-food-detail" data-id="' + item.id + '">' +
        '<div class="menu-card-image">' +
          '<img src="' + item.image + '" alt="' + escapeHTML(item.name) + '" loading="lazy" onerror="this.onerror=null;this.src=getFallbackImage(\'' + item.category + '\')">' +
          '<div class="food-type-badge">' + vegBadge + '</div>' +
          (tagHTML ? '<div class="menu-card-tags">' + tagHTML + '</div>' : '') +
        '</div>' +
        '<div class="menu-card-body">' +
          '<div class="menu-card-title-row">' +
            '<h3 class="menu-card-name">' + escapeHTML(item.name) + '</h3>' +
          '</div>' +
          '<p class="menu-card-desc">' + escapeHTML(item.description) + '</p>' +
          '<div class="menu-card-meta">' +
            '<span>' + ratingHTML + '</span>' +
            '<span>' + item.prepTime + '</span>' +
            '<span>' + item.category + '</span>' +
            (spiceHTML ? '<span>Spicy</span>' : '') +
          '</div>' +
          '<div class="menu-card-footer">' +
            '<span class="menu-card-price">' + formatCurrency(item.price) + '</span>' +
            actionBtnHTML +
          '</div>' +
        '</div>' +
      '</article>';
  }
  return html;
}

function getFallbackImage(category) {
  var catMap = {
    'Starters': 'assets/images/crispy_corn.png',
    'Mains': 'assets/images/dal_tadka.png',
    'Breads': 'assets/images/butter_naan.png',
    'Rice/Biryani': 'assets/images/veg_fried_rice.png',
    'Desserts': 'assets/images/gulab_jamun.png',
    'Beverages': 'assets/images/lemon_soda.png',
    'Combos': 'assets/images/veg_thali.png'
  };
  return catMap[category] || 'assets/images/paneer_tikka_premium.png';
}

// ========================
// FOOD DETAIL MODAL
// ========================

function showFoodDetailModal(itemId) {
  itemId = String(itemId);
  var menu = window.APP_MENU || [];
  var item = null;
  for (var i = 0; i < menu.length; i++) {
    if (String(menu[i].id) === String(itemId)) { item = menu[i]; break; }
  }
  if (!item) return;

  var enrich = getEnrichment(item.id);
  var user = Auth.getUser();

  var vegBadge = item.isVeg
    ? '<span class="badge badge-veg" style="font-size:0.85rem;"><span class="veg-dot"></span> Veg</span>'
    : '<span class="badge badge-nonveg" style="font-size:0.85rem;"><span class="nonveg-dot"></span> Non-Veg</span>';

  var tagsHTML = '';
  if (enrich.tags.indexOf('bestseller') !== -1) {
    tagsHTML += '<span class="menu-tag menu-tag-bestseller">Bestseller</span> ';
  }
  if (enrich.tags.indexOf('chef-recommended') !== -1) {
    tagsHTML += '<span class="menu-tag menu-tag-chef">Chef Recommended</span> ';
  }

  // Portion selector
  var portionHTML = '';
  var portionKeys = ['Small', 'Medium', 'Large', 'Family Pack'];
  for (var p = 0; p < portionKeys.length; p++) {
    var pk = portionKeys[p];
    var pc = PORTION_CONFIG[pk];
    var portionPrice = Math.round(item.price * pc.multiplier);
    var checked = pk === 'Small' ? ' checked' : '';
    portionHTML +=
      '<label class="portion-option">' +
        '<input type="radio" name="fd-portion" value="' + pk + '"' + checked + ' onchange="updateFoodDetailPrice()">' +
        '<div class="portion-label">' +
          '<span class="portion-name">' + pc.label + '</span>' +
          '<span class="portion-price">' + formatCurrency(portionPrice) + '</span>' +
        '</div>' +
      '</label>';
  }

  // Spice level selector
  var spiceLevels = ['Mild', 'Medium', 'Hot', 'Extra Hot'];
  var spiceHTML = '';
  for (var s = 0; s < spiceLevels.length; s++) {
    var sChecked = spiceLevels[s] === 'Medium' ? ' checked' : '';
    spiceHTML +=
      '<label class="spice-option">' +
        '<input type="radio" name="fd-spice" value="' + spiceLevels[s] + '"' + sChecked + ' onchange="updateFoodDetailPrice()">' +
        '<span class="spice-label">' + spiceLevels[s] + '</span>' +
      '</label>';
  }

  // Add-ons checkboxes
  var addOnsHTML = '';
  if (enrich.addOns && enrich.addOns.length > 0) {
    for (var a = 0; a < enrich.addOns.length; a++) {
      var ao = enrich.addOns[a];
      addOnsHTML +=
        '<label class="addon-option">' +
          '<input type="checkbox" name="fd-addon" value="' + a + '" data-name="' + escapeHTML(ao.name) + '" data-price="' + ao.price + '" onchange="updateFoodDetailPrice()">' +
          '<span class="addon-check"></span>' +
          '<span class="addon-name">' + escapeHTML(ao.name) + '</span>' +
          '<span class="addon-price">+' + formatCurrency(ao.price) + '</span>' +
        '</label>';
    }
  }

  // Build modal body
  var bodyHTML =
    '<div class="food-detail-modal">' +
      '<div class="fd-image-wrap">' +
        '<img class="fd-image" src="' + item.image + '" alt="' + escapeHTML(item.name) + '" onerror="this.onerror=null;this.src=getFallbackImage(\'' + item.category + '\')">' +
        '<div class="fd-image-overlay">' +
          '<span>' + item.category + '</span>' +
          '<strong>' + formatCurrency(item.price) + '</strong>' +
        '</div>' +
      '</div>' +

      '<div class="fd-info">' +
        '<div class="fd-title-row">' +
          '<h2 class="fd-name">' + escapeHTML(item.name) + '</h2>' +
          vegBadge +
        '</div>' +
        (tagsHTML ? '<div class="fd-tags">' + tagsHTML + '</div>' : '') +
        '<p class="fd-description">' + escapeHTML(item.description) + '</p>' +
        '<div class="fd-meta">' +
          '<span>&#9733; ' + enrich.rating.toFixed(1) + ' Rating</span>' +
          '<span>' + item.prepTime + '</span>' +
          '<span>' + item.category + '</span>' +
          (item.isSpicy ? '<span>Spicy</span>' : '') +
        '</div>' +
      '</div>' +

      // Portion size
      '<div class="fd-section">' +
        '<h4 class="fd-section-title">Portion Size</h4>' +
        '<div class="fd-portion-grid">' + portionHTML + '</div>' +
      '</div>' +

      // Spice level
      '<div class="fd-section">' +
        '<h4 class="fd-section-title">Spice Level</h4>' +
        '<div class="fd-spice-grid">' + spiceHTML + '</div>' +
      '</div>' +

      // Add-ons
      (addOnsHTML ?
        '<div class="fd-section">' +
          '<h4 class="fd-section-title">Add-ons</h4>' +
          '<div class="fd-addons-list">' + addOnsHTML + '</div>' +
        '</div>'
      : '') +

      // Special instructions
      '<div class="fd-section">' +
        '<h4 class="fd-section-title">Special Instructions</h4>' +
        '<textarea id="fd-instructions" class="form-input" rows="2" placeholder="e.g. Less oil, no onions, extra spicy..."></textarea>' +
      '</div>' +

      // Quantity + price
      '<div class="fd-bottom-bar">' +
        '<div class="fd-qty-control">' +
          '<button class="btn-qty" onclick="changeFoodDetailQty(-1)">−</button>' +
          '<span id="fd-qty" style="font-size:1.2rem;font-weight:700;min-width:32px;text-align:center;">1</span>' +
          '<button class="btn-qty" onclick="changeFoodDetailQty(1)">+</button>' +
        '</div>' +
        '<div class="fd-price-display">' +
          '<span>Total</span>' +
          '<strong id="fd-total-price">' + formatCurrency(item.price) + '</strong>' +
        '</div>' +
      '</div>' +
    '</div>';

  // Footer
  var footerHTML = user
    ? '<div class="fd-sticky-footer"><div><span>Total</span><strong id="fd-btn-price">' + formatCurrency(item.price) + '</strong></div><button class="btn btn-primary btn-lg" data-action="add-to-cart-modal" data-id="' + item.id + '">Add to Cart</button></div>'
    : '<button class="btn btn-secondary btn-lg btn-block animate-pulse-light" data-action="login-click">Login to Order</button>';

  showModal(escapeHTML(item.name), bodyHTML, footerHTML);

  // Store item data on modal for price calculation
  var modal = document.querySelector('.modal');
  if (modal) {
    modal.classList.add('food-modal-shell');
    modal.setAttribute('data-item-id', item.id);
    modal.setAttribute('data-base-price', item.price);
  }
}

// Live price calculation
function updateFoodDetailPrice() {
  var modal = document.querySelector('.modal');
  if (!modal) return;

  var basePrice = parseFloat(modal.getAttribute('data-base-price')) || 0;

  // Portion multiplier
  var portionInput = document.querySelector('input[name="fd-portion"]:checked');
  var portion = portionInput ? portionInput.value : 'Small';
  var multiplier = PORTION_CONFIG[portion] ? PORTION_CONFIG[portion].multiplier : 1;

  // Add-ons total
  var addOnTotal = 0;
  var addonChecks = document.querySelectorAll('input[name="fd-addon"]:checked');
  for (var i = 0; i < addonChecks.length; i++) {
    addOnTotal += parseFloat(addonChecks[i].getAttribute('data-price')) || 0;
  }

  // Quantity
  var qtyEl = document.getElementById('fd-qty');
  var qty = qtyEl ? parseInt(qtyEl.textContent) || 1 : 1;

  var finalPrice = (basePrice * multiplier + addOnTotal) * qty;

  var totalEl = document.getElementById('fd-total-price');
  if (totalEl) totalEl.textContent = formatCurrency(finalPrice);

  var btnPriceEl = document.getElementById('fd-btn-price');
  if (btnPriceEl) btnPriceEl.textContent = formatCurrency(finalPrice);
}

function changeFoodDetailQty(delta) {
  var qtyEl = document.getElementById('fd-qty');
  if (!qtyEl) return;
  var qty = parseInt(qtyEl.textContent) || 1;
  qty = Math.max(1, Math.min(20, qty + delta));
  qtyEl.textContent = qty;
  updateFoodDetailPrice();
}

// Add to cart from the detail modal
function addToCartFromModal(itemId) {
  var portionInput = document.querySelector('input[name="fd-portion"]:checked');
  var portion = portionInput ? portionInput.value : 'Small';

  var spiceInput = document.querySelector('input[name="fd-spice"]:checked');
  var spiceLevel = spiceInput ? spiceInput.value : 'Medium';

  var selectedAddOns = [];
  var addonChecks = document.querySelectorAll('input[name="fd-addon"]:checked');
  for (var i = 0; i < addonChecks.length; i++) {
    selectedAddOns.push({
      name: addonChecks[i].getAttribute('data-name'),
      price: parseFloat(addonChecks[i].getAttribute('data-price')) || 0
    });
  }

  var instructionsEl = document.getElementById('fd-instructions');
  var specialInstructions = instructionsEl ? instructionsEl.value.trim() : '';

  var qtyEl = document.getElementById('fd-qty');
  var quantity = qtyEl ? parseInt(qtyEl.textContent) || 1 : 1;

  addToCart(itemId, {
    portion: portion,
    spiceLevel: spiceLevel,
    addOns: selectedAddOns,
    specialInstructions: specialInstructions,
    quantity: quantity
  });

  closeModal();
}

// Make globally accessible
window.addToCartFromModal = addToCartFromModal;
window.changeFoodDetailQty = changeFoodDetailQty;
window.updateFoodDetailPrice = updateFoodDetailPrice;
window.PORTION_CONFIG = PORTION_CONFIG;

// ========================
// MENU FILTERING
// ========================

function filterMenu(filter, value) {
  if (filter === 'category') {
    menuFilters.category = value;
  } else if (filter === 'dietary') {
    menuFilters.dietary = menuFilters.dietary === value ? null : value;
  } else if (filter === 'spicy') {
    menuFilters.spicy = !menuFilters.spicy;
  } else if (filter === 'budget') {
    menuFilters.budget = !menuFilters.budget;
  } else if (filter === 'bestseller') {
    menuFilters.bestseller = !menuFilters.bestseller;
  }
  applyMenuFilters();
}

function filterMenuBySearch(query) {
  menuFilters.search = query.toLowerCase().trim();
  applyMenuFilters();
}

function applyMenuFilters() {
  var menu = window.APP_MENU || [];

  var filtered = menu.filter(function (item) {
    // Category
    if (menuFilters.category !== 'All' && item.category !== menuFilters.category) return false;
    // Dietary
    if (menuFilters.dietary === 'veg' && !item.isVeg) return false;
    if (menuFilters.dietary === 'non-veg' && item.isVeg) return false;
    // Spicy
    if (menuFilters.spicy && item.spiceLevel !== 'Hot' && item.spiceLevel !== 'Extra Hot') return false;
    // Budget (under ₹200)
    if (menuFilters.budget && item.price >= 200) return false;
    // Bestseller
    if (menuFilters.bestseller) {
      var tags = item.tags || [];
      var enTags = getEnrichment(item.id).tags || [];
      if (tags.indexOf('bestseller') === -1 && enTags.indexOf('bestseller') === -1) return false;
    }
    // Search
    if (menuFilters.search) {
      var searchStr = (item.name + ' ' + item.description + ' ' + item.category).toLowerCase();
      if (searchStr.indexOf(menuFilters.search) === -1) return false;
    }
    return true;
  });

  var grid = document.getElementById('menu-grid');
  if (grid) grid.innerHTML = renderMenuCards(filtered);

  // Update filter tag active states
  document.querySelectorAll('.filter-tag').forEach(function (tag) {
    var f = tag.dataset.filter;
    var v = tag.dataset.value;
    tag.classList.remove('active');

    if (f === 'category' && menuFilters.category === v) tag.classList.add('active');
    if (f === 'dietary' && menuFilters.dietary === v) tag.classList.add('active');
    if (f === 'spicy' && menuFilters.spicy && v === 'true') tag.classList.add('active');
    if (f === 'budget' && menuFilters.budget && v === 'true') tag.classList.add('active');
    if (f === 'bestseller' && menuFilters.bestseller && v === 'true') tag.classList.add('active');
    tag.setAttribute('aria-pressed', tag.classList.contains('active') ? 'true' : 'false');
  });
}

// ========================
// ORDER TRACKING PAGE
// ========================

function isOrderExpiredForTrack(order) {
  if (typeof SMARTDINE_DATA_RETENTION_MS === 'undefined') return false;
  var time = getOrderCreatedTime(order);
  return time ? Date.now() - time >= SMARTDINE_DATA_RETENTION_MS : false;
}

function orderBelongsToUser(order, user) {
  if (!order || !user || !user.email) return false;
  var orderEmail = order.customer_email || order.customerEmail;
  return String(orderEmail || '').toLowerCase() === String(user.email).toLowerCase();
}

function getActiveTrackOrders(orders, user) {
  orders = orders || [];
  return orders.filter(function(order) {
    if (!orderBelongsToUser(order, user)) return false;
    if (String(order.status || '').toLowerCase() === 'served') return false;
    if (String(order.status || '').toLowerCase() === 'cancelled') return false;
    if (isOrderExpiredForTrack(order)) return false;
    return true;
  }).sort(function(a, b) {
    return getOrderCreatedTime(a) - getOrderCreatedTime(b);
  });
}

var ORDER_CANCEL_WINDOW_MS = 3 * 60 * 1000;

function getOrderCancelRemainingMs(order) {
  var created = getOrderCreatedTime(order);
  if (!created) return 0;
  return Math.max(0, ORDER_CANCEL_WINDOW_MS - (Date.now() - created));
}

function canCancelOrder(order) {
  if (!order) return false;
  var status = String(order.status || '').toLowerCase();
  if (status === 'served' || status === 'cancelled') return false;
  return getOrderCancelRemainingMs(order) > 0;
}

function renderCancelOrderAction(order) {
  var remaining = getOrderCancelRemainingMs(order);
  if (canCancelOrder(order)) {
    var remainingMin = Math.max(1, Math.ceil(remaining / 60000));
    return '<div class="track-actions">' +
      '<button class="btn btn-danger btn-sm track-cancel-btn" data-action="cancel-order" data-id="' + order.id + '">Cancel Order</button>' +
      '<span>Cancellation available for about ' + remainingMin + ' min.</span>' +
    '</div>';
  }
  return '<div class="track-actions track-actions-muted"><span>Cancellation window has ended.</span></div>';
}

async function cancelOrder(orderId) {
  var user = Auth.getUser();
  if (!user || !user.email) {
    showToast('Login Required', 'Sign in to manage your order.', 'warning');
    return;
  }

  var res = await SmartDineAPI.getOrders();
  if (res.error) {
    showToast('Error', 'Could not check this order right now.', 'error');
    return;
  }

  var orders = res.data || [];
  var order = null;
  for (var i = 0; i < orders.length; i++) {
    if (String(orders[i].id) === String(orderId)) {
      order = orders[i];
      break;
    }
  }

  if (!order || !orderBelongsToUser(order, user)) {
    showToast('Order Not Found', 'This order is no longer available.', 'warning');
    return;
  }

  if (!canCancelOrder(order)) {
    showToast('Cancellation Closed', 'Orders can only be cancelled within 3 minutes.', 'warning');
    renderTrackOrder();
    return;
  }

  var cancelRes = await SmartDineAPI.updateOrderStatus(orderId, 'cancelled');
  if (cancelRes.error) {
    showToast('Cancel Failed', 'Could not cancel this order. Please contact staff.', 'error');
    return;
  }

  showToast('Order Cancelled', 'Your order was cancelled successfully.', 'success');
  renderTrackOrder();
}

async function renderTrackOrder() {
  var app = document.getElementById('app');
  var user = Auth.getUser();
  
  // Only show loading state on initial load, not during silent polling
  if (!app.querySelector('.track-card') && !app.querySelector('.empty-state')) {
      app.innerHTML = '<section class="page-section"><div style="text-align:center; padding:100px;"><h3>Loading Orders...</h3></div></section>';
  }

  if (!user || !user.email) {
    app.innerHTML =
      '<section class="page-section">' +
        '<div class="empty-state">' +
          '<div class="empty-state-icon"></div>' +
          '<h2>Login Required</h2>' +
          '<p>Sign in to view your active orders.</p>' +
          '<button class="btn btn-primary" data-action="login-click">Login</button>' +
        '</div>' +
      '</section>';
    return;
  }

  if (window.SmartDineAPI && typeof SmartDineAPI.cleanupExpiredUserData === 'function') {
    SmartDineAPI.cleanupExpiredUserData().catch(function(err) {
      console.warn('[Track Order] Cleanup skipped:', err);
    });
  }
  
  var res = await SmartDineAPI.getOrders();
  if (res.error) {
      app.innerHTML = '<div class="container"><div class="empty-state"><h3>Error</h3><p>'+res.error+'</p></div></div>';
      return;
  }
  var orders = getActiveTrackOrders(res.data || [], user);

  if (orders.length === 0) {
    app.innerHTML =
      '<section class="page-section">' +
        '<div class="empty-state">' +
          '<div class="empty-state-icon"></div>' +
          '<h2>No Active Orders</h2>' +
          '<p>Completed orders leave tracking after service and old order data is cleaned after 24 hours.</p>' +
          '<button class="btn btn-primary" data-action="navigate" data-route="/menu">Browse Menu</button>' +
        '</div>' +
      '</section>';
    return;
  }

  var order = orders[orders.length - 1];
  var assignedWaiter = getOrderWaiter(order);
  var statuses = ['placed', 'preparing', 'ready', 'served'];
  var statusIcons = { placed: '', preparing: '', ready: '', served: '' };
  var statusLabels = { placed: 'Placed', preparing: 'Preparing', ready: 'Ready', served: 'Served', cancelled: 'Cancelled' };
  var currentIdx = statuses.indexOf(order.status);

  var itemsList = '';
  var itemsArray = order.order_items || order.items || [];
  for (var i = 0; i < itemsArray.length; i++) {
    var it = itemsArray[i];
    var extras = '';
    var qty = it.quantity || it.qty || 1;
    var itemTotal = typeof it.item_total !== 'undefined' && it.item_total !== null ?
      Number(it.item_total) :
      (typeof it.itemTotal !== 'undefined' && it.itemTotal !== null ? Number(it.itemTotal) : Number(it.price || 0) * qty);
    if (it.portion && it.portion !== 'Regular') extras += ' <span class="meta-tag" style="font-size:0.7rem;">' + it.portion + '</span>';
    var addonArr = it.addons || it.addOns || [];
    if (addonArr && addonArr.length > 0) {
      for (var x = 0; x < addonArr.length; x++) {
        extras += ' <span class="meta-tag" style="font-size:0.7rem;">+' + addonArr[x].name + '</span>';
      }
    }
    itemsList +=
      '<div class="track-item">' +
        '<span>' + escapeHTML(it.menu_item_name || it.name) + ' × ' + (it.quantity || it.qty || 1) + extras + '</span>' +
        '<span>' + formatCurrency(itemTotal) + '</span>' +
      '</div>';
  }

  // Timeline
  var timelineHTML = '';
  for (var j = 0; j < statuses.length; j++) {
    var s = statuses[j];
    var stepClass = 'timeline-step';
    if (j < currentIdx) stepClass += ' completed';
    else if (j === currentIdx) stepClass += ' active';
    else stepClass += ' upcoming';

    var iconDisplay = j < currentIdx ? '✓' : statusIcons[s];

    timelineHTML +=
      '<div class="' + stepClass + '">' +
        '<div class="timeline-icon">' + iconDisplay + '</div>' +
        '<div class="timeline-label">' + statusLabels[s] + '</div>' +
      '</div>';

    if (j < statuses.length - 1) {
      timelineHTML += '<div class="timeline-connector' + (j < currentIdx ? ' completed' : '') + '"></div>';
    }
  }

  // Waiter card
  var waiterHTML = '';
  if (assignedWaiter) {
    waiterHTML =
      '<div class="waiter-assigned-card glass-card" style="margin-top:1.5rem;display:flex;align-items:center;gap:1rem;padding:1rem;border:1px solid var(--border-color);border-radius:12px;background:var(--bg-surface);">' +
        '<div style="font-size:2.2rem;background:rgba(245,158,11,0.1);width:55px;height:55px;display:flex;align-items:center;justify-content:center;border-radius:50%;border:2px dashed var(--color-primary,#f59e0b);">' + assignedWaiter.avatar + '</div>' +
        '<div style="flex:1;">' +
          '<div style="font-size:0.75rem;color:var(--text-secondary);text-transform:uppercase;font-weight:700;letter-spacing:0.05em;">Assigned Server</div>' +
          '<div style="font-size:1.1rem;font-weight:700;color:var(--text-primary);margin-top:2px;">' + escapeHTML(assignedWaiter.name) + '</div>' +
          '<div style="font-size:0.8rem;color:var(--text-secondary);margin-top:2px;">★ ' + assignedWaiter.rating + ' Rating • Your dedicated server for this meal</div>' +
        '</div>' +
        '<div style="font-size:1.5rem;animation:pulse 2s infinite;"></div>' +
      '</div>';
  }

  app.innerHTML =
    '<section class="page-section">' +
      '<div class="page-header">' +
        '<h1 class="page-title">Track Your Order</h1>' +
        '<p class="page-subtitle">Real-time order status updates</p>' +
      '</div>' +
      '<div class="track-card glass-card">' +
        '<div class="track-info-grid">' +
          '<div class="track-info"><span class="track-label">Order ID</span><span class="track-value">' + order.id + '</span></div>' +
          '<div class="track-info"><span class="track-label">Table</span><span class="track-value">' + (order.table_number || order.tableNum) + '</span></div>' +
          '<div class="track-info"><span class="track-label">Placed At</span><span class="track-value">' + formatTime(order.created_at || order.placedAt || order.timestamp) + '</span></div>' +
          '<div class="track-info"><span class="track-label">Est. Prep Time</span><span class="track-value">' + (order.estimated_prep_time || order.prepTime || '20 mins') + '</span></div>' +
          '<div class="track-info"><span class="track-label">Total</span><span class="track-value">' + formatCurrency(order.total_amount || order.total) + '</span></div>' +
          '<div class="track-info"><span class="track-label">Status</span><span class="track-value status-badge status-' + order.status + '">' + statusLabels[order.status] + '</span></div>' +
        '</div>' +
        '<div class="track-items-section">' +
          '<h3>Order Items</h3>' +
          itemsList +
        '</div>' +
        '<div class="track-timeline">' + timelineHTML + '</div>' +
        renderCancelOrderAction(order) +
        waiterHTML +
      '</div>' +
    '</section>';

  // Auto-refresh every 3 seconds
  if (currentInterval) {
    clearInterval(currentInterval);
    currentInterval = null;
  }
  currentInterval = setInterval(function () {
    var hash = window.location.hash.split('?')[0].replace('#', '') || '/';
    if (hash === '/track-order') {
      renderTrackOrder();
    }
  }, 3000);
}

function getOrderWaiter(order) {
  if (!order) return null;
  if (order.assignedWaiter) return order.assignedWaiter;

  var waiters = Storage.get('smartdine_waiters', []);
  var waiterName = order.waiter_name || order.waiter;
  if (waiterName) {
    for (var i = 0; i < waiters.length; i++) {
      if (waiters[i].name === waiterName) return waiters[i];
    }
  }

  if (order.table_number || order.tableNum) {
    return Auth.getWaiterByTable(order.table_number || order.tableNum);
  }

  return null;
}

// ========================
// SETTINGS PAGE
// ========================

function renderSettings() {
  var currentTheme = Storage.get('smartdine_theme', 'dark');
  var user = Auth.getUser();

  // User info
  var accountHTML = '';
  if (user) {
    var display = user.email || user.phone || 'User';
    accountHTML =
      '<div class="setting-row">' +
        '<div class="setting-info">' +
          '<h4>Logged In As</h4>' +
          '<p>👤 ' + escapeHTML(display) + ' (' + (user.role || 'customer') + ')</p>' +
        '</div>' +
        '<button class="btn btn-secondary btn-sm" data-action="logout-click">Logout</button>' +
      '</div>';
  } else {
    accountHTML =
      '<div class="setting-row">' +
        '<div class="setting-info">' +
          '<h4>Not Logged In</h4>' +
          '<p>Login to place orders and track them</p>' +
        '</div>' +
        '<button class="btn btn-primary btn-sm" data-action="login-click">Login</button>' +
      '</div>';
  }

  var app = document.getElementById('app');
  app.innerHTML =
    '<section class="page-section">' +
      '<div class="page-header">' +
        '<h1 class="page-title">⚙️ Settings</h1>' +
        '<p class="page-subtitle">Configure your SmartDine experience</p>' +
      '</div>' +

      '<div class="settings-grid">' +
        // Appearance
        '<div class="card section-card settings-section">' +
          '<div class="card-header"><h3>🎨 Appearance</h3></div>' +
          '<div class="card-body">' +
            '<div class="setting-row">' +
              '<div class="setting-info">' +
                '<h4>Theme</h4>' +
                '<p>Switch between dark and light mode</p>' +
              '</div>' +
              '<div class="toggle-switch" data-action="toggle-theme">' +
                '<div class="toggle-track' + (currentTheme === 'light' ? ' active' : '') + '">' +
                  '<div class="toggle-thumb"></div>' +
                '</div>' +
                '<span>' + (currentTheme === 'dark' ? '🌙 Dark' : '☀️ Light') + '</span>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +

        // Data Management
        '<div class="card section-card settings-section">' +
          '<div class="card-header"><h3>💾 Data Management</h3></div>' +
          '<div class="card-body">' +
            '<div class="setting-row">' +
              '<div class="setting-info">' +
                '<h4>Reset Demo Data</h4>' +
                '<p>Clear all data and restore sample defaults</p>' +
              '</div>' +
              '<button class="btn btn-danger btn-sm" data-action="reset-data">🔄 Reset Data</button>' +
            '</div>' +
            '<div class="setting-row">' +
              '<div class="setting-info">' +
                '<h4>Export Data</h4>' +
                '<p>Download all your data as a JSON backup file</p>' +
              '</div>' +
              '<button class="btn btn-primary btn-sm" data-action="export-data">📥 Export Data</button>' +
            '</div>' +
          '</div>' +
        '</div>' +

        // Account
        '<div class="card section-card settings-section">' +
          '<div class="card-header"><h3>👤 Account</h3></div>' +
          '<div class="card-body">' + accountHTML + '</div>' +
        '</div>' +

        // About
        '<div class="card section-card settings-section">' +
          '<div class="card-header"><h3>ℹ️ About</h3></div>' +
          '<div class="card-body">' +
            '<div class="setting-row">' +
              '<div class="setting-info">' +
                '<h4>App Version</h4>' +
                '<p>v' + (typeof APP_VERSION !== 'undefined' ? APP_VERSION : '1.0.0') + '</p>' +
              '</div>' +
            '</div>' +
            '<div class="setting-row">' +
              '<div class="setting-info">' +
                '<h4>PWA Install</h4>' +
                '<p>This app can be installed on your device for offline access. Look for the install prompt in your browser\'s address bar.</p>' +
              '</div>' +
            '</div>' +
            '<div class="setting-row">' +
              '<div class="setting-info">' +
                '<h4>Tech Stack</h4>' +
                '<p>Built with HTML, CSS & Vanilla JavaScript. No frameworks used. PWA-enabled with Service Worker caching.</p>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</section>';
}

// ========================
// THEME & DATA MANAGEMENT
// ========================

function toggleTheme() {
  var current = Storage.get('smartdine_theme', 'dark');
  var next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.classList.add('theme-transitioning');
  Storage.set('smartdine_theme', next);
  applyTheme();
  if (typeof saveCurrentPreferences === 'function') saveCurrentPreferences();
  setTimeout(function() {
    document.documentElement.classList.remove('theme-transitioning');
  }, 360);
  showToast('Theme', 'Switched to ' + next + ' mode', 'info');
}

function applyTheme() {
  var theme = Storage.get('smartdine_theme', 'dark');
  var resolvedTheme = theme === 'light' ? 'light' : 'dark';
  if (document.documentElement) document.documentElement.setAttribute('data-theme', resolvedTheme);
  if (document.body) document.body.setAttribute('data-theme', resolvedTheme);
  var themeMeta = document.querySelector ? document.querySelector('meta[name="theme-color"]') : null;
  if (themeMeta) themeMeta.setAttribute('content', resolvedTheme === 'light' ? '#fbfaf7' : '#0d0d12');
  if (document.querySelectorAll) {
    document.querySelectorAll('.theme-toggle-btn').forEach(function (btn) {
      btn.textContent = resolvedTheme === 'dark' ? '\u{1F319}' : '\u2600\uFE0F';
      btn.setAttribute('aria-label', 'Switch to ' + (resolvedTheme === 'dark' ? 'light' : 'dark') + ' mode');
    });
  }
}

function resetData() {
  showModal(
    'Reset Data',
    '<p>Are you sure you want to reset all data to defaults? This action <strong>cannot be undone</strong>.</p>',
    '<button class="btn btn-danger" onclick="confirmResetData()">🗑️ Reset Everything</button>' +
    '<button class="btn btn-secondary" data-action="close-modal">Cancel</button>'
  );
}

window.confirmResetData = function () {
  Storage.clear();
  initializeData();
  applyTheme();
  closeModal();
  handleRoute();
  showToast('Data Reset', 'All demo data has been restored to defaults', 'success');
};

function exportData() {
  var data = {};
  var keys = ['smartdine_menu', 'smartdine_inventory', 'smartdine_cart', 'smartdine_orders', 'smartdine_table', 'smartdine_theme', 'smartdine_waiters', 'smartdine_active_user', 'smartdine_guest_count'];
  for (var i = 0; i < keys.length; i++) {
    data[keys[i]] = Storage.get(keys[i]);
  }

  var jsonStr = JSON.stringify(data, null, 2);
  var blob = new Blob([jsonStr], { type: 'application/json' });
  var url = URL.createObjectURL(blob);

  var link = document.createElement('a');
  link.href = url;
  link.download = 'smartdine_backup_' + new Date().toISOString().slice(0, 10) + '.json';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  showToast('Export Complete', 'Your data has been downloaded as JSON', 'success');
}
