// LEGAL / INFORMATION MODALS
// =========================================

(function () {

    const modal = document.getElementById("legalModal");
    const modalTitle = document.getElementById("legalModalTitle");
    const modalContent = document.getElementById("legalModalContent");
    const closeButton = document.getElementById("closeLegalModal");

    if (!modal || !modalTitle || !modalContent || !closeButton) {
        return;
    }

    const legalPages = {

        terms: {
            title: "Terms of Service",

            content: `
                <h3>1. Acceptance of Terms</h3>
                <p>
                    By accessing or using Ralph's Games, you agree to
                    these Terms of Service.
                </p>

                <h3>2. Using the Website</h3>
                <p>
                    You agree to use the website responsibly and not
                    attempt to disrupt, damage, or gain unauthorized
                    access to the website or its systems.
                </p>

                <h3>3. User Accounts</h3>
                <p>
                    If you create an account, you are responsible for
                    maintaining the security of your account.
                </p>

                <h3>4. Prohibited Activities</h3>
                <ul>
                    <li>Attempting to access accounts that do not belong to you</li>
                    <li>Attempting to damage or disrupt the website</li>
                    <li>Spamming or abusing website features</li>
                    <li>Impersonating other users</li>
                    <li>Uploading malicious content</li>
                </ul>

                <h3>5. Changes to the Service</h3>
                <p>
                    Ralph's Games may modify, suspend, or discontinue
                    features of the website at any time.
                </p>

                <h3>6. Changes to These Terms</h3>
                <p>
                    These Terms of Service may be updated from time
                    to time. Continued use of the website after changes
                    are published constitutes acceptance of the updated terms.
                </p>
            `
        },

        privacy: {
            title: "Privacy Policy",

            content: `
                <h3>1. Information We Collect</h3>
                <p>
                    Ralph's Games may collect information necessary
                    to provide website functionality, including account
                    information and information generated through use
                    of the website.
                </p>

                <h3>2. Account Information</h3>
                <p>
                    When creating an account, information such as your
                    username and email address may be stored.
                </p>

                <h3>3. Website Usage</h3>
                <p>
                    Certain gameplay statistics and preferences may be
                    stored to provide features such as favorites,
                    likes, and statistics.
                </p>

                <h3>4. How Information Is Used</h3>
                <p>
                    Information may be used to operate, maintain,
                    secure, and improve the website.
                </p>

                <h3>5. Data Storage</h3>
                <p>
                    Some information may be stored using third-party
                    services that help operate the website.
                </p>
            `
        },

        guidelines: {
            title: "Community Guidelines",

            content: `
                <h3>Keep It Respectful</h3>
                <p>
                    Ralph's Games is intended to be a place where
                    users can enjoy games and interact with the community.
                </p>

                <h3>Do Not</h3>
                <ul>
                    <li>Harass or threaten other users</li>
                    <li>Spam messages</li>
                    <li>Impersonate other users</li>
                    <li>Share another person's private information</li>
                    <li>Abuse bugs or vulnerabilities</li>
                    <li>Attempt to disrupt the website</li>
                </ul>

                <h3>Moderation</h3>
                <p>
                    Content or accounts that violate these guidelines
                    may be removed or restricted.
                </p>
            `
        },

        dmca: {
            title: "Copyright / DMCA",

            content: `
                <h3>Copyright</h3>
                <p>
                    Ralph's Games respects the intellectual property
                    rights of others.
                </p>

                <h3>Copyright Concerns</h3>
                <p>
                    If you believe that material available through the
                    website infringes your copyright, please contact
                    us with enough information to identify the material
                    and explain your claim.
                </p>

                <h3>Review Process</h3>
                <p>
                    Copyright complaints may be reviewed and appropriate
                    action may be taken when warranted.
                </p>
            `
        },

        cookies: {
            title: "Cookie Policy",

            content: `
                <h3>Cookies and Local Storage</h3>
                <p>
                    Ralph's Games may use cookies, local storage, or
                    similar browser technologies to provide website
                    functionality and remember preferences.
                </p>

                <h3>Why We Use Them</h3>
                <ul>
                    <li>Remembering preferences</li>
                    <li>Providing account functionality</li>
                    <li>Security</li>
                    <li>Website functionality</li>
                </ul>
            `
        },

        contact: {
            title: "Contact",

            content: `
                <h3>Contact Ralph's Games</h3>
                <p>
                    Have a question, issue, or concern?
                </p>

                <p>
                    Contact information will be added here.
                </p>
            `
        },

        suggest: {
            title: "Suggest a Game",

            content: `
                <h3>Suggest a Game</h3>
                <p>
                    Think a game should be added to Ralph's Games?
                    Send us a suggestion.
                </p>

                <p>
                    The game suggestion system will be available here.
                </p>
            `
        }

    };


    // =========================================
    // OPEN MODAL
    // =========================================

    document.querySelectorAll("[data-legal]").forEach(link => {

        link.addEventListener("click", function (event) {

            event.preventDefault();

            const page = this.dataset.legal;
            const data = legalPages[page];

            if (!data) {
                return;
            }

            modalTitle.textContent = data.title;
            modalContent.innerHTML = data.content;

            modal.classList.add("active");

            document.body.style.overflow = "hidden";
        });

    });


    // =========================================
    // CLOSE MODAL
    // =========================================

    function closeLegalModal() {

        modal.classList.remove("active");

        document.body.style.overflow = "";

    }

    closeButton.addEventListener("click", closeLegalModal);


    // Click outside the box
    modal.addEventListener("click", function (event) {

        if (event.target === modal) {
            closeLegalModal();
        }

    });


    // ESC key
    document.addEventListener("keydown", function (event) {

        if (event.key === "Escape" && modal.classList.contains("active")) {
            closeLegalModal();
        }

    });


    // =========================================
    // FOOTER YEAR
    // =========================================

    const footerYear = document.getElementById("footerYear");

    if (footerYear) {
        footerYear.textContent = new Date().getFullYear();
    }

})();

// =========================================
// OWNER PANEL
// =========================================

const ownerPanelButton =
    document.getElementById("ownerPanelButton");

const ownerOverlay =
    document.getElementById("ownerOverlay");

const closeOwnerPanel =
    document.getElementById("closeOwnerPanel");

const ownerUserList =
    document.getElementById("ownerUserList");

const ownerUserSearch =
    document.getElementById("ownerUserSearch");

const refreshOwnerUsers =
    document.getElementById("refreshOwnerUsers");

let ownerUsers = [];


// =========================================
// OWNER NOTIFICATIONS
// =========================================

function showOwnerNotification(message, type = "info") {

    let container =
        document.getElementById(
            "ownerNotificationContainer"
        );

    if (!container) {

        container =
            document.createElement("div");

        container.id =
            "ownerNotificationContainer";

        container.className =
            "owner-notification-container";

        document.body.appendChild(container);
    }

    const notification =
        document.createElement("div");

    notification.className =
        `owner-notification ${type}`;

    const icons = {
        success: "✓",
        error: "✕",
        info: "ⓘ"
    };

    notification.innerHTML = `
        <div class="owner-notification-icon">
            ${icons[type] || icons.info}
        </div>

        <div class="owner-notification-message">
            ${escapeOwnerHTML(message)}
        </div>

        <button
            class="owner-notification-close"
            type="button"
        >
            ×
        </button>
    `;

    container.appendChild(notification);

    requestAnimationFrame(() => {
        notification.classList.add("show");
    });

    const removeNotification = () => {

        if (!notification.isConnected) {
            return;
        }

        notification.classList.remove("show");

        setTimeout(() => {

            if (notification.isConnected) {
                notification.remove();
            }

            if (
                container.isConnected &&
                container.children.length === 0
            ) {
                container.remove();
            }

        }, 250);
    };

    const closeButton =
        notification.querySelector(
            ".owner-notification-close"
        );

    if (closeButton) {

        closeButton.addEventListener(
            "click",
            removeNotification
        );
    }

    setTimeout(
        removeNotification,
        3500
    );
}


// =========================================
// CHECK ADMIN
// =========================================

async function checkAdmin() {

    if (!ownerPanelButton) {
        return false;
    }

    const user =
        await getCurrentUser();

    if (!user) {

        ownerPanelButton.style.display =
            "none";

        return false;
    }

    const { data, error } =
        await supabaseClient.rpc(
            "is_admin"
        );

    if (error) {

        console.error(
            "Could not check admin status:",
            error
        );

        ownerPanelButton.style.display =
            "none";

        return false;
    }

    if (data === true) {

        ownerPanelButton.style.display =
            "block";

        return true;
    }

    ownerPanelButton.style.display =
        "none";

    return false;
}


// =========================================
// LOAD USERS
// =========================================

async function loadOwnerUsers() {

    if (!ownerUserList) {
        return;
    }

    ownerUserList.innerHTML = `
        <p class="owner-loading">
            Loading users...
        </p>
    `;

    const { data, error } =
        await supabaseClient.rpc(
            "admin_list_users"
        );

    if (error) {

        console.error(
            "Could not load users:",
            error
        );

        ownerUserList.innerHTML = `
            <p class="owner-error">
                You don't have permission to view users.
            </p>
        `;

        showOwnerNotification(
            "Could not load users.",
            "error"
        );

        return;
    }

    ownerUsers =
        Array.isArray(data)
            ? data
            : [];

    renderOwnerUsers();
}


// =========================================
// RENDER USERS
// =========================================

function renderOwnerUsers() {

    if (!ownerUserList || !ownerUserSearch) {
        return;
    }

    const search =
        ownerUserSearch.value
            .toLowerCase()
            .trim();

    const filteredUsers =
        ownerUsers.filter(user => {

            const username =
                String(
                    user.username || ""
                ).toLowerCase();

            return username.includes(search);
        });

    if (filteredUsers.length === 0) {

        ownerUserList.innerHTML = `
            <p class="owner-loading">
                No users found.
            </p>
        `;

        return;
    }

    ownerUserList.innerHTML = "";

    filteredUsers.forEach(user => {

        const row =
            document.createElement("div");

        row.className =
            "owner-user-row";

        row.innerHTML = `
            <div class="owner-user-info">

                <div class="owner-username">
                    ${escapeOwnerHTML(
                        user.username || "Unknown User"
                    )}
                </div>

                <div class="owner-coins">
                    🪙 ${Number(
                        user.coins || 0
                    ).toLocaleString()} coins
                </div>

            </div>

            <div class="owner-actions">

                <input
                    type="number"
                    min="1"
                    step="1"
                    placeholder="Amount"
                    class="owner-amount"
                    data-user-id="${user.user_id}"
                >

                <button
                    type="button"
                    class="owner-give"
                    data-user-id="${user.user_id}"
                >
                    + Give
                </button>

                <button
                    type="button"
                    class="owner-take"
                    data-user-id="${user.user_id}"
                >
                    − Take
                </button>

            </div>
        `;

        ownerUserList.appendChild(row);
    });

    attachOwnerActions();
}


// =========================================
// OWNER ACTION BUTTONS
// =========================================

function attachOwnerActions() {

    document
        .querySelectorAll(".owner-give")
        .forEach(button => {

            button.addEventListener(
                "click",
                async function() {

                    await adjustUserCoins(
                        this.dataset.userId,
                        1
                    );

                }
            );

        });

    document
        .querySelectorAll(".owner-take")
        .forEach(button => {

            button.addEventListener(
                "click",
                async function() {

                    await adjustUserCoins(
                        this.dataset.userId,
                        -1
                    );

                }
            );

        });
}


// =========================================
// ADJUST COINS
// =========================================

// =========================================
// CUSTOM COIN CONFIRMATION
// =========================================

function showCoinConfirmation(action, amount, username) {

    return new Promise(resolve => {

        const existing =
            document.getElementById("coinConfirmOverlay");

        if (existing) {
            existing.remove();
        }

        const overlay =
            document.createElement("div");

        overlay.id =
            "coinConfirmOverlay";

        overlay.className =
            "coin-confirm-overlay";

        const actionText =
            action === "give"
                ? "Give"
                : "Take";

        const actionColor =
            action === "give"
                ? "success"
                : "error";

        overlay.innerHTML = `
            <div class="coin-confirm-modal">

                <div class="coin-confirm-icon ${actionColor}">
                    ${action === "give" ? "+" : "−"}
                </div>

                <h2>
                    ${actionText} Coins
                </h2>

                <p class="coin-confirm-text">
                    Are you sure you want to
                    <strong>${actionText.toLowerCase()}</strong>
                    <span>${amount.toLocaleString()} coins</span>
                    ${action === "give" ? "to" : "from"}
                    <strong>${escapeOwnerHTML(username)}</strong>?
                </p>

                <div class="coin-confirm-actions">

                    <button
                        type="button"
                        class="coin-confirm-cancel"
                        id="coinConfirmCancel"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        class="coin-confirm-yes ${actionColor}"
                        id="coinConfirmYes"
                    >
                        ${actionText} Coins
                    </button>

                </div>

            </div>
        `;

        document.body.appendChild(overlay);

        requestAnimationFrame(() => {
            overlay.classList.add("open");
        });

        const closeModal = result => {

            overlay.classList.remove("open");

            setTimeout(() => {
                overlay.remove();
            }, 200);

            resolve(result);
        };

        document
            .getElementById("coinConfirmCancel")
            .addEventListener(
                "click",
                () => closeModal(false)
            );

        document
            .getElementById("coinConfirmYes")
            .addEventListener(
                "click",
                () => closeModal(true)
            );

        overlay.addEventListener(
            "click",
            event => {

                if (
                    event.target === overlay
                ) {
                    closeModal(false);
                }

            }
        );

        const escapeHandler = event => {

            if (event.key === "Escape") {

                document.removeEventListener(
                    "keydown",
                    escapeHandler
                );

                closeModal(false);
            }
        };

        document.addEventListener(
            "keydown",
            escapeHandler
        );
    });
}


// =========================================
// ADJUST COINS
// =========================================

async function adjustUserCoins(
    userId,
    direction
) {

    const amountInput =
        document.querySelector(
            `.owner-amount[data-user-id="${userId}"]`
        );

    if (!amountInput) {

        showOwnerNotification(
            "Could not find the amount field.",
            "error"
        );

        return;
    }

    const amount =
        Number(amountInput.value);

    if (
        !Number.isInteger(amount) ||
        amount <= 0
    ) {

        showOwnerNotification(
            "Enter a valid whole number.",
            "error"
        );

        amountInput.focus();

        return;
    }

    const user =
        ownerUsers.find(
            u => u.user_id === userId
        );

    if (!user) {

        showOwnerNotification(
            "User could not be found.",
            "error"
        );

        return;
    }

    const confirmed =
        await showCoinConfirmation(
            direction > 0
                ? "give"
                : "take",
            amount,
            user.username
        );

    if (!confirmed) {
        return;
    }

    const finalAmount =
        amount * direction;

    const { data, error } =
        await supabaseClient.rpc(
            "admin_adjust_coins",
            {
                target_user_id: userId,
                amount: finalAmount
            }
        );

    if (error) {

        console.error(
            "Coin adjustment failed:",
            error
        );

        showOwnerNotification(
            error.message ||
            "Could not change coins.",
            "error"
        );

        return;
    }

    user.coins =
        Number(data) || 0;

    amountInput.value = "";

    renderOwnerUsers();

    showOwnerNotification(
        `${user.username} now has ${Number(
            data
        ).toLocaleString()} coins.`,
        "success"
    );
}
// =========================================
// OPEN OWNER PANEL
// =========================================

if (ownerPanelButton) {

    ownerPanelButton.addEventListener(
        "click",
        async function(event) {

            event.preventDefault();
            event.stopPropagation();

            const isAdmin =
                await checkAdmin();

            if (!isAdmin) {

                showOwnerNotification(
                    "You don't have permission to access this.",
                    "error"
                );

                return;
            }

            if (
                typeof accountMenu !==
                "undefined" &&
                accountMenu
            ) {

                accountMenu.classList.remove(
                    "open"
                );
            }

            if (ownerOverlay) {

                ownerOverlay.classList.add(
                    "open"
                );

                await loadOwnerUsers();
            }

        }
    );
}


// =========================================
// CLOSE OWNER PANEL
// =========================================

if (closeOwnerPanel) {

    closeOwnerPanel.addEventListener(
        "click",
        function() {

            if (ownerOverlay) {

                ownerOverlay.classList.remove(
                    "open"
                );
            }

        }
    );
}


// =========================================
// CLOSE WHEN CLICKING OUTSIDE
// =========================================

if (ownerOverlay) {

    ownerOverlay.addEventListener(
        "click",
        function(event) {

            if (
                event.target ===
                ownerOverlay
            ) {

                ownerOverlay.classList.remove(
                    "open"
                );
            }

        }
    );
}


// =========================================
// SEARCH USERS
// =========================================

if (ownerUserSearch) {

    ownerUserSearch.addEventListener(
        "input",
        function() {

            renderOwnerUsers();

        }
    );
}


// =========================================
// REFRESH USERS
// =========================================

if (refreshOwnerUsers) {

    refreshOwnerUsers.addEventListener(
        "click",
        async function() {

            await loadOwnerUsers();

            showOwnerNotification(
                "User list refreshed.",
                "success"
            );

        }
    );
}


// =========================================
// ESCAPE
// =========================================

document.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key === "Escape" &&
            ownerOverlay &&
            ownerOverlay.classList.contains("open")
        ) {

            ownerOverlay.classList.remove(
                "open"
            );

        }

    }
);

// =========================================
// UPDATE OWNER PANEL AFTER LOGIN
// =========================================

supabaseClient.auth.onAuthStateChange(
    async function(event, session) {

        if (
            event === "SIGNED_IN" ||
            event === "INITIAL_SESSION"
        ) {
            await checkAdmin();
        }

        if (
            event === "SIGNED_OUT"
        ) {
            if (ownerPanelButton) {
                ownerPanelButton.style.display =
                    "none";
            }

            if (ownerOverlay) {
                ownerOverlay.classList.remove(
                    "open"
                );
            }
        }
    }
);


// =========================================
// HTML ESCAPE
// =========================================

function escapeOwnerHTML(text) {

    const div =
        document.createElement("div");

    div.textContent =
        String(text ?? "");

    return div.innerHTML;
}

// =========================================
