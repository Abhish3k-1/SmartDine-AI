// ============================================================
// SmartDine AI — LocalStorage Wrapper (storage.js)
// Version 2.0.0 | Loaded SECOND via <script> tag
// Global scope — NO import/export
// ============================================================

/**
 * Storage — a thin, safe wrapper around window.localStorage.
 *
 * All values are automatically JSON-stringified on write and
 * JSON-parsed on read.  If parsing fails the fallback is returned,
 * so callers never need their own try/catch.
 *
 * Usage:
 *   Storage.set('smartdine_cart', []);
 *   var cart = Storage.get('smartdine_cart', []);
 *   Storage.remove('smartdine_cart');
 *   Storage.clear();
 */
var Storage = {

  /**
   * Read a value from localStorage.
   * @param {string} key — the storage key
   * @param {*} [fallback=null] — value returned when key is missing or corrupt
   * @returns {*} parsed JSON value, or fallback
   */
  get: function (key, fallback) {
    if (typeof fallback === 'undefined') fallback = null;
    try {
      var raw = localStorage.getItem(key);
      if (raw === null) return fallback;
      return JSON.parse(raw);
    } catch (e) {
      console.warn('[Storage.get] Failed to parse key "' + key + '":', e);
      return fallback;
    }
  },

  /**
   * Write a value to localStorage (JSON-stringified).
   * @param {string} key — the storage key
   * @param {*} value — any JSON-serialisable value
   */
  set: function (key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('[Storage.set] Failed to write key "' + key + '":', e);
    }
  },

  /**
   * Remove a single key from localStorage.
   * @param {string} key
   */
  remove: function (key) {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error('[Storage.remove] Failed to remove key "' + key + '":', e);
    }
  },

  /**
   * Clear ALL localStorage entries.
   * Use with caution — this removes everything, not just SmartDine keys.
   */
  clear: function () {
    try {
      localStorage.clear();
    } catch (e) {
      console.error('[Storage.clear] Failed:', e);
    }
  }
};
