// ============================================================
// SmartDine AI — Hash Router with Route Guards
// Handles SPA navigation with role-based access control
// ============================================================

var currentInterval = null;

// Route definitions: hash path -> render function
var routes = {
  '/':              'renderLanding',
  '/menu':          'renderMenu',
  '/cart':          'renderCart',
  '/track-order':   'renderTrackOrder',
  '/staff-login':   'renderStaffLogin',
  '/admin-login':   'renderAdminLogin',
  '/admin':         'renderAdmin',
  '/inventory':     'renderInventory',
  '/analytics':     'renderAnalytics',
  '/kitchen-login': 'renderKitchenLogin',
  '/kitchen':       'renderKitchen',
  '/settings':      'renderSettings'
};

// Customer-visible routes (no admin/kitchen)
var CUSTOMER_ROUTES = ['/', '/menu', '/cart', '/track-order', '/settings'];
var STAFF_HIDDEN_CUSTOMER_ROUTES = ['/menu', '/cart', '/track-order'];

// Admin-protected routes
var ADMIN_ROUTES = ['/admin', '/inventory', '/analytics'];

// Kitchen-protected routes
var KITCHEN_ROUTES = ['/kitchen'];

/**
 * Navigate to a hash route
 */
function navigateTo(hash) {
  if (window.location.hash === '#' + hash) {
    handleRoute();
    return;
  }
  window.location.hash = hash;
}

/**
 * Get current hash path (without query params)
 */
function getCurrentRoute() {
  var hash = window.location.hash.replace('#', '').split('?')[0] || '/';
  return hash;
}

/**
 * Main route handler — called on every hash change
 */
function handleRoute() {
  // Clear any existing polling intervals from previous pages
  if (currentInterval) {
    clearInterval(currentInterval);
    currentInterval = null;
  }

  var hash = getCurrentRoute();
  var user = Auth.getUser();
  var devBypass = typeof DEV_BYPASS_LOGIN !== 'undefined' && DEV_BYPASS_LOGIN;

  // Logged-in users should not stay on the landing page.
  if (hash === '/' && user && !devBypass) {
    navigateTo(getDefaultRouteForUser(user));
    return;
  }

  if (user && !devBypass && (Auth.isAdmin() || Auth.isKitchen()) && STAFF_HIDDEN_CUSTOMER_ROUTES.indexOf(hash) !== -1) {
    navigateTo(getDefaultRouteForUser(user));
    return;
  }

  // ==========================================
  // ROUTE GUARDS — Role-Based Access Control
  // ==========================================

  // Admin route protection
  if (ADMIN_ROUTES.indexOf(hash) !== -1) {
    if (!Auth.isAdmin() && !devBypass) {
      setTimeout(function () {
        showToast('Access Denied 🔒', 'Admin login required to access this page.', 'error');
      }, 100);
      navigateTo('/admin-login');
      return;
    }
  }

  // Kitchen route protection
  if (KITCHEN_ROUTES.indexOf(hash) !== -1) {
    if (!Auth.isKitchen() && !devBypass) {
      setTimeout(function () {
        showToast('Access Denied 🔒', 'Kitchen staff login required.', 'error');
      }, 100);
      navigateTo('/kitchen-login');
      return;
    }
  }

  // If already logged in as admin, skip admin login page
  if (hash === '/admin-login' && Auth.isAdmin() && !devBypass) {
    navigateTo('/admin');
    return;
  }

  // If already logged in as kitchen, skip kitchen login page
  if (hash === '/kitchen-login' && Auth.isKitchen() && !devBypass) {
    navigateTo('/kitchen');
    return;
  }

  // ==========================================
  // RENDER THE ROUTE
  // ==========================================
  var routeFnName = routes[hash];

  if (routeFnName && typeof window[routeFnName] === 'function') {
    window[routeFnName]();
  } else {
    // 404 Page
    var app = document.getElementById('app');
    app.innerHTML =
      '<section class="page-section" style="padding-top:120px;">' +
        '<div class="empty-state">' +
          '<div class="empty-state-icon">🔍</div>' +
          '<h2>Page Not Found</h2>' +
          '<p>The page you are looking for does not exist.</p>' +
          '<button class="btn btn-primary" data-action="navigate" data-route="/">Go Home</button>' +
        '</div>' +
      '</section>';
  }

  // Update active nav link highlights
  document.querySelectorAll('.nav-link').forEach(function (link) {
    link.classList.remove('active');
    var linkRoute = link.getAttribute('data-route');
    if (linkRoute === hash) {
      link.classList.add('active');
    }
  });

  // Scroll to top on route change
  window.scrollTo(0, 0);

  // Update cart badge count
  if (typeof updateCartBadge === 'function') {
    updateCartBadge();
  }
}

/**
 * Render the navbar based on current user role
 * Customer: Home, Menu, Cart, Track Order
 * Admin: + Admin, Inventory, Analytics
 * Kitchen: + Kitchen
 */
function renderNavbar() {
  var cartCount = typeof getCartCount === 'function' ? getCartCount() : 0;
  var user = Auth.getUser();
  var isAdmin = Auth.isAdmin();
  var isKitchenStaff = Auth.isKitchen();
  var tableNum = Storage.get('smartdine_table', null);

  // Build nav links — customer sees ONLY customer routes
  var isStaff = isAdmin || isKitchenStaff;
  var linksHTML = '';

  // NO admin/kitchen links in the main navbar for customers
  // Admin/kitchen users see their respective links only after login
  if (isAdmin) {
    linksHTML =
      '<a class="nav-link" data-action="navigate" data-route="/admin" href="#/admin">Admin</a>' +
      '<a class="nav-link" data-action="navigate" data-route="/inventory" href="#/inventory">Inventory</a>' +
      '<a class="nav-link" data-action="navigate" data-route="/analytics" href="#/analytics">Analytics</a>';
  } else if (isKitchenStaff) {
    linksHTML = '<a class="nav-link" data-action="navigate" data-route="/kitchen" href="#/kitchen">Kitchen</a>';
  } else {
    linksHTML =
      '<a class="nav-link" data-action="navigate" data-route="/" href="#/">Home</a>' +
      '<a class="nav-link" data-action="navigate" data-route="/menu" href="#/menu">Menu</a>' +
      '<a class="nav-link" data-action="navigate" data-route="/cart" href="#/cart">Cart</a>' +
      '<a class="nav-link" data-action="navigate" data-route="/track-order" href="#/track-order">Track Order</a>';
  }

  // Auth button
  var authBtnHTML = '';
  if (user) {
    var userDisplay = user.email || user.phone || 'User';
    var displayName = isAdmin ? 'Admin' : (isKitchenStaff ? 'Kitchen' : userDisplay.split('@')[0]);
    authBtnHTML =
      '<span class="user-greeting">👤 ' + escapeHTML(displayName) + '</span>' +
      '<button class="btn btn-secondary btn-sm" data-action="logout-click">Logout</button>';
  } else {
    authBtnHTML = '<button class="btn btn-primary btn-sm" data-action="login-click">Login</button>';
  }

  // Table indicator
  var tableHTML = '';
  if (!isStaff && tableNum) {
    tableHTML = '<span class="table-indicator">🪑 Table ' + tableNum + '</span>';
  }

  var cartLinkHTML = '';
  if (!isStaff) {
    cartLinkHTML =
      '<a class="btn-icon cart-link" data-action="navigate" data-route="/cart" href="#/cart" title="Cart">' +
        'ðŸ›’<span class="cart-badge" style="' + (cartCount > 0 ? '' : 'display:none') + '">' + cartCount + '</span>' +
      '</a>';
  }

  // Mobile nav links (same as desktop + extra items)
  var mobileLinksHTML = linksHTML;
  if (user) {
    mobileLinksHTML +=
      '<a class="nav-link" data-action="navigate" data-route="/settings" href="#/settings">⚙️ Settings</a>' +
      '<a class="nav-link" data-action="logout-click" href="#">🚪 Logout</a>';
  } else {
    mobileLinksHTML += '<a class="nav-link" data-action="login-click" href="#">🔑 Login</a>';
  }

  return (
    '<nav class="navbar">' +
      '<div class="navbar-container">' +
        '<a class="navbar-logo" data-action="navigate" data-route="/" href="#/">' +
          '<div class="logo-icon">🍽️</div>' +
          '<span class="logo-text">Smart<span class="logo-accent">Dine</span></span>' +
        '</a>' +
        '<div class="nav-links">' + linksHTML + '</div>' +
        '<div class="nav-actions">' +
          tableHTML +
          '<button class="btn-icon theme-toggle-btn" data-action="toggle-theme" title="Toggle Theme">🌙</button>' +
          cartLinkHTML +
          authBtnHTML +
          '<button class="btn-icon mobile-menu-btn" data-action="toggle-mobile-menu" title="Menu">☰</button>' +
        '</div>' +
      '</div>' +
      '<div class="mobile-nav" id="mobile-nav">' + mobileLinksHTML + '</div>' +
    '</nav>'
  );
}

/**
 * Toggle mobile menu visibility
 */
function toggleMobileMenu() {
  var mobileNav = document.getElementById('mobile-nav');
  if (mobileNav) {
    mobileNav.classList.toggle('active');
  }
}

/**
 * Refresh the navbar (call after login/logout/cart changes)
 */
function refreshNavbar() {
  var navRoot = document.getElementById('navbar-root');
  if (navRoot) {
    navRoot.innerHTML = renderNavbar();
    if (typeof applyTheme === 'function') {
      applyTheme();
    }
  }
}
