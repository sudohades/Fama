document.addEventListener("DOMContentLoaded", () => {
    setupRoleSelection();
    initProfileForm();
});

/* --------------------------------------------------
   ROLE SELECTION HANDLING
-------------------------------------------------- */
function setupRoleSelection() {
    const roleCards = document.querySelectorAll(".role-card");
    const selectedRole = document.getElementById("selected-role");
    const userRole = document.getElementById("user-role");
    const profileFormContainer = document.getElementById("profile-form-container");

    roleCards.forEach(card => {
        card.addEventListener("click", () => {
            const role = card.dataset.role;
            userRole.value = role;
            selectedRole.textContent = role === "seller" ? "Farmer Seller" : "Buyer";

            // Show the profile form only after role selection
            profileFormContainer.style.display = "block";

            // Display specific sections
            const seller = document.querySelectorAll(".seller-only");
            const buyer = document.querySelectorAll(".buyer-only");

            if (role === "seller") {
                seller.forEach(e => e.style.display = "block");
                buyer.forEach(e => e.style.display = "none");
            } else {
                seller.forEach(e => e.style.display = "none");
                buyer.forEach(e => e.style.display = "block");
            }
        });
    });
}

/* --------------------------------------------------
   INITIALIZE PROFILE FORM
-------------------------------------------------- */
function initProfileForm() {
    const form = document.getElementById("user-profile-form");
    const resultBox = document.getElementById("form-result");

    if (!form) return;

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const role = document.getElementById("user-role").value;

        if (!role) {
            resultBox.innerText = "Please select a role first.";
            resultBox.style.color = "red";
            return;
        }

        const profile = {
            name: document.getElementById("user-name").value,
            role,
            phone: document.getElementById("user-phone").value,
            address: document.getElementById("user-address").value,
            county: document.getElementById("user-county").value,
        };

        if (role === "seller") {
            profile.farmName = document.getElementById("farm-name").value;
            profile.primaryCrops = document.getElementById("primary-crops").value;
            profile.subscriptionPlan = document.getElementById("subscription-plan").value;

            if (!profile.subscriptionPlan) {
                resultBox.innerText = "Please choose a subscription plan.";
                resultBox.style.color = "red";
                return;
            }
        }

        if (role === "buyer") {
            profile.businessType = document.getElementById("business-type").value;
        }

        saveProfile(profile);
        displayProfile(profile);

        resultBox.innerText = "Profile created successfully!";
        resultBox.style.color = "green";
    });
}

/* --------------------------------------------------
   SAVE PROFILE
-------------------------------------------------- */
function saveProfile(profile) {
    sessionStorage.setItem("agrilink_profile", JSON.stringify(profile));
}

/* --------------------------------------------------
   DISPLAY PROFILE IN SIDEBAR
-------------------------------------------------- */
function displayProfile(profile) {
    const display = document.getElementById("profile-display");

    let html = `
        <div><strong>Name:</strong> ${profile.name}</div>
        <div><strong>Role:</strong> ${
            profile.role === "seller" ? "Farmer Seller" : "Buyer"
        }</div>
        <div><strong>Phone:</strong> ${profile.phone}</div>
        <div><strong>Address:</strong> ${profile.address}</div>
        <div><strong>County:</strong> ${profile.county}</div>
    `;

    if (profile.role === "seller") {
        html += `
            <div><strong>Farm Name:</strong> ${profile.farmName}</div>
            <div><strong>Primary Crops:</strong> ${profile.primaryCrops}</div>
            <div><strong>Subscription Plan:</strong> ${profile.subscriptionPlan}</div>
        `;
    }

    if (profile.role === "buyer") {
        html += `
            <div><strong>Business Type:</strong> ${profile.businessType}</div>
        `;
    }

    display.innerHTML = html;
}
