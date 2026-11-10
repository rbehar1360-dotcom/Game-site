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

const moderatorPanelButton =
    document.getElementById("moderatorPanelButton");

const ownerOverlay =
    document.getElementById("ownerOverlay");

const moderatorOverlay =
    document.getElementById("moderatorOverlay");

const closeOwnerPanel =
    document.getElementById("closeOwnerPanel");

const closeModeratorPanel =
    document.getElementById("closeModeratorPanel");

const ownerUserList =
    document.getElementById("ownerUserList");

const ownerUsersTab =
    document.getElementById("ownerUsersTab");

const ownerSuggestionsTab =
    document.getElementById("ownerSuggestionsTab");

const ownerIssueReportsTab =
    document.getElementById("ownerIssueReportsTab");

const ownerCoinsHistoryTab =
    document.getElementById("ownerCoinsHistoryTab");

const ownerUsersView =
    document.getElementById("ownerUsersView");

const ownerSuggestionsView =
    document.getElementById("ownerSuggestionsView");

const ownerIssueReportsView =
    document.getElementById("ownerIssueReportsView");

const ownerCoinsHistoryView =
    document.getElementById("ownerCoinsHistoryView");

const ownerSuggestionsList =
    document.getElementById("ownerSuggestionsList");

const ownerIssueReportsList =
    document.getElementById("ownerIssueReportsList");

const moderatorSuggestionsList =
    document.getElementById("moderatorSuggestionsList");

const moderatorIssueReportsList =
    document.getElementById("moderatorIssueReportsList");

const refreshOwnerSuggestions =
    document.getElementById("refreshOwnerSuggestions");

const refreshModeratorSuggestions =
    document.getElementById("refreshModeratorSuggestions");

const refreshOwnerIssueReports =
    document.getElementById("refreshOwnerIssueReports");

const refreshModeratorIssueReports =
    document.getElementById("refreshModeratorIssueReports");

const ownerCoinsHistoryStatus =
    document.getElementById("ownerCoinsHistoryStatus");

const ownerCoinsHistoryStats =
    document.getElementById("ownerCoinsHistoryStats");

const refreshOwnerCoinsHistory =
    document.getElementById("refreshOwnerCoinsHistory");

const ownerTotalUsers =
    document.getElementById("ownerTotalUsers");

const ownerUserSearch =
    document.getElementById("ownerUserSearch");

const refreshOwnerUsers =
    document.getElementById("refreshOwnerUsers");

const ownerGiveAllAmount =
    document.getElementById("ownerGiveAllAmount");

const ownerGiveAll =
    document.getElementById("ownerGiveAll");

let ownerUsers = [];
let ownerSuggestions = [];
let moderatorSuggestions = [];
let ownerIssueReports = [];
let moderatorIssueReports = [];


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

    const user =
        await getCurrentUser();

    if (!user) {

        if (ownerPanelButton) {
            ownerPanelButton.style.display = "none";
        }
        if (moderatorPanelButton) {
            moderatorPanelButton.style.display = "none";
        }

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

        if (ownerPanelButton) {
            ownerPanelButton.style.display = "none";
        }
        await checkModeratorAccess();

        return false;
    }

    if (data === true) {

        if (ownerPanelButton) {
            ownerPanelButton.style.display = "block";
        }
        if (moderatorPanelButton) {
            moderatorPanelButton.style.display = "block";
        }

        const { error: syncError } = await supabaseClient.rpc(
            "admin_sync_owner_rank"
        );

        if (syncError) {
            console.error(
                "Could not sync the OWNER rank. Apply sql/migrations/20261108_user_ranks.sql in Supabase:",
                syncError
            );
        } else {
            try {
                await refreshUserRanks();
            } catch (error) {
                console.error(
                    "Could not refresh user ranks. Apply sql/migrations/20261108_user_ranks.sql in Supabase:",
                    error
                );
            }
        }

        return true;
    }

    if (ownerPanelButton) {
        ownerPanelButton.style.display = "none";
    }
    await checkModeratorAccess();

    return false;
}

async function checkModeratorAccess() {
    if (!moderatorPanelButton) {
        return false;
    }

    const user = await getCurrentUser();
    if (!user) {
        moderatorPanelButton.style.display = "none";
        return false;
    }

    const { data, error } = await supabaseClient.rpc(
        "can_review_game_suggestions"
    );

    if (error) {
        console.error("Could not check moderator access:", error);
        moderatorPanelButton.style.display = "none";
        return false;
    }

    const canReview = data === true;
    moderatorPanelButton.style.display = canReview ? "block" : "none";
    return canReview;
}


// =========================================
// LOAD USERS
// =========================================

async function loadOwnerUsers() {

    if (!ownerUserList) {
        return;
    }

    if (ownerTotalUsers) {
        ownerTotalUsers.textContent = "Loading…";
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

        if (ownerTotalUsers) {
            ownerTotalUsers.textContent = "Unavailable";
        }

        showOwnerNotification(
            "Could not load users.",
            "error"
        );

        return;
    }

    if (!Array.isArray(data)) {
        console.error(
            "Could not count users: admin_list_users returned an invalid response.",
            data
        );

        ownerUserList.innerHTML = `
            <p class="owner-error">
                The user list returned an invalid response.
            </p>
        `;

        if (ownerTotalUsers) {
            ownerTotalUsers.textContent = "Unavailable";
        }

        showOwnerNotification(
            "Could not load the user count.",
            "error"
        );

        return;
    }

    ownerUsers = data;

    if (ownerTotalUsers) {
        ownerTotalUsers.textContent =
            ownerUsers.length.toLocaleString();
    }

    try {
        await refreshUserRanks();
    } catch (error) {
        console.error(
            "Could not load ranks. Apply sql/migrations/20261108_user_ranks.sql in Supabase:",
            error
        );
        showOwnerNotification(
            "Could not load ranks. Apply the user-ranks SQL migration in Supabase.",
            "error"
        );
    }

    renderOwnerUsers();
}

async function loadOwnerSuggestions() {

    if (!ownerSuggestionsList) {
        return;
    }

    ownerSuggestionsList.innerHTML = `
        <p class="owner-loading">Loading suggestions...</p>
    `;

    const isAdmin = await checkAdmin();

    if (!isAdmin) {
        ownerSuggestionsList.innerHTML = `
            <p class="owner-error">You don't have permission to view suggestions.</p>
        `;
        return;
    }

    const { data, error } = await supabaseClient
        .rpc("admin_list_approved_game_suggestions");

    if (error) {
        console.error("Could not load game suggestions:", error);
        ownerSuggestionsList.innerHTML = `
            <p class="owner-error">Could not load suggestions. Apply the game-suggestions moderation database migration, then refresh.</p>
        `;
        showOwnerNotification("Could not load suggestions.", "error");
        return;
    }

    if (!Array.isArray(data)) {
        console.error("Could not load game suggestions: invalid response.", data);
        ownerSuggestionsList.innerHTML = `
            <p class="owner-error">The suggestions query returned an invalid response.</p>
        `;
        return;
    }

    ownerSuggestions = data;
    renderOwnerSuggestions();
}

async function loadOwnerIssueReports() {
    if (!ownerIssueReportsList) {
        return;
    }

    ownerIssueReportsList.innerHTML =
        '<p class="owner-loading">Loading problem reports...</p>';

    if (!await checkAdmin()) {
        ownerIssueReportsList.innerHTML =
            '<p class="owner-error">You do not have permission to view problem reports.</p>';
        return;
    }

    const { data, error } = await supabaseClient.rpc(
        "admin_list_forwarded_game_issue_reports"
    );

    if (error) {
        console.error("Could not load forwarded game reports:", error);
        ownerIssueReportsList.innerHTML =
            '<p class="owner-error">Could not load reports. Apply the game-issue-reports SQL migration, then refresh.</p>';
        showOwnerNotification("Could not load problem reports.", "error");
        return;
    }

    if (!Array.isArray(data)) {
        console.error("Could not load forwarded game reports: invalid response.", data);
        ownerIssueReportsList.innerHTML =
            '<p class="owner-error">The reports query returned an invalid response.</p>';
        return;
    }

    ownerIssueReports = data;
    renderGameIssueReports(ownerIssueReportsList, ownerIssueReports, false);
}

async function loadOwnerCoinsHistory() {

    if (!ownerCoinsHistoryStatus || !ownerCoinsHistoryStats) {
        return;
    }

    ownerCoinsHistoryStatus.textContent = "Loading coin totals...";
    ownerCoinsHistoryStats.replaceChildren();

    if (!await checkAdmin()) {
        ownerCoinsHistoryStatus.textContent = "You don't have permission to view coin totals.";
        return;
    }

    const { data, error } = await supabaseClient.rpc("admin_get_coin_history_stats");

    if (error) {
        console.error("Could not load coin history:", error);
        ownerCoinsHistoryStatus.textContent =
            "Could not load coin totals. Apply sql/migrations/20261101_owner_coin_history.sql in Supabase, then refresh.";
        showOwnerNotification("Could not load coin totals. Check the owner coin-history SQL migration.", "error");
        return;
    }

    const stats = Array.isArray(data) ? data[0] : data;
    if (!stats) {
        console.error("Could not load coin history: the stats query returned no result.", data);
        ownerCoinsHistoryStatus.textContent = "The coin-history query returned no totals.";
        return;
    }

    const values = [
        ["Coins currently held", stats.total_current_coins],
        ["Coins ever issued (tracked)", stats.total_coins_ever],
        ["Coins removed (tracked)", stats.total_coins_removed]
    ];

    for (const [label, rawValue] of values) {
        const value = Number(rawValue);
        if (!Number.isFinite(value)) {
            console.error("Could not load coin history: invalid total.", stats);
            ownerCoinsHistoryStatus.textContent = "The coin-history query returned invalid totals.";
            ownerCoinsHistoryStats.replaceChildren();
            return;
        }

        const card = document.createElement("div");
        card.className = "owner-coins-stat";

        const caption = document.createElement("span");
        caption.textContent = label;

        const amount = document.createElement("strong");
        amount.textContent = value.toLocaleString();

        card.append(caption, amount);
        ownerCoinsHistoryStats.appendChild(card);
    }

    const trackingSince = stats.tracking_since
        ? new Date(stats.tracking_since)
        : null;
    ownerCoinsHistoryStatus.textContent = trackingSince && !Number.isNaN(trackingSince.getTime())
        ? `Tracking changes since ${trackingSince.toLocaleString()}.`
        : "Coin totals loaded.";
}

async function activateOwnerTab(selectedTab) {

    const sections = [
        [ownerUsersTab, ownerUsersView],
        [ownerSuggestionsTab, ownerSuggestionsView],
        [ownerIssueReportsTab, ownerIssueReportsView],
        [ownerCoinsHistoryTab, ownerCoinsHistoryView]
    ];

    sections.forEach(([tab, view]) => {
        if (!tab || !view) {
            return;
        }

        const selected = tab === selectedTab;
        tab.classList.toggle("active", selected);
        tab.setAttribute("aria-selected", String(selected));
        view.hidden = !selected;
    });

    if (selectedTab === ownerSuggestionsTab) {
        await loadOwnerSuggestions();
    } else if (selectedTab === ownerIssueReportsTab) {
        await loadOwnerIssueReports();
    } else if (selectedTab === ownerCoinsHistoryTab) {
        await loadOwnerCoinsHistory();
    }
}

function renderOwnerSuggestions() {

    if (!ownerSuggestionsList) {
        return;
    }

    ownerSuggestionsList.replaceChildren();

    if (ownerSuggestions.length === 0) {
        const emptyMessage = document.createElement("p");
        emptyMessage.className = "owner-loading";
        emptyMessage.textContent = "No game suggestions yet.";
        ownerSuggestionsList.appendChild(emptyMessage);
        return;
    }

    const usernamesById = new Map(
        ownerUsers.map(user => [
            String(user.user_id),
            String(user.username || "Unknown user")
        ])
    );

    ownerSuggestions.forEach(suggestion => {
        ownerSuggestionsList.appendChild(
            createSuggestionCard(
                suggestion,
                usernamesById.get(String(suggestion.user_id)) || "Unknown user"
            )
        );
    });
}

function createSuggestionCard(suggestion, usernameText, includeActions = false) {
    const card = document.createElement("article");
    card.className = "owner-suggestion-card";

    const heading = document.createElement("div");
    heading.className = "owner-suggestion-heading";

    const gameName = document.createElement("h3");
    gameName.textContent = suggestion.game_name || "Untitled suggestion";

    const username = document.createElement("span");
    username.className = "owner-suggestion-username";
    setRankedUsername(username, usernameText, suggestion.user_id);
    heading.append(gameName, username);
    card.appendChild(heading);

    const gameUrl = String(suggestion.game_url || "").trim();
    const linkLabel = document.createElement("div");

    if (gameUrl) {
        try {
            const parsedUrl = new URL(gameUrl);
            if (parsedUrl.protocol !== "https:" && parsedUrl.protocol !== "http:") {
                throw new TypeError("Unsupported URL protocol");
            }

            const link = document.createElement("a");
            link.className = "owner-suggestion-link";
            link.href = parsedUrl.href;
            link.target = "_blank";
            link.rel = "noopener noreferrer";
            link.textContent = gameUrl;
            linkLabel.appendChild(link);
        } catch (error) {
            console.warn("Skipped invalid game suggestion URL:", gameUrl, error);
            linkLabel.className = "owner-suggestion-no-link";
            linkLabel.textContent = "Invalid game link";
            card.appendChild(linkLabel);
        }
    } else {
        linkLabel.className = "owner-suggestion-no-link";
        linkLabel.textContent = "No link provided";
        card.appendChild(linkLabel);
    }

    if (linkLabel.childElementCount > 0) {
        card.appendChild(linkLabel);
    }

    const reason = document.createElement("p");
    reason.className = "owner-suggestion-reason";
    reason.textContent = suggestion.reason || "No reason provided.";
    card.appendChild(reason);

    if (includeActions) {
        const actions = document.createElement("div");
        actions.className = "owner-suggestion-actions";

        const approveButton = document.createElement("button");
        approveButton.type = "button";
        approveButton.textContent = "Send to owner";
        approveButton.addEventListener("click", () => {
            reviewGameSuggestion(suggestion.id, "approve", approveButton, deleteButton);
        });

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener("click", () => {
            reviewGameSuggestion(suggestion.id, "delete", approveButton, deleteButton);
        });

        actions.append(approveButton, deleteButton);
        card.appendChild(actions);
    }

    return card;
}

async function loadModeratorSuggestions() {
    if (!moderatorSuggestionsList) {
        return;
    }

    moderatorSuggestionsList.innerHTML =
        '<p class="owner-loading">Loading suggestions...</p>';

    if (!await checkModeratorAccess()) {
        moderatorSuggestionsList.innerHTML =
            '<p class="owner-error">You do not have permission to review suggestions.</p>';
        return;
    }

    const { data, error } = await supabaseClient.rpc(
        "moderator_list_game_suggestions"
    );

    if (error) {
        console.error("Could not load moderator suggestions:", error);
        moderatorSuggestionsList.innerHTML =
            '<p class="owner-error">Could not load suggestions. Apply the game-suggestions moderation database migration, then refresh.</p>';
        showOwnerNotification("Could not load suggestions.", "error");
        return;
    }

    if (!Array.isArray(data)) {
        console.error("Could not load moderator suggestions: invalid response.", data);
        moderatorSuggestionsList.innerHTML =
            '<p class="owner-error">The suggestions query returned an invalid response.</p>';
        return;
    }

    moderatorSuggestions = data;
    moderatorSuggestionsList.replaceChildren();

    if (moderatorSuggestions.length === 0) {
        const emptyMessage = document.createElement("p");
        emptyMessage.className = "owner-loading";
        emptyMessage.textContent = "No suggestions need review.";
        moderatorSuggestionsList.appendChild(emptyMessage);
        return;
    }

    moderatorSuggestions.forEach(suggestion => {
        const card = createSuggestionCard(
            suggestion,
            suggestion.username || (suggestion.user_id ? "Player" : "Guest"),
            true
        );

        if (!suggestion.id) {
            card.querySelectorAll("button").forEach(button => {
                button.disabled = true;
            });
            const missingId = document.createElement("p");
            missingId.className = "owner-error";
            missingId.textContent =
                "This suggestion is missing its ID and cannot be reviewed.";
            card.appendChild(missingId);
        }

        moderatorSuggestionsList.appendChild(card);
    });
}

async function reviewGameSuggestion(suggestionId, action, ...buttons) {
    if (!suggestionId || !await checkModeratorAccess()) {
        showOwnerNotification("You do not have permission to review suggestions.", "error");
        return;
    }

    if (action === "delete" && !confirm("Permanently delete this suggestion?")) {
        return;
    }

    buttons.forEach(button => {
        button.disabled = true;
    });

    try {
        const functionName = action === "approve"
            ? "moderator_approve_game_suggestion"
            : "moderator_delete_game_suggestion";
        const { error } = await supabaseClient.rpc(functionName, {
            target_suggestion_id: String(suggestionId)
        });

        if (error) {
            throw error;
        }
    } catch (error) {
        console.error(`Could not ${action} game suggestion:`, error);
        showOwnerNotification(
            `Could not ${action === "approve" ? "send" : "delete"} the suggestion.`,
            "error"
        );
        buttons.forEach(button => {
            button.disabled = false;
        });
        return;
    }

    showOwnerNotification(
        action === "approve" ? "Suggestion sent to the owner." : "Suggestion deleted.",
        "success"
    );
    await loadModeratorSuggestions();
}

function renderGameIssueReports(list, reports, includeActions) {
    list.replaceChildren();

    if (reports.length === 0) {
        const emptyMessage = document.createElement("p");
        emptyMessage.className = "owner-loading";
        emptyMessage.textContent = includeActions
            ? "No problem reports need review."
            : "No problem reports have been forwarded to the owner.";
        list.appendChild(emptyMessage);
        return;
    }

    reports.forEach(report => {
        list.appendChild(createGameIssueReportCard(report, includeActions));
    });
}

function createGameIssueReportCard(report, includeActions) {
    const card = document.createElement("article");
    card.className = "owner-suggestion-card";

    const heading = document.createElement("div");
    heading.className = "owner-suggestion-heading";

    const gameName = document.createElement("h3");
    gameName.textContent = report.game_name || "Game report";

    const username = document.createElement("span");
    username.className = "owner-suggestion-username";
    setRankedUsername(
        username,
        report.username || (report.user_id ? "Player" : "Guest"),
        report.user_id
    );
    heading.append(gameName, username);
    card.appendChild(heading);

    const gameUrl = String(report.game_url || "").trim();
    try {
        const parsedUrl = new URL(gameUrl);
        if (parsedUrl.protocol !== "https:" && parsedUrl.protocol !== "http:") {
            throw new TypeError("Unsupported URL protocol");
        }

        const link = document.createElement("a");
        link.className = "owner-suggestion-link";
        link.href = parsedUrl.href;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = "Open reported game";
        card.appendChild(link);
    } catch (error) {
        console.warn("Skipped invalid game report URL:", gameUrl, error);
    }

    const reportText = document.createElement("p");
    reportText.className = "owner-suggestion-reason";
    reportText.textContent = report.report_text || "No problem details provided.";
    card.appendChild(reportText);

    if (report.created_at) {
        const submittedAt = document.createElement("div");
        submittedAt.className = "owner-suggestion-no-link";
        const date = new Date(report.created_at);
        submittedAt.textContent = Number.isNaN(date.getTime())
            ? "Submitted date unavailable"
            : `Submitted ${date.toLocaleString()}`;
        card.appendChild(submittedAt);
    }

    if (includeActions) {
        const actions = document.createElement("div");
        actions.className = "owner-suggestion-actions";

        const forwardButton = document.createElement("button");
        forwardButton.type = "button";
        forwardButton.textContent = "Send to owner";

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.textContent = "Delete";

        forwardButton.addEventListener("click", () => {
            reviewGameIssueReport(report.id, "forward", forwardButton, deleteButton);
        });
        deleteButton.addEventListener("click", () => {
            reviewGameIssueReport(report.id, "delete", forwardButton, deleteButton);
        });

        actions.append(forwardButton, deleteButton);
        card.appendChild(actions);
    }

    return card;
}

async function loadModeratorIssueReports() {
    if (!moderatorIssueReportsList) {
        return;
    }

    moderatorIssueReportsList.innerHTML =
        '<p class="owner-loading">Loading problem reports...</p>';

    if (!await checkModeratorAccess()) {
        moderatorIssueReportsList.innerHTML =
            '<p class="owner-error">You do not have permission to review problem reports.</p>';
        return;
    }

    const { data, error } = await supabaseClient.rpc(
        "moderator_list_game_issue_reports"
    );

    if (error) {
        console.error("Could not load moderator game reports:", error);
        moderatorIssueReportsList.innerHTML =
            '<p class="owner-error">Could not load reports. Apply the game-issue-reports SQL migration, then refresh.</p>';
        showOwnerNotification("Could not load problem reports.", "error");
        return;
    }

    if (!Array.isArray(data)) {
        console.error("Could not load moderator game reports: invalid response.", data);
        moderatorIssueReportsList.innerHTML =
            '<p class="owner-error">The reports query returned an invalid response.</p>';
        return;
    }

    moderatorIssueReports = data;
    renderGameIssueReports(moderatorIssueReportsList, moderatorIssueReports, true);

    if (!moderatorIssueReports.length) {
        return;
    }

    moderatorIssueReportsList.querySelectorAll(".owner-suggestion-card").forEach((card, index) => {
        if (moderatorIssueReports[index] && !moderatorIssueReports[index].id) {
            card.querySelectorAll("button").forEach(button => {
                button.disabled = true;
            });
            const missingId = document.createElement("p");
            missingId.className = "owner-error";
            missingId.textContent = "This report is missing its ID and cannot be reviewed.";
            card.appendChild(missingId);
        }
    });
}

async function reviewGameIssueReport(reportId, action, ...buttons) {
    if (!reportId || !await checkModeratorAccess()) {
        showOwnerNotification("You do not have permission to review problem reports.", "error");
        return;
    }

    if (action === "delete" && !confirm("Permanently delete this problem report?")) {
        return;
    }

    buttons.forEach(button => {
        button.disabled = true;
    });

    try {
        const functionName = action === "forward"
            ? "moderator_forward_game_issue_report"
            : "moderator_delete_game_issue_report";
        const { error } = await supabaseClient.rpc(functionName, {
            target_report_id: String(reportId)
        });
        if (error) throw error;
    } catch (error) {
        console.error(`Could not ${action} game issue report:`, error);
        showOwnerNotification(
            `Could not ${action === "forward" ? "send" : "delete"} the problem report.`,
            "error"
        );
        buttons.forEach(button => {
            button.disabled = false;
        });
        return;
    }

    showOwnerNotification(
        action === "forward" ? "Problem report sent to the owner." : "Problem report deleted.",
        "success"
    );
    await loadModeratorIssueReports();
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

                <button
                    type="button"
                    class="owner-username owner-profile-link"
                    aria-label="View ${escapeOwnerHTML(
                        user.username || "Unknown User"
                    )}'s profile"
                    ${user.user_id ? `data-user-id="${escapeOwnerHTML(user.user_id)}"` : "disabled"}
                >
                    ${escapeOwnerHTML(user.username || "Unknown User")}
                </button>

                <div class="owner-coins">
                    🪙 ${Number(
                        user.coins || 0
                    ).toLocaleString()} coins
                </div>

            </div>

            <div class="owner-actions">

                <select
                    class="owner-rank-select"
                    aria-label="Rank for ${escapeOwnerHTML(user.username || "Unknown User")}"
                    data-user-id="${escapeOwnerHTML(user.user_id)}"
                >
                    <option value="NONE">No rank</option>
                    <option value="MODERATOR">MODERATOR</option>
                    <option value="OWNER" disabled>OWNER (automatic)</option>
                </select>

                <button
                    type="button"
                    class="owner-rank-save"
                    data-user-id="${escapeOwnerHTML(user.user_id)}"
                >
                    Save rank
                </button>

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

        const profileButton =
            row.querySelector(".owner-profile-link");

        const userRank = getCachedUserRank(user.user_id);
        const rankSelect = row.querySelector(".owner-rank-select");
        const rankSaveButton = row.querySelector(".owner-rank-save");
        if (rankSelect && rankSaveButton) {
            rankSelect.value = userRank || "NONE";
            const isOwner = userRank === "OWNER";
            rankSelect.disabled = isOwner;
            rankSaveButton.disabled = isOwner;
            rankSaveButton.addEventListener("click", async () => {
                rankSelect.disabled = true;
                rankSaveButton.disabled = true;

                const { error } = await supabaseClient.rpc(
                    "admin_set_user_rank",
                    {
                        target_user_id: user.user_id,
                        new_rank: rankSelect.value
                    }
                );

                if (error) {
                    console.error("Could not update user rank:", error);
                    showOwnerNotification(
                        error.message || "Could not update this user's rank.",
                        "error"
                    );
                    rankSelect.disabled = false;
                    rankSaveButton.disabled = false;
                    return;
                }

                try {
                    await refreshUserRanks();
                    renderOwnerUsers();
                    showOwnerNotification(
                        rankSelect.value === "MODERATOR"
                            ? `${user.username || "User"} is now a MODERATOR.`
                            : `Removed the rank from ${user.username || "this user"}.`,
                        "success"
                    );
                } catch (refreshError) {
                    console.error("Could not refresh user ranks:", refreshError);
                    showOwnerNotification(
                        "The rank was saved, but the rank list could not be refreshed.",
                        "error"
                    );
                    rankSelect.disabled = false;
                    rankSaveButton.disabled = false;
                }
            });
        }

        if (profileButton) {
            setRankedUsername(
                profileButton,
                user.username || "Unknown User",
                user.user_id
            );
        }

        if (profileButton && user.user_id) {
            profileButton.addEventListener("click", () => {
                if (typeof openUserProfile === "function") {
                    openUserProfile(
                        user.user_id,
                        user.username || "Unknown User"
                    );
                } else {
                    console.error("User profile interface is unavailable.");
                    showOwnerNotification(
                        "Could not open this user's profile.",
                        "error"
                    );
                }
            });
        }

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
// GIVE COINS TO ALL USERS
// =========================================

if (ownerGiveAll) {

    ownerGiveAll.addEventListener(
        "click",
        async function() {

            const amount =
                Number(ownerGiveAllAmount?.value);

            if (
                !Number.isInteger(amount) ||
                amount <= 0
            ) {

                showOwnerNotification(
                    "Enter a valid whole number.",
                    "error"
                );

                ownerGiveAllAmount?.focus();

                return;
            }

            const confirmed =
                confirm(
                    `Give ${amount.toLocaleString()} coins to every user?`
                );

            if (!confirmed) {
                return;
            }

            ownerGiveAll.disabled = true;

            const { data, error } =
                await supabaseClient.rpc(
                    "admin_give_coins_to_all",
                    {
                        amount: amount
                    }
                );

            ownerGiveAll.disabled = false;

            if (error) {

                console.error(
                    "Give all coins failed:",
                    error
                );

                showOwnerNotification(
                    error.message ||
                    "Could not give coins to all users.",
                    "error"
                );

                return;
            }

            ownerGiveAllAmount.value = "";

            await loadOwnerUsers();

            showOwnerNotification(
                `Gave ${amount.toLocaleString()} coins to ${Number(
                    data || 0
                ).toLocaleString()} users.`,
                "success"
            );
        }
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

                await activateOwnerTab(ownerUsersTab);

                await loadOwnerUsers();
            }

        }
    );
}

if (moderatorPanelButton) {
    moderatorPanelButton.addEventListener("click", async event => {
        event.preventDefault();
        event.stopPropagation();

        if (!await checkModeratorAccess()) {
            showOwnerNotification(
                "You don't have permission to access this.",
                "error"
            );
            return;
        }

        if (typeof accountMenu !== "undefined" && accountMenu) {
            accountMenu.classList.remove("open");
        }

        if (moderatorOverlay) {
            moderatorOverlay.classList.add("open");
            await Promise.all([
                loadModeratorSuggestions(),
                loadModeratorIssueReports()
            ]);
        }
    });
}

if (refreshModeratorSuggestions) {
    refreshModeratorSuggestions.addEventListener(
        "click",
        loadModeratorSuggestions
    );
}

if (refreshModeratorIssueReports) {
    refreshModeratorIssueReports.addEventListener(
        "click",
        loadModeratorIssueReports
    );
}

if (closeModeratorPanel) {
    closeModeratorPanel.addEventListener("click", () => {
        moderatorOverlay?.classList.remove("open");
    });
}

if (moderatorOverlay) {
    moderatorOverlay.addEventListener("click", event => {
        if (event.target === moderatorOverlay) {
            moderatorOverlay.classList.remove("open");
        }
    });
}

[
    ownerUsersTab,
    ownerSuggestionsTab,
    ownerIssueReportsTab,
    ownerCoinsHistoryTab
].filter(Boolean).forEach(tab => {
    tab.addEventListener("click", async () => {
        await activateOwnerTab(tab);
    });
});

if (refreshOwnerCoinsHistory) {
    refreshOwnerCoinsHistory.addEventListener("click", loadOwnerCoinsHistory);
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

if (refreshOwnerSuggestions) {
    refreshOwnerSuggestions.addEventListener("click", async () => {
        await loadOwnerSuggestions();
    });
}

if (refreshOwnerIssueReports) {
    refreshOwnerIssueReports.addEventListener("click", loadOwnerIssueReports);
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

        if (
            event.key === "Escape" &&
            moderatorOverlay?.classList.contains("open")
        ) {
            moderatorOverlay.classList.remove("open");
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

            ownerUsers = [];
            ownerSuggestions = [];
            moderatorSuggestions = [];
            ownerIssueReports = [];
            moderatorIssueReports = [];

            if (ownerTotalUsers) {
                ownerTotalUsers.textContent = "—";
            }

            if (ownerPanelButton) {

                ownerPanelButton.style.display =
                    "none";
            }

            if (moderatorPanelButton) {
                moderatorPanelButton.style.display = "none";
            }

            if (ownerOverlay) {

                ownerOverlay.classList.remove(
                    "open"
                );
            }

            if (moderatorOverlay) {
                moderatorOverlay.classList.remove("open");
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