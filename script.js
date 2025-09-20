// ========================================
// JOBCONNECT - COMPLETE JAVASCRIPT
// Enhanced with comprehensive profile functionality
// ========================================

// Global state
let currentUser = null;
let currentAuthRole = 'student';
let currentAuthStep = 'role';
let selectedRole = 'student';
let isAuthenticated = false;
let profileDropdownOpen = false;

// Job data
const jobDatabase = {
    1: { title: "Senior Frontend Developer", company: "TechVision Inc", salary: "$120k - $180k" },
    2: { title: "Product Marketing Lead", company: "InnovateLabs", salary: "$90k - $140k" },
    3: { title: "AI Research Intern", company: "DeepMind Labs", salary: "$8k/month" }
};

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    checkAuthStatus();
});

// App Initialization
function initializeApp() {
    console.log('JobConnect initialized');
    setupGoogleAuth();
    initializeProfileUI();
}

// Enhanced Event Listeners
function setupEventListeners() {
    // Close modal on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (document.getElementById('authModal').classList.contains('show')) {
                closeAuthModal();
            }
            if (profileDropdownOpen) {
                toggleProfileDropdown();
            }
        }
    });

    // Close profile dropdown on outside click
    document.addEventListener('click', function(e) {
        const profileToggle = document.getElementById('profileToggle');
        const profileMenu = document.getElementById('profileMenu');
        
        if (!profileToggle.contains(e.target) && !profileMenu.contains(e.target)) {
            if (profileDropdownOpen) {
                toggleProfileDropdown();
            }
        }
    });

    // Prevent body scroll when modal is open
    const modal = document.getElementById('authModal');
    modal.addEventListener('transitionend', function(e) {
        if (e.propertyName === 'opacity' && modal.classList.contains('show')) {
            document.body.style.overflow = 'hidden';
        } else if (e.propertyName === 'opacity' && !modal.classList.contains('show')) {
            document.body.style.overflow = 'auto';
        }
    });
}

// Initialize Profile UI
function initializeProfileUI() {
    const profileName = document.getElementById('profileName');
    const profileAvatar = document.getElementById('profileAvatar');
    const menuProfileName = document.getElementById('menuProfileName');
    const menuProfileEmail = document.getElementById('menuProfileEmail');
    const menuAvatar = document.getElementById('menuAvatar');
    
    if (profileName && currentUser) {
        profileName.textContent = currentUser.name;
        menuProfileName.textContent = currentUser.name;
        menuProfileEmail.textContent = currentUser.email;
        
        // Set avatar (use first letter if no avatar)
        const avatarText = currentUser.name.charAt(0).toUpperCase();
        const avatarColor = getRoleColor(currentUser.role);
        
        profileAvatar.src = currentUser.avatar || `https://via.placeholder.com/32x32/${avatarColor}/ffffff?text=${avatarText}`;
        menuAvatar.src = currentUser.avatar || `https://via.placeholder.com/40x40/${avatarColor}/ffffff?text=${avatarText}`;
        
        updateProfileBadges();
    }
}

// Profile Dropdown Functions
function toggleProfileDropdown() {
    const profileMenu = document.getElementById('profileMenu');
    const profileChevron = document.getElementById('profileChevron');
    profileDropdownOpen = !profileDropdownOpen;
    
    if (profileDropdownOpen) {
        profileMenu.classList.add('show');
        profileChevron.style.transform = 'rotate(180deg)';
        document.body.style.overflow = 'hidden'; // Prevent background scroll
    } else {
        profileMenu.classList.remove('show');
        profileChevron.style.transform = 'rotate(0deg)';
        document.body.style.overflow = 'auto';
    }
}

// Get color based on user role
function getRoleColor(role) {
    const colors = {
        student: 'a77bfd',
        employee: '10b981',
        admin: 'f59e0b'
    };
    return colors[role] || '6a40f8';
}

// Update profile badges
function updateProfileBadges() {
    if (!currentUser) return;
    
    const applications = JSON.parse(localStorage.getItem(`${currentUser.email}_applications`) || '[]');
    const savedJobs = JSON.parse(localStorage.getItem(`${currentUser.email}_saved_jobs`) || '[]');
    
    const applicationsBadge = document.getElementById('applicationsBadge');
    const savedJobsBadge = document.getElementById('savedJobsBadge');
    
    if (applicationsBadge) applicationsBadge.textContent = applications.length;
    if (savedJobsBadge) savedJobsBadge.textContent = savedJobs.length;
    
    // Hide badges if zero
    if (applicationsBadge && applications.length === 0) {
        applicationsBadge.style.display = 'none';
    } else if (applicationsBadge) {
        applicationsBadge.style.display = 'inline';
    }
    
    if (savedJobsBadge && savedJobs.length === 0) {
        savedJobsBadge.style.display = 'none';
    } else if (savedJobsBadge) {
        savedJobsBadge.style.display = 'inline';
    }
}

// Google Auth Setup
function setupGoogleAuth() {
    if (typeof gapi !== 'undefined') {
        gapi.load('auth2', function() {
            gapi.auth2.init({
                client_id: 'YOUR_CLIENT_ID.apps.googleusercontent.com'
            }).then(function() {
                console.log('Google Auth initialized');
            });
        });
    }
}

// Google Sign-In Handler
function onGoogleSignIn(googleUser) {
    const profile = googleUser.getBasicProfile();
    const userData = {
        id: `google_${profile.getId()}`,
        name: profile.getName(),
        email: profile.getEmail(),
        avatar: profile.getImageUrl(),
        role: selectedRole,
        authProvider: 'google',
        timestamp: new Date().toISOString()
    };
    
    handleAuthSuccess(userData, 'Google Sign-In Successful!');
}

// Modal Functions
function showLoginModal(userType = 'talent') {
    const modal = document.getElementById('authModal');
    modal.classList.add('show');
    currentAuthStep = 'role';
    showAuthStep('roleSelection');
    resetAuthForms();
}

function closeAuthModal() {
    const modal = document.getElementById('authModal');
    modal.classList.remove('show');
    currentAuthStep = 'role';
    resetAuthForms();
}

// Auth Step Management
function showAuthStep(step) {
    document.querySelectorAll('.auth-step').forEach(s => s.classList.remove('active'));
    document.getElementById(step).classList.add('active');
    currentAuthStep = step;
    updateProgressBar();
}

function goBackToRoleSelection() {
    showAuthStep('roleSelection');
}

function updateProgressBar() {
    const progressSteps = {
        'roleSelection': 33,
        'authForms': 66,
        'successStep': 100
    };
    
    const progressFill = document.querySelectorAll('.progress-fill');
    const progressText = document.querySelectorAll('.progress-text');
    
    progressFill.forEach(fill => {
        fill.style.width = `${progressSteps[currentAuthStep]}%`;
    });
    
    progressText.forEach(text => {
        const stepNum = ['roleSelection', 'authForms', 'successStep'].indexOf(currentAuthStep) + 1;
        text.textContent = stepNum === 3 ? 'Complete!' : `Step ${stepNum} of 3`;
    });
}

// Role Selection (Enhanced)
function selectAuthRole(role) {
    selectedRole = role;
    currentAuthRole = role;
    
    document.querySelectorAll('.role-option').forEach(option => {
        option.classList.remove('selected');
    });
    event.currentTarget.classList.add('selected');
    
    updateFormTitles();
    generateRoleSpecificField();
    
    // Add back button class for proper spacing
    const authStepHeader = document.querySelector('#authForms .auth-step-header');
    if (authStepHeader) {
        authStepHeader.classList.add('with-back-btn');
    }
    
    setTimeout(() => {
        showAuthStep('authForms');
    }, 300);
}

function updateFormTitles() {
    const roleTitles = {
        student: { login: 'Login as Student', subtitle: 'Access internships and entry-level opportunities' },
        employee: { login: 'Login as Employee', subtitle: 'Find premium full-time career opportunities' },
        admin: { login: 'Login as Administrator', subtitle: 'Manage opportunities and connect with talent' }
    };
    
    const titles = roleTitles[currentAuthRole] || roleTitles.student;
    document.getElementById('authStepTitle').textContent = titles.login;
    document.getElementById('authStepSubtitle').textContent = titles.subtitle;
}

function generateRoleSpecificField() {
    const container = document.getElementById('roleSpecificFieldContainer');
    const fieldConfigs = {
        student: {
            type: 'text',
            id: 'studentUniversity',
            label: 'University/Institution',
            placeholder: 'e.g., Stanford University'
        },
        employee: {
            type: 'text',
            id: 'employeeTitle',
            label: 'Current Job Title',
            placeholder: 'e.g., Software Engineer'
        },
        admin: {
            type: 'text',
            id: 'adminCompany',
            label: 'Company Name',
            placeholder: 'e.g., TechCorp Inc.'
        }
    };
    
    const config = fieldConfigs[currentAuthRole] || fieldConfigs.student;
    container.innerHTML = `
        <div class="form-group">
            <input type="${config.type}" id="${config.id}" placeholder="${config.placeholder}" required>
            <label for="${config.id}">${config.label}</label>
        </div>
    `;
}

// Form Switching
function switchToRegister() {
    document.getElementById('loginContainer').classList.remove('active');
    document.getElementById('registerContainer').classList.add('active');
    document.querySelector('#registerForm .auth-btn .btn-text').textContent = 'Create Account';
}

function switchToLogin() {
    document.getElementById('registerContainer').classList.remove('active');
    document.getElementById('loginContainer').classList.add('active');
    document.querySelector('#loginForm .auth-btn .btn-text').textContent = 'Sign In';
}

// Form Reset
function resetAuthForms() {
    document.getElementById('loginForm').reset();
    document.getElementById('registerForm').reset();
    document.getElementById('roleSpecificFieldContainer').innerHTML = '';
    
    document.querySelectorAll('.form-group label').forEach(label => {
        label.style.top = '1.25rem';
        label.style.fontSize = '0.875rem';
    });
    
    updateFormTitles();
    document.querySelector('#loginForm .auth-btn .btn-text').textContent = 'Sign In';
    document.querySelector('#registerForm .auth-btn .btn-text').textContent = 'Create Account';
    
    const authStepHeader = document.querySelector('#authForms .auth-step-header');
    if (authStepHeader) {
        authStepHeader.classList.remove('with-back-btn');
    }
}

// Enhanced Form Submission Handlers
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        handleLogin.call(this);
    });
    
    document.getElementById('registerForm').addEventListener('submit', function(e) {
        e.preventDefault();
        handleRegister.call(this);
    });
});

function handleLogin() {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    if (!email || !password) {
        showToast('Please fill in all fields', 'error');
        return;
    }
    
    if (!isValidEmail(email)) {
        showToast('Please enter a valid email address', 'error');
        return;
    }
    
    const submitBtn = this.querySelector('.auth-btn');
    showButtonLoading(submitBtn);
    
    setTimeout(() => {
        const storedUser = localStorage.getItem(`jobconnect_user_${email}`);
        if (storedUser) {
            const userData = JSON.parse(storedUser);
            if (userData.password === password && userData.role === currentAuthRole) {
                currentUser = userData;
                localStorage.setItem('jobconnect_current_user', JSON.stringify(userData));
                isAuthenticated = true;
                showAuthStep('successStep');
                document.getElementById('successTitle').textContent = 'Welcome Back!';
                document.getElementById('successMessage').textContent = `Hello ${userData.name}, we're glad to see you!`;
                updateUIForAuth();
                initializeProfileUI();
                hideButtonLoading(submitBtn);
            } else {
                showToast('Invalid email or password', 'error');
                hideButtonLoading(submitBtn);
            }
        } else {
            showToast('No account found. Please register first.', 'error');
            hideButtonLoading(submitBtn);
        }
    }, 1500);
}

function handleRegister() {
    const name = document.getElementById('registerName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    let roleFieldValue = '';
    
    const roleFieldId = currentAuthRole === 'student' ? 'studentUniversity' : 
                       currentAuthRole === 'employee' ? 'employeeTitle' : 'adminCompany';
    const roleField = document.getElementById(roleFieldId);
    
    if (roleField) {
        roleFieldValue = roleField.value.trim();
    }
    
    if (!name || !email || !password || !roleFieldValue) {
        showToast('Please fill in all fields', 'error');
        return;
    }
    
    if (!isValidEmail(email)) {
        showToast('Please enter a valid email address', 'error');
        return;
    }
    
    if (password.length < 6) {
        showToast('Password must be at least 6 characters', 'error');
        return;
    }
    
    if (localStorage.getItem(`jobconnect_user_${email}`)) {
        showToast('An account with this email already exists', 'error');
        return;
    }
    
    const submitBtn = this.querySelector('.auth-btn');
    showButtonLoading(submitBtn);
    
    setTimeout(() => {
        const userData = {
            id: `user_${Date.now()}`,
            name: name,
            email: email,
            password: password,
            role: currentAuthRole,
            authProvider: 'email',
            timestamp: new Date().toISOString(),
            avatar: null,
            notifications: true,
            emailVerified: false,
            phone: '',
            location: '',
            bio: '',
            linkedin: '',
            github: '',
            [currentAuthRole === 'student' ? 'university' : 
             currentAuthRole === 'employee' ? 'jobTitle' : 'company']: roleFieldValue,
            applications: [],
            savedJobs: []
        };
        
        localStorage.setItem(`jobconnect_user_${email}`, JSON.stringify(userData));
        localStorage.setItem('jobconnect_current_user', JSON.stringify(userData));
        
        currentUser = userData;
        isAuthenticated = true;
        
        showAuthStep('successStep');
        document.getElementById('successTitle').textContent = 'Account Created!';
        document.getElementById('successMessage').textContent = `Welcome ${name}! Your account has been created successfully.`;
        
        updateUIForAuth();
        initializeProfileUI();
        hideButtonLoading(submitBtn);
    }, 2000);
}

// Enhanced Profile Functions
function showProfile() {
    if (!isAuthenticated) {
        showLoginModal();
        return;
    }
    
    toggleProfileDropdown(); // Close dropdown
    
    const applications = JSON.parse(localStorage.getItem(`${currentUser.email}_applications`) || '[]');
    const savedJobs = JSON.parse(localStorage.getItem(`${currentUser.email}_saved_jobs`) || '[]');
    
    const roleSpecific = currentUser.role === 'student' ? `University: ${currentUser.university || 'Not specified'}` :
                        currentUser.role === 'employee' ? `Job Title: ${currentUser.jobTitle || 'Not specified'}` :
                        `Company: ${currentUser.company || 'Not specified'}`;
    
    const profileInfo = `
🎯 **Profile Overview**
👤 Name: ${currentUser.name}
📧 Email: ${currentUser.email}
🎓 Role: ${currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)}
${roleSpecific}

📊 **Activity**
📋 Applications: ${applications.length}
⭐ Saved Jobs: ${savedJobs.length}
🔔 Notifications: ${currentUser.notifications ? 'Enabled' : 'Disabled'}

🌐 **Contact Info**
📍 Location: ${currentUser.location || 'Not specified'}
📱 Phone: ${currentUser.phone || 'Not specified'}
💼 LinkedIn: ${currentUser.linkedin ? currentUser.linkedin : 'Not connected'}
🐙 GitHub: ${currentUser.github ? currentUser.github : 'Not connected'}

✍️ **About**
${currentUser.bio ? `"${currentUser.bio}"` : 'Add a bio to showcase your story!'}
    `;
    
    // Enhanced alert with better formatting
    const profileModal = createProfileModal(profileInfo, 'Profile');
    document.body.appendChild(profileModal);
    profileModal.showModal();
    
    // Auto-close after 10 seconds
    setTimeout(() => {
        profileModal.close();
        document.body.removeChild(profileModal);
    }, 10000);
}

function showProfileSettings() {
    if (!isAuthenticated) {
        showLoginModal();
        return;
    }
    
    toggleProfileDropdown();
    
    const settingsContent = `
<div class="settings-modal-content">
    <div class="settings-header">
        <h2><i class="fas fa-cog"></i> Profile Settings</h2>
        <button onclick="this.closest('dialog').close()" class="close-btn">&times;</button>
    </div>
    
    <div class="settings-tabs">
        <button class="tab-btn active" onclick="switchSettingsTab('personal')">
            <i class="fas fa-user"></i> Personal Info
        </button>
        <button class="tab-btn" onclick="switchSettingsTab('privacy')">
            <i class="fas fa-lock"></i> Privacy
        </button>
        <button class="tab-btn" onclick="switchSettingsTab('notifications')">
            <i class="fas fa-bell"></i> Notifications
        </button>
    </div>
    
    <div class="settings-content">
        <!-- Personal Info Tab -->
        <div class="tab-content active" id="personal-tab">
            <form class="settings-form" id="personalForm">
                <div class="form-row">
                    <div class="form-group">
                        <label for="settingsName">Full Name</label>
                        <input type="text" id="settingsName" value="${currentUser.name}">
                    </div>
                    <div class="form-group">
                        <label for="settingsPhone">Phone</label>
                        <input type="tel" id="settingsPhone" value="${currentUser.phone || ''}" placeholder="+1 (555) 123-4567">
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="settingsLocation">Location</label>
                        <input type="text" id="settingsLocation" value="${currentUser.location || ''}" placeholder="City, State">
                    </div>
                    <div class="form-group">
                        <label for="settingsBio">Bio</label>
                        <textarea id="settingsBio" placeholder="Tell us about yourself...">${currentUser.bio || ''}</textarea>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="settingsLinkedin">LinkedIn</label>
                        <input type="url" id="settingsLinkedin" value="${currentUser.linkedin || ''}" placeholder="https://linkedin.com/in/yourprofile">
                    </div>
                    <div class="form-group">
                        <label for="settingsGithub">GitHub</label>
                        <input type="url" id="settingsGithub" value="${currentUser.github || ''}" placeholder="https://github.com/yourusername">
                    </div>
                </div>
                
                <button type="submit" class="save-btn">Save Changes</button>
            </form>
        </div>
        
        <!-- Privacy Tab -->
        <div class="tab-content" id="privacy-tab">
            <div class="privacy-settings">
                <div class="setting-item">
                    <div class="setting-info">
                        <i class="fas fa-eye"></i>
                        <div>
                            <h4>Profile Visibility</h4>
                            <p>Who can see your profile</p>
                        </div>
                    </div>
                    <select id="profileVisibility">
                        <option value="public" ${currentUser.profileVisibility === 'public' ? 'selected' : ''}>Public</option>
                        <option value="connections" ${currentUser.profileVisibility === 'connections' ? 'selected' : ''}>Connections Only</option>
                        <option value="private" ${currentUser.profileVisibility === 'private' ? 'selected' : ''}>Private</option>
                    </select>
                </div>
                
                <div class="setting-item">
                    <div class="setting-info">
                        <i class="fas fa-search"></i>
                        <div>
                            <h4>Search Engine Indexing</h4>
                            <p>Allow search engines to index your profile</p>
                        </div>
                    </div>
                    <label class="toggle-switch">
                        <input type="checkbox" id="searchIndexing" ${currentUser.searchIndexing ? 'checked' : ''}>
                        <span class="toggle-slider"></span>
                    </label>
                </div>
                
                <button class="save-btn" onclick="savePrivacySettings()">Save Privacy Settings</button>
            </div>
        </div>
        
        <!-- Notifications Tab -->
        <div class="tab-content" id="notifications-tab">
            <div class="notification-settings">
                <h4>Email Notifications</h4>
                <div class="setting-item">
                    <div class="setting-info">
                        <i class="fas fa-envelope"></i>
                        <div>
                            <h5>Job Application Updates</h5>
                            <p>Get notified when employers respond to your applications</p>
                        </div>
                    </div>
                    <label class="toggle-switch">
                        <input type="checkbox" id="notifyApplications" ${currentUser.notifyApplications ? 'checked' : ''}>
                        <span class="toggle-slider"></span>
                    </label>
                </div>
                
                <div class="setting-item">
                    <div class="setting-info">
                        <i class="fas fa-star"></i>
                        <div>
                            <h5>New Job Matches</h5>
                            <p>Receive alerts for jobs matching your preferences</p>
                        </div>
                    </div>
                    <label class="toggle-switch">
                        <input type="checkbox" id="notifyJobMatches" ${currentUser.notifyJobMatches ? 'checked' : ''}>
                        <span class="toggle-slider"></span>
                    </label>
                </div>
                
                <h4>App Notifications</h4>
                <div class="setting-item">
                    <div class="setting-info">
                        <i class="fas fa-bell"></i>
                        <div>
                            <h5>Push Notifications</h5>
                            <p>Enable browser notifications for instant alerts</p>
                        </div>
                    </div>
                    <label class="toggle-switch">
                        <input type="checkbox" id="pushNotifications" ${currentUser.pushNotifications ? 'checked' : ''}>
                        <span class="toggle-slider"></span>
                    </label>
                </div>
                
                <button class="save-btn" onclick="saveNotificationSettings()">Save Notification Settings</button>
            </div>
        </div>
    </div>
</div>
    `;
    
    const settingsModal = createProfileModal(settingsContent, 'Settings');
    document.body.appendChild(settingsModal);
    settingsModal.showModal();
    
    // Setup form listeners
    setupSettingsFormListeners();
}

// Applications and Saved Jobs
function showApplications() {
    if (!isAuthenticated) {
        showLoginModal();
        return;
    }
    
    toggleProfileDropdown();
    
    const applications = JSON.parse(localStorage.getItem(`${currentUser.email}_applications`) || '[]');
    
    if (applications.length === 0) {
        showToast('No applications yet. Start applying to track your progress!', 'info');
        return;
    }
    
    const applicationsContent = `
<div class="applications-modal-content">
    <div class="modal-header">
        <h2><i class="fas fa-briefcase"></i> My Applications (${applications.length})</h2>
        <button onclick="this.closest('dialog').close()" class="close-btn">&times;</button>
    </div>
    
    <div class="applications-list">
        ${applications.map(app => `
            <div class="application-item ${app.status}">
                <div class="app-header">
                    <h4>${app.jobTitle}</h4>
                    <span class="company">${app.company}</span>
                    <span class="status-badge ${app.status}">${app.status.toUpperCase()}</span>
                </div>
                <div class="app-details">
                    <p><i class="fas fa-dollar-sign"></i> ${app.salary}</p>
                    <p><i class="fas fa-calendar"></i> Applied: ${new Date(app.appliedAt).toLocaleDateString()}</p>
                </div>
                <div class="app-actions">
                    <button class="action-btn withdraw-btn" onclick="withdrawApplication(${app.id})">
                        <i class="fas fa-times"></i> Withdraw
                    </button>
                </div>
            </div>
        `).join('')}
    </div>
</div>
    `;
    
    const appModal = createProfileModal(applicationsContent, 'Applications');
    document.body.appendChild(appModal);
    appModal.showModal();
}

function showSavedJobs() {
    if (!isAuthenticated) {
        showLoginModal();
        return;
    }
    
    toggleProfileDropdown();
    
    const savedJobs = JSON.parse(localStorage.getItem(`${currentUser.email}_saved_jobs`) || '[]');
    
    if (savedJobs.length === 0) {
        showToast('No saved jobs yet. Click the bookmark icon on job cards to save them!', 'info');
        return;
    }
    
    const savedJobsContent = `
<div class="saved-jobs-modal-content">
    <div class="modal-header">
        <h2><i class="fas fa-bookmark"></i> Saved Jobs (${savedJobs.length})</h2>
        <button onclick="this.closest('dialog').close()" class="close-btn">&times;</button>
    </div>
    
    <div class="saved-jobs-list">
        ${savedJobs.map(job => `
            <div class="saved-job-item">
                <div class="job-header">
                    <h4>${job.title}</h4>
                    <span class="company">${job.company}</span>
                </div>
                <div class="job-details">
                    <p><i class="fas fa-dollar-sign"></i> ${job.salary}</p>
                    <p><i class="fas fa-map-marker-alt"></i> ${job.location}</p>
                    <p><i class="fas fa-calendar"></i> Saved: ${new Date(job.savedAt).toLocaleDateString()}</p>
                </div>
                <div class="job-actions">
                    <button class="action-btn apply-btn" onclick="handleApply(${job.jobId}, '${job.title}')">
                        <i class="fas fa-paper-plane"></i> Apply Now
                    </button>
                    <button class="action-btn remove-btn" onclick="removeSavedJob(${job.id})">
                        <i class="fas fa-trash"></i> Remove
                    </button>
                </div>
            </div>
        `).join('')}
    </div>
</div>
    `;
    
    const savedModal = createProfileModal(savedJobsContent, 'Saved Jobs');
    document.body.appendChild(savedModal);
    savedModal.showModal();
}

// Settings Form Handlers
function setupSettingsFormListeners() {
    const personalForm = document.getElementById('personalForm');
    if (personalForm) {
        personalForm.addEventListener('submit', function(e) {
            e.preventDefault();
            savePersonalSettings();
        });
    }
}

function switchSettingsTab(tabName) {
    // Update active tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.currentTarget.classList.add('active');
    
    // Update active tab content
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.getElementById(`${tabName}-tab`).classList.add('active');
}

function savePersonalSettings() {
    const name = document.getElementById('settingsName').value.trim();
    const phone = document.getElementById('settingsPhone').value.trim();
    const location = document.getElementById('settingsLocation').value.trim();
    const bio = document.getElementById('settingsBio').value.trim();
    const linkedin = document.getElementById('settingsLinkedin').value.trim();
    const github = document.getElementById('settingsGithub').value.trim();
    
    if (!name) {
        showToast('Name is required', 'error');
        return;
    }
    
    // Update user data
    currentUser.name = name;
    currentUser.phone = phone;
    currentUser.location = location;
    currentUser.bio = bio;
    currentUser.linkedin = linkedin;
    currentUser.github = github;
    
    // Save to localStorage
    localStorage.setItem(`jobconnect_user_${currentUser.email}`, JSON.stringify(currentUser));
    localStorage.setItem('jobconnect_current_user', JSON.stringify(currentUser));
    
    // Update UI
    initializeProfileUI();
    showToast('Profile updated successfully!', 'success');
    
    // Close modal
    document.querySelector('dialog').close();
}

function savePrivacySettings() {
    const visibility = document.getElementById('profileVisibility').value;
    const searchIndexing = document.getElementById('searchIndexing').checked;
    
    currentUser.profileVisibility = visibility;
    currentUser.searchIndexing = searchIndexing;
    
    localStorage.setItem(`jobconnect_user_${currentUser.email}`, JSON.stringify(currentUser));
    localStorage.setItem('jobconnect_current_user', JSON.stringify(currentUser));
    
    showToast('Privacy settings updated!', 'success');
}

function saveNotificationSettings() {
    const notifyApplications = document.getElementById('notifyApplications').checked;
    const notifyJobMatches = document.getElementById('notifyJobMatches').checked;
    const pushNotifications = document.getElementById('pushNotifications').checked;
    
    currentUser.notifyApplications = notifyApplications;
    currentUser.notifyJobMatches = notifyJobMatches;
    currentUser.pushNotifications = pushNotifications;
    currentUser.notifications = notifyApplications || notifyJobMatches || pushNotifications;
    
    localStorage.setItem(`jobconnect_user_${currentUser.email}`, JSON.stringify(currentUser));
    localStorage.setItem('jobconnect_current_user', JSON.stringify(currentUser));
    
    showToast('Notification settings updated!', 'success');
}

// Application Management
function withdrawApplication(appId) {
    if (confirm('Are you sure you want to withdraw this application?')) {
        const applications = JSON.parse(localStorage.getItem(`${currentUser.email}_applications`) || '[]');
        const updatedApps = applications.filter(app => app.id !== appId);
        
        localStorage.setItem(`${currentUser.email}_applications`, JSON.stringify(updatedApps));
        updateProfileBadges();
        showToast('Application withdrawn successfully', 'success');
        
        // Refresh modal
        showApplications();
    }
}

function removeSavedJob(jobId) {
    if (confirm('Remove this job from saved?')) {
        const savedJobs = JSON.parse(localStorage.getItem(`${currentUser.email}_saved_jobs`) || '[]');
        const updatedSaved = savedJobs.filter(job => job.id !== jobId);
        
        localStorage.setItem(`${currentUser.email}_saved_jobs`, JSON.stringify(updatedSaved));
        updateProfileBadges();
        showToast('Job removed from saved list', 'success');
        
        // Refresh modal
        showSavedJobs();
    }
}

// Utility Functions
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showButtonLoading(button) {
    const content = button.querySelector('.btn-content');
    const text = content.querySelector('.btn-text');
    const loading = content.querySelector('.btn-loading');
    
    text.style.opacity = '0';
    loading.style.display = 'inline-block';
    button.disabled = true;
}

function hideButtonLoading(button) {
    const content = button.querySelector('.btn-content');
    const text = content.querySelector('.btn-text');
    const loading = content.querySelector('.btn-loading');
    
    text.style.opacity = '1';
    loading.style.display = 'none';
    button.disabled = false;
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('successToast');
    const toastMessage = document.getElementById('toastMessage');
    const toastIcon = toast.querySelector('i');
    
    toastMessage.textContent = message;
    toast.className = `success-toast ${type}`;
    toast.classList.add('show');
    
    // Update icon based on type
    toastIcon.className = type === 'error' ? 'fas fa-exclamation-triangle' : 
                         type === 'info' ? 'fas fa-info-circle' : 'fas fa-check';
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 4000);
    
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.onclick = () => {
        toast.classList.remove('show');
    };
}

// Modal Creation Helper
function createProfileModal(content, title) {
    const modal = document.createElement('dialog');
    modal.className = 'profile-modal';
    modal.innerHTML = `
        <div class="profile-modal-overlay" onclick="this.closest('dialog').close()"></div>
        ${content}
    `;
    return modal;
}

// UI Updates
function updateUIForAuth() {
    document.getElementById('authControls').style.display = 'flex';
    document.getElementById('mainNav').style.display = 'none';
    updateApplyButtons();
    
    document.querySelectorAll('.job-card').forEach(card => {
        card.classList.add('authenticated');
        // Add save button to job cards
        addSaveButtonToCard(card);
    });
}

function addSaveButtonToCard(card) {
    const footer = card.querySelector('.job-footer');
    if (!footer.querySelector('.save-btn')) {
        const saveBtn = document.createElement('button');
        saveBtn.className = 'save-btn';
        saveBtn.innerHTML = '<i class="far fa-bookmark"></i>';
        saveBtn.title = 'Save Job';
        saveBtn.onclick = () => toggleSaveJob(card.dataset.jobId, card.querySelector('h3').textContent);
        footer.appendChild(saveBtn);
    }
}

function updateApplyButtons() {
    document.querySelectorAll('.apply-btn').forEach(btn => {
        const textSpan = btn.querySelector('.btn-text');
        if (textSpan) {
            textSpan.textContent = isAuthenticated ? 'Apply Now' : 'Login to Apply';
        }
    });
}

function checkAuthStatus() {
    const savedUser = localStorage.getItem('jobconnect_current_user');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        isAuthenticated = true;
        updateUIForAuth();
        initializeProfileUI();
        console.log('User restored from session:', currentUser.email);
    }
}

// Enhanced Apply Function with Save
function handleApply(jobId, jobTitle) {
    if (!isAuthenticated) {
        showLoginModal('talent');
        setTimeout(() => {
            showToast(`Login to apply for "${jobTitle}"`, 'info');
        }, 500);
        return;
    }
    
    const applyBtn = event.target.closest('.apply-btn');
    const originalText = applyBtn.querySelector('.btn-text').textContent;
    
    applyBtn.querySelector('.btn-text').textContent = 'Applying...';
    applyBtn.disabled = true;
    
    setTimeout(() => {
        const applications = JSON.parse(localStorage.getItem(`${currentUser.email}_applications`) || '[]');
        const application = {
            id: Date.now(),
            jobId: jobId,
            jobTitle: jobTitle,
            company: jobDatabase[jobId].company,
            salary: jobDatabase[jobId].salary,
            appliedAt: new Date().toISOString(),
            status: 'pending'
        };
        
        applications.unshift(application);
        localStorage.setItem(`${currentUser.email}_applications`, JSON.stringify(applications));
        
        applyBtn.querySelector('.btn-text').textContent = 'Applied!';
        applyBtn.style.background = '#10b981';
        applyBtn.disabled = false;
        
        showToast(`Application submitted for "${jobTitle}"! We'll contact you soon.`, 'success');
        updateProfileBadges();
    }, 1500);
}

// Save Job Functionality
function toggleSaveJob(jobId, jobTitle) {
    if (!isAuthenticated) {
        showLoginModal();
        return;
    }
    
    const savedJobs = JSON.parse(localStorage.getItem(`${currentUser.email}_saved_jobs`) || '[]');
    const existingJob = savedJobs.find(job => job.jobId == jobId);
    const saveBtn = event.target.closest('.save-btn');
    
    if (existingJob) {
        // Remove from saved
        const updatedSaved = savedJobs.filter(job => job.jobId != jobId);
        localStorage.setItem(`${currentUser.email}_saved_jobs`, JSON.stringify(updatedSaved));
        saveBtn.innerHTML = '<i class="far fa-bookmark"></i>';
        saveBtn.title = 'Save Job';
        showToast(`${jobTitle} removed from saved jobs`, 'info');
    } else {
        // Add to saved
        const jobData = {
            id: Date.now(),
            jobId: jobId,
            title: jobTitle,
            company: jobDatabase[jobId].company,
            salary: jobDatabase[jobId].salary,
            location: 'Remote', // Default, would come from actual data
            savedAt: new Date().toISOString()
        };
        
        savedJobs.unshift(jobData);
        localStorage.setItem(`${currentUser.email}_saved_jobs`, JSON.stringify(savedJobs));
        saveBtn.innerHTML = '<i class="fas fa-bookmark"></i>';
        saveBtn.title = 'Saved';
        showToast(`${jobTitle} saved successfully`, 'success');
    }
    
    updateProfileBadges();
}

// Authentication Flow Completion
function completeAuthFlow() {
    closeAuthModal();
    showToast('Welcome to JobConnect! Start exploring premium opportunities.', 'success');
    
    setTimeout(() => {
        document.querySelector('.opportunities-section').scrollIntoView({
            behavior: 'smooth'
        });
    }, 300);
}

// Logout
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        currentUser = null;
        isAuthenticated = false;
        localStorage.removeItem('jobconnect_current_user');
        
        document.getElementById('authControls').style.display = 'none';
        document.getElementById('mainNav').style.display = 'flex';
        
        updateApplyButtons();
        document.querySelectorAll('.job-card').forEach(card => {
            card.classList.remove('authenticated');
            const saveBtn = card.querySelector('.save-btn');
            if (saveBtn) saveBtn.remove();
        });
        
        // Reset profile UI
        document.getElementById('profileName').textContent = '';
        document.getElementById('profileAvatar').src = 'https://via.placeholder.com/32x32/6a40f8/ffffff?text=👤';
        
        showToast('Logged out successfully', 'success');
        toggleProfileDropdown(); // Close dropdown if open
    }
}

// Mobile Menu
function toggleMobileMenu() {
    const nav = document.getElementById('mainNav');
    const icon = document.getElementById('hamburgerIcon');
    const authControls = document.getElementById('authControls');
    
    nav.classList.toggle('active');
    authControls.classList.toggle('active');
    icon.classList.toggle('fa-bars');
    icon.classList.toggle('fa-times');
}

// Search Functionality
function searchJobs() {
    const query = document.getElementById('searchInput').value.toLowerCase().trim();
    const jobCards = document.querySelectorAll('.job-card');
    let visibleCount = 0;
    
    jobCards.forEach(card => {
        const title = card.querySelector('h3').textContent.toLowerCase();
        const company = card.querySelector('.company').textContent.toLowerCase();
        const skills = Array.from(card.querySelectorAll('.skills span')).map(span => span.textContent.toLowerCase());
        const description = card.querySelector('.description').textContent.toLowerCase();
        
        const matches = title.includes(query) || 
                       company.includes(query) || 
                       skills.some(skill => skill.includes(query)) ||
                       description.includes(query);
        
        card.style.display = matches ? 'block' : 'none';
        if (matches) visibleCount++;
    });
    
    if (visibleCount === 0 && query !== '') {
        showNoResults();
    } else if (query === '') {
        jobCards.forEach(card => card.style.display = 'block');
    }
}

function showNoResults() {
    const grid = document.getElementById('jobGrid');
    grid.innerHTML = `
        <div class="no-results">
            <i class="fas fa-search"></i>
            <h3>No Jobs Found</h3>
            <p>Try different keywords or clear your search to see all opportunities</p>
            <button class="btn-primary" onclick="clearSearch()">Clear Search</button>
        </div>
    `;
}

function clearSearch() {
    document.getElementById('searchInput').value = '';
    const originalGrid = document.getElementById('jobGrid');
    originalGrid.innerHTML = `
        <div class="job-card" data-job-id="1">
            <div class="job-header">
                <span class="job-type full-time">Full time</span>
                <span class="job-time"><i class="far fa-clock"></i> 2 days ago</span>
            </div>
            <h3>Senior Frontend Developer</h3>
            <p class="company">TechVision Inc</p>
            <p class="location"><i class="fas fa-map-marker-alt"></i> San Francisco, CA</p>
            <p class="description">Join our elite team to build next-generation user experiences with cutting-edge technologies.</p>
            <div class="skills">
                <span>React</span>
                <span>TypeScript</span>
                <span>GraphQL</span>
                <span>Next.js</span>
            </div>
            <div class="job-footer">
                <span class="salary"><i class="fas fa-star"></i> $120k - $180k</span>
                <button class="apply-btn" onclick="handleApply(1, 'Senior Frontend Developer')">
                    <span class="btn-text">Apply Now</span>
                    <i class="fas fa-arrow-right"></i>
                </button>
            </div>
        </div>

        <div class="job-card" data-job-id="2">
            <div class="job-header">
                <span class="job-type full-time">Full time</span>
                <span class="job-time"><i class="far fa-clock"></i> 1 day ago</span>
                <span class="featured-tag">Featured</span>
            </div>
            <h3>Product Marketing Lead</h3>
            <p class="company">InnovateLabs</p>
            <p class="location"><i class="fas fa-map-marker-alt"></i> Remote</p>
            <p class="description">Drive product strategy and growth for revolutionary B2B SaaS solutions.</p>
            <div class="skills">
                <span>Strategy</span>
                <span>Analytics</span>
                <span>Growth</span>
                <span>Leadership</span>
            </div>
            <div class="job-footer">
                <span class="salary"><i class="fas fa-star"></i> $90k - $140k</span>
                <button class="apply-btn" onclick="handleApply(2, 'Product Marketing Lead')">
                    <span class="btn-text">Apply Now</span>
                    <i class="fas fa-arrow-right"></i>
                </button>
            </div>
        </div>

        <div class="job-card" data-job-id="3">
            <div class="job-header">
                <span class="job-type internship">Internship</span>
                <span class="job-time"><i class="far fa-clock"></i> 3 days ago</span>
            </div>
            <h3>AI Research Intern</h3>
            <p class="company">DeepMind Labs</p>
            <p class="location"><i class="fas fa-map-marker-alt"></i> London, UK</p>
            <p class="description">Contribute to groundbreaking research in artificial intelligence and machine learning.</p>
            <div class="skills">
                <span>Python</span>
                <span>TensorFlow</span>
                <span>Research</span>
                <span>Mathematics</span>
            </div>
            <div class="job-footer">
                <span class="salary"><i class="fas fa-star"></i> $8k/month</span>
                <button class="apply-btn" onclick="handleApply(3, 'AI Research Intern')">
                    <span class="btn-text">Apply Now</span>
                    <i class="fas fa-arrow-right"></i>
                </button>
            </div>
        </div>
    `;
    
    if (isAuthenticated) {
        updateUIForAuth();
    } else {
        updateApplyButtons();
    }
}

// Expose functions globally
window.showLoginModal = showLoginModal;
window.closeAuthModal = closeAuthModal;
window.selectAuthRole = selectAuthRole;
window.switchToRegister = switchToRegister;
window.switchToLogin = switchToLogin;
window.handleLogin = handleLogin;
window.handleRegister = handleRegister;
window.onGoogleSignIn = onGoogleSignIn;
window.handleApply = handleApply;
window.showProfile = showProfile;
window.showProfileSettings = showProfileSettings;
window.showApplications = showApplications;
window.showSavedJobs = showSavedJobs;
window.logout = logout;
window.toggleMobileMenu = toggleMobileMenu;
window.searchJobs = searchJobs;
window.clearSearch = clearSearch;
window.toggleProfileDropdown = toggleProfileDropdown;
window.onLoad = setupGoogleAuth;