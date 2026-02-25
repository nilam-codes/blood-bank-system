/* ==========================================================
   VITALLINK — SMART BLOOD DONATION SYSTEM
   app.js — All the logic for the app

   HOW THIS FILE IS ORGANIZED:
   1.  App Data (fake database stored in variables)
   2.  Page Navigation helpers
   3.  Modal (popup) helpers
   4.  Registration & Login logic
   5.  Logout
   6.  Toast notification helper
   7.  DONOR DASHBOARD functions
   8.  HOSPITAL DASHBOARD functions
   9.  BLOOD BANK DASHBOARD functions
   10. Donor Matching algorithm
   11. App startup (runs when the page loads)
   ========================================================== */


/* ============================================================
   1. APP DATA — Our "fake database" stored in variables
   In a real app this would come from a server/database.
   We use plain JavaScript arrays and objects here.
   ============================================================ */

// List of all registered users
// Each user has: id, name, email, password, role, city, bloodGroup, available
const API_BASE_URL = 'http://localhost:5000';

// Currently logged-in user (null when not logged in)
var currentUser = null;

// Counter for generating unique IDs for new requests (not used if DB handles it, but kept to prevent errors)
var nextRequestId = 200;


/* ============================================================
   2. PAGE NAVIGATION HELPERS
   These functions show/hide the different "pages" of the app.
   ============================================================ */

// showPage: hides all pages and shows only the one you ask for
function showPage(pageName) {
    // Get all elements with the class "page"
    var pages = document.querySelectorAll('.page');

    // Loop through each page and hide it
    for (var i = 0; i < pages.length; i++) {
        pages[i].classList.remove('active');
    }

    // Show the requested page by adding the "active" class
    var targetPage = document.getElementById('page-' + pageName);
    if (targetPage) {
        targetPage.classList.add('active');
    }
}


/* ============================================================
   3. MODAL HELPERS
   Modals are popup boxes for Login and Register forms.
   ============================================================ */

// openModal: shows the login or register modal
function openModal(modalName) {
    // Show the dark overlay behind the modal
    document.getElementById('modal-overlay').classList.add('active');

    // Show the correct modal
    document.getElementById('modal-' + modalName).classList.add('active');
}

// openModalWithRole: opens the register modal AND pre-selects a role
// Used by the feature cards on the landing page
function openModalWithRole(modalName, role) {
    openModal(modalName);

    // Click the correct role tab to pre-select it
    if (modalName === 'register') {
        // Find the tab button for this role and click it
        var tabMap = { donor: 'reg-tab-donor', hospital: 'reg-tab-hospital', bloodbank: 'reg-tab-bloodbank' };
        var tabId = tabMap[role];
        if (tabId) {
            var tabBtn = document.getElementById(tabId);
            if (tabBtn) {
                setRegisterRole(role, tabBtn);
            }
        }
    }
}

// closeModal: hides all modals and the overlay
function closeModal() {
    document.getElementById('modal-overlay').classList.remove('active');

    // Hide all modal elements
    var modals = document.querySelectorAll('.modal');
    for (var i = 0; i < modals.length; i++) {
        modals[i].classList.remove('active');
    }

    // Clear any error messages
    hideError('login-error');
    hideError('register-error');
}

// setLoginRole: changes the selected role in the login modal
function setLoginRole(role, clickedBtn) {
    // Update the hidden input
    document.getElementById('login-role').value = role;

    // Remove "active" from all role tab buttons
    var tabs = document.querySelectorAll('#modal-login .role-tab');
    for (var i = 0; i < tabs.length; i++) {
        tabs[i].classList.remove('active');
    }

    // Add "active" to the clicked button
    clickedBtn.classList.add('active');
}

// setRegisterRole: changes the selected role in the register modal
function setRegisterRole(role, clickedBtn) {
    // Update the hidden input
    document.getElementById('register-role').value = role;

    // Remove "active" from all role tabs
    var tabs = document.querySelectorAll('#modal-register .role-tab');
    for (var i = 0; i < tabs.length; i++) {
        tabs[i].classList.remove('active');
    }

    // Add "active" to the clicked button
    clickedBtn.classList.add('active');

    // Show/hide the blood group field (only needed for donors)
    var bloodGroupWrap = document.getElementById('reg-blood-group-wrap');
    if (role === 'donor') {
        bloodGroupWrap.classList.remove('hidden');
    } else {
        bloodGroupWrap.classList.add('hidden');
    }
}

// Helper: show an error message element
function showError(id, message) {
    var el = document.getElementById(id);
    if (el) {
        el.textContent = message;
        el.classList.remove('hidden');
    }
}

// Helper: hide an error message element
function hideError(id) {
    var el = document.getElementById(id);
    if (el) {
        el.classList.add('hidden');
    }
}


/* ============================================================
   4. REGISTRATION & LOGIN
   ============================================================ */

// register: creates a new user account
async function register() {
    // Read values from the register form
    var name = document.getElementById('reg-name').value.trim();
    var email = document.getElementById('reg-email').value.trim().toLowerCase();
    var city = document.getElementById('reg-city').value.trim();
    var password = document.getElementById('reg-password').value;
    var role = document.getElementById('register-role').value;
    var blood = document.getElementById('reg-blood-group').value;

    // Validate: make sure required fields are not empty
    if (!name || !email || !city || !password) {
        showError('register-error', 'Please fill in all fields.');
        return; // Stop here if validation fails
    }

    try {
        const response = await fetch(`${API_BASE_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: name,
                email: email,
                password: password,
                role: role,
                city: city,
                blood_group: role === 'donor' ? blood : null,
                phone: ''
            })
        });

        const data = await response.json();

        if (!response.ok) {
            showError('register-error', data.error || 'Registration failed');
            return;
        }

        closeModal();
        showToast('Registration successful! Please sign in using your new credentials.');
    } catch (e) {
        showError('register-error', 'Server error. Is the backend running?');
    }
}

// login: checks credentials and logs the user in
async function login() {
    var email = document.getElementById('login-email').value.trim().toLowerCase();
    var password = document.getElementById('login-password').value;
    var role = document.getElementById('login-role').value;

    try {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email, password: password })
        });

        const data = await response.json();

        if (!response.ok) {
            showError('login-error', data.error || 'Login failed');
            return;
        }

        // The backend returns user info. We map it to currentUser struct.
        var foundUser = {
            name: data.name,
            email: data.email,
            role: data.role,
            city: data.city,
            bloodGroup: data.blood_group,
            available: true // By default, could be updated 
        };

        // Login succeeded
        closeModal();
        loginAsUser(foundUser);
        showToast('Welcome back, ' + foundUser.name + '!');
    } catch (e) {
        showError('login-error', 'Server error. Is the backend running?');
    }
}

// loginAsUser: sets the current user and shows their dashboard
function loginAsUser(user) {
    currentUser = user;

    // Update the navbar: hide login buttons, show user info
    document.getElementById('nav-actions').classList.add('hidden');
    document.getElementById('nav-user').classList.remove('hidden');

    // Set the user's name and role badge in the navbar
    document.getElementById('user-name-display').textContent = user.name;
    document.getElementById('user-role-badge').textContent = user.role.toUpperCase();

    // Navigate to the correct dashboard based on role
    if (user.role === 'donor') {
        loadDonorDashboard();
        showPage('donor');
    } else if (user.role === 'hospital') {
        loadHospitalDashboard();
        showPage('hospital');
    } else if (user.role === 'bloodbank') {
        loadBloodBankDashboard();
        showPage('bloodbank');
    }
}


/* ============================================================
   5. LOGOUT
   ============================================================ */

function logout() {
    // Clear the current user
    currentUser = null;

    // Show the login/register buttons again in the navbar
    document.getElementById('nav-actions').classList.remove('hidden');
    document.getElementById('nav-user').classList.add('hidden');

    // Go back to the landing page
    showPage('landing');
    showToast('You have been logged out.');
}


/* ============================================================
   6. TOAST NOTIFICATION HELPER
   Shows a small popup message at the bottom of the screen.
   ============================================================ */

// We keep a reference to the timeout so we can clear it
var toastTimeout = null;

function showToast(message) {
    var toast = document.getElementById('toast');
    toast.textContent = message;

    // Show the toast by adding the "show" class
    toast.classList.add('show');

    // If there's an existing timer, clear it (reset the countdown)
    if (toastTimeout) {
        clearTimeout(toastTimeout);
    }

    // After 3 seconds, hide the toast
    toastTimeout = setTimeout(function () {
        toast.classList.remove('show');
    }, 3000);
}


/* ============================================================
   7. DONOR DASHBOARD FUNCTIONS
   ============================================================ */

// loadDonorDashboard: fills in all donor dashboard content
function loadDonorDashboard() {
    if (!currentUser) return;

    // Fill profile display
    document.getElementById('donor-display-name').textContent = currentUser.name;
    document.getElementById('donor-display-city').textContent = (currentUser.city || 'City') + ', India';
    document.getElementById('donor-blood-badge').textContent = currentUser.bloodGroup || 'A+';

    // Pre-fill the profile edit form with existing data
    document.getElementById('donor-name-input').value = currentUser.name || '';
    document.getElementById('donor-phone-input').value = currentUser.phone || '';
    document.getElementById('donor-city-input').value = currentUser.city || '';
    document.getElementById('donor-blood-input').value = currentUser.bloodGroup || 'A+';
    document.getElementById('donor-last-donation').value = currentUser.lastDonation || '';
    document.getElementById('donor-age-input').value = currentUser.age || '';

    // Set the availability toggle to match the user's current availability
    var toggle = document.getElementById('availability-toggle');
    toggle.checked = currentUser.available;
    updateAvailabilityDisplay();

    // Update the 90-day gap tracker
    updateDonationGap();

    // Load the requests list
    loadDonorRequests();

    // Load donation history
    loadDonorHistory();
}

// saveDonorProfile: saves the edited profile data
function saveDonorProfile() {
    if (!currentUser) return;

    // Read updated values from the form
    currentUser.name = document.getElementById('donor-name-input').value.trim();
    currentUser.phone = document.getElementById('donor-phone-input').value.trim();
    currentUser.city = document.getElementById('donor-city-input').value.trim();
    currentUser.bloodGroup = document.getElementById('donor-blood-input').value;
    currentUser.lastDonation = document.getElementById('donor-last-donation').value;
    currentUser.age = document.getElementById('donor-age-input').value;

    // Update the profile display card
    document.getElementById('donor-display-name').textContent = currentUser.name;
    document.getElementById('donor-display-city').textContent = currentUser.city + ', India';
    document.getElementById('donor-blood-badge').textContent = currentUser.bloodGroup;

    // Update the navbar name too
    document.getElementById('user-name-display').textContent = currentUser.name;

    // Update the donation gap tracker
    updateDonationGap();

    showToast('✅ Profile saved successfully!');
}

// toggleAvailability: called when the toggle switch is flipped
function toggleAvailability() {
    if (!currentUser) return;

    var toggle = document.getElementById('availability-toggle');
    currentUser.available = toggle.checked;
    updateAvailabilityDisplay();

    var msg = currentUser.available
        ? '✅ You are now available for requests.'
        : '⛔ You are now unavailable.';
    showToast(msg);
}

// updateAvailabilityDisplay: updates the toggle label text and color
function updateAvailabilityDisplay() {
    var statusText = document.getElementById('toggle-status-text');
    var availNote = document.getElementById('avail-note');

    if (currentUser.available) {
        statusText.textContent = 'Available';
        statusText.style.color = 'var(--success)';
        availNote.textContent = 'You can receive blood requests.';
    } else {
        statusText.textContent = 'Unavailable';
        statusText.style.color = 'var(--muted)';
        availNote.textContent = 'You will not receive new requests.';
    }
}

// updateDonationGap: calculates how many days since last donation
// and shows a progress bar (90 days required between donations)
async function updateDonationGap() {
    var bar = document.getElementById('donation-gap-bar');
    var text = document.getElementById('donation-gap-text');

    if (!currentUser) return;

    try {
        const response = await fetch(`${API_BASE_URL}/check-eligibility?email=${encodeURIComponent(currentUser.email)}`);
        const data = await response.json();

        if (data.eligible) {
            bar.style.width = '100%';
            bar.style.background = 'var(--success)';
            text.textContent = '✅ ' + data.message;
            text.style.color = 'var(--success)';
        } else {
            bar.style.width = '20%';
            bar.style.background = 'var(--crimson)';
            text.textContent = '⏳ ' + data.message;
            text.style.color = 'var(--muted)';
        }
    } catch (e) {
        text.textContent = 'Error checking eligibility.';
    }
}

// loadDonorRequests: shows blood requests that match the donor's blood group
async function loadDonorRequests() {
    var container = document.getElementById('donor-requests-list');
    if (!container) return;

    try {
        const response = await fetch(`${API_BASE_URL}/openrequests?blood_group=${encodeURIComponent(currentUser.bloodGroup)}`);
        const matchingRequests = await response.json();

        // Update the badge count
        document.getElementById('donor-req-badge').textContent = matchingRequests.length;

        // If no matching requests, show empty state
        if (matchingRequests.length === 0) {
            container.innerHTML = getEmptyStateHTML('🎉', 'No active requests for your blood group right now.');
            return;
        }

        // Build HTML for each request card
        var html = '';
        for (var j = 0; j < matchingRequests.length; j++) {
            var r = matchingRequests[j];
            var reqObj = {
                id: r.id,
                urgency: r.urgency,
                bloodGroup: r.blood_group,
                hospitalName: r.hospital_name,
                patientName: r.patient_email,
                city: r.city || 'Unknown',
                units: r.units_needed,
                date: new Date(r.created_at).toLocaleDateString(),
                notes: ''
            };
            html += buildDonorRequestCard(reqObj);
        }
        container.innerHTML = html;
    } catch (e) {
        container.innerHTML = getEmptyStateHTML('⚠️', 'Error loading requests.');
    }
}

// buildDonorRequestCard: returns HTML string for a single request card
function buildDonorRequestCard(req) {
    return '<div class="request-card ' + req.urgency + '" id="req-card-' + req.id + '">' +
        '<div class="req-blood-group">' + req.bloodGroup + '</div>' +
        '<div class="req-info">' +
        '<div class="req-title">' + req.hospitalName + '</div>' +
        '<div style="color:var(--muted);font-size:0.88rem">Patient: ' + req.patientName + '</div>' +
        '<div class="req-meta">' +
        '<span>📍 ' + req.city + '</span>' +
        '<span>🩸 ' + req.units + ' unit(s)</span>' +
        '<span>' + req.date + '</span>' +
        (req.notes ? '<span>📝 ' + req.notes + '</span>' : '') +
        '</div>' +
        '</div>' +
        '<div class="req-actions">' +
        '<span class="urgency-pill ' + req.urgency + '">' + req.urgency + '</span>' +
        '<button class="btn btn-success btn-sm" onclick="respondToRequest(' + req.id + ', true, ' + req.units + ', \'' + req.bloodGroup + '\')">Accept</button>' +
        '<button class="btn btn-ghost btn-sm" onclick="respondToRequest(' + req.id + ', false, ' + req.units + ', \'' + req.bloodGroup + '\')">Decline</button>' +
        '</div>' +
        '</div>';
}

// respondToRequest: called when donor clicks Accept or Decline
async function respondToRequest(requestId, accepted, units, bloodGroup) {
    if (!accepted) {
        showToast('Request declined. You can change your mind anytime.');
        removeCardLocally(requestId, false);
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/donate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                donor_email: currentUser.email,
                blood_group: bloodGroup,
                units: units,
                request_id: requestId
            })
        });

        const data = await response.json();

        if (!response.ok) {
            showToast('⚠️ ' + (data.error || 'Failed to accept request'));
            return;
        }

        showToast('✅ Great! You accepted the request. ' + data.message);
        removeCardLocally(requestId, true);

        // Update the request status
        setTimeout(function () {
            loadDonorRequests();
            updateDonationGap(); // Refresh eligibility
        }, 1500);

    } catch (e) {
        showToast('⚠️ Error responding to request.');
    }
}

function removeCardLocally(requestId, accepted) {
    var card = document.getElementById('req-card-' + requestId);
    if (card) {
        card.style.opacity = '0.4';
        card.style.pointerEvents = 'none';

        var label = document.createElement('div');
        label.style = 'text-align:center;padding:0.5rem;color:var(--muted);font-size:0.85rem;';
        label.textContent = accepted ? '✅ Accepted' : '❌ Declined';
        card.appendChild(label);
    }
}

// loadDonorHistory: shows past donation history
async function loadDonorHistory() {
    var container = document.getElementById('donor-history-list');
    if (!container) return;

    try {
        const response = await fetch(`${API_BASE_URL}/mydonations?email=${encodeURIComponent(currentUser.email)}`);
        const donorHistory = await response.json();

        if (donorHistory.length === 0) {
            container.innerHTML = getEmptyStateHTML('📋', 'No donation history yet.');
            return;
        }

        var html = '';
        for (var i = 0; i < donorHistory.length; i++) {
            var h = donorHistory[i];
            html += '<div class="history-item">' +
                '<div class="history-icon">🩸</div>' +
                '<div class="history-info">' +
                '<strong>' + (h.request_id ? 'Donated for Request #' + h.request_id : 'Donation') + '</strong>' +
                '<span>' + h.blood_group + ' · ' + h.units + ' unit(s) · Completed</span>' +
                '</div>' +
                '<div class="history-date">' + new Date(h.donated_at).toLocaleDateString() + '</div>' +
                '</div>';
        }
        container.innerHTML = html;
    } catch (e) {
        container.innerHTML = getEmptyStateHTML('⚠️', 'Error loading history.');
    }
}

// showDonorTab: switches between tabs in the donor dashboard
function showDonorTab(tabName, clickedLink) {
    switchTab('donor', tabName, clickedLink);
}


/* ============================================================
   8. HOSPITAL DASHBOARD FUNCTIONS
   ============================================================ */

// loadHospitalDashboard: fills in all hospital dashboard content
function loadHospitalDashboard() {
    if (!currentUser) return;

    // Pre-fill the city in the request form
    document.getElementById('req-city').value = currentUser.city || '';

    // Load the active requests list
    loadHospitalRequests();
}

// createBloodRequest: called when hospital submits the form
async function createBloodRequest() {
    var patientName = document.getElementById('req-patient-name').value.trim();
    var bloodGroup = document.getElementById('req-blood-group').value;
    var units = parseInt(document.getElementById('req-units').value);
    var urgency = document.getElementById('req-urgency').value;
    var city = document.getElementById('req-city').value.trim();
    var notes = document.getElementById('req-notes').value.trim();

    if (!patientName || !city || !units || units < 1) {
        showToast('⚠️ Please fill in all required fields.');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/request`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                patient_email: currentUser.email,
                blood_group: bloodGroup,
                units_needed: units,
                hospital_name: currentUser.name,
                city: city,
                urgency: urgency
            })
        });

        const data = await response.json();
        if (!response.ok) {
            showToast('⚠️ Failed to create request.');
            return;
        }

        loadHospitalRequests();

        document.getElementById('req-patient-name').value = '';
        document.getElementById('req-units').value = '';
        document.getElementById('req-notes').value = '';

        const matchRes = await fetch(`${API_BASE_URL}/match-donors?blood_group=${encodeURIComponent(bloodGroup)}&city=${encodeURIComponent(city)}`);
        const matchData = await matchRes.json();
        showMatchResults(matchData.donors || [], data);

        showToast('🚨 ' + data.message + ' ' + (data.note || ''));
    } catch (e) {
        showToast('⚠️ Error creating request.');
    }
}

// findMatchingDonors: finds donors that match blood group + city + are available
function showMatchResults(donors, request) {
    var container = document.getElementById('matched-donors-list');
    var wrapper = document.getElementById('match-results');

    if (!container || !wrapper) return;

    wrapper.classList.remove('hidden');

    if (!donors || donors.length === 0) {
        container.innerHTML = getEmptyStateHTML('😔', 'No matching donors found right now. The request has been posted and donors will be notified when available.');
        return;
    }

    var html = '';
    for (var i = 0; i < donors.length; i++) {
        var d = donors[i];
        html += '<div class="request-card">' +
            '<div class="req-blood-group">' + d.blood_group + '</div>' +
            '<div class="req-info">' +
            '<div class="req-title">' + d.name + '</div>' +
            '<div class="req-meta">' +
            '<span>📍 ' + (d.city || 'Unknown') + '</span>' +
            '<span>📞 ' + (d.phone || 'Not provided') + '</span>' +
            '<span>🟢 Available</span>' +
            '</div>' +
            '</div>' +
            '<div class="req-actions">' +
            '<span class="status-pill matched">Notified</span>' +
            '</div>' +
            '</div>';
    }
    container.innerHTML = html;
}

// loadHospitalRequests: shows all requests created by this hospital
async function loadHospitalRequests() {
    var container = document.getElementById('hospital-requests-list');
    if (!container) return;

    try {
        const response = await fetch(`${API_BASE_URL}/myrequests?email=${encodeURIComponent(currentUser.email)}`);
        const myRequests = await response.json();

        var openCount = 0;
        for (var j = 0; j < myRequests.length; j++) {
            if (myRequests[j].status === 'pending') openCount++;
        }
        document.getElementById('hosp-active-badge').textContent = openCount;

        if (myRequests.length === 0) {
            container.innerHTML = getEmptyStateHTML('📡', 'No blood requests yet. Create one!');
            return;
        }

        var html = '';
        for (var k = 0; k < myRequests.length; k++) {
            var r = myRequests[k];
            html += '<div class="request-card ' + r.urgency + '">' +
                '<div class="req-blood-group">' + r.blood_group + '</div>' +
                '<div class="req-info">' +
                '<div class="req-title">' + (r.hospital_name || 'Hospital') + '</div>' +
                '<div class="req-meta">' +
                '<span>🩸 ' + r.units_needed + ' unit(s)</span>' +
                '<span>📍 ' + r.city + '</span>' +
                '<span>' + new Date(r.created_at).toLocaleDateString() + '</span>' +
                '</div>' +
                '</div>' +
                '<div class="req-actions">' +
                '<span class="urgency-pill ' + r.urgency + '">' + r.urgency + '</span>' +
                '<span class="status-pill ' + r.status + '">' + r.status + '</span>' +
                (r.status === 'pending' ?
                    '<button class="btn btn-ghost btn-sm" onclick="cancelRequest(' + r.id + ')">Cancel</button>'
                    : '') +
                '</div>' +
                '</div>';
        }
        container.innerHTML = html;

        loadMatchedDonors();
    } catch (e) {
        container.innerHTML = getEmptyStateHTML('⚠️', 'Error loading requests.');
    }
}

// cancelRequest: marks a request as cancelled
async function cancelRequest(requestId) {
    try {
        const response = await fetch(`${API_BASE_URL}/request/update/${requestId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'cancelled', role: 'admin' })
        });
        if (response.ok) {
            loadHospitalRequests();
            showToast('Request cancelled.');
        } else {
            showToast('Failed to cancel request.');
        }
    } catch (e) {
        showToast('Error cancelling request.');
    }
}

function loadMatchedDonors() {
    var container = document.getElementById('matched-list');
    if (!container) return;

    container.innerHTML = getEmptyStateHTML('✅', 'Confirmed donors are coordinated via backend.');
}

// showHospitalTab: switches between tabs in the hospital dashboard
function showHospitalTab(tabName, clickedLink) {
    switchTab('hospital', tabName, clickedLink);
}


var bloodInventory = {};
var updateLog = [];

async function loadBloodBankDashboard() {
    try {
        const response = await fetch(`${API_BASE_URL}/inventory`);
        const inventoryArray = await response.json();

        var inventoryMap = {};
        for (var i = 0; i < inventoryArray.length; i++) {
            inventoryMap[inventoryArray[i].blood_group] = {
                units: inventoryArray[i].units_available,
                expiry: '2025-12-31',
                lastUpdated: new Date(inventoryArray[i].last_updated || Date.now()).toLocaleDateString()
            };
        }

        var groups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
        for (var g of groups) {
            if (!inventoryMap[g]) {
                inventoryMap[g] = { units: 0, expiry: '--', lastUpdated: '--' };
            }
        }

        bloodInventory = inventoryMap;

        renderInventorySummary();
        renderStockTable();
        renderAlerts();
    } catch (e) {
        showToast('⚠️ Error loading inventory.');
    }
}

// renderInventorySummary: renders the 8 summary cards (one per blood group)
function renderInventorySummary() {
    var container = document.getElementById('inventory-summary');
    if (!container) return;

    var html = '';
    // Loop through each blood group
    var groups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
    for (var i = 0; i < groups.length; i++) {
        var group = groups[i];
        var inv = bloodInventory[group];

        // Flag low stock (less than 5 units)
        var isLow = inv.units < 5;

        html += '<div class="inv-card' + (isLow ? ' low-stock' : '') + '">' +
            '<div class="inv-blood-type">' + group + '</div>' +
            '<div class="inv-units">' + inv.units + '</div>' +
            '<div class="inv-label">units' + (isLow ? ' ⚠️ LOW' : '') + '</div>' +
            '</div>';
    }
    container.innerHTML = html;
}

// renderStockTable: renders the detailed stock table
function renderStockTable() {
    var tbody = document.getElementById('stock-table-body');
    if (!tbody) return;

    var html = '';
    var groups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

    for (var i = 0; i < groups.length; i++) {
        var group = groups[i];
        var inv = bloodInventory[group];

        // Determine stock status
        var statusText, statusClass;
        if (inv.units === 0) {
            statusText = 'Out of Stock';
            statusClass = 'critical';
        } else if (inv.units < 5) {
            statusText = 'Low Stock';
            statusClass = 'urgent';
        } else {
            statusText = 'Adequate';
            statusClass = 'normal';
        }

        // Check if expiry is soon (within 14 days)
        var expiryWarning = '';
        var expiryDate = new Date(inv.expiry);
        var today = new Date();
        var daysToExpiry = Math.floor((expiryDate - today) / (1000 * 60 * 60 * 24));
        if (daysToExpiry < 14) {
            expiryWarning = ' ⚠️';
        }

        html += '<tr>' +
            '<td class="blood-type-cell">' + group + '</td>' +
            '<td><strong>' + inv.units + '</strong> units</td>' +
            '<td>' + inv.expiry + expiryWarning + '</td>' +
            '<td><span class="urgency-pill ' + statusClass + '">' + statusText + '</span></td>' +
            '<td style="color:var(--muted);font-size:0.85rem">' + inv.lastUpdated + '</td>' +
            '</tr>';
    }

    tbody.innerHTML = html;
}

function updateInventory() {
    var group = document.getElementById('bank-blood-group').value;
    var units = parseInt(document.getElementById('bank-units').value);
    var expiry = document.getElementById('bank-expiry').value;
    var action = document.getElementById('bank-action').value;

    if (isNaN(units) || units < 0) {
        showToast('⚠️ Please enter a valid number of units.');
        return;
    }

    var inv = bloodInventory[group];
    if (!inv) return;
    var oldUnits = inv.units;

    if (action === 'set') {
        inv.units = units;
    } else if (action === 'add') {
        inv.units = inv.units + units;
    } else if (action === 'subtract') {
        inv.units = Math.max(0, inv.units - units);
    }

    if (expiry) inv.expiry = expiry;
    inv.lastUpdated = getTodayDate();

    var logMessage = group + ': ' + oldUnits + ' → ' + inv.units + ' units (' + action + ') | ' + getTodayDate();
    updateLog.unshift(logMessage);

    renderInventorySummary();
    renderStockTable();
    renderAlerts();
    renderUpdateLog();
    updateAlertsBadge();

    showToast('✅ Local update only (Backend API for direct update not implemented)');
}

// renderUpdateLog: shows the recent update history
function renderUpdateLog() {
    var container = document.getElementById('update-log');
    var wrapper = document.getElementById('update-log-wrap');

    if (!container || updateLog.length === 0) return;

    // Show the wrapper
    wrapper.classList.remove('hidden');

    var html = '';
    // Show up to the last 10 updates
    var limit = Math.min(updateLog.length, 10);
    for (var i = 0; i < limit; i++) {
        html += '<li>' + updateLog[i] + '</li>';
    }
    container.innerHTML = html;
}

// renderAlerts: shows blood groups that are low or out of stock
function renderAlerts() {
    var container = document.getElementById('alerts-list');
    if (!container) return;

    var alerts = [];
    var groups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

    for (var i = 0; i < groups.length; i++) {
        var group = groups[i];
        var inv = bloodInventory[group];

        if (inv.units === 0) {
            alerts.push({ group: group, type: 'danger', message: 'OUT OF STOCK — Immediate restocking required!' });
        } else if (inv.units < 5) {
            alerts.push({ group: group, type: 'warning', message: 'LOW STOCK — Only ' + inv.units + ' units remaining.' });
        }

        // Check for expiry warning (within 14 days)
        var expiryDate = new Date(inv.expiry);
        var today = new Date();
        var daysToExpiry = Math.floor((expiryDate - today) / (1000 * 60 * 60 * 24));
        if (daysToExpiry < 14 && inv.units > 0) {
            alerts.push({ group: group, type: 'warning', message: 'EXPIRING SOON — Expires in ' + daysToExpiry + ' day(s) on ' + inv.expiry });
        }
    }

    // Update badge
    document.getElementById('bank-alert-badge').textContent = alerts.length;

    if (alerts.length === 0) {
        container.innerHTML = getEmptyStateHTML('✅', 'No alerts right now. All stock levels are adequate.');
        return;
    }

    var html = '';
    for (var j = 0; j < alerts.length; j++) {
        var a = alerts[j];
        html += '<div class="alert-card">' +
            '<div class="alert-icon">' + (a.type === 'danger' ? '🔴' : '🟡') + '</div>' +
            '<div class="alert-text">' +
            '<strong>Blood Group ' + a.group + '</strong>' +
            '<span>' + a.message + '</span>' +
            '</div>' +
            '</div>';
    }
    container.innerHTML = html;
}

// updateAlertsBadge: updates the number on the alerts sidebar link
function updateAlertsBadge() {
    var count = 0;
    var groups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
    for (var i = 0; i < groups.length; i++) {
        if (bloodInventory[groups[i]].units < 5) count++;
    }
    var badge = document.getElementById('bank-alert-badge');
    if (badge) badge.textContent = count;
}

// showBankTab: switches between tabs in the blood bank dashboard
function showBankTab(tabName, clickedLink) {
    switchTab('bloodbank', tabName, clickedLink);
}


/* ============================================================
   10. SHARED TAB SWITCHING HELPER
   This is used by all three dashboards to switch between tabs.
   ============================================================ */

// switchTab: hides all tabs for a dashboard and shows the selected one
// dashboardPrefix: 'donor', 'hospital', or 'bloodbank'
// tabName: the name of the tab to show
// clickedLink: the sidebar link that was clicked (to mark it active)
function switchTab(dashboardPrefix, tabName, clickedLink) {
    // Find all tabs in this dashboard
    var page = document.getElementById('page-' + dashboardPrefix);
    if (!page) return;

    var tabs = page.querySelectorAll('.dash-tab');

    // Hide all tabs
    for (var i = 0; i < tabs.length; i++) {
        tabs[i].classList.remove('active');
    }

    // Show the requested tab
    var targetTab = document.getElementById(dashboardPrefix + '-tab-' + tabName);
    if (targetTab) {
        targetTab.classList.add('active');
    }

    // Update the sidebar active link
    var sidebar = page.querySelector('.sidebar');
    if (sidebar) {
        var links = sidebar.querySelectorAll('.sidebar-link');
        for (var j = 0; j < links.length; j++) {
            links[j].classList.remove('active');
        }
    }

    // Mark the clicked link as active
    if (clickedLink) {
        clickedLink.classList.add('active');
    }

    // Prevent the <a> tag from navigating to #
    return false;
}

// Prevent <a href="#"> from adding # to the URL
document.addEventListener('click', function (e) {
    if (e.target.tagName === 'A' && e.target.getAttribute('href') === '#') {
        e.preventDefault();
    }
});


/* ============================================================
   11. UTILITY FUNCTIONS
   Small helpers used in multiple places.
   ============================================================ */

// findById: searches an array for an item with a matching id
function findById(arr, id) {
    for (var i = 0; i < arr.length; i++) {
        if (arr[i].id === id) return arr[i];
    }
    return null; // Return null if not found
}

// getTodayDate: returns today's date as a string "YYYY-MM-DD"
function getTodayDate() {
    var today = new Date();
    var year = today.getFullYear();
    var month = String(today.getMonth() + 1).padStart(2, '0'); // +1 because months start at 0
    var day = String(today.getDate()).padStart(2, '0');
    return year + '-' + month + '-' + day;
}

// getEmptyStateHTML: returns HTML for an empty state message
function getEmptyStateHTML(icon, message) {
    return '<div class="empty-state">' +
        '<div class="empty-icon">' + icon + '</div>' +
        '<p>' + message + '</p>' +
        '</div>';
}

// scrollToFeatures: smooth scrolls to the features section on the landing page
function scrollToFeatures() {
    var features = document.getElementById('features');
    if (features) {
        features.scrollIntoView({ behavior: 'smooth' });
    }
}


/* ============================================================
   12. APP STARTUP
   This code runs automatically when the page first loads.
   ============================================================ */

// We don't need to do much on startup — just show the landing page.
// The landing page is shown by default (it has class "active" in HTML).
// But we also initialize the inventory alert badge.

// Count initial low-stock alerts
// Note: Initial alerts are calculated once the Blood Bank signs in and fetches inventory.

// Animate the stats numbers on the landing page on load
// This creates a counting-up animation effect
window.addEventListener('load', function () {
    animateCounter('stat-donors', 0, 1284, 1500);
    animateCounter('stat-requests', 0, 37, 800);
    animateCounter('stat-saved', 0, 8921, 2000);
});

// animateCounter: counts from 'start' to 'end' over 'duration' milliseconds
function animateCounter(elementId, start, end, duration) {
    var element = document.getElementById(elementId);
    if (!element) return;

    var startTime = null;

    function step(currentTime) {
        // On first frame, record the start time
        if (!startTime) startTime = currentTime;

        // Calculate how far through the animation we are (0 to 1)
        var progress = Math.min((currentTime - startTime) / duration, 1);

        // Calculate the current number to display
        var current = Math.floor(start + (end - start) * progress);

        // Format with commas (e.g. 1284 → "1,284")
        element.textContent = current.toLocaleString();

        // Keep animating until we reach the end
        if (progress < 1) {
            requestAnimationFrame(step);
        }
    }

    requestAnimationFrame(step);
}

// Log a welcome message for developers looking at the console
console.log('%c🩸 VitalLink — Smart Blood Donation System', 'color: #e8192c; font-size: 1.2rem; font-weight: bold;');
console.log('Demo accounts:\n  donor@test.com / 123 (role: donor)\n  hospital@test.com / 123 (role: hospital)\n  bank@test.com / 123 (role: bloodbank)');