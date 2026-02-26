/* ============================================================
   app2.js — AttendIQ Institutional Attendance Management System
   ============================================================ */
"use strict";

const API_BASE_URL = "http://localhost:5000";


/* ============================================================
   MOCK DATA
   ============================================================ */
var MOCK = {

    credentials: {
        student: { email: "student@college.edu", password: "student123", name: "Aarav Sharma", id: 1 },
        staff: { email: "staff@college.edu", password: "staff123", name: "Dr. Priya Menon", id: 10 },
        admin: { email: "admin@college.edu", password: "admin123", name: "Dr. R. Venkat", id: 99 }
    },

    departments: [
        { id: 1, name: "Computer Science & Engineering", short: "CSE" },
        { id: 2, name: "Electronics & Communication", short: "ECE" },
        { id: 3, name: "Mechanical Engineering", short: "MECH" },
        { id: 4, name: "Civil Engineering", short: "CIVIL" }
    ],

    subjects: {
        1: [
            { id: 101, subject_name: "Data Structures", staff_name: "Dr. Priya Menon" },
            { id: 102, subject_name: "Operating Systems", staff_name: "Prof. Arjun Nair" },
            { id: 103, subject_name: "DBMS", staff_name: "Dr. Lakshmi Iyer" }
        ],
        2: [
            { id: 201, subject_name: "Digital Electronics", staff_name: "Dr. Ramesh Kumar" },
            { id: 202, subject_name: "Signal Processing", staff_name: "Prof. Sujata Rao" }
        ],
        3: [
            { id: 301, subject_name: "Thermodynamics", staff_name: "Dr. Mohan Das" },
            { id: 302, subject_name: "Fluid Mechanics", staff_name: "Prof. Venkat Reddy" }
        ],
        4: [
            { id: 401, subject_name: "Structural Analysis", staff_name: "Dr. Anand Pillai" },
            { id: 402, subject_name: "Geotechnical Engg", staff_name: "Prof. Kavitha Nair" }
        ]
    },

    students: {
        1: [
            { id: 1, name: "Aarav Sharma", year: "3rd Year" },
            { id: 2, name: "Divya Krishnan", year: "3rd Year" },
            { id: 3, name: "Rohan Mehta", year: "2nd Year" },
            { id: 4, name: "Sneha Patel", year: "3rd Year" },
            { id: 5, name: "Karthik Subramaniam", year: "2nd Year" }
        ],
        2: [
            { id: 6, name: "Anjali Verma", year: "3rd Year" },
            { id: 7, name: "Siddharth Nair", year: "2nd Year" }
        ],
        3: [
            { id: 8, name: "Rahul Tiwari", year: "4th Year" },
            { id: 9, name: "Pooja Joshi", year: "3rd Year" }
        ],
        4: [
            { id: 10, name: "Vikram Singh", year: "2nd Year" },
            { id: 11, name: "Meera Iyer", year: "3rd Year" }
        ]
    },

    deptAnalytics: [
        { name: "Computer Science & Engineering", short: "CSE", avg_attendance: 91, total_students: 320 },
        { name: "Electronics & Communication", short: "ECE", avg_attendance: 84, total_students: 210 },
        { name: "Mechanical Engineering", short: "MECH", avg_attendance: 72, total_students: 280 },
        { name: "Civil Engineering", short: "CIVIL", avg_attendance: 88, total_students: 180 },
        { name: "Information Technology", short: "IT", avg_attendance: 95, total_students: 195 },
        { name: "Electrical Engineering", short: "EE", avg_attendance: 79, total_students: 163 }
    ],

    trendData: [
        { month: "Jan", attendance_percentage: 82 },
        { month: "Feb", attendance_percentage: 79 },
        { month: "Mar", attendance_percentage: 85 },
        { month: "Apr", attendance_percentage: 88 },
        { month: "May", attendance_percentage: 91 },
        { month: "Jun", attendance_percentage: 76 },
        { month: "Jul", attendance_percentage: 83 },
        { month: "Aug", attendance_percentage: 87 },
        { month: "Sep", attendance_percentage: 89 },
        { month: "Oct", attendance_percentage: 92 },
        { month: "Nov", attendance_percentage: 86 },
        { month: "Dec", attendance_percentage: 84 }
    ],

    riskStudents: [
        { id: 1, name: "Aarav Sharma", email: "aarav.s@college.edu", department: "CSE", year: "3rd", percentage: 92, risk: "safe" },
        { id: 2, name: "Divya Krishnan", email: "divya.k@college.edu", department: "CSE", year: "3rd", percentage: 88, risk: "safe" },
        { id: 3, name: "Rohan Mehta", email: "rohan.m@college.edu", department: "CSE", year: "2nd", percentage: 64, risk: "warning" },
        { id: 4, name: "Sneha Patel", email: "sneha.p@college.edu", department: "CSE", year: "3rd", percentage: 77, risk: "safe" },
        { id: 5, name: "Karthik S", email: "karthik.s@college.edu", department: "CSE", year: "2nd", percentage: 52, risk: "critical" },
        { id: 6, name: "Anjali Verma", email: "anjali.v@college.edu", department: "ECE", year: "3rd", percentage: 85, risk: "safe" },
        { id: 7, name: "Siddharth Nair", email: "siddharth.n@college.edu", department: "ECE", year: "2nd", percentage: 68, risk: "warning" },
        { id: 8, name: "Rahul Tiwari", email: "rahul.t@college.edu", department: "MECH", year: "4th", percentage: 47, risk: "critical" },
        { id: 9, name: "Pooja Joshi", email: "pooja.j@college.edu", department: "MECH", year: "3rd", percentage: 71, risk: "warning" },
        { id: 10, name: "Vikram Singh", email: "vikram.s@college.edu", department: "CIVIL", year: "2nd", percentage: 93, risk: "safe" },
        { id: 11, name: "Meera Iyer", email: "meera.i@college.edu", department: "CIVIL", year: "3rd", percentage: 56, risk: "critical" },
        { id: 12, name: "Akash Reddy", email: "akash.r@college.edu", department: "CSE", year: "4th", percentage: 81, risk: "safe" }
    ],

    studentAttendance: {
        overall_percentage: 92,
        overall_risk: "safe",
        subjects: [
            { subject_name: "Data Structures", total_classes: 48, present: 44, absent: 4, percentage: 91.7, risk_category: "safe" },
            { subject_name: "Operating Systems", total_classes: 40, present: 38, absent: 2, percentage: 95.0, risk_category: "safe" },
            { subject_name: "DBMS", total_classes: 44, present: 40, absent: 4, percentage: 90.9, risk_category: "safe" }
        ]
    },

    recentSessions: [
        { date: "2026-02-25", subject: "Data Structures", dept: "CSE", present: 28, absent: 4, total: 32 },
        { date: "2026-02-24", subject: "Operating Systems", dept: "CSE", present: 30, absent: 2, total: 32 },
        { date: "2026-02-23", subject: "DBMS", dept: "CSE", present: 25, absent: 7, total: 32 },
        { date: "2026-02-21", subject: "Data Structures", dept: "CSE", present: 31, absent: 1, total: 32 },
        { date: "2026-02-20", subject: "Operating Systems", dept: "CSE", present: 29, absent: 3, total: 32 }
    ],

    /* Staff-specific sections data */
    staffMySubjects: [
        { id: 101, subject_name: "Data Structures", dept: "CSE", year: "3rd Year", section: "B", total_students: 32, avg_attendance: 87, total_classes: 28 },
        { id: 102, subject_name: "Operating Systems", dept: "CSE", year: "2nd Year", section: "A", total_students: 28, avg_attendance: 82, total_classes: 24 }
    ],

    staffStudentSummary: [
        { id: 1, name: "Aarav Sharma", roll: "21CS001", year: "3rd Year", overall: 92, risk: "safe" },
        { id: 2, name: "Divya Krishnan", roll: "21CS002", year: "3rd Year", overall: 88, risk: "safe" },
        { id: 3, name: "Rohan Mehta", roll: "21CS003", year: "2nd Year", overall: 64, risk: "warning" },
        { id: 4, name: "Sneha Patel", roll: "21CS004", year: "3rd Year", overall: 77, risk: "safe" },
        { id: 5, name: "Karthik Subramaniam", roll: "21CS005", year: "2nd Year", overall: 52, risk: "critical" },
        { id: 6, name: "Priya Sharma", roll: "21CS006", year: "3rd Year", overall: 95, risk: "safe" },
        { id: 7, name: "Vijay Kumar", roll: "21CS007", year: "2nd Year", overall: 68, risk: "warning" },
        { id: 8, name: "Ananya Rao", roll: "21CS008", year: "3rd Year", overall: 83, risk: "safe" }
    ]
};


/* ============================================================
   CLASS: AuthManager
   ============================================================ */
function AuthManager() {
    this.SESSION_KEY = "attendiq_session";
}

AuthManager.prototype.login = async function (role, email, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: email.trim().toLowerCase(), password: password })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Login failed:", data.error);
            return false;
        }

        // Verify role matches if needed (or just use role from backend)
        const session = {
            role: data.role,
            name: data.name,
            id: data.id,
            email: email,
            dept_id: data.department_id,
            year: data.year
        };

        localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
        return true;
    } catch (error) {
        console.error("Connection error:", error);
        return false;
    }
};


AuthManager.prototype.logout = function () {
    localStorage.removeItem(this.SESSION_KEY);
    window.location.href = "index2.html";
};

AuthManager.prototype.getSession = function () {
    var raw = localStorage.getItem(this.SESSION_KEY);
    if (!raw) { return null; }
    try { return JSON.parse(raw); } catch (e) { return null; }
};

AuthManager.prototype.requireRole = function (expectedRole) {
    var session = this.getSession();
    if (!session || session.role !== expectedRole) {
        window.location.href = "index2.html";
        return null;
    }
    return session;
};


/* ============================================================
   CLASS: LoginPage
   ============================================================ */
function LoginPage(auth) {
    this.auth = auth;
    this.selectedRole = "";
    this.roleCards = document.querySelectorAll(".role-card");
    this.formPanel = document.getElementById("loginFormPanel");
    this.formTitle = document.getElementById("loginFormTitle");
    this.credEmail = document.getElementById("credEmail");
    this.credPass = document.getElementById("credPass");
    this.emailInput = document.getElementById("loginEmail");
    this.passInput = document.getElementById("loginPassword");
    this.loginBtn = document.getElementById("loginBtn");
    this.errorMsg = document.getElementById("loginError");
}

LoginPage.prototype.init = function () {
    if (!this.formPanel) { return; }
    var i;
    for (i = 0; i < this.roleCards.length; i++) {
        this.roleCards[i].addEventListener("click", this.handleRoleClick.bind(this));
    }
    this.loginBtn.addEventListener("click", this.handleLogin.bind(this));
    this.passInput.addEventListener("keydown", this.handleEnterKey.bind(this));
    var session = this.auth.getSession();
    if (session) { this.redirectByRole(session.role); }
};

LoginPage.prototype.handleRoleClick = function (event) {
    var card = event.currentTarget;
    var role = card.getAttribute("data-role");
    this.selectedRole = role;
    var i;
    for (i = 0; i < this.roleCards.length; i++) { this.roleCards[i].classList.remove("selected"); }
    card.classList.add("selected");
    this.showForm(role);
};

LoginPage.prototype.showForm = function (role) {
    var cred = MOCK.credentials[role];
    var titleMap = { student: "Student Login", staff: "Staff / Faculty Login", admin: "Administrator Login" };
    this.formTitle.textContent = titleMap[role] || "Login";
    if (cred) {
        this.credEmail.textContent = cred.email;
        this.credPass.textContent = cred.password;
        this.emailInput.value = cred.email;
        this.passInput.value = cred.password;
    }
    this.errorMsg.style.display = "none";
    this.formPanel.classList.add("visible");
};

LoginPage.prototype.handleEnterKey = function (event) {
    if (event.key === "Enter") { this.handleLogin(); }
};

LoginPage.prototype.handleLogin = async function () {
    var role = this.selectedRole;
    var email = this.emailInput.value;
    var pass = this.passInput.value;
    if (!role) {
        this.errorMsg.textContent = "⚠ Please select a role first.";
        this.errorMsg.style.display = "block";
        return;
    }
    this.loginBtn.disabled = true;
    this.loginBtn.textContent = "Signing In...";

    var ok = await this.auth.login(role, email, pass);

    if (!ok) {
        this.loginBtn.disabled = false;
        this.loginBtn.textContent = "Sign In →";
        this.errorMsg.textContent = "⚠ Invalid credentials or server error.";
        this.errorMsg.style.display = "block";
        return;
    }
    this.redirectByRole(role);
};


LoginPage.prototype.redirectByRole = function (role) {
    var map = { student: "student.html", staff: "staff.html", admin: "admin.html" };
    window.location.href = map[role] || "index2.html";
};


/* ============================================================
   CLASS: SidebarNav
   Generic section switcher — used on student & staff pages.
   Queries all .nav-item[data-section] and .page-section elements.
   ============================================================ */
function SidebarNav(titleMap) {
    this.navItems = document.querySelectorAll(".nav-item[data-section]");
    this.sections = document.querySelectorAll(".page-section");
    this.topTitle = document.getElementById("topbarTitle");
    this.breadcrumb = document.getElementById("breadcrumbCurrent");
    this.titleMap = titleMap || {};
}

SidebarNav.prototype.init = function () {
    var i;
    for (i = 0; i < this.navItems.length; i++) {
        this.navItems[i].addEventListener("click", this.handleClick.bind(this));
    }
};

SidebarNav.prototype.handleClick = function (event) {
    event.preventDefault();
    var section = event.currentTarget.getAttribute("data-section");
    this.switchTo(section);
};

SidebarNav.prototype.switchTo = function (section) {
    var i;
    /* Deactivate all nav items */
    for (i = 0; i < this.navItems.length; i++) {
        this.navItems[i].classList.remove("active");
    }
    /* Activate selected */
    var activeBtn = document.querySelector(".nav-item[data-section='" + section + "']");
    if (activeBtn) { activeBtn.classList.add("active"); }

    /* Hide all sections */
    for (i = 0; i < this.sections.length; i++) {
        this.sections[i].classList.add("hidden");
    }
    /* Show target section */
    var target = document.getElementById("section-" + section);
    if (target) { target.classList.remove("hidden"); }

    /* Update topbar title and breadcrumb */
    if (this.topTitle && this.titleMap[section]) {
        this.topTitle.textContent = this.titleMap[section];
    }
    if (this.breadcrumb && this.titleMap[section]) {
        this.breadcrumb.textContent = this.titleMap[section];
    }
};


/* ============================================================
   CLASS: DashCharts
   ============================================================ */
function DashCharts(deptChartId, trendChartId, trendLabelsId) {
    this.deptEl = document.getElementById(deptChartId || "deptChart");
    this.trendEl = document.getElementById(trendChartId || "trendChart");
    this.labelsEl = document.getElementById(trendLabelsId || "trendLabelsX");
}

DashCharts.prototype.renderDeptChart = async function () {
    if (!this.deptEl) { return; }
    try {
        const response = await fetch(`${API_BASE_URL}/analytics/department`);
        const data = await response.json();

        var i, dept, pct, colorClass, html;
        html = "";
        for (i = 0; i < data.length; i++) {
            dept = data[i];
            pct = dept.avg_attendance;
            if (pct >= 85) { colorClass = "blue-fill"; }
            else if (pct >= 75) { colorClass = "amber-fill"; }
            else { colorClass = "red-fill"; }
            html += '<div class="bar-item">'
                + '<span class="bar-label">' + dept.department + '</span>'
                + '<div class="bar-track"><div class="bar-fill ' + colorClass + '" style="width:' + pct + '%"></div></div>'
                + '<span class="bar-pct">' + pct + '%</span>'
                + '</div>';
        }
        this.deptEl.innerHTML = html;
    } catch (e) {
        console.error("Failed to render dept chart:", e);
    }
};

DashCharts.prototype.renderTrendChart = async function () {
    if (!this.trendEl) { return; }
    try {
        const response = await fetch(`${API_BASE_URL}/analytics/trend`);
        const data = await response.json();

        if (!data || data.length === 0) return;

        var W = 700, H = 160, padX = 10, padY = 14;
        var stepX = (W - padX * 2) / (data.length - 1 || 1);
        var minVal = 0, maxVal = 100, range = 100;
        var points = [], polyPts = "", circlesHtml = "";
        var i, x, y, pct;
        for (i = 0; i < data.length; i++) {
            pct = data[i].attendance_percentage;
            x = padX + i * stepX;
            y = H - padY - ((pct - minVal) / range) * (H - padY * 2);
            points.push({ x: x, y: y });
            polyPts += x + "," + y + " ";
            circlesHtml += '<circle cx="' + x + '" cy="' + y + '" r="4" fill="#2563eb" stroke="#fff" stroke-width="2"/>';
        }
        var areaPath = "M " + points[0].x + "," + points[0].y;
        var j;
        for (j = 1; j < points.length; j++) { areaPath += " L " + points[j].x + "," + points[j].y; }
        areaPath += " L " + points[points.length - 1].x + "," + (H - padY);
        areaPath += " L " + points[0].x + "," + (H - padY) + " Z";

        var svgHtml = '<svg viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg" style="width:100%;display:block;">'
            + '<defs><linearGradient id="tGrad" x1="0" y1="0" x2="0" y2="1">'
            + '<stop offset="0%" stop-color="#2563eb" stop-opacity="0.15"/>'
            + '<stop offset="100%" stop-color="#2563eb" stop-opacity="0.01"/>'
            + '</linearGradient></defs>'
            + '<line x1="' + padX + '" y1="' + padY + '" x2="' + (W - padX) + '" y2="' + padY + '" stroke="#e2e8f0" stroke-width="1"/>'
            + '<line x1="' + padX + '" y1="' + (H / 2) + '" x2="' + (W - padX) + '" y2="' + (H / 2) + '" stroke="#e2e8f0" stroke-width="1"/>'
            + '<line x1="' + padX + '" y1="' + (H - padY) + '" x2="' + (W - padX) + '" y2="' + (H - padY) + '" stroke="#e2e8f0" stroke-width="1"/>'
            + '<path d="' + areaPath + '" fill="url(#tGrad)"/>'
            + '<polyline points="' + polyPts.trim() + '" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>'
            + circlesHtml + '</svg>';
        this.trendEl.innerHTML = svgHtml;

        if (this.labelsEl) {
            var labHtml = "";
            for (i = 0; i < data.length; i++) {
                // Format month for display
                labHtml += '<span>' + data[i].month.split('-')[1] + '</span>';
            }
            this.labelsEl.innerHTML = labHtml;
        }
    } catch (e) {
        console.error("Failed to render trend chart:", e);
    }
};



/* ============================================================
   CLASS: RiskReport
   ============================================================ */
function RiskReport(opts) {
    opts = opts || {};
    this.tableBodyId = opts.tableBodyId || "riskTableBody";
    this.filterSel = opts.filterSel || ".risk-filter-btn";
    this.pieSvgId = opts.pieSvgId || "riskPie";
    this.pieLegendId = opts.pieLegendId || "pieLegend";
    this.critCountId = opts.critCountId || "criticalCount";
    this.warnCountId = opts.warnCountId || "warningCount";
    this.safeCountId = opts.safeCountId || "safeCount";
    this.all = MOCK.riskStudents;
}

RiskReport.prototype.init = async function () {
    if (!document.getElementById(this.tableBodyId)) { return; }
    var btns = document.querySelectorAll(this.filterSel), i;
    for (i = 0; i < btns.length; i++) {
        btns[i].addEventListener("click", this.handleFilter.bind(this));
    }
    await this.renderSummary();
    await this.renderTable("all");
};

RiskReport.prototype.renderSummary = async function () {
    try {
        const response = await fetch(`${API_BASE_URL}/analytics/at-risk`);
        const data = await response.json();
        this.all = data; // Keep for filtering table locally or refetching

        const summary = data.summary;
        var c = document.getElementById(this.critCountId);
        var w = document.getElementById(this.warnCountId);
        var sv = document.getElementById(this.safeCountId);
        if (c) { c.textContent = summary.critical_count; }
        if (w) { w.textContent = summary.warning_count; }
        if (sv) { sv.textContent = summary.safe_count; }

        this.renderPie(summary);
    } catch (e) {
        console.error("Failed to render risk summary:", e);
    }
};

RiskReport.prototype.renderPie = function (summary) {
    var pieSvg = document.getElementById(this.pieSvgId);
    if (!pieSvg) { return; }
    var critical = summary.critical_count, warning = summary.warning_count, safe = summary.safe_count;
    var total = critical + warning + safe;
    if (total === 0) total = 1;

    var r = 45, cx = 60, cy = 60;
    var circ = 2 * Math.PI * r;
    var critDash = (critical / total) * circ;
    var warnDash = (warning / total) * circ;
    var safeDash = (safe / total) * circ;

    pieSvg.innerHTML =
        '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="#f1f5f9" stroke-width="20"/>'
        + '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="#ef4444" stroke-width="20"'
        + ' stroke-dasharray="' + critDash + ' ' + (circ - critDash) + '" stroke-dashoffset="' + (circ * 0.25) + '"'
        + ' transform="rotate(-90 ' + cx + ' ' + cy + ')"/>'
        + '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="#f59e0b" stroke-width="20"'
        + ' stroke-dasharray="' + warnDash + ' ' + (circ - warnDash) + '" stroke-dashoffset="' + (circ - (critical / total) * circ + circ * 0.25) + '"'
        + ' transform="rotate(-90 ' + cx + ' ' + cy + ')"/>'
        + '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="#22c55e" stroke-width="20"'
        + ' stroke-dasharray="' + safeDash + ' ' + (circ - safeDash) + '" stroke-dashoffset="' + (circ - ((critical + warning) / total) * circ + circ * 0.25) + '"'
        + ' transform="rotate(-90 ' + cx + ' ' + cy + ')"/>'
        + '<circle cx="' + cx + '" cy="' + cy + '" r="28" fill="#fff"/>'
        + '<text x="' + cx + '" y="' + (cy - 4) + '" text-anchor="middle" font-size="16" font-weight="700" fill="#0f172a" font-family="Share Tech Mono,monospace">' + total + '</text>'
        + '<text x="' + cx + '" y="' + (cy + 12) + '" text-anchor="middle" font-size="8" fill="#94a3b8" font-family="IBM Plex Sans,sans-serif">STUDENTS</text>';

    var legendEl = document.getElementById(this.pieLegendId);
    if (legendEl) {
        legendEl.innerHTML =
            '<div class="pie-legend-item"><span class="pie-dot" style="background:#ef4444"></span> Critical — ' + critical + '</div>'
            + '<div class="pie-legend-item"><span class="pie-dot" style="background:#f59e0b"></span> Warning — ' + warning + '</div>'
            + '<div class="pie-legend-item"><span class="pie-dot" style="background:#22c55e"></span> Safe — ' + safe + '</div>';
    }
};


RiskReport.prototype.handleFilter = function (event) {
    var btn = event.currentTarget;
    var filter = btn.getAttribute("data-risk");
    var btns = document.querySelectorAll(this.filterSel), i;
    for (i = 0; i < btns.length; i++) {
        btns[i].classList.remove("active", "active-critical", "active-warning", "active-safe");
    }
    if (filter === "all") { btn.classList.add("active"); }
    else if (filter === "critical") { btn.classList.add("active-critical"); }
    else if (filter === "warning") { btn.classList.add("active-warning"); }
    else if (filter === "safe") { btn.classList.add("active-safe"); }
    this.renderTable(filter);
};

RiskReport.prototype.renderTable = async function (filter) {
    var tbody = document.getElementById(this.tableBodyId);
    if (!tbody) { return; }

    try {
        // use data from summary call
        var data;
        if (filter === "all") {
            data = [...this.all.safe, ...this.all.warning, ...this.all.critical];
        } else {
            data = this.all[filter];
        }

        var rows = "", i, s, badgeClass, badgeText;
        for (i = 0; i < data.length; i++) {
            s = data[i];
            badgeClass = "badge-safe"; badgeText = "Safe";
            if (s.risk_category === "Critical") { badgeClass = "badge-critical"; badgeText = "Critical"; }
            else if (s.risk_category === "Warning") { badgeClass = "badge-warning"; badgeText = "Warning"; }
            rows += '<tr>'
                + '<td class="td-name">' + s.name + '</td>'
                + '<td>' + s.email + '</td>'
                + '<td><span class="badge badge-neutral">' + s.department + '</span></td>'
                + '<td>' + (s.year || "3rd") + ' Year</td>'
                + '<td class="td-mono">' + s.percentage + '%</td>'
                + '<td><span class="badge ' + badgeClass + '">' + badgeText + '</span></td>'
                + '</tr>';
        }
        if (!rows) {
            rows = '<tr><td colspan="6" style="text-align:center;padding:24px;color:#94a3b8;">No students in this category.</td></tr>';
        }
        tbody.innerHTML = rows;
    } catch (e) {
        console.error("Failed to render risk table:", e);
    }
};



/* ============================================================
   CLASS: AttendanceMarker (Staff — Mark Attendance tab)
   ============================================================ */
function AttendanceMarker() {
    this.deptSelect = document.getElementById("markDept");
    this.subjectSelect = document.getElementById("markSubject");
    this.dateInput = document.getElementById("markDate");
    this.emptyState = document.getElementById("attendanceEmptyState");
    this.listContainer = document.getElementById("attendanceList");
    this.studentRows = document.getElementById("studentRows");
    this.markAllBtn = document.getElementById("markAllPresent");
    this.submitBtn = document.getElementById("submitAttendance");
    this.successToast = document.getElementById("markSuccess");
    this.currentStudents = [];
}

AttendanceMarker.prototype.init = function () {
    if (!this.deptSelect) { return; }
    var today = new Date();
    this.dateInput.value = today.getFullYear() + "-"
        + String(today.getMonth() + 1).padStart(2, "0") + "-"
        + String(today.getDate()).padStart(2, "0");

    this.deptSelect.addEventListener("change", this.handleDeptChange.bind(this));
    this.subjectSelect.addEventListener("change", this.handleSubjectChange.bind(this));
    this.markAllBtn.addEventListener("click", this.handleMarkAll.bind(this));
    this.submitBtn.addEventListener("click", this.handleSubmit.bind(this));
};

AttendanceMarker.prototype.handleDeptChange = async function () {
    var deptId = this.deptSelect.value;
    this.subjectSelect.innerHTML = '<option value="">-- Select Subject --</option>';
    this.subjectSelect.disabled = true;
    this.showEmpty();
    if (!deptId) { return; }

    try {
        const response = await fetch(`${API_BASE_URL}/subjects?department_id=${deptId}`);
        const subjects = await response.json();
        var i, opt;
        for (i = 0; i < subjects.length; i++) {
            opt = document.createElement("option");
            opt.value = subjects[i].id;
            opt.textContent = subjects[i].subject_name + " — " + (subjects[i].staff_name || "Assigned Staff");
            this.subjectSelect.appendChild(opt);
        }
        this.subjectSelect.disabled = false;
    } catch (e) {
        console.error("Failed to fetch subjects:", e);
    }
};

AttendanceMarker.prototype.handleSubjectChange = async function () {
    var deptId = this.deptSelect.value, subjId = this.subjectSelect.value;
    if (!deptId || !subjId) { this.showEmpty(); return; }

    try {
        const response = await fetch(`${API_BASE_URL}/students?department_id=${deptId}`);
        const students = await response.json();
        if (!students.length) { this.showEmpty(); return; }
        this.currentStudents = students;
        this.renderStudentRows(students);
    } catch (e) {
        console.error("Failed to fetch students for marking:", e);
    }
};


AttendanceMarker.prototype.renderStudentRows = function (students) {
    var html = "", i, s;
    for (i = 0; i < students.length; i++) {
        s = students[i];
        html += '<div class="att-row" id="srow-' + s.id + '">'
            + '<span class="att-row-name">' + s.name + '</span>'
            + '<span class="att-row-year">' + s.year + '</span>'
            + '<div class="radio-grp"><input type="radio" name="att-' + s.id + '" value="present" id="p-' + s.id + '" onchange="APP_MARKER.handleRowChange(' + s.id + ',\'present\')" /></div>'
            + '<div class="radio-grp"><input type="radio" name="att-' + s.id + '" value="absent"  id="a-' + s.id + '" onchange="APP_MARKER.handleRowChange(' + s.id + ',\'absent\')" /></div>'
            + '</div>';
    }
    this.studentRows.innerHTML = html;
    this.emptyState.style.display = "none";
    this.listContainer.style.display = "block";
    if (this.successToast) { this.successToast.style.display = "none"; }
};

AttendanceMarker.prototype.handleRowChange = function (studentId, status) {
    var row = document.getElementById("srow-" + studentId);
    if (!row) { return; }
    row.classList.remove("status-present", "status-absent");
    row.classList.add("status-" + status);
};

AttendanceMarker.prototype.handleMarkAll = function () {
    var i, s, el;
    for (i = 0; i < this.currentStudents.length; i++) {
        s = this.currentStudents[i];
        el = document.getElementById("p-" + s.id);
        if (el) { el.checked = true; this.handleRowChange(s.id, "present"); }
    }
};

AttendanceMarker.prototype.handleSubmit = async function () {
    var list = [], i, s, radios, j, status;
    for (i = 0; i < this.currentStudents.length; i++) {
        s = this.currentStudents[i];
        radios = document.querySelectorAll("input[name='att-" + s.id + "']");
        status = "";
        for (j = 0; j < radios.length; j++) { if (radios[j].checked) { status = radios[j].value; break; } }
        if (status !== "") { list.push({ student_id: s.id, status: status }); }
    }
    if (list.length !== this.currentStudents.length) {
        alert("Please mark attendance for all students before submitting.");
        return;
    }

    this.submitBtn.disabled = true;
    this.submitBtn.textContent = "Submitting...";

    try {
        const response = await fetch(`${API_BASE_URL}/attendance/bulk`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                subject_id: parseInt(this.subjectSelect.value),
                date: this.dateInput.value,
                attendance_list: list
            })
        });

        if (response.ok) {
            if (this.successToast) { this.successToast.style.display = "flex"; }
            window.setTimeout(this.hideToast.bind(this), 5000);
            this.showEmpty(); // Clear form
        } else {
            alert("Failed to submit attendance. Ensure you are authorized.");
        }
    } catch (e) {
        console.error("Submission error:", e);
    } finally {
        this.submitBtn.disabled = false;
        this.submitBtn.textContent = "Submit Attendance";
    }
};

AttendanceMarker.prototype.hideToast = function () {
    if (this.successToast) { this.successToast.style.display = "none"; }
};


AttendanceMarker.prototype.showEmpty = function () {
    this.listContainer.style.display = "none";
    this.emptyState.style.display = "block";
    this.currentStudents = [];
};


/* ============================================================
   CLASS: StaffSections
   Renders: session history, my students, my subjects tables/cards
   ============================================================ */
function StaffSections() { }

StaffSections.prototype.init = async function () {
    await this.renderHistory();
    await this.renderStudents();
    await this.renderSubjects();
};

StaffSections.prototype.renderHistory = async function () {
    var el = document.getElementById("historyTableBody");
    if (!el) { return; }
    try {
        const response = await fetch(`${API_BASE_URL}/analytics/trend`);
        const data = await response.json();

        var html = "", i, s;
        for (i = 0; i < Math.min(data.length, 5); i++) {
            s = data[i];
            html += '<tr>'
                + '<td class="td-mono">' + s.month + '-01</td>'
                + '<td class="td-name">Monthly Analysis Mode</td>'
                + '<td><span class="badge badge-neutral">System</span></td>'
                + '<td class="td-mono" style="color:var(--green-600)">' + s.attendance_percentage + '%</td>'
                + '<td class="td-mono" style="color:var(--red-500)">--</td>'
                + '<td class="td-mono">Avg</td>'
                + '<td><span class="badge badge-safe">REPORTED</span></td>'
                + '</tr>';
        }
        el.innerHTML = html || '<tr><td colspan="7" style="text-align:center;padding:24px;color:#94a3b8;">No history available.</td></tr>';
    } catch (e) {
        console.error("Failed to render history:", e);
    }
};


StaffSections.prototype.renderStudents = async function () {
    var el = document.getElementById("staffStudentTable");
    if (!el) { return; }
    try {
        const response = await fetch(`${API_BASE_URL}/students`);
        const data = await response.json();

        var i, s, badgeClass, badgeText, html = "";
        for (i = 0; i < data.length; i++) {
            s = data[i];
            // Get mock risk or calculate (backend doesn't provide single-student-risk in /students)
            badgeClass = "badge-safe"; badgeText = "Active";
            html += '<tr>'
                + '<td class="td-name">' + s.name + '</td>'
                + '<td class="td-mono" style="color:var(--text-muted)">STU' + s.id.toString().padStart(3, '0') + '</td>'
                + '<td>' + (s.year || "3rd") + '</td>'
                + '<td>' + s.department_name + '</td>'
                + '<td><div class="progress-wrap" style="min-width:80px"><div class="progress-bar safe" style="width:85%"></div></div></td>'
                + '<td><span class="badge ' + badgeClass + '">' + badgeText + '</span></td>'
                + '</tr>';
        }
        el.innerHTML = html || '<tr><td colspan="6" style="text-align:center;padding:24px;color:#94a3b8;">No students found.</td></tr>';
    } catch (e) {
        console.error("Failed to render staff student list:", e);
    }
};

StaffSections.prototype.renderSubjects = async function () {
    var el = document.getElementById("mySubjectsGrid");
    if (!el) { return; }
    try {
        const response = await fetch(`${API_BASE_URL}/subjects`);
        const data = await response.json();

        var i, subj, colorClass, html = "";
        for (i = 0; i < data.length; i++) {
            subj = data[i];
            colorClass = "safe";
            html += '<div class="card" style="margin-bottom:16px;">'
                + '<div class="card-header">'
                + '  <div><div class="card-title">' + subj.subject_name + '</div>'
                + '  <div class="text-sm text-muted">' + subj.department_name + ' · Code: ' + subj.subject_code + '</div></div>'
                + '  <span class="badge badge-blue">ID: ' + subj.id + '</span>'
                + '</div>'
                + '<div class="card-body">'
                + '  <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-bottom:16px;">'
                + '    <div><div class="stat-card-label">Staff</div><div class="stat-card-value" style="font-size:16px">' + (subj.staff_name || "Assigned") + '</div></div>'
                + '    <div><div class="stat-card-label">Credits</div><div class="stat-card-value" style="font-size:22px">' + (subj.credits || "4") + '</div></div>'
                + '    <div><div class="stat-card-label">Type</div><div class="stat-card-value" style="font-size:16px;color:var(--blue-500)">' + (subj.type || "Theory") + '</div></div>'
                + '  </div>'
                + '  <div class="progress-wrap"><div class="progress-bar ' + colorClass + '" style="width:100%"></div></div>'
                + '  <div class="text-xs text-muted" style="margin-top:6px">Active course module</div>'
                + '</div>'
                + '</div>';
        }
        el.innerHTML = html || '<div style="color:#94a3b8;padding:24px;text-align:center;">No subjects found.</div>';
    } catch (e) {
        console.error("Failed to render staff subjects:", e);
    }
};



/* ============================================================
   CLASS: StudentDash
   ============================================================ */
function StudentDash(session) {
    this.session = session;
    this.data = MOCK.studentAttendance;
}

StudentDash.prototype.init = async function () {
    var user = this.session;
    if (!user || !document.getElementById("studentNameEl")) { return; }

    try {
        const response = await fetch(`${API_BASE_URL}/attendance/student?student_id=${user.id}`);
        const data = await response.json();
        this.data = data;

        this.renderProfile();
        this.renderSubjectBreakdown();
        this.renderTrendChart();
        this.renderTrendTable();
        this.updateRiskCalculator();
    } catch (e) {
        console.error("Failed to render student dash:", e);
    }
};

StudentDash.prototype.renderProfile = function () {
    var s = this.session;
    var d = this.data;
    var el;

    el = document.getElementById("studentNameEl"); if (el) { el.textContent = s.name; }
    el = document.getElementById("studentMetaEl"); if (el) {
        el.textContent = (s.dept_id == 1 ? "CSE" : "Dept") + " · " + (s.year || "3rd") + " Year · " + s.email;
    }
    el = document.getElementById("overallPctEl"); if (el) { el.textContent = d.overall_percentage + "%"; }

    var parts = s.name.split(" ");
    var initials = parts[0][0] + (parts[1] ? parts[1][0] : "");
    el = document.getElementById("studentInitEl"); if (el) { el.textContent = initials.toUpperCase(); }
    el = document.getElementById("avatarLargeEl"); if (el) { el.textContent = initials.toUpperCase(); }

    el = document.getElementById("overallRiskEl");
    if (el) {
        var risk = d.overall_risk.toLowerCase();
        el.textContent = d.overall_risk.toUpperCase();
        el.className = "badge badge-" + risk;
    }
};

StudentDash.prototype.renderSubjectBreakdown = function () {
    var el = document.getElementById("subjectBreakdownEl");
    if (!el) { return; }
    var subjects = this.data.subjects, i, subj, risk, html;
    html = "";
    for (i = 0; i < subjects.length; i++) {
        subj = subjects[i];
        risk = subj.risk_category.toLowerCase();
        html += '<div class="subject-row">'
            + '<div class="subject-row-header">'
            + '  <span class="subject-row-name">' + subj.subject_name + '</span>'
            + '  <span class="badge badge-' + risk + '">' + subj.risk_category.toUpperCase() + '</span>'
            + '</div>'
            + '<div class="flex-between mb-8">'
            + '  <span class="subject-row-meta">' + subj.present_count + ' present / ' + subj.absent + ' absent / ' + subj.total_classes + ' total</span>'
            + '  <span class="subject-row-pct ' + risk + '">' + subj.percentage + '%</span>'
            + '</div>'
            + '<div class="progress-wrap"><div class="progress-bar ' + risk + '" style="width:' + subj.percentage + '%"></div></div>'
            + '</div>';
    }
    el.innerHTML = html || '<div style="color:#94a3b8;padding:24px;text-align:center;">No subject data found.</div>';
};


StudentDash.prototype.renderTrendChart = function () {
    var charts = new DashCharts(null, "studentTrendChart", "studentTrendLabels");
    charts.renderTrendChart();
};

StudentDash.prototype.renderTrendTable = function () {
    var el = document.getElementById("trendTableBody");
    if (!el) { return; }
    var data = MOCK.trendData, i, d, badgeClass, html;
    html = "";
    for (i = 0; i < data.length; i++) {
        d = data[i];
        badgeClass = d.attendance_percentage >= 85 ? "badge-safe" : (d.attendance_percentage >= 75 ? "badge-warning" : "badge-critical");
        html += '<tr>'
            + '<td class="td-name">' + d.month + ' 2024</td>'
            + '<td class="td-mono">' + d.attendance_percentage + '%</td>'
            + '<td><div class="progress-wrap" style="min-width:100px"><div class="progress-bar blue" style="width:' + d.attendance_percentage + '%"></div></div></td>'
            + '<td><span class="badge ' + badgeClass + '">' + (d.attendance_percentage >= 85 ? "Good" : d.attendance_percentage >= 75 ? "Warning" : "Low") + '</span></td>'
            + '</tr>';
    }
    el.innerHTML = html;
};

StudentDash.prototype.updateRiskCalculator = function () {
    /* Can miss = (total classes * 0.25) - absences already taken */
    var pct = this.data.overall_percentage;
    var total = 132;
    var missed = Math.round(total * (1 - pct / 100));
    var canMiss = Math.max(0, Math.floor(total * 0.25) - missed);
    var el = document.getElementById("canMissEl");
    if (el) { el.textContent = canMiss; }
};


/* ============================================================
   CLASS: AdminDash
   ============================================================ */
function AdminDash(session) {
    this.session = session;
    this.navItems = document.querySelectorAll(".admin-nav-item");
    this.sections = document.querySelectorAll(".admin-section");
    this.riskReport = new RiskReport();
    this.charts = new DashCharts();
}

AdminDash.prototype.init = async function () {
    if (!document.getElementById("adminContentArea")) { return; }
    var i;
    for (i = 0; i < this.navItems.length; i++) {
        this.navItems[i].addEventListener("click", this.handleNavClick.bind(this));
    }
    await this.charts.renderDeptChart();
    await this.charts.renderTrendChart();
    await this.riskReport.init();
    await this.renderStats();
};

AdminDash.prototype.renderStats = async function () {
    try {
        const response = await fetch(`${API_BASE_URL}/analytics/dashboard`);
        const data = await response.json();

        var el;
        el = document.getElementById("statTotalStudents"); if (el) { el.textContent = data.total_students.toLocaleString(); }
        el = document.getElementById("statTotalSubjects"); if (el) { el.textContent = data.total_subjects; }
        el = document.getElementById("statTotalRecords"); if (el) { el.textContent = data.total_records.toLocaleString(); }
        el = document.getElementById("statAvgAttendance"); if (el) { el.textContent = data.overall_attendance_percentage + "%"; }
    } catch (e) {
        console.error("Failed to render admin stats:", e);
    }
};


AdminDash.prototype.handleNavClick = function (event) {
    event.preventDefault();
    var btn = event.currentTarget, section = btn.getAttribute("data-section");
    var i;
    for (i = 0; i < this.navItems.length; i++) { this.navItems[i].classList.remove("active"); }
    btn.classList.add("active");
    for (i = 0; i < this.sections.length; i++) { this.sections[i].classList.add("hidden"); }
    var target = document.getElementById("section-" + section);
    if (target) { target.classList.remove("hidden"); }
    var titleMap = { overview: "Overview Dashboard", atrisk: "At-Risk Report", attendance: "Attendance Register", manage: "Manage Institution" };
    var topTitle = document.getElementById("topbarTitle");
    if (topTitle && titleMap[section]) { topTitle.textContent = titleMap[section]; }
    var bc = document.getElementById("breadcrumbCurrent");
    if (bc && titleMap[section]) { bc.textContent = titleMap[section]; }
};


/* ============================================================
   CLASS: SidebarController
   ============================================================ */
function SidebarController(session, auth) {
    this.session = session;
    this.auth = auth;
    this.logoutBtn = document.getElementById("logoutBtn");
    this.profileName = document.getElementById("profileName");
    this.profileRole = document.getElementById("profileRole");
    this.profileAvatar = document.getElementById("profileAvatar");
    this.avatarLarge = document.getElementById("avatarLargeEl");
}

SidebarController.prototype.init = function () {
    if (this.logoutBtn) {
        this.logoutBtn.addEventListener("click", this.handleLogout.bind(this));
    }
    if (!this.session) { return; }
    if (this.profileName) { this.profileName.textContent = this.session.name; }
    if (this.profileRole) { this.profileRole.textContent = this.session.role.charAt(0).toUpperCase() + this.session.role.slice(1); }
    var parts = this.session.name.split(" ");
    var init = (parts[0][0] + (parts[1] ? parts[1][0] : "")).toUpperCase();
    if (this.profileAvatar) { this.profileAvatar.textContent = init; }
    if (this.avatarLarge) { this.avatarLarge.textContent = init; }
};

SidebarController.prototype.handleLogout = function () {
    this.auth.logout();
};


/* ============================================================
   GLOBAL: used by inline radio onchange handlers
   ============================================================ */
var APP_MARKER = null;


/* ============================================================
   BOOTSTRAPPER
   ============================================================ */
(function boot() {
    var auth = new AuthManager();
    var page = document.body ? document.body.getAttribute("data-page") : null;

    if (page === "login") {
        var loginPage = new LoginPage(auth);
        loginPage.init();
        return;
    }

    if (page === "student") {
        var sessionSt = auth.requireRole("student");
        if (!sessionSt) { return; }
        var sidebarSt = new SidebarController(sessionSt, auth);
        sidebarSt.init();
        var navSt = new SidebarNav({
            "my-attendance": "My Attendance",
            "subjects": "Subject-wise Breakdown",
            "trend": "Attendance Trend & Analysis",
            "risk": "Risk Status"
        });
        navSt.init();
        var dashSt = new StudentDash(sessionSt);
        dashSt.init();
        return;
    }

    if (page === "staff") {
        var sessionSf = auth.requireRole("staff");
        if (!sessionSf) { return; }
        var sidebarSf = new SidebarController(sessionSf, auth);
        sidebarSf.init();
        var navSf = new SidebarNav({
            "mark": "Mark Attendance",
            "history": "Session History",
            "students": "My Students",
            "subjects-list": "My Subjects"
        });
        navSf.init();
        var marker = new AttendanceMarker();
        APP_MARKER = marker;
        marker.init();
        var staffSec = new StaffSections();
        staffSec.init();
        return;
    }

    if (page === "admin") {
        var sessionAd = auth.requireRole("admin");
        if (!sessionAd) { return; }
        var sidebarAd = new SidebarController(sessionAd, auth);
        sidebarAd.init();
        var adminDash = new AdminDash(sessionAd);
        adminDash.init();
        return;
    }

    /* Fallback — treat as login */
    var fb = new LoginPage(auth);
    fb.init();
}());