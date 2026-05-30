// ============================================================
// SmartDine AI — Authentication (Async Refactor)
// ============================================================

var DEV_BYPASS_LOGIN = false;
var DEV_BYPASS_USER = {
    id: 'dev-bypass',
    name: 'Dev Customer',
    email: 'dev@smartdine.local',
    role: 'customer'
};

var STAFF_LOGIN_CREDENTIALS = {
    admin: {
        email: 'absihekdas@gmail.com',
        password: 'QWERTY@234',
        label: 'Admin',
        route: '/admin',
        title: 'Admin Manager',
        description: 'Analytics, inventory, QR tools'
    },
    kitchen: {
        email: 'kitchen@gmail.com',
        password: 'QWERTY@234',
        label: 'Kitchen',
        route: '/kitchen',
        title: 'Kitchen Staff',
        description: 'Live order preparation board'
    }
};

var Auth = {
    getUser: function() {
        return DEV_BYPASS_LOGIN ? DEV_BYPASS_USER : Storage.get('smartdine_user', null);
    },
    
    isLoggedIn: function() {
        return this.getUser() !== null;
    },
    
    isAdmin: function() {
        var user = this.getUser();
        return user && user.role === 'admin';
    },
    
    isKitchen: function() {
        var user = this.getUser();
        return user && user.role === 'kitchen';
    },
    
    logout: async function() {
        if (window.SmartDineAPI && window.APP_CONFIG && window.APP_CONFIG.MODE === 'cloud') {
            try {
                var res = await SmartDineAPI.logout();
                if (res && res.error) {
                    console.warn('[Auth] Cloud logout skipped:', res.error);
                }
            } catch (err) {
                console.warn('[Auth] Cloud logout skipped:', err);
            }
        }

        Storage.set('smartdine_cart', []);
        Storage.remove('smartdine_table');
        Storage.remove('smartdine_guest_count');
        Storage.remove('smartdine_user');
        showToast('Logged Out', 'Your session data has been cleared.', 'info');
        navigateTo('/');
        refreshNavbar();
    },

    getWaiterByTable: function(tableNum) {
        var waiters = Storage.get('smartdine_waiters', []);
        var tableInt = parseInt(tableNum);
        for(var i=0; i<waiters.length; i++) {
            if(waiters[i].tables && waiters[i].tables.includes(tableInt)) {
                return waiters[i];
            }
        }
        return waiters[0];
    }
};

Auth.syncSupabaseSession = async function() {
    try {
        if (!window.APP_CONFIG || window.APP_CONFIG.MODE !== 'cloud' || !window.SmartDineAPI) return;
        var res = await SmartDineAPI.getCurrentAuthUser();
        if (!res.error && res.data) {
            Storage.set('smartdine_user', res.data);
            await syncUserDataFromDB(res.data);
            refreshNavbar();
            if (getCurrentRoute() === '/' || isSupabaseAuthCallbackRoute()) {
                navigateTo(getDefaultRouteForUser(res.data));
            }
        }
    } catch (err) {
        console.warn('[Auth] Supabase session sync skipped:', err);
    }
};

Auth.listenForSupabaseAuth = function() {
    if (!window.APP_CONFIG || window.APP_CONFIG.MODE !== 'cloud') return;
    if (!window.supabase || !window.SmartDineAPI || !SmartDineAPI.client || !SmartDineAPI.client.getAuthClient) return;

    var client = SmartDineAPI.client.getAuthClient();
    if (!client || !client.auth || !client.auth.onAuthStateChange) return;

    client.auth.onAuthStateChange(function(event, session) {
        if ((event !== 'SIGNED_IN' && event !== 'TOKEN_REFRESHED') || !session || !session.user) return;

        var user = {
            name: session.user.user_metadata && (session.user.user_metadata.full_name || session.user.user_metadata.name),
            email: session.user.email,
            role: 'customer',
            provider: 'google'
        };

        Storage.set('smartdine_user', user);
        syncUserDataFromDB(user).catch(function(err) {
            console.warn('[Auth] Cloud profile sync skipped:', err);
        });
        refreshNavbar();
        if (getCurrentRoute() === '/' || isSupabaseAuthCallbackRoute()) {
            navigateTo('/menu');
        }
    });
};

function isSupabaseAuthCallbackRoute() {
    var hash = window.location.hash || '';
    var search = window.location.search || '';
    return hash.indexOf('access_token=') !== -1 ||
        hash.indexOf('refresh_token=') !== -1 ||
        hash.indexOf('error_code=') !== -1 ||
        search.indexOf('code=') !== -1;
}

async function syncUserDataFromDB(user) {
    try {
        if (!user || !user.email || !window.SmartDineAPI) return;
        await SmartDineAPI.upsertProfile(user);
        var stateRes = await SmartDineAPI.getUserState(user.email);
        if (stateRes.error || !stateRes.data) return;

        if (stateRes.data.cart) {
            Storage.set('smartdine_cart', stateRes.data.cart);
        }
        if (stateRes.data.preferences) {
            var pref = stateRes.data.preferences;
            if (pref.theme) Storage.set('smartdine_theme', pref.theme);
            if (pref.selected_table) Storage.set('smartdine_table', pref.selected_table);
            if (pref.guest_count) Storage.set('smartdine_guest_count', pref.guest_count);
            applyTheme();
        }
    } catch (err) {
        console.warn('[Auth] User DB data sync failed:', err);
    }
}

function getDefaultRouteForUser(user) {
    user = user || Auth.getUser();
    if (user && user.role === 'admin') return '/admin';
    if (user && user.role === 'kitchen') return '/kitchen';
    if (user) return '/menu';
    return '/';
}

async function handleLoginSubmit(event, role) {
    event.preventDefault();
    var form = event.target;
    var emailEl = form.querySelector('input[type="email"]') || document.getElementById('login-email');
    var passEl = form.querySelector('input[type="password"]') || document.getElementById('login-password');
    var btn = form.querySelector('button[type="submit"]');
    var email = emailEl ? emailEl.value.trim() : '';
    var password = passEl ? passEl.value.trim() : '';
    var originalBtnHTML = btn ? btn.innerHTML : '';
    
    if (btn) {
        btn.innerHTML = 'Authenticating...';
        btn.disabled = true;
    }
    
    try {
        if (!window.SmartDineAPI || typeof SmartDineAPI.login !== 'function') {
            throw new Error('Login service is unavailable.');
        }

        var res = await SmartDineAPI.login(email, password, role);
        
        if (res.error) {
            showToast('Error', res.error, 'error');
            if (btn) {
                btn.innerHTML = originalBtnHTML;
                btn.disabled = false;
            }
            return;
        }

        Storage.set('smartdine_user', res.data);
        syncUserDataFromDB(res.data).catch(function(err) {
            console.warn('[Auth] Cloud profile sync skipped:', err);
        });
        showToast('Success', 'Welcome back, ' + (res.data.name || 'User') + '!', 'success');
        closeModal();
        refreshNavbar();
        
        if (role === 'admin') navigateTo('/admin');
        else if (role === 'kitchen') navigateTo('/kitchen');
        else navigateTo('/menu');
    } catch (err) {
        showToast('Login Failed', err && err.message ? err.message : 'Unexpected login error.', 'error');
        if (btn) {
            btn.innerHTML = originalBtnHTML;
            btn.disabled = false;
        }
    }
}

function showCustomerLoginModal() {
    var body =
        '<div class="auth-panel">' +
            '<div class="auth-hero">' +
                '<div class="auth-mark">SD</div>' +
                '<h2>Welcome to SmartDine</h2>' +
                '<p>Sign in to order, customize meals, and track your table service.</p>' +
            '</div>' +
            '<button type="button" class="google-login-btn" onclick="handleGoogleLogin()">' +
                '<span class="google-g">G</span>' +
                '<span>Continue with Google</span>' +
            '</button>' +
            '<div id="auth-status" style="margin-top:10px;font-size:0.85rem;color:var(--text-secondary);"></div>' +
            '<div class="auth-divider"><span>Restaurant staff</span></div>' +
            '<button type="button" class="staff-toggle-btn" onclick="closeModal(); navigateTo(\'/staff-login\')">Staff Login</button>' +
        '</div>';
    var modal = showModal('', body, '');
    if (modal) modal.classList.add('auth-modal-shell');
}

function renderStaffLoginCard(role, isPrimary) {
    var staff = STAFF_LOGIN_CREDENTIALS[role];
    var buttonClass = isPrimary ? 'btn btn-primary btn-block btn-lg' : 'btn btn-secondary btn-block btn-lg';
    return (
        '<div class="glass-card" style="padding:24px;display:flex;flex-direction:column;gap:16px;">' +
            '<div>' +
                '<h2 style="margin-bottom:6px;">' + staff.title + '</h2>' +
                '<p class="page-subtitle" style="font-size:0.95rem;">' + staff.description + '</p>' +
            '</div>' +
            '<div style="display:grid;gap:10px;">' +
                '<div class="form-group" style="margin-bottom:0;">' +
                    '<label class="form-label">Email</label>' +
                    '<input type="email" class="form-input" value="' + staff.email + '" readonly>' +
                '</div>' +
                '<div class="form-group" style="margin-bottom:0;">' +
                    '<label class="form-label">Password</label>' +
                    '<input type="password" class="form-input" value="' + staff.password + '" readonly>' +
                '</div>' +
            '</div>' +
            '<button type="button" class="' + buttonClass + '" onclick="performStaffLogin(\'' + role + '\', this)">Login as ' + staff.label + '</button>' +
        '</div>'
    );
}

function renderStaffLoginPage(role) {
    role = role || 'admin';
    var app = document.getElementById('app');
    var title = role === 'kitchen' ? 'Kitchen Staff Login' : (role === 'admin' ? 'Admin Staff Login' : 'Staff Login');

    app.innerHTML =
        '<section class="page-section">' +
            '<div class="container" style="max-width:920px;">' +
                '<div class="page-header" style="display:block;text-align:center;">' +
                    '<h1 class="page-title">' + title + '</h1>' +
                    '<p class="page-subtitle">Use the predefined staff access for dashboards.</p>' +
                '</div>' +
                '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px;">' +
                    renderStaffLoginCard('admin', role === 'admin') +
                    renderStaffLoginCard('kitchen', role === 'kitchen') +
                '</div>' +
            '</div>' +
        '</section>';
}

function renderStaffLogin() {
    renderStaffLoginPage('staff');
}

function renderAdminLogin() {
    renderStaffLoginPage('admin');
}

function renderKitchenLogin() {
    renderStaffLoginPage('kitchen');
}

async function handleGoogleLogin() {
    var statusEl = document.getElementById('auth-status');
    if (statusEl) statusEl.textContent = 'Opening Google sign-in...';

    if (!window.APP_CONFIG || window.APP_CONFIG.MODE !== 'cloud') {
        if (statusEl) statusEl.textContent = 'Google login needs cloud mode.';
        showToast('Google Login', 'Google login needs cloud mode and Supabase Auth enabled.', 'warning');
        return;
    }
    try {
        if (!window.SmartDineAPI || typeof SmartDineAPI.loginWithGoogle !== 'function') {
            throw new Error('Google login service is unavailable.');
        }

        var res = await SmartDineAPI.loginWithGoogle();
        if (res.error) {
            if (statusEl) statusEl.textContent = res.error;
            showToast('Google Login', res.error, 'error');
        } else if (statusEl) {
            statusEl.textContent = 'Redirecting to Google...';
        }
    } catch (err) {
        var message = err && err.message ? err.message : 'Unexpected Google login error.';
        if (statusEl) statusEl.textContent = message;
        showToast('Google Login', message, 'error');
    }
}

function showStaffLoginModal() {
    closeModal();
    navigateTo('/staff-login');
}

async function performStaffLogin(role, button) {
    var staff = STAFF_LOGIN_CREDENTIALS[role];
    if (!staff) {
        showToast('Login Failed', 'Unknown staff role.', 'error');
        return;
    }

    var originalBtnHTML = button ? button.innerHTML : '';
    if (button) {
        button.innerHTML = 'Authenticating...';
        button.disabled = true;
    }

    try {
        var res = await SmartDineAPI.login(staff.email, staff.password, role);
        if (res.error) {
            showToast('Error', res.error, 'error');
            if (button) {
                button.innerHTML = originalBtnHTML;
                button.disabled = false;
            }
            return;
        }

        Storage.set('smartdine_user', res.data);
        syncUserDataFromDB(res.data).catch(function(err) {
            console.warn('[Auth] Cloud profile sync skipped:', err);
        });
        showToast('Success', 'Welcome back, ' + staff.title + '!', 'success');
        refreshNavbar();
        navigateTo(staff.route);
    } catch (err) {
        showToast('Login Failed', err && err.message ? err.message : 'Unexpected staff login error.', 'error');
        if (button) {
            button.innerHTML = originalBtnHTML;
            button.disabled = false;
        }
    }
}

// Global attach
window.showCustomerLoginModal = showCustomerLoginModal;
window.showStaffLoginModal = showStaffLoginModal;
window.renderStaffLogin = renderStaffLogin;
window.renderAdminLogin = renderAdminLogin;
window.renderKitchenLogin = renderKitchenLogin;
window.getDefaultRouteForUser = getDefaultRouteForUser;
window.syncUserDataFromDB = syncUserDataFromDB;
window.handleLoginSubmit = handleLoginSubmit;
window.handleGoogleLogin = handleGoogleLogin;
window.performStaffLogin = performStaffLogin;
