// USER PROFILE SYSTEM
// =========================================

const profileOverlay =
    document.getElementById("profileOverlay");

const closeProfile =
    document.getElementById("closeProfile");

const profileUsername =
    document.getElementById("profileUsername");

const profileBadge =
    document.getElementById("profileBadge");

const profileRank =
    document.getElementById("profileRank");

const profileTotalPlaytime =
    document.getElementById("profileTotalPlaytime");

const profileGamesPlayed =
    document.getElementById("profileGamesPlayed");

const profileMostPlayed =
    document.getElementById("profileMostPlayed");

const profileLastActive =
    document.getElementById("profileLastActive");

const profilePlaytimeList =
    document.getElementById("profilePlaytimeList");

const profileRecentList =
    document.getElementById("profileRecentList");

const profileAchievements =
    document.getElementById("profileAchievements");

const profileMessageButton =
    document.getElementById("profileMessageButton");

let currentProfileUser = null;


// =========================================
// GET GAME TITLE
// =========================================

function getProfileGameTitle(gameId) {

    const wrapper =
        document.querySelector(
            `.game-wrapper[data-game-id="${CSS.escape(gameId)}"]`
        );

    return (
        wrapper
            ?.querySelector(".title")
            ?.textContent
            ?.trim()
        || gameId
    );
}


// =========================================
// FORMAT PROFILE DATE
// =========================================

function formatProfileDate(date) {

    if (!date) {
        return "Never";
    }

    const parsed =
        new Date(date);

    if (Number.isNaN(parsed.getTime())) {
        return "Unknown";
    }

    return parsed.toLocaleDateString(
        [],
        {
            month: "short",
            day: "numeric",
            year: "numeric"
        }
    );
}


// =========================================
// RENDER ACHIEVEMENTS
// =========================================


// =========================================
// RENDER PLAYTIME
// =========================================

function renderProfilePlaytime(playtime) {

    if (!profilePlaytimeList) {
        return;
    }

    profilePlaytimeList.innerHTML = "";

    if (!playtime || playtime.length === 0) {

        profilePlaytimeList.innerHTML = `
            <div class="profile-empty">
                No playtime recorded yet.
            </div>
        `;

        return;
    }

    playtime.forEach(game => {

        const row =
            document.createElement("div");

        row.className =
            "profile-playtime-row";

        const title =
            getProfileGameTitle(
                game.game_id
            );

        row.innerHTML = `
            <div class="profile-playtime-game">
                ${escapeOwnerHTML(title)}
            </div>

            <div class="profile-playtime-time">
                ${formatPlaytime(
                    game.playtime_seconds
                )}
            </div>
        `;

        profilePlaytimeList.appendChild(row);

    });
}


// =========================================
// RENDER RECENT ACTIVITY
// =========================================

function renderProfileRecent(recentGames) {

    if (!profileRecentList) {
        return;
    }

    profileRecentList.innerHTML = "";

    if (
        !recentGames ||
        recentGames.length === 0
    ) {

        profileRecentList.innerHTML = `
            <div class="profile-empty">
                No recent activity.
            </div>
        `;

        return;
    }

    recentGames.forEach(game => {

        const item =
            document.createElement("div");

        item.className =
            "profile-recent-item";

        const title =
            getProfileGameTitle(
                game.game_id
            );

        item.innerHTML = `
            <div>
                <div class="profile-recent-game">
                    ${escapeOwnerHTML(title)}
                </div>

                <div class="profile-recent-time">
                    ${formatPlaytime(
                        game.playtime_seconds
                    )}
                    played
                </div>
            </div>

            <div class="profile-recent-date">
                ${formatProfileDate(
                    game.last_played
                )}
            </div>
        `;

        profileRecentList.appendChild(item);

    });
}


// =========================================
// OPEN USER PROFILE
// =========================================

async function openUserProfile(
    userId,
    username
) {

    if (!profileOverlay) {
        console.error(
            "Profile overlay was not found."
        );

        return;
    }

    currentProfileUser = {
        id: userId,
        username: username
    };

    profileOverlay.classList.add("open");

    if (profileUsername) {
        profileUsername.textContent =
            username || "User";
    }

    if (profileBadge) {
        profileBadge.textContent = "";
    }

    if (profileRank) {
        profileRank.textContent = "Loading...";
    }

    if (profileTotalPlaytime) {
        profileTotalPlaytime.textContent =
            "Loading...";
    }

    if (profileGamesPlayed) {
        profileGamesPlayed.textContent =
            "Loading...";
    }

    if (profileMostPlayed) {
        profileMostPlayed.textContent =
            "Loading...";
    }

    if (profileLastActive) {
        profileLastActive.textContent =
            "Loading...";
    }

    if (profilePlaytimeList) {
        profilePlaytimeList.innerHTML = `
            <div class="profile-loading">
                Loading playtime...
            </div>
        `;
    }

    if (profileRecentList) {
        profileRecentList.innerHTML = `
            <div class="profile-loading">
                Loading activity...
            </div>
        `;
    }

    

    // If leaderboard did not provide the UUID,
    // try finding the user by username.
    if (!userId && username) {

        const foundUser =
            await findUserByUsername(username);

        if (foundUser) {

            userId =
                foundUser.user_id ||
                foundUser.id;

            currentProfileUser.id =
                userId;

        }

    }

    if (!userId) {

        if (profileRank) {
            profileRank.textContent = "—";
        }

        if (profileTotalPlaytime) {
            profileTotalPlaytime.textContent = "—";
        }

        if (profileGamesPlayed) {
            profileGamesPlayed.textContent = "—";
        }

        if (profileMostPlayed) {
            profileMostPlayed.textContent = "—";
        }

        if (profileLastActive) {
            profileLastActive.textContent = "—";
        }

        return;
    }

    const { data, error } =
        await supabaseClient.rpc(
            "get_public_user_profile",
            {
                target_user_id: userId
            }
        );

    if (error) {

        console.error(
            "Could not load profile:",
            error
        );

        if (profileRank) {
            profileRank.textContent = "—";
        }

        if (profileTotalPlaytime) {
            profileTotalPlaytime.textContent = "Could not load";
        }

        if (profileGamesPlayed) {
            profileGamesPlayed.textContent = "—";
        }

        if (profileMostPlayed) {
            profileMostPlayed.textContent = "—";
        }

        if (profileLastActive) {
            profileLastActive.textContent = "—";
        }

        return;
    }

    if (!data) {
        return;
    }

    currentProfileUser = {
        id: data.user_id,
        username:
            data.username ||
            username ||
            "User"
    };

    if (profileUsername) {
        profileUsername.textContent =
            currentProfileUser.username;
    }

    // Owner badge
    if (
        currentProfileUser.username
            .toLowerCase() === "ralph"
    ) {

        if (profileBadge) {
            profileBadge.textContent =
                "👑 Owner";
        }

    }

    if (profileRank) {

        profileRank.textContent =
            data.overall_rank
                ? `#${data.overall_rank}`
                : "Unranked";

    }

    if (profileTotalPlaytime) {

        profileTotalPlaytime.textContent =
            formatPlaytime(
                data.total_playtime
            );

    }

    if (profileGamesPlayed) {

        profileGamesPlayed.textContent =
            data.games_played || 0;

    }

    if (profileMostPlayed) {

        profileMostPlayed.textContent =
            data.most_played_game_id
                ? getProfileGameTitle(
                    data.most_played_game_id
                )
                : "None yet";

    }

    const recentGames =
        data.recent_games || [];

    if (profileLastActive) {

        profileLastActive.textContent =
            recentGames.length > 0
                ? formatProfileDate(
                    recentGames[0].last_played
                )
                : "Never";

    }

    renderProfilePlaytime(
        data.playtime || []
    );

    renderProfileRecent(
        recentGames
    );

   

    const currentUser =
        await getCurrentUser();

    if (profileMessageButton) {

        if (
            currentUser &&
            currentUser.id === data.user_id
        ) {

            profileMessageButton.style.display =
                "none";

        } else {

            profileMessageButton.style.display =
                "block";

        }

    }

}


// =========================================
// CLOSE PROFILE
// =========================================

function closeUserProfile() {

    if (!profileOverlay) {
        return;
    }

    profileOverlay.classList.remove(
        "open"
    );

    currentProfileUser = null;
}


if (closeProfile) {

    closeProfile.addEventListener(
        "click",
        closeUserProfile
    );

}


if (profileOverlay) {

    profileOverlay.addEventListener(
        "click",
        function(event) {

            if (
                event.target ===
                profileOverlay
            ) {

                closeUserProfile();

            }

        }
    );

}


// =========================================
// ESCAPE PROFILE
// =========================================

document.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key === "Escape" &&
            profileOverlay &&
            profileOverlay.classList.contains("open")
        ) {

            closeUserProfile();

        }

    }
);


// =========================================
// MESSAGE FROM PROFILE
// =========================================

if (profileMessageButton) {

    profileMessageButton.addEventListener(
        "click",
        async function() {

            if (!currentProfileUser) {
                return;
            }

            const user =
                await getCurrentUser();

            if (!user) {

                closeUserProfile();

                if (loginOverlay) {
                    loginOverlay.classList.add("open");
                }

                return;
            }

            if (
                user.id ===
                currentProfileUser.id
            ) {
                return;
            }

            const targetUser =
                currentProfileUser;

            closeUserProfile();

            if (leaderboardOverlay) {
                leaderboardOverlay.classList.remove(
                    "open"
                );
            }

            if (accountMenu) {
                accountMenu.classList.remove(
                    "open"
                );
            }

            if (messagesOverlay) {

                messagesOverlay.classList.add(
                    "open"
                );

                await loadConversations();

                await openPrivateConversation(
                    targetUser.id,
                    targetUser.username
                );

                await updateUnreadCount();

            }

        }
    );

}
// =========================================
