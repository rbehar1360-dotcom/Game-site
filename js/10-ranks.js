let userRankCache = new Map();
let userRanksLoaded = false;
let userRanksLoading = null;

async function refreshUserRanks() {
    const { data, error } = await supabaseClient
        .from("user_ranks")
        .select("user_id, rank");

    if (error) {
        throw error;
    }

    if (!Array.isArray(data)) {
        throw new TypeError("The user-ranks query returned an invalid response.");
    }

    userRankCache = new Map(
        data.map(({ user_id, rank }) => [
            String(user_id),
            String(rank).toUpperCase()
        ])
    );
    userRanksLoaded = true;

    document.querySelectorAll("[data-ranked-username]").forEach(element => {
        applyUserRank(element);
    });

    return userRankCache;
}

async function ensureUserRanksLoaded() {
    if (userRanksLoaded) {
        return userRankCache;
    }

    if (!userRanksLoading) {
        userRanksLoading = refreshUserRanks().finally(() => {
            userRanksLoading = null;
        });
    }

    return userRanksLoading;
}

function getCachedUserRank(userId) {
    return userId ? userRankCache.get(String(userId)) || "" : "";
}

function applyUserRank(element) {
    const username = element.dataset.rankedUsername || "";
    const rank = getCachedUserRank(element.dataset.userId);

    element.textContent = rank
        ? `${username} (${rank})`
        : username;
    element.classList.toggle("rank-owner", rank === "OWNER");
    element.classList.toggle("rank-moderator", rank === "MODERATOR");
}

function setRankedUsername(element, username, userId) {
    if (!element) {
        return;
    }

    element.dataset.rankedUsername = String(username || "User");
    element.dataset.userId = userId ? String(userId) : "";

    if (userRanksLoaded) {
        applyUserRank(element);
        return;
    }

    element.textContent = element.dataset.rankedUsername;
    ensureUserRanksLoaded()
        .then(() => {
            if (element.isConnected) {
                applyUserRank(element);
            }
        })
        .catch(error => {
            console.error(
                "Could not load user ranks. Apply sql/migrations/20261108_user_ranks.sql in Supabase:",
                error
            );
        });
}
