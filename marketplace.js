document.addEventListener('DOMContentLoaded', () => {
    initRoleSelector();
    initProfileForm();
    loadSavedProfile();
    checkPendingProfile();
});

function checkPendingProfile() {
    const pendingProfile = sessionStorage.getItem('pendingFarmerProfile');
    if (pendingProfile) {
        const profileData = JSON.parse(pendingProfile);
        sessionStorage.setItem('currentProfile', JSON.stringify(profileData));
        sessionStorage.removeItem('pendingFarmerProfile');
        
        document.getElementById('role-selector').style.display = 'none';
        document.getElementById('user-profile-section').style.display = 'none';
        displayFarmerDashboard(profileData);
    }
}

function initRoleSelector() {
    const roleCards = document.querySelectorAll('.role-card');
    const userRoleInput = document.getElementById('user-role');
    const selectedRoleDisplay = document.getElementById('selected-role');

    roleCards.forEach(card => {
        card.addEventListener('click', () => {
            roleCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');

            const role = card.dataset.role;
            userRoleInput.value = role;
            
            const roleText = role.charAt(0).toUpperCase() + role.slice(1);
            selectedRoleDisplay.textContent = roleText;
            selectedRoleDisplay.style.color = 'var(--primary)';
            selectedRoleDisplay.style.fontWeight = '500';

            toggleRoleSpecificFields(role);
            scrollToForm();
        });
    });
}

function populateFormWithData(data) {
    document.getElementById('user-name').value = data.name || '';
    document.getElementById('user-role').value = data.role || '';
    document.getElementById('user-phone').value = data.phone || '';
    document.getElementById('user-address').value = data.address || '';
    document.getElementById('user-county').value = data.county || '';
    
    if (data.role) {
        document.getElementById('selected-role').textContent = 
            data.role.charAt(0).toUpperCase() + data.role.slice(1);
        toggleRoleSpecificFields(data.role);
    }
    
    if (data.role === 'seller') {
        document.getElementById('farm-name').value = data.farmName || '';
        document.getElementById('primary-crops').value = data.primaryCrops || '';
    } else if (data.role === 'buyer') {
        document.getElementById('business-type').value = data.businessType || '';
    }
}

function displayProfile(data) {
    const profileDisplay = document.getElementById('profile-display');
    const roleText = data.role.charAt(0).toUpperCase() + data.role.slice(1);
    
    let profileHTML = `
        <div class="profile-card-display">
            <div class="profile-field">
                <span class="profile-label">Name</span>
                <span class="profile-value">${escapeHtml(data.name)}</span>
            </div>
            <div class="profile-field">
                <span class="profile-label">Role</span>
                <span class="profile-value profile-role">${roleText}</span>
            </div>
            <div class="profile-field">
                <span class="profile-label">Phone</span>
                <span class="profile-value">${escapeHtml(data.phone)}</span>
            </div>
            <div class="profile-field">
                <span class="profile-label">Address</span>
                <span class="profile-value">${escapeHtml(data.address)}</span>
            </div>
            <div class="profile-field">
                <span class="profile-label">County</span>
                <span class="profile-value">${escapeHtml(data.county)}</span>
            </div>
    `;

    if (data.role === 'seller' && data.farmName) {
        profileHTML += `
            <div class="profile-field">
                <span class="profile-label">Farm Name</span>
                <span class="profile-value">${escapeHtml(data.farmName)}</span>
            </div>
            <div class="profile-field">
                <span class="profile-label">Primary Products</span>
                <span class="profile-value">${escapeHtml(data.primaryCrops)}</span>
            </div>
        `;
    } else if (data.role === 'buyer' && data.businessType) {
        profileHTML += `
            <div class="profile-field">
                <span class="profile-label">Business Type</span>
                <span class="profile-value">${escapeHtml(data.businessType)}</span>
            </div>
        `;
    }

    if (data.subscription) {
        profileHTML += `
            <div class="profile-field">
                <span class="profile-label">Subscription Plan</span>
                <span class="profile-value profile-role">${escapeHtml(data.subscription.planName)}</span>
            </div>
            <div class="profile-field">
                <span class="profile-label">Monthly Fee</span>
                <span class="profile-value">${escapeHtml(data.subscription.price)}</span>
            </div>
        `;
    }

    profileHTML += `
        <div class="profile-actions">
            <button class="btn-secondary" onclick="editProfile()">Edit Profile</button>
            <button class="btn-secondary" onclick="clearProfile()">Clear Profile</button>
        </div>
    `;

    profileDisplay.innerHTML = profileHTML;
}

function editProfile() {
    document.querySelector('.role-selector').scrollIntoView({ behavior: 'smooth' });
}

function clearProfile() {
    if (confirm('Are you sure you want to clear your profile?')) {
        sessionStorage.removeItem('currentProfile');
        document.getElementById('profile-display').innerHTML = 
            '<div class="info-empty">Select a role and fill in the form to create your profile</div>';
        document.getElementById('user-profile-form').reset();
        document.getElementById('user-role').value = '';
        document.getElementById('selected-role').textContent = 'Select a role above';
    }
}

function showSubscriptionSection() {
    const subscriptionSection = document.getElementById('subscription-section');
    subscriptionSection.style.display = 'block';
    subscriptionSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

    const planButtons = document.querySelectorAll('.select-plan');
    planButtons.forEach(button => {
        button.addEventListener('click', handlePlanSelection);
    });
}

function handlePlanSelection(e) {
    const planCard = e.target.closest('.subscription-card');
    const plan = planCard.dataset.plan;
    const planName = planCard.querySelector('.subscription-tier').textContent;
    const price = planCard.querySelector('.price-amount').textContent;

    const currentProfile = JSON.parse(sessionStorage.getItem('currentProfile'));
    currentProfile.subscription = {
        plan: plan,
        planName: planName,
        price: price,
        selectedAt: new Date().toISOString()
    };

    saveProfile(currentProfile);
    displayProfile(currentProfile);

    const subscriptionResult = document.getElementById('subscription-result');
    subscriptionResult.textContent = `✓ You have selected the ${planName} plan (${price}/month). Redirecting to marketplace...`;
    subscriptionResult.style.padding = '1rem';
    subscriptionResult.style.background = 'var(--success)';
    subscriptionResult.style.color = 'white';
    subscriptionResult.style.animation = 'fadeIn 0.3s';

    document.getElementById('subscription-section').scrollIntoView({ behavior: 'smooth', block: 'end' });

    setTimeout(() => {
        window.location.href = 'marketplace.html';
    }, 2000);
}



function resetForm() {
    document.getElementById('user-profile-form').reset();
    document.getElementById('user-role').value = '';
    document.getElementById('selected-role').textContent = 'Select a role above';
    document.querySelector('.role-card.active')?.classList.remove('active');
    document.getElementById('profile-form-container').style.display = 'none';
}

function showFormResult(message, type) {
    const resultDiv = document.getElementById('form-result');
    resultDiv.textContent = message;
    resultDiv.style.padding = '1rem';
    resultDiv.style.marginTop = '1rem';
    resultDiv.style.borderRadius = '8px';
    resultDiv.style.background = type === 'success' ? 'var(--success)' : 'var(--danger)';
    resultDiv.style.color = 'white';
    resultDiv.style.animation = 'fadeIn 0.3s';

    setTimeout(() => {
        resultDiv.style.opacity = '0';
        setTimeout(() => {
            resultDiv.textContent = '';
            resultDiv.style.padding = '0';
            resultDiv.style.marginTop = '0';
            resultDiv.style.opacity = '1';
        }, 300);
    }, 3500);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function displayFarmerDashboard(profileData) {
    const marketplaceSection = document.querySelector('.marketplace-features');
    const planFeatures = {
        basic: ['List 5 products', 'Basic analytics', 'Direct messaging', 'Email support'],
        professional: ['List 25 products', 'Advanced analytics', 'SMS marketing (500 credits)', 'Weather & pest alerts', 'Priority support'],
        enterprise: ['Unlimited listings', 'Full analytics suite', 'Bulk campaigns', 'SMS credits (2,000/month)', '24/7 dedicated support']
    };

    const dashboardHTML = `
        <div class="farmer-dashboard">
            <div class="dashboard-header">
                <h2 class="dashboard-title">Welcome, ${escapeHtml(profileData.farmName || profileData.name)}!</h2>
                <p class="dashboard-subtitle">Your ${escapeHtml(profileData.subscription.planName)} Plan is Active</p>
            </div>
            <div class="dashboard-grid">
                <div class="dashboard-card">
                    <h3 class="card-heading">Farm Profile</h3>
                    <div class="dashboard-field">
                        <span class="field-label">Farm Name:</span>
                        <span class="field-value">${escapeHtml(profileData.farmName)}</span>
                    </div>
                    <div class="dashboard-field">
                        <span class="field-label">Products:</span>
                        <span class="field-value">${escapeHtml(profileData.primaryCrops)}</span>
                    </div>
                    <div class="dashboard-field">
                        <span class="field-label">County:</span>
                        <span class="field-value">${escapeHtml(profileData.county)}</span>
                    </div>
                </div>
                <div class="dashboard-card">
                    <h3 class="card-heading">Subscription Plan</h3>
                    <div class="plan-badge">${escapeHtml(profileData.subscription.planName)}</div>
                    <div class="plan-price">${escapeHtml(profileData.subscription.price)}/month</div>
                    <ul class="plan-benefits">
                        ${planFeatures[profileData.subscription.plan].map(feature => `<li class="benefit-item">✓ ${feature}</li>`).join('')}
                    </ul>
                </div>
                <div class="dashboard-card">
                    <h3 class="card-heading">Quick Actions</h3>
                    <button class="btn-primary btn-large btn-block" style="margin-bottom: 1rem;">List New Product</button>
                    <button class="btn-secondary btn-large btn-block" style="margin-bottom: 1rem;">View Orders</button>
                    <button class="btn-secondary btn-large btn-block">Send SMS Campaign</button>
                </div>
            </div>
            <div class="dashboard-actions">
                <button class="btn-secondary" onclick="resetFarmerDashboard()">Back to Profile</button>
                <button class="btn-secondary" onclick="changeSubscription()">Change Plan</button>
            </div>
        </div>
    `;

    marketplaceSection.innerHTML = dashboardHTML;
}

function showMarketplaceContent() {
    document.querySelectorAll('.marketplace-features').forEach(section => {
        section.style.display = 'block';
    });
}

function resetFarmerDashboard() {
    sessionStorage.removeItem('currentProfile');
    location.reload();
}

function changeSubscription() {
    const currentProfile = JSON.parse(sessionStorage.getItem('currentProfile'));
    sessionStorage.removeItem('currentProfile');
    sessionStorage.setItem('currentProfile', JSON.stringify({
        name: currentProfile.name,
        role: currentProfile.role,
        phone: currentProfile.phone,
        address: currentProfile.address,
        county: currentProfile.county,
        farmName: currentProfile.farmName,
        primaryCrops: currentProfile.primaryCrops
    }));
    location.reload();
}