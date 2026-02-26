/* ============================================================
   app2.js — AttendIQ Institutional Attendance Management System
   ============================================================ */
"use strict";

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

AuthManager.prototype.login = function (role, email, password) {
    var cred = MOCK.credentials[role];
    if (!cred) { return false; }
    if (cred.email !== email.trim().toLowerCase()) { return false; }
    if (cred.password !== password) { return false; }
    var session = { role: role, name: cred.name, id: cred.id, email: cred.email };
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
    return true;
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

LoginPage.prototype.handleLogin = function () {
    var role = this.selectedRole;
    var email = this.emailInput.value;
    var pass = this.passInput.value;
    if (!role) {
        this.errorMsg.textContent = "⚠ Please select a role first.";
        this.errorMsg.style.display = "block";
        return;
    }
    var ok = this.auth.login(role, email, pass);
    if (!ok) {
        this.errorMsg.textContent = "⚠ Invalid credentials. Please try again.";
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

DashCharts.prototype.renderDeptChart = function () {
    if (!this.deptEl) { return; }
    var data = MOCK.deptAnalytics;
    var i, dept, pct, colorClass, html;
    html = "";
    for (i = 0; i < data.length; i++) {
        dept = data[i];
        pct = dept.avg_attendance;
        if (pct >= 85) { colorClass = "blue-fill"; }
        else if (pct >= 75) { colorClass = "amber-fill"; }
        else { colorClass = "red-fill"; }
        html += '<div class="bar-item">'
            + '<span class="bar-label">' + dept.name + '</span>'
            + '<div class="bar-track"><div class="bar-fill ' + colorClass + '" style="width:' + pct + '%"></div></div>'
            + '<span class="bar-pct">' + pct + '%</span>'
            + '</div>';
    }
    this.deptEl.innerHTML = html;
};

DashCharts.prototype.renderTrendChart = function () {
    if (!this.trendEl) { return; }
    var data = MOCK.trendData;
    var W = 700, H = 160, padX = 10, padY = 14;
    var stepX = (W - padX * 2) / (data.length - 1);
    var minVal = 60, maxVal = 100, range = maxVal - minVal;
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
        for (i = 0; i < data.length; i++) { labHtml += '<span>' + data[i].month + '</span>'; }
        this.labelsEl.innerHTML = labHtml;
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

RiskReport.prototype.init = function () {
    if (!document.getElementById(this.tableBodyId)) { return; }
    var btns = document.querySelectorAll(this.filterSel), i;
    for (i = 0; i < btns.length; i++) {
        btns[i].addEventListener("click", this.handleFilter.bind(this));
    }
    this.renderCounts();
    this.renderPie();
    this.renderTable("all");
};

RiskReport.prototype.renderCounts = function () {
    var critical = 0, warning = 0, safe = 0, i, s;
    for (i = 0; i < this.all.length; i++) {
        s = this.all[i];
        if (s.risk === "critical") { critical++; }
        else if (s.risk === "warning") { warning++; }
        else { safe++; }
    }
    var c = document.getElementById(this.critCountId);
    var w = document.getElementById(this.warnCountId);
    var sv = document.getElementById(this.safeCountId);
    if (c) { c.textContent = critical; }
    if (w) { w.textContent = warning; }
    if (sv) { sv.textContent = safe; }
};

RiskReport.prototype.renderPie = function () {
    var pieSvg = document.getElementById(this.pieSvgId);
    if (!pieSvg) { return; }
    var total = this.all.length;
    var critical = 0, warning = 0, safe = 0, i, s;
    for (i = 0; i < total; i++) {
        s = this.all[i];
        if (s.risk === "critical") { critical++; }
        else if (s.risk === "warning") { warning++; }
        else { safe++; }
    }
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

RiskReport.prototype.renderTable = function (filter) {
    var tbody = document.getElementById(this.tableBodyId);
    if (!tbody) { return; }
    var rows = "", i, s, badgeClass, badgeText;
    for (i = 0; i < this.all.length; i++) {
        s = this.all[i];
        if (filter !== "all" && s.risk !== filter) { continue; }
        badgeClass = "badge-safe"; badgeText = "Safe";
        if (s.risk === "critical") { badgeClass = "badge-critical"; badgeText = "Critical"; }
        else if (s.risk === "warning") { badgeClass = "badge-warning"; badgeText = "Warning"; }
        rows += '<tr>'
            + '<td class="td-name">' + s.name + '</td>'
            + '<td>' + s.email + '</td>'
            + '<td><span class="badge badge-neutral">' + s.department + '</span></td>'
            + '<td>' + s.year + ' Year</td>'
            + '<td class="td-mono">' + s.percentage + '%</td>'
            + '<td><span class="badge ' + badgeClass + '">' + badgeText + '</span></td>'
            + '</tr>';
    }
    if (!rows) {
        rows = '<tr><td colspan="6" style="text-align:center;padding:24px;color:#94a3b8;">No students in this category.</td></tr>';
    }
    tbody.innerHTML = rows;
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

AttendanceMarker.prototype.handleDeptChange = function () {
    var deptId = this.deptSelect.value;
    this.subjectSelect.innerHTML = '<option value="">-- Select Subject --</option>';
    this.subjectSelect.disabled = true;
    this.showEmpty();
    if (!deptId) { return; }
    var subjects = MOCK.subjects[deptId] || [], i, opt;
    for (i = 0; i < subjects.length; i++) {
        opt = document.createElement("option");
        opt.value = subjects[i].id;
        opt.textContent = subjects[i].subject_name + " — " + subjects[i].staff_name;
        this.subjectSelect.appendChild(opt);
    }
    this.subjectSelect.disabled = false;
};

AttendanceMarker.prototype.handleSubjectChange = function () {
    var deptId = this.deptSelect.value, subjId = this.subjectSelect.value;
    if (!deptId || !subjId) { this.showEmpty(); return; }
    var students = MOCK.students[deptId] || [];
    if (!students.length) { this.showEmpty(); return; }
    this.currentStudents = students;
    this.renderStudentRows(students);
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

AttendanceMarker.prototype.handleSubmit = function () {
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
    if (this.successToast) { this.successToast.style.display = "flex"; }
    window.setTimeout(this.hideToast.bind(this), 5000);
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

StaffSections.prototype.init = function () {
    this.renderHistory();
    this.renderStudents();
    this.renderSubjects();
};

StaffSections.prototype.renderHistory = function () {
    var el = document.getElementById("historyTableBody");
    if (!el) { return; }
    var data = MOCK.recentSessions, i, s, pct, badgeClass;
    var html = "";
    for (i = 0; i < data.length; i++) {
        s = data[i];
        pct = Math.round((s.present / s.total) * 100);
        badgeClass = pct >= 85 ? "badge-safe" : (pct >= 75 ? "badge-blue" : "badge-warning");
        html += '<tr>'
            + '<td>' + s.date + '</td>'
            + '<td class="td-name">' + s.subject + '</td>'
            + '<td><span class="badge badge-neutral">' + s.dept + '</span></td>'
            + '<td class="td-mono" style="color:var(--green-600)">' + s.present + '</td>'
            + '<td class="td-mono" style="color:var(--red-500)">' + s.absent + '</td>'
            + '<td class="td-mono">' + s.total + '</td>'
            + '<td><span class="badge ' + badgeClass + '">' + pct + '%</span></td>'
            + '</tr>';
    }
    el.innerHTML = html;
};

StaffSections.prototype.renderStudents = function () {
    var el = document.getElementById("staffStudentTable");
    if (!el) { return; }
    var data = MOCK.staffStudentSummary, i, s, badgeClass, badgeText;
    var html = "";
    for (i = 0; i < data.length; i++) {
        s = data[i];
        badgeClass = "badge-safe"; badgeText = "Safe";
        if (s.risk === "critical") { badgeClass = "badge-critical"; badgeText = "Critical"; }
        else if (s.risk === "warning") { badgeClass = "badge-warning"; badgeText = "Warning"; }
        html += '<tr>'
            + '<td class="td-name">' + s.name + '</td>'
            + '<td class="td-mono" style="color:var(--text-muted)">' + s.roll + '</td>'
            + '<td>' + s.year + '</td>'
            + '<td class="td-mono">' + s.overall + '%</td>'
            + '<td><div class="progress-wrap" style="min-width:80px"><div class="progress-bar ' + s.risk + '" style="width:' + s.overall + '%"></div></div></td>'
            + '<td><span class="badge ' + badgeClass + '">' + badgeText + '</span></td>'
            + '</tr>';
    }
    el.innerHTML = html;
};

StaffSections.prototype.renderSubjects = function () {
    var el = document.getElementById("mySubjectsGrid");
    if (!el) { return; }
    var data = MOCK.staffMySubjects, i, subj, colorClass, html;
    html = "";
    for (i = 0; i < data.length; i++) {
        subj = data[i];
        colorClass = subj.avg_attendance >= 85 ? "safe" : (subj.avg_attendance >= 75 ? "warning" : "critical");
        html += '<div class="card" style="margin-bottom:16px;">'
            + '<div class="card-header">'
            + '  <div><div class="card-title">' + subj.subject_name + '</div>'
            + '  <div class="text-sm text-muted">' + subj.dept + ' · ' + subj.year + ' · Section ' + subj.section + '</div></div>'
            + '  <span class="badge badge-blue">Code: ' + subj.id + '</span>'
            + '</div>'
            + '<div class="card-body">'
            + '  <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-bottom:16px;">'
            + '    <div><div class="stat-card-label">Students</div><div class="stat-card-value" style="font-size:22px">' + subj.total_students + '</div></div>'
            + '    <div><div class="stat-card-label">Classes Held</div><div class="stat-card-value" style="font-size:22px">' + subj.total_classes + '</div></div>'
            + '    <div><div class="stat-card-label">Avg Attendance</div><div class="stat-card-value" style="font-size:22px;color:var(--blue-500)">' + subj.avg_attendance + '%</div></div>'
            + '  </div>'
            + '  <div class="progress-wrap"><div class="progress-bar ' + colorClass + '" style="width:' + subj.avg_attendance + '%"></div></div>'
            + '  <div class="text-xs text-muted" style="margin-top:6px">Class average attendance</div>'
            + '</div>'
            + '</div>';
    }
    el.innerHTML = html;
};


/* ============================================================
   CLASS: StudentDash
   ============================================================ */
function StudentDash(session) {
    this.session = session;
    this.data = MOCK.studentAttendance;
}

StudentDash.prototype.init = function () {
    this.renderProfile();
    this.renderSubjectBreakdown();
    this.renderTrendChart();
    this.renderTrendTable();
    this.updateRiskCalculator();
};

StudentDash.prototype.renderProfile = function () {
    var s = this.session;
    var d = this.data;
    var el;

    el = document.getElementById("studentNameEl"); if (el) { el.textContent = s.name; }
    el = document.getElementById("studentMetaEl"); if (el) { el.textContent = "CSE · 3rd Year · " + s.email; }
    el = document.getElementById("overallPctEl"); if (el) { el.textContent = d.overall_percentage + "%"; }
    el = document.getElementById("attendedEl"); if (el) { el.textContent = "122"; }
    el = document.getElementById("missedEl"); if (el) { el.textContent = "10"; }

    var parts = s.name.split(" ");
    var initials = parts[0][0] + (parts[1] ? parts[1][0] : "");
    el = document.getElementById("studentInitEl"); if (el) { el.textContent = initials.toUpperCase(); }
    el = document.getElementById("avatarLargeEl"); if (el) { el.textContent = initials.toUpperCase(); }

    el = document.getElementById("overallRiskEl");
    if (el) {
        el.textContent = d.overall_risk.charAt(0).toUpperCase() + d.overall_risk.slice(1);
        el.className = "badge badge-" + d.overall_risk;
    }
};

StudentDash.prototype.renderSubjectBreakdown = function () {
    var el = document.getElementById("subjectBreakdownEl");
    if (!el) { return; }
    var subjects = this.data.subjects, i, subj, risk, html;
    html = "";
    for (i = 0; i < subjects.length; i++) {
        subj = subjects[i];
        risk = subj.risk_category;
        html += '<div class="subject-row">'
            + '<div class="subject-row-header">'
            + '  <span class="subject-row-name">' + subj.subject_name + '</span>'
            + '  <span class="badge badge-' + risk + '">' + risk.toUpperCase() + '</span>'
            + '</div>'
            + '<div class="flex-between mb-8">'
            + '  <span class="subject-row-meta">' + subj.present + ' present / ' + subj.absent + ' absent / ' + subj.total_classes + ' total</span>'
            + '  <span class="subject-row-pct ' + risk + '">' + subj.percentage + '%</span>'
            + '</div>'
            + '<div class="progress-wrap"><div class="progress-bar ' + risk + '" style="width:' + subj.percentage + '%"></div></div>'
            + '</div>';
    }
    el.innerHTML = html;
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

AdminDash.prototype.init = function () {
    if (!document.getElementById("adminContentArea")) { return; }
    var i;
    for (i = 0; i < this.navItems.length; i++) {
        this.navItems[i].addEventListener("click", this.handleNavClick.bind(this));
    }
    this.charts.renderDeptChart();
    this.charts.renderTrendChart();
    this.riskReport.init();
    this.renderStats();
};

AdminDash.prototype.renderStats = function () {
    var totalStudents = 0, i, dept;
    for (i = 0; i < MOCK.deptAnalytics.length; i++) { totalStudents += MOCK.deptAnalytics[i].total_students; }
    var totalSubjects = 0;
    for (dept in MOCK.subjects) {
        if (MOCK.subjects.hasOwnProperty(dept)) { totalSubjects += MOCK.subjects[dept].length; }
    }
    var el;
    el = document.getElementById("statTotalStudents"); if (el) { el.textContent = totalStudents.toLocaleString(); }
    el = document.getElementById("statTotalSubjects"); if (el) { el.textContent = totalSubjects; }
    el = document.getElementById("statTotalRecords"); if (el) { el.textContent = "98,432"; }
    el = document.getElementById("statAvgAttendance"); if (el) { el.textContent = "87.4%"; }
    el = document.getElementById("statAtRisk"); if (el) { el.textContent = "4"; }
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