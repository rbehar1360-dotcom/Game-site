// ACHIEVEMENTS SYSTEM
// =========================================
console.log("ACHIEVEMENTS SYSTEM LOADED");
console.log(
    "Achievements button:",
    document.getElementById("achievementsButton")
);
const achievementsOverlay =
    document.getElementById("achievementsOverlay");

const closeAchievements =
    document.getElementById("closeAchievements");

const achievementsButton =
    document.getElementById("achievementsButton");

const profileAchievementsButton =
    document.getElementById("profileAchievementsButton");

const achievementsSubtitle =
    document.getElementById("achievementsSubtitle");

const achievementsProgressText =
    document.getElementById("achievementsProgressText");

const achievementsProgressFill =
    document.getElementById("achievementsProgressFill");

const achievementsList =
    document.getElementById("achievementsList");

let currentAchievementsUser = null;


// =========================================
// FORMAT ACHIEVEMENT DATE
// =========================================

function formatAchievementDate(date) {

    if (!date) {
        return "Unknown date";
    }

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
        return "Unknown date";
    }

    return parsed.toLocaleDateString([], {
        month: "short",
        day: "numeric",
        year: "numeric"
    });
}


// =========================================
// FORMAT ACHIEVEMENT PROGRESS
// =========================================

function formatAchievementProgress(
    current,
    required
) {

    current = Number(current || 0);
    required = Number(required || 0);

    if (required <= 0) {
        return "Complete";
    }

    if (current > required) {
        current = required;
    }

    return `${current.toLocaleString()} / ${required.toLocaleString()}`;
}


// =========================================
// GET ACHIEVEMENT PERCENTAGE
// =========================================

function getAchievementPercentage(
    current,
    required
) {

    current = Number(current || 0);
    required = Number(required || 0);

    if (required <= 0) {
        return 100;
    }

    return Math.min(
        100,
        Math.max(
            0,
            (current / required) * 100
        )
    );
}


// =========================================
// RENDER ACHIEVEMENTS
// =========================================

function renderAchievements(data) {

    if (!achievementsList) {
        return;
    }

    achievementsList.innerHTML = "";

    const achievements =
        data?.achievements || [];

    const unlockedCount =
        achievements.filter(
            achievement => achievement.unlocked
        ).length;

    const totalCount =
        achievements.length;

    const percentage =
        totalCount > 0
            ? Math.round(
                (unlockedCount / totalCount) * 100
            )
            : 0;

    if (achievementsProgressText) {

        achievementsProgressText.textContent =
            `${unlockedCount} / ${totalCount}`;

    }

    if (achievementsProgressFill) {

        achievementsProgressFill.style.width =
            `${percentage}%`;

    }

    if (achievements.length === 0) {

        achievementsList.innerHTML = `
            <div class="achievements-empty">
                No achievements are available yet.
            </div>
        `;

        return;
    }

    achievements.forEach(achievement => {

        const unlocked =
            Boolean(achievement.unlocked);

        const current =
            Number(
                achievement.progress_current || 0
            );

        const required =
            Number(
                achievement.progress_required || 0
            );

        const progressPercentage =
            getAchievementPercentage(
                current,
                required
            );

        const card =
            document.createElement("div");

        card.className =
            unlocked
                ? "achievement-card unlocked"
                : "achievement-card locked";

        const status =
            unlocked
                ? "Unlocked"
                : "Locked";

        const progressText =
            unlocked
                ? "Complete"
                : formatAchievementProgress(
                    current,
                    required
                );

        const unlockedDate =
            unlocked
                ? `
                    <div class="achievement-unlocked-date">
                        Unlocked ${formatAchievementDate(
                            achievement.unlocked_at
                        )}
                    </div>
                `
                : "";

        card.innerHTML = `

            <div class="achievement-icon">
                ${achievement.icon || "🏅"}
            </div>

            <div class="achievement-content">

                <div class="achievement-top">

                    <div class="achievement-name">
                        ${escapeOwnerHTML(
                            achievement.name ||
                            "Achievement"
                        )}
                    </div>

                    <div class="achievement-status">
                        ${status}
                    </div>

                </div>

                <div class="achievement-description">
                    ${escapeOwnerHTML(
                        achievement.description ||
                        ""
                    )}
                </div>

                <div class="achievement-progress">

                    <div class="achievement-progress-top">

                        <span>
                            ${progressText}
                        </span>

                        <span>
                            ${Math.round(
                                progressPercentage
                            )}%
                        </span>

                    </div>

                    <div class="achievement-progress-bar">

                        <div
                            class="achievement-progress-fill"
                            style="width: ${progressPercentage}%"
                        ></div>

                    </div>

                </div>

                ${unlockedDate}

                ${
                    achievement.category
                        ? `
                            <div class="achievement-category">
                                ${escapeOwnerHTML(
                                    achievement.category
                                )}
                            </div>
                        `
                        : ""
                }

            </div>
        `;

        achievementsList.appendChild(card);

    });
}


// =========================================
// LOAD ACHIEVEMENTS
// =========================================

async function loadAchievements(
    userId
) {

    if (!achievementsList) {
        return;
    }

    achievementsList.innerHTML = `
        <div class="achievements-loading">
            Loading achievements...
        </div>
    `;

    if (!userId) {

        achievementsList.innerHTML = `
            <div class="achievements-empty">
                Could not identify this user.
            </div>
        `;

        return;
    }

    const {
        data,
        error
    } = await supabaseClient.rpc(
        "get_user_achievements",
        {
            target_user_id: userId
        }
    );

    if (error) {

        console.error(
            "Could not load achievements:",
            error
        );

        achievementsList.innerHTML = `
            <div class="achievements-empty">
                Could not load achievements.
            </div>
        `;

        if (achievementsProgressText) {
            achievementsProgressText.textContent =
                "—";
        }

        if (achievementsProgressFill) {
            achievementsProgressFill.style.width =
                "0%";
        }

        return;
    }

    renderAchievements(data);
}


// =========================================
// OPEN ACHIEVEMENTS
// =========================================

async function openAchievements(userId, username) {

    console.log(
        "OPEN ACHIEVEMENTS:",
        userId,
        username
    );

    if (!achievementsOverlay) {

        console.error(
            "Achievements overlay was not found."
        );

        return;
    }

    if (!userId) {

        console.error(
            "No achievement user ID."
        );

        return;
    }

    currentAchievementsUser = {
        id: userId,
        username: username || "User"
    };

    // Open the modal immediately
    achievementsOverlay.classList.add("open");

    console.log(
        "Achievements modal opened."
    );

    if (achievementsSubtitle) {

        const {
            data: userData
        } = await supabaseClient.auth.getUser();

        const isOwnProfile =
            userData?.user?.id === userId;

        achievementsSubtitle.textContent =
            isOwnProfile
                ? "Track your Game Hub achievements"
                : `${username || "User"}'s achievements`;

    }

    if (achievementsProgressText) {

        achievementsProgressText.textContent =
            "Loading...";

    }

    if (achievementsProgressFill) {

        achievementsProgressFill.style.width =
            "0%";

    }

    if (achievementsList) {

        achievementsList.innerHTML = `
            <div class="achievements-loading">
                Loading achievements...
            </div>
        `;

    }

    console.log(
        "Loading achievement data..."
    );

    await loadAchievements(userId);

    console.log(
        "Achievement data loaded."
    );
}


// =========================================
// CLOSE ACHIEVEMENTS
// =========================================

function closeAchievementsModal() {

    if (!achievementsOverlay) {
        return;
    }

    achievementsOverlay.classList.remove("open");

    currentAchievementsUser = null;
}


// =========================================
// MY ACHIEVEMENTS BUTTON
// =========================================

if (achievementsButton) {

    achievementsButton.addEventListener(
        "click",
        async function(event) {

            console.log("ACHIEVEMENTS BUTTON CLICKED");

            event.preventDefault();
            event.stopPropagation();

            const {
                data: userData,
                error
            } = await supabaseClient.auth.getUser();

            console.log("Supabase user result:", userData);
            console.log("Supabase user error:", error);

            const user =
                userData?.user;

            if (!user) {

                console.log(
                    "No logged-in user."
                );

                if (loginOverlay) {
                    loginOverlay.classList.add("open");
                }

                return;
            }

            console.log(
                "Opening achievements for:",
                user.id
            );

            if (accountMenu) {
                accountMenu.classList.remove("open");
            }

            const username =
                user.user_metadata?.username ||
                "You";

            await openAchievements(
                user.id,
                username
            );

        }
    );

} else {

    console.error(
        "Achievements button was not found."
    );

}

// =========================================
// PROFILE ACHIEVEMENTS BUTTON
// =========================================

if (profileAchievementsButton) {

    profileAchievementsButton.addEventListener(
        "click",
        async function() {

            if (!currentProfileUser) {
                return;
            }

            await openAchievements(
                currentProfileUser.id,
                currentProfileUser.username
            );

        }
    );

}


// =========================================
// CLOSE BUTTON
// =========================================

if (closeAchievements) {

    closeAchievements.addEventListener(
        "click",
        closeAchievementsModal
    );

}


// =========================================
// CLICK OUTSIDE
// =========================================

if (achievementsOverlay) {

    achievementsOverlay.addEventListener(
        "click",
        function(event) {

            if (
                event.target ===
                achievementsOverlay
            ) {

                closeAchievementsModal();

            }

        }
    );

}


// =========================================
// ESCAPE ACHIEVEMENTS
// =========================================

document.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key === "Escape" &&
            achievementsOverlay &&
            achievementsOverlay.classList.contains("open")
        ) {

            closeAchievementsModal();

        }

    }
);
// =========================================
// INITIAL ADMIN CHECK
// =========================================
async function checkAchievements() {
    const { data: { user }, error: userError } =
        await supabaseClient.auth.getUser();

    if (userError || !user) return;

    const { data, error } = await supabaseClient.rpc(
        "check_and_unlock_achievements",
        {
            target_user_id: user.id
        }
    );

    if (error) {
        console.error("Achievement check failed:", error);
        return;
    }

    if (Array.isArray(data) && data.length > 0) {
        data.forEach(achievement => {
            console.log(
                `${achievement.icon} Achievement unlocked: ${achievement.name}`
            );
        });
    }

    if (
        typeof currentAchievementsUser !== "undefined" &&
        currentAchievementsUser === user.id &&
        typeof loadAchievements === "function"
    ) {
        await loadAchievements(user.id);
    }
}
checkAchievements();
checkAdmin();
