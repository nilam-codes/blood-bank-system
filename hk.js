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
var users = [
    {
        id: 1,
        name: "Arjun Mehta",
        email: "donor@test.com",
        password: "123",
        role: "donor",
        city: "Mumbai",
        bloodGroup: "O+",
        available: true,
        phone: "+91 98765 43210",
        age: 28,
        lastDonation: "2024-10-01"
    },
    {
        id: 2,
        name: "City General Hospital",
        email: "hospital@test.com",
        password: "123",
        role: "hospital",
        city: "Mumbai"
    },
    {
        id: 3,
        name: "LifeLine Blood Bank",
        email: "bank@test.com",
        password: "123",
        role: "bloodbank",
        city: "Mumbai"
    }
];

// Blood requests created by hospitals
var bloodRequests = [
    {
        id: 101,
        hospitalName: "City General Hospital",
        patientName: "Rahul Sharma",
        bloodGroup: "O+",
        units: 2,
        urgency: "critical",
        city: "Mumbai",
        status: "open",          // open | matched | fulfilled | cancelled
        date: "2025-01-15",
        notes: "Surgery in 2 hours"
    },
    {
        id: 102,
        hospitalName: "City General Hospital",
        patientName: "Priya Nair",
        bloodGroup: "A+",
        units: 1,
        urgency: "urgent",
        city: "Mumbai",
        status: "matched",
        date: "2025-01-14",
        notes: ""
    },
    {
        id: 103,
        hospitalName: "Apollo Hospital",
        patientName: "Vikram Singh",
        bloodGroup: "O+",
        units: 3,
        urgency: "normal",
        city: "Delhi",
        status: "open",
        date: "2025-01-13",
        notes: "Elective surgery"
    }
];

// Blood bank inventory
// Stores units available for each blood group
var bloodInventory = {
    "A+": { units: 15, expiry: "2025-03-10", lastUpdated: "2025-01-10" },
    "A-": { units: 3, expiry: "2025-02-28", lastUpdated: "2025-01-08" },
    "B+": { units: 22, expiry: "2025-03-15", lastUpdated: "2025-01-12" },
    "B-": { units: 2, expiry: "2025-02-20", lastUpdated: "2025-01-05" },
    "O+": { units: 8, expiry: "2025-03-05", lastUpdated: "2025-01-11" },
    "O-": { units: 1, expiry: "2025-02-15", lastUpdated: "2025-01-07" },
    "AB+": { units: 10, expiry: "2025-03-20", lastUpdated: "2025-01-09" },
    "AB-": { units: 0, expiry: "2025-02-10", lastUpdated: "2025-01-06" }
};

// Donor donation history and accepted requests
var donorHistory = [
    { date: "2024-10-01", hospital: "City General Hospital", units: 1, bloodGroup: "O+", status: "Donated" },
    { date: "2024-06-15", hospital: "Apollo Hospital", units: 1, bloodGroup: "O+", status: "Donated" }
];

// Update log for blood bank
var updateLog = [];

// Currently logged-in user (null when not logged in)
var currentUser = null;

// Counter for generating unique IDs for new requests
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
function register() {
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

    // Check if email is already used
    for (var i = 0; i < users.length; i++) {
        if (users[i].email === email) {
            showError('register-error', 'This email is already registered. Please sign in.');
            return;
        }
    }

    // Build the new user object
    var newUser = {
        id: users.length + 1,
        name: name,
        email: email,
        password: password,
        role: role,
        city: city,
        bloodGroup: role === 'donor' ? blood : null,
        available: role === 'donor' ? true : false,
        phone: '',
        age: '',
        lastDonation: ''
    };

    // Add the new user to our users array
    users.push(newUser);

    // Log the user in immediately after registering
    closeModal();
    loginAsUser(newUser);
    showToast('Welcome to VitalLink, ' + name + '! 🎉');
}

// login: checks credentials and logs the user in
function login() {
    var email = document.getElementById('login-email').value.trim().toLowerCase();
    var password = document.getElementById('login-password').value;
    var role = document.getElementById('login-role').value;

    // Find a user that matches email + password + role
    var foundUser = null;
    for (var i = 0; i < users.length; i++) {
        if (users[i].email === email &&
            users[i].password === password &&
            users[i].role === role) {
            foundUser = users[i];
            break; // Stop searching once found
        }
    }

    // If no match found, show error
    if (!foundUser) {
        showError('login-error', 'Incorrect email, password, or role. Try again.');
        return;
    }

    // Login succeeded
    closeModal();
    loginAsUser(foundUser);
    showToast('Welcome back, ' + foundUser.name + '!');
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
function updateDonationGap() {
    var lastDonation = currentUser.lastDonation;
    if (!lastDonation) {
        document.getElementById('donation-gap-text').textContent =
            'No last donation date set. Please update your profile.';
        document.getElementById('donation-gap-bar').style.width = '0%';
        return;
    }

    // Calculate days since last donation
    var lastDate = new Date(lastDonation);
    var today = new Date();
    var diffMs = today - lastDate;           // difference in milliseconds
    var diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24)); // convert to days

    var requiredDays = 90;

    // Calculate percentage (cap at 100%)
    var percent = Math.min((diffDays / requiredDays) * 100, 100);

    var bar = document.getElementById('donation-gap-bar');
    var text = document.getElementById('donation-gap-text');

    // Set the bar width
    bar.style.width = percent + '%';

    if (diffDays >= requiredDays) {
        // Eligible: green bar
        bar.style.background = 'var(--success)';
        text.textContent = '✅ You are eligible to donate! (' + diffDays + ' days since last donation)';
        text.style.color = 'var(--success)';
    } else {
        // Not eligible yet: red bar
        var daysLeft = requiredDays - diffDays;
        bar.style.background = 'var(--crimson)';
        text.textContent = '⏳ ' + daysLeft + ' more days until you can donate again. (' + diffDays + '/' + requiredDays + ' days passed)';
        text.style.color = 'var(--muted)';
    }
}

// loadDonorRequests: shows blood requests that match the donor's blood group
function loadDonorRequests() {
    var container = document.getElementById('donor-requests-list');
    if (!container) return;

    // Filter requests that match this donor's blood group and are open
    var matchingRequests = [];
    for (var i = 0; i < bloodRequests.length; i++) {
        var req = bloodRequests[i];
        // Check if blood group matches and request is open
        if (req.bloodGroup === currentUser.bloodGroup && req.status === 'open') {
            matchingRequests.push(req);
        }
    }

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
        html += buildDonorRequestCard(r);
    }
    container.innerHTML = html;
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
        '<button class="btn btn-success btn-sm" onclick="respondToRequest(' + req.id + ', true)">Accept</button>' +
        '<button class="btn btn-ghost btn-sm" onclick="respondToRequest(' + req.id + ', false)">Decline</button>' +
        '</div>' +
        '</div>';
}

// respondToRequest: called when donor clicks Accept or Decline
function respondToRequest(requestId, accepted) {
    // Find the request in our array
    var request = findById(bloodRequests, requestId);
    if (!request) return;

    if (accepted) {
        // Mark the request as matched
        request.status = 'matched';

        // Add to donor history
        donorHistory.unshift({
            date: getTodayDate(),
            hospital: request.hospitalName,
            units: request.units,
            bloodGroup: request.bloodGroup,
            status: 'Accepted'
        });

        showToast('✅ Great! You accepted the request. The hospital has been notified.');
    } else {
        showToast('Request declined. You can change your mind anytime.');
    }

    // Remove this card from the view
    var card = document.getElementById('req-card-' + requestId);
    if (card) {
        card.style.opacity = '0.4';
        card.style.pointerEvents = 'none';

        // Add a declined label
        var label = document.createElement('div');
        label.style = 'text-align:center;padding:0.5rem;color:var(--muted);font-size:0.85rem;';
        label.textContent = accepted ? '✅ Accepted' : '❌ Declined';
        card.appendChild(label);
    }

    // Reload the requests list after a short delay
    setTimeout(function () {
        loadDonorRequests();
    }, 1500);
}

// loadDonorHistory: shows past donation history
function loadDonorHistory() {
    var container = document.getElementById('donor-history-list');
    if (!container) return;

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
            '<strong>' + h.hospital + '</strong>' +
            '<span>' + h.bloodGroup + ' · ' + h.units + ' unit(s) · ' + h.status + '</span>' +
            '</div>' +
            '<div class="history-date">' + h.date + '</div>' +
            '</div>';
    }
    container.innerHTML = html;
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
function createBloodRequest() {
    // Read form values
    var patientName = document.getElementById('req-patient-name').value.trim();
    var bloodGroup = document.getElementById('req-blood-group').value;
    var units = parseInt(document.getElementById('req-units').value);
    var urgency = document.getElementById('req-urgency').value;
    var city = document.getElementById('req-city').value.trim();
    var notes = document.getElementById('req-notes').value.trim();

    // Validate required fields
    if (!patientName || !city || !units || units < 1) {
        showToast('⚠️ Please fill in all required fields.');
        return;
    }

    // Create the new request object
    var newRequest = {
        id: nextRequestId++,
        hospitalName: currentUser.name,
        patientName: patientName,
        bloodGroup: bloodGroup,
        units: units,
        urgency: urgency,
        city: city,
        status: 'open',
        date: getTodayDate(),
        notes: notes
    };

    // Add to the requests array
    bloodRequests.unshift(newRequest); // Add to the start of the array

    // Update the active requests badge
    loadHospitalRequests();

    // Find matching donors and show them
    var matched = findMatchingDonors(bloodGroup, city);
    showMatchResults(matched, newRequest);

    showToast('🚨 Blood request created! Notifying ' + matched.length + ' donor(s)...');

    // Clear the form
    document.getElementById('req-patient-name').value = '';
    document.getElementById('req-units').value = '';
    document.getElementById('req-notes').value = '';
}

// findMatchingDonors: finds donors that match blood group + city + are available
function findMatchingDonors(bloodGroup, city) {
    var matched = [];

    for (var i = 0; i < users.length; i++) {
        var user = users[i];

        // Only look at donors
        if (user.role !== 'donor') continue;

        // Check if blood group matches
        if (user.bloodGroup !== bloodGroup) continue;

        // Check if donor is available
        if (!user.available) continue;

        // Check if 90-day gap has passed
        if (user.lastDonation) {
            var lastDate = new Date(user.lastDonation);
            var today = new Date();
            var diffDays = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
            if (diffDays < 90) continue; // Skip if less than 90 days
        }

        // Donor matches! Add to results.
        matched.push(user);
    }

    return matched;
}

// showMatchResults: displays the matched donors after a request is created
function showMatchResults(donors, request) {
    var container = document.getElementById('matched-donors-list');
    var wrapper = document.getElementById('match-results');

    if (!container || !wrapper) return;

    // Show the results section
    wrapper.classList.remove('hidden');

    if (donors.length === 0) {
        container.innerHTML = getEmptyStateHTML('😔', 'No matching donors found right now. The request has been posted and donors will be notified when available.');
        return;
    }

    var html = '';
    for (var i = 0; i < donors.length; i++) {
        var d = donors[i];
        html += '<div class="request-card">' +
            '<div class="req-blood-group">' + d.bloodGroup + '</div>' +
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
function loadHospitalRequests() {
    var container = document.getElementById('hospital-requests-list');
    if (!container) return;

    // Filter requests created by this hospital
    var myRequests = [];
    for (var i = 0; i < bloodRequests.length; i++) {
        if (bloodRequests[i].hospitalName === currentUser.name) {
            myRequests.push(bloodRequests[i]);
        }
    }

    // Update badge: count of open requests
    var openCount = 0;
    for (var j = 0; j < myRequests.length; j++) {
        if (myRequests[j].status === 'open') openCount++;
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
            '<div class="req-blood-group">' + r.bloodGroup + '</div>' +
            '<div class="req-info">' +
            '<div class="req-title">Patient: ' + r.patientName + '</div>' +
            '<div class="req-meta">' +
            '<span>🩸 ' + r.units + ' unit(s)</span>' +
            '<span>📍 ' + r.city + '</span>' +
            '<span>' + r.date + '</span>' +
            '</div>' +
            '</div>' +
            '<div class="req-actions">' +
            '<span class="urgency-pill ' + r.urgency + '">' + r.urgency + '</span>' +
            '<span class="status-pill ' + r.status + '">' + r.status + '</span>' +
            (r.status === 'open' ?
                '<button class="btn btn-ghost btn-sm" onclick="cancelRequest(' + r.id + ')">Cancel</button>'
                : '') +
            '</div>' +
            '</div>';
    }
    container.innerHTML = html;

    // Also load matched donors list
    loadMatchedDonors();
}

// cancelRequest: marks a request as cancelled
function cancelRequest(requestId) {
    var request = findById(bloodRequests, requestId);
    if (request) {
        request.status = 'cancelled';
        loadHospitalRequests();
        showToast('Request cancelled.');
    }
}

// loadMatchedDonors: shows donors who accepted hospital requests
function loadMatchedDonors() {
    var container = document.getElementById('matched-list');
    if (!container) return;

    // For demo, show users who are donors and available
    var donors = [];
    for (var i = 0; i < users.length; i++) {
        if (users[i].role === 'donor' && users[i].available) {
            donors.push(users[i]);
        }
    }

    if (donors.length === 0) {
        container.innerHTML = getEmptyStateHTML('✅', 'No confirmed donors yet.');
        return;
    }

    var html = '';
    for (var j = 0; j < donors.length; j++) {
        var d = donors[j];
        html += '<div class="request-card">' +
            '<div class="req-blood-group">' + (d.bloodGroup || '--') + '</div>' +
            '<div class="req-info">' +
            '<div class="req-title">' + d.name + '</div>' +
            '<div class="req-meta">' +
            '<span>📍 ' + (d.city || 'Unknown') + '</span>' +
            '<span>📞 ' + (d.phone || 'Not provided') + '</span>' +
            '</div>' +
            '</div>' +
            '<div class="req-actions"><span class="status-pill fulfilled">Confirmed</span></div>' +
            '</div>';
    }
    container.innerHTML = html;
}

// showHospitalTab: switches between tabs in the hospital dashboard
function showHospitalTab(tabName, clickedLink) {
    switchTab('hospital', tabName, clickedLink);
}


/* ============================================================
   9. BLOOD BANK DASHBOARD FUNCTIONS
   ============================================================ */

// loadBloodBankDashboard: fills in all blood bank dashboard content
function loadBloodBankDashboard() {
    renderInventorySummary();
    renderStockTable();
    renderAlerts();
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

// updateInventory: called when blood bank submits the update form
function updateInventory() {
    var group = document.getElementById('bank-blood-group').value;
    var units = parseInt(document.getElementById('bank-units').value);
    var expiry = document.getElementById('bank-expiry').value;
    var action = document.getElementById('bank-action').value;

    // Validate
    if (isNaN(units) || units < 0) {
        showToast('⚠️ Please enter a valid number of units.');
        return;
    }

    var inv = bloodInventory[group];
    var oldUnits = inv.units;

    // Apply the action
    if (action === 'set') {
        inv.units = units;
    } else if (action === 'add') {
        inv.units = inv.units + units;
    } else if (action === 'subtract') {
        inv.units = Math.max(0, inv.units - units); // Don't go below 0
    }

    // Update expiry if provided
    if (expiry) {
        inv.expiry = expiry;
    }

    // Update last updated date
    inv.lastUpdated = getTodayDate();

    // Log the update
    var logMessage = group + ': ' + oldUnits + ' → ' + inv.units + ' units (' + action + ') | ' + getTodayDate();
    updateLog.unshift(logMessage);

    // Re-render everything
    renderInventorySummary();
    renderStockTable();
    renderAlerts();
    renderUpdateLog();

    // Update the alerts badge
    updateAlertsBadge();

    showToast('✅ Inventory updated for ' + group);
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
var initialAlertCount = 0;
var initialGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
for (var i = 0; i < initialGroups.length; i++) {
    if (bloodInventory[initialGroups[i]].units < 5) {
        initialAlertCount++;
    }
}

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