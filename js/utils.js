// ============================================================
// SmartDine AI — Utility Functions (utils.js)
// Version 2.0.0 | Loaded FIRST via <script> tag
// Global scope — NO import/export
// ============================================================

// ========================
// CONSTANTS
// ========================

var APP_VERSION = '2.0.0';
var CURRENCY = '₹';
var GST_RATE = 0.05;
var SERVICE_CHARGE_RATE = 0.03;

// ========================
// FORMAT HELPERS
// ========================

/**
 * Format a number as Indian Rupee currency string.
 * @param {number} amount — the numeric value
 * @returns {string} e.g. '₹249.00'
 */
function formatCurrency(amount) {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return CURRENCY + '0.00';
  }
  return CURRENCY + amount.toFixed(2);
}

/**
 * Format an ISO date string to a 12-hour time.
 * @param {string} isoString — e.g. '2026-05-25T10:30:00'
 * @returns {string} e.g. '10:30 AM'
 */
function formatTime(isoString) {
  try {
    var d = new Date(isoString);
    if (isNaN(d.getTime())) return '--:--';
    var hours = d.getHours();
    var minutes = d.getMinutes();
    var ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    if (hours === 0) hours = 12;
    var minStr = minutes < 10 ? '0' + minutes : '' + minutes;
    return hours + ':' + minStr + ' ' + ampm;
  } catch (e) {
    return '--:--';
  }
}

/**
 * Format an ISO date string to a readable date.
 * @param {string} isoString — e.g. '2026-05-25T10:30:00'
 * @returns {string} e.g. '25 May 2026'
 */
function formatDate(isoString) {
  try {
    var d = new Date(isoString);
    if (isNaN(d.getTime())) return '—';
    var months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
  } catch (e) {
    return '—';
  }
}

/**
 * Generate a unique SmartDine ID.
 * @returns {string} e.g. 'SD-M4K7X9'
 */
function generateId() {
  var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no ambiguous 0/O, 1/I
  var id = 'SD-';
  for (var i = 0; i < 6; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

/**
 * Escape HTML special characters to prevent XSS injection.
 * @param {string} str — raw user input
 * @returns {string} sanitised string safe for innerHTML
 */
function escapeHTML(str) {
  if (typeof str !== 'string') return '';
  var map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return str.replace(/[&<>"']/g, function (char) {
    return map[char];
  });
}

/**
 * Debounce a function call.
 * @param {Function} func — the function to debounce
 * @param {number} wait — milliseconds to delay
 * @returns {Function} debounced wrapper
 */
function debounce(func, wait) {
  var timeout;
  return function () {
    var context = this;
    var args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(function () {
      func.apply(context, args);
    }, wait);
  };
}

// ========================
// TOAST NOTIFICATION SYSTEM
// ========================

/**
 * Show a toast notification.
 * Creates a toast element, appends it to #toast-container (auto-created),
 * and auto-removes after 3 seconds with slide-in/out animation.
 *
 * @param {string} title — toast heading
 * @param {string} message — toast body text
 * @param {string} type — 'success' | 'error' | 'info' | 'warning'
 */
function showToast(title, message, type) {
  type = type || 'info';

  // Ensure toast container exists
  var container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  // Icon map
  var icons = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
    warning: '⚠️'
  };
  var icon = icons[type] || icons.info;

  // Build toast element
  var toast = document.createElement('div');
  toast.className = 'toast toast-' + type;
  toast.innerHTML =
    '<div class="toast-icon">' + icon + '</div>' +
    '<div class="toast-body">' +
      '<div class="toast-title">' + escapeHTML(title) + '</div>' +
      '<div class="toast-message">' + escapeHTML(message) + '</div>' +
    '</div>' +
    '<button class="toast-close" onclick="this.parentElement.remove()" aria-label="Close">&times;</button>';

  container.appendChild(toast);

  // Trigger slide-in animation on next frame
  requestAnimationFrame(function () {
    toast.classList.add('toast-show');
  });

  // Auto-remove after 3 seconds
  setTimeout(function () {
    toast.classList.add('toast-hide');
    setTimeout(function () {
      if (toast.parentElement) toast.remove();
    }, 400);
  }, 3000);
}

// ========================
// MODAL SYSTEM
// ========================

/**
 * Escape-key handler reference so we can clean it up on close.
 * @private
 */
function _handleModalEscape(e) {
  if (e.key === 'Escape') closeModal();
}

/**
 * Show a modal dialog.
 * Creates a full-screen overlay with a glass-card modal containing the
 * provided title, body HTML, and optional footer HTML.
 *
 * @param {string} title — modal heading
 * @param {string} bodyHTML — inner HTML for the modal body
 * @param {string} [footerHTML] — optional inner HTML for the modal footer
 * @returns {HTMLElement} reference to the .modal element inside the overlay
 */
function showModal(title, bodyHTML, footerHTML) {
  footerHTML = footerHTML || '';

  // Remove any existing modal first
  closeModal();

  var overlay = document.createElement('div');
  overlay.className = 'modal-backdrop';
  overlay.id = 'modal-overlay';

  overlay.innerHTML =
    '<div class="modal" role="dialog" aria-modal="true">' +
      '<div class="modal-header">' +
        '<h3 class="modal-title">' + title + '</h3>' +
        '<button class="modal-close modal-close-btn" data-action="close-modal" aria-label="Close">&times;</button>' +
      '</div>' +
      '<div class="modal-body">' + bodyHTML + '</div>' +
      (footerHTML ? '<div class="modal-footer">' + footerHTML + '</div>' : '') +
    '</div>';

  document.body.appendChild(overlay);

  // Close when clicking the backdrop (not the modal itself)
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) closeModal();
  });

  // Close button inside modal header
  var closeBtn = overlay.querySelector('.modal-close-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', function () {
      closeModal();
    });
  }

  // Close on Escape key
  document.addEventListener('keydown', _handleModalEscape);

  // Trigger entrance animation
  requestAnimationFrame(function () {
    overlay.classList.add('active');
    var modal = overlay.querySelector('.modal');
    if (modal) modal.classList.add('active');
  });

  return overlay.querySelector('.modal');
}

/**
 * Close the currently-open modal with a fade-out animation.
 */
function closeModal() {
  var overlay = document.getElementById('modal-overlay');
  if (overlay) {
    var modal = overlay.querySelector('.modal');
    if (modal) modal.classList.remove('active');
    overlay.classList.remove('active');
    setTimeout(function () {
      if (overlay.parentElement) overlay.remove();
    }, 250);
  }
  document.removeEventListener('keydown', _handleModalEscape);
}

// ========================
// STAT CARD RENDERER
// ========================

/**
 * Render an HTML string for a glass-card stat card.
 * Reused across the Kitchen, Admin, and Analytics dashboards.
 *
 * @param {string} icon — emoji or icon string
 * @param {string} label — stat label (e.g. 'Total Orders')
 * @param {string|number} value — the stat value to display
 * @param {string} color — CSS colour keyword or hex for the accent
 * @returns {string} HTML string
 */
function renderStatCard(icon, label, value, color) {
  return (
    '<div class="stat-card glass-card" style="border-top: 3px solid ' + (color || 'var(--primary)') + ';">' +
      '<div class="stat-icon" style="color: ' + (color || 'var(--primary)') + ';">' + icon + '</div>' +
      '<div class="stat-info">' +
        '<div class="stat-value">' + value + '</div>' +
        '<div class="stat-label">' + escapeHTML(label) + '</div>' +
      '</div>' +
    '</div>'
  );
}
