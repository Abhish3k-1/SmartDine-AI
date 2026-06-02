// ============================================================
// SmartDine AI — Main Application Entry Point
// Version 2.0.0 | Modular Vanilla JS Architecture
// ============================================================

/**
 * Initialize the entire application
 */
async function init() {
  // 1. Initialize sample data in localStorage
  initializeData();

  await syncWaitersFromDB();

  // 1.5. Prune expired order/user data while keeping profile identity.
  if (window.SmartDineAPI && typeof SmartDineAPI.cleanupExpiredUserData === 'function') {
    SmartDineAPI.cleanupExpiredUserData().catch(function(err) {
      console.warn('[SmartDine AI] Data cleanup skipped:', err);
    });
  }

  // 2. Apply saved theme
  applyTheme();

  // 3. Render the navbar
  refreshNavbar();

  // 4. Ensure toast container exists
  if (!document.getElementById('toast-container')) {
    var toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }

  // 5. Restore Google OAuth session if Supabase redirected back here
  if (window.Auth && typeof Auth.syncSupabaseSession === 'function') {
    if (typeof Auth.listenForSupabaseAuth === 'function') {
      Auth.listenForSupabaseAuth();
    }
    await Auth.syncSupabaseSession();
  }

  // 5.5. Handle current route
  handleRoute();

  showVisitGreeting();

  // 6. Register service worker for PWA
  registerServiceWorker();

  console.log('[SmartDine AI] v' + APP_VERSION + ' initialized successfully');
}

function normalizeWaiterRoster(waiters) {
  return (waiters || []).map(function(waiter) {
    var avatar = waiter.avatar || '';
    if (avatar && avatar.indexOf('<') !== 0) {
      avatar = '<img src="' + escapeHTML(avatar) + '" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">';
    }

    return {
      id: waiter.id,
      name: waiter.name,
      avatar: avatar,
      rating: waiter.rating,
      status: waiter.status,
      tables: waiter.tables || [],
      description: waiter.description || ''
    };
  });
}

function syncWaitersFromDB() {
  if (!window.SmartDineAPI || typeof SmartDineAPI.getWaiters !== 'function') {
    return Promise.resolve();
  }

  return SmartDineAPI.getWaiters().then(function(res) {
    if (!res.error && res.data && res.data.length > 0) {
      Storage.set('smartdine_waiters', normalizeWaiterRoster(res.data));
    }
  }).catch(function(err) {
    console.warn('[SmartDine AI] Waiter roster sync skipped:', err);
  });
}

function showVisitGreeting() {
  try {
    if (sessionStorage.getItem('smartdine_visit_greeted') === 'true') return;
    sessionStorage.setItem('smartdine_visit_greeted', 'true');
  } catch (err) {
    console.warn('[SmartDine AI] Greeting session check skipped:', err);
  }

  var visits = Storage.get('smartdine_visit_count', 0) || 0;
  visits += 1;
  Storage.set('smartdine_visit_count', visits);
  Storage.set('smartdine_last_visit_at', new Date().toISOString());

  var user = Auth.getUser();
  var greeting = getVisitGreeting(user, visits);

  setTimeout(function() {
    showToast(greeting.title, greeting.message, greeting.type);
  }, 650);
}

function getVisitGreeting(user, visits) {
  var timeGreeting = getTimeBasedGreeting();
  if (user && user.email) {
    var displayName = user.name || user.email.split('@')[0] || 'there';
    return {
      title: timeGreeting + ', ' + displayName,
      message: 'Your table menu and SmartDine AI are ready.',
      type: 'success'
    };
  }

  if (visits <= 1) {
    return {
      title: 'Welcome to SmartDine AI',
      message: 'Explore dishes, pick your table, and ask the AI for food suggestions.',
      type: 'info'
    };
  }

  var messages = [
    'Ready for another order? The menu and AI assistant are waiting.',
    'Welcome back. Browse favorites or ask for a quick recommendation.',
    'Good to see you again. Start with the menu or let SmartDine AI suggest a dish.'
  ];

  return {
    title: timeGreeting,
    message: messages[visits % messages.length],
    type: 'info'
  };
}

function getTimeBasedGreeting() {
  var hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

// ============================================================
// GLOBAL EVENT DELEGATION
// All click events are handled via data-action attributes
// ============================================================

document.addEventListener('click', function (e) {
  try {
    var target = e.target.closest('[data-action]');
    if (!target) return;

    var action = target.dataset.action;
    var id = target.dataset.id;

    switch (action) {
      // Navigation
      case 'navigate':
        e.preventDefault();
        navigateTo(target.dataset.route);
        // Close mobile menu on navigation
        var mobileNav = document.getElementById('mobile-nav');
        if (mobileNav) mobileNav.classList.remove('active');
        break;

      // Menu Filters
      case 'filter-menu':
        filterMenu(target.dataset.filter, target.dataset.value);
        break;

      // Food Detail Modal
      case 'show-food-detail':
        showFoodDetailModal(parseInt(id));
        break;

      // Cart Operations
      case 'add-to-cart':
        e.stopPropagation();
        // Quick add with default options
        addToCart(parseInt(id), {
          portion: 'Small',
          spiceLevel: 'Medium',
          addOns: [],
          specialInstructions: '',
          quantity: 1
        });
        break;

      case 'add-to-cart-modal':
        // Add from detail modal with selected options
        e.preventDefault();
        addToCartFromModal(parseInt(id));
        break;

      case 'increase-qty':
        updateQuantity(id, 1);
        break;

      case 'decrease-qty':
        updateQuantity(id, -1);
        break;

      case 'remove-from-cart':
        removeFromCart(id);
        break;

      case 'place-order':
        placeOrder();
        break;

      // Order Status Updates (Kitchen)
      case 'update-order-status':
        updateOrderStatus(id, target.dataset.status);
        break;

      case 'cancel-order':
        cancelOrder(id);
        break;

      case 'delete-kitchen-history':
        deleteKitchenOrderHistory(id);
        break;

      case 'confirm-delete-kitchen-history':
        confirmDeleteKitchenOrderHistory(id);
        break;

      // Theme Toggle
      case 'toggle-theme':
        toggleTheme();
        break;

      // AI Chat
      case 'toggle-ai-chat':
        toggleAIChat(target.dataset.prompt);
        break;

      case 'ask-ai':
        e.preventDefault();
        askAI(target.dataset.prompt || target.textContent || '');
        break;

      case 'send-ai-message':
        sendAIMessage();
        break;

      case 'clear-ai-chat':
        clearAIChat();
        break;

      // Mobile Menu
      case 'toggle-mobile-menu':
        toggleMobileMenu();
        break;

      // Auth
      case 'login-click':
        showCustomerLoginModal();
        break;

      case 'staff-login-click':
        showStaffLoginModal();
        break;

      case 'logout-click':
        e.preventDefault();
        Auth.logout();
        break;

      // Inventory
      case 'add-inventory':
        showAddInventoryModal();
        break;

      case 'edit-inventory':
        showEditInventoryModal(parseInt(id));
        break;

      case 'delete-inventory':
        deleteInventoryItem(parseInt(id));
        break;

      case 'save-inventory':
        saveInventoryForm();
        break;

      // Modal
      case 'close-modal':
        closeModal();
        break;

      // Settings
      case 'reset-data':
        resetData();
        break;

      case 'export-data':
        exportData();
        break;

      // PWA Install
      case 'install-pwa':
        installPWA();
        break;
    }
  } catch (err) {
    console.error("Click handler crash:", err);
    showToast('Action Failed', err && err.message ? err.message : 'Something went wrong. Please try again.', 'error');
  }
});

// ============================================================
// SEARCH INPUT HANDLER (debounced)
// ============================================================

var debouncedMenuSearch = debounce(function (value) {
  if (typeof filterMenuBySearch === 'function') {
    filterMenuBySearch(value);
  }
}, 300);

document.addEventListener('input', function (e) {
  if (e.target.id === 'menu-search') {
    debouncedMenuSearch(e.target.value);
  }
});

// ============================================================
// AI CHAT ENTER KEY
// ============================================================

document.addEventListener('keypress', function (e) {
  if (e.target.id === 'ai-input' && e.key === 'Enter') {
    e.preventDefault();
    sendAIMessage();
  }
});

// ============================================================
// QUANTITY CONTROLS IN FOOD DETAIL MODAL
// ============================================================

document.addEventListener('click', function (e) {
  if (e.target.id === 'modal-qty-increase') {
    var qtyEl = document.getElementById('modal-qty-value');
    if (qtyEl) {
      var val = parseInt(qtyEl.textContent) || 1;
      qtyEl.textContent = Math.min(20, val + 1);
      if (typeof updateModalPrice === 'function') updateModalPrice();
    }
  }
  if (e.target.id === 'modal-qty-decrease') {
    var qtyEl2 = document.getElementById('modal-qty-value');
    if (qtyEl2) {
      var val2 = parseInt(qtyEl2.textContent) || 1;
      qtyEl2.textContent = Math.max(1, val2 - 1);
      if (typeof updateModalPrice === 'function') updateModalPrice();
    }
  }
});

// ============================================================
// MODAL OPTION CHANGE HANDLERS (portions, add-ons)
// ============================================================

document.addEventListener('change', function (e) {
  if (e.target.name === 'modal-portion' || e.target.name === 'modal-addon' || e.target.name === 'modal-spice') {
    if (typeof updateModalPrice === 'function') updateModalPrice();
  }
  // Table selector on menu page
  if (e.target.id === 'table-select') {
    Storage.set('smartdine_table', parseInt(e.target.value));
    saveCurrentPreferences();
    if (typeof syncCartToDB === 'function') syncCartToDB();
    refreshNavbar();
  }
  if (e.target.id === 'cart-table-select') {
    var selectedTable = parseInt(e.target.value);
    if (selectedTable) {
      Storage.set('smartdine_table', selectedTable);
    } else {
      Storage.remove('smartdine_table');
    }
    var warning = document.getElementById('cart-table-warning');
    if (warning) warning.style.display = selectedTable ? 'none' : 'block';
    saveCurrentPreferences();
    if (typeof syncCartToDB === 'function') syncCartToDB();
    refreshNavbar();
  }
});

// ============================================================
// GUEST COUNT CONTROLS (Cart Page)
// ============================================================

window.adjustGuestCount = function (delta) {
  var el = document.getElementById('guest-count-val');
  if (el) {
    var val = parseInt(el.textContent) || 2;
    val = Math.max(1, Math.min(20, val + delta));
    el.textContent = val;
    Storage.set('smartdine_guest_count', val);
    saveCurrentPreferences();
    if (typeof syncCartToDB === 'function') syncCartToDB();
  }
};

function saveCurrentPreferences() {
  var user = Auth.getUser();
  if (!user || !user.email || !window.SmartDineAPI) return;
  SmartDineAPI.savePreferences(user.email, {
    theme: Storage.get('smartdine_theme', 'dark'),
    selected_table: Storage.get('smartdine_table', null),
    guest_count: Storage.get('smartdine_guest_count', 2)
  });
}

window.saveCurrentPreferences = saveCurrentPreferences;

// ============================================================
// APPLICATION STARTUP
// ============================================================

document.addEventListener('DOMContentLoaded', init);

window.addEventListener('hashchange', function () {
  // Re-render navbar to update active states, cart badge, and role-based links
  refreshNavbar();
  handleRoute();
});

// Listen for storage events (cross-tab sync)
window.addEventListener('storage', function (e) {
  if (e.key && e.key.startsWith('smartdine_')) {
    // Refresh navbar for cart badge updates
    refreshNavbar();
  }
});
