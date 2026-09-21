// PLAYTIME LEADERBOARD
// =========================================

const leaderboardButton =
    document.getElementById("leaderboardButton");

const leaderboardOverlay =
    document.getElementById("leaderboardOverlay");

const closeLeaderboard =
    document.getElementById("closeLeaderboard");

const leaderboardList =
    document.getElementById("leaderboardList");

const leaderboardGame =
    document.getElementById("leaderboardGame");

const leaderboardUsersTab =
    document.getElementById("leaderboardUsersTab");

const leaderboardGamesTab =
    document.getElementById("leaderboardGamesTab");

const leaderboardDescription =
    document.getElementById("leaderboardDescription");

const gamePlaytimeOverlay =
    document.getElementById("gamePlaytimeOverlay");

const closeGamePlaytime =
    document.getElementById("closeGamePlaytime");

const gamePlaytimeTitle =
    document.getElementById("gamePlaytimeTitle");

const gamePlaytimeDescription =
    document.getElementById("gamePlaytimeDescription");

const gamePlaytimeTotal =
    document.getElementById("gamePlaytimeTotal");

const gamePlaytimeList =
    document.getElementById("gamePlaytimeList");

let currentLeaderboardMode = "users";

let leaderboardGameNames = {};


// =========================================
// FORMAT PLAYTIME
// =========================================

function formatLeaderboardTime(seconds) {

    seconds = Number(seconds) || 0;

    const days =
        Math.floor(seconds / 86400);

    const hours =
        Math.floor(
            (seconds % 86400) / 3600
        );

    const minutes =
        Math.floor(
            (seconds % 3600) / 60
        );

    if (days > 0) {

        return (
            days +
            "d " +
            hours +
            "h " +
            minutes +
            "m"
        );

    }

    if (hours > 0) {

        return (
            hours +
            "h " +
            minutes +
            "m"
        );

    }

    if (minutes > 0) {

        return minutes + "m";

    }

    return seconds + "s";
}


// =========================================
// GET GAME NAME
// =========================================

function getLeaderboardGameName(gameId) {

    if (!gameId) {
        return "Unknown Game";
    }

    if (leaderboardGameNames[gameId]) {

        return leaderboardGameNames[gameId];

    }

    const wrappers =
        document.querySelectorAll(
            ".game-wrapper[data-game-id]"
        );

    for (const wrapper of wrappers) {

        if (
            wrapper.dataset.gameId ===
            gameId
        ) {

            const titleElement =
                wrapper.querySelector(".title");

            if (titleElement) {

                const title =
                    titleElement.textContent.trim();

                if (title) {

                    leaderboardGameNames[gameId] =
                        title;

                    return title;

                }

            }

        }

    }

    return gameId;
}


// =========================================
// SETUP GAME NAMES
// =========================================

function setupLeaderboardGames() {

    if (!leaderboardGame) {
        return;
    }

    leaderboardGameNames = {};

    leaderboardGame.innerHTML =
        '<option value="">🌎 All Games</option>';

    const wrappers =
        document.querySelectorAll(
            ".game-wrapper[data-game-id]"
        );

    const games = [];

    wrappers.forEach(function(wrapper) {

        const gameId =
            wrapper.dataset.gameId;

        if (!gameId) {
            return;
        }

        const titleElement =
            wrapper.querySelector(".title");

        const title =
            titleElement
                ? titleElement.textContent.trim()
                : gameId;

        leaderboardGameNames[gameId] =
            title;

        if (
            !games.some(
                function(game) {
                    return game.id === gameId;
                }
            )
        ) {

            games.push({
                id: gameId,
                title: title
            });

        }

    });

    games
        .sort(function(a, b) {

            return a.title.localeCompare(
                b.title
            );

        })
        .forEach(function(game) {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                game.id;

            option.textContent =
                game.title;

            leaderboardGame.appendChild(
                option
            );

        });

}


// =========================================
// LOAD USER LEADERBOARD
// =========================================

async function loadUserLeaderboard() {

    leaderboardList.innerHTML =
        '<div class="leaderboard-loading">Loading leaderboard...</div>';

    const gameId =
        leaderboardGame.value || null;

    const result =
        await supabaseClient.rpc(
            "get_playtime_leaderboard",
            {
                p_game_id: gameId,
                p_limit: 25
            }
        );

    
    if (result.error) {

        console.error(
            "Could not load playtime leaderboard:",
            result.error
        );

        leaderboardList.innerHTML =
            '<div class="leaderboard-loading">Could not load leaderboard.</div>';

        return;
    }

    const data =
        result.data;

    
    leaderboardList.innerHTML = "";

    if (
        !data ||
        data.length === 0
    ) {

        leaderboardList.innerHTML =
            '<div class="leaderboard-loading">No playtime recorded yet.</div>';

        return;
    }

    data.forEach(function(player, index) {

        const row =
            document.createElement("div");

        row.className =
            "leaderboard-row";

        const rank =
            document.createElement("div");

        rank.className =
            "leaderboard-rank";

        if (index === 0) {

            rank.textContent =
                "🥇";

        }

        else if (index === 1) {

            rank.textContent =
                "🥈";

        }

        else if (index === 2) {

            rank.textContent =
                "🥉";

        }

        else {

            rank.textContent =
                "#" + (index + 1);

        }

        const username =
            document.createElement("div");

        username.className =
            "leaderboard-username";

        const playerUsername =
            player.username ||
            player.display_name ||
            "User";

        username.textContent =
            playerUsername;

        const profileUserId =
            player.user_id ||
            player.id ||
            null;

        const time =
            document.createElement("div");

        time.className =
            "leaderboard-time";

        time.textContent =
            formatLeaderboardTime(
                player.playtime_seconds
            );

        row.appendChild(rank);
        row.appendChild(username);
        row.appendChild(time);

        row.dataset.userId =
            profileUserId || "";

        row.dataset.username =
            playerUsername;

        row.classList.add(
            "clickable-profile"
        );

        row.setAttribute(
            "role",
            "button"
        );

        row.setAttribute(
            "tabindex",
            "0"
        );

        row.addEventListener(
            "click",
            function() {

                if (
                    typeof openUserProfile ===
                    "function" &&
                    profileUserId
                ) {

                    openUserProfile(
                        profileUserId,
                        playerUsername
                    );

                }

            }
        );

        row.addEventListener(
            "keydown",
            function(event) {

                if (
                    event.key === "Enter" ||
                    event.key === " "
                ) {

                    event.preventDefault();

                    if (
                        typeof openUserProfile ===
                        "function" &&
                        profileUserId
                    ) {

                        openUserProfile(
                            profileUserId,
                            playerUsername
                        );

                    }

                }

            }
        );

        leaderboardList.appendChild(row);

    });

}


// =========================================
// LOAD GAME LEADERBOARD
// =========================================

async function loadGameLeaderboard() {

    leaderboardList.innerHTML =
        '<div class="leaderboard-loading">Loading game leaderboard...</div>';

    const result =
        await supabaseClient.rpc(
            "get_game_playtime_leaderboard",
            {
                p_limit: 100
            }
        );

    if (result.error) {

        console.error(
            "Could not load game leaderboard:",
            result.error
        );

        leaderboardList.innerHTML =
            '<div class="leaderboard-loading">Could not load game leaderboard.</div>';

        return;
    }

    const data =
        result.data;

    leaderboardList.innerHTML = "";

    if (
        !data ||
        data.length === 0
    ) {

        leaderboardList.innerHTML =
            '<div class="leaderboard-loading">No game playtime recorded yet.</div>';

        return;
    }


    // =====================================
    // TOTAL PLAYTIME
    // =====================================

    let totalPlaytime =
        0;

    data.forEach(function(game) {

        totalPlaytime +=
            Number(
                game.playtime_seconds
            ) || 0;

    });


    // =====================================
    // STATS HEADER
    // =====================================

    const stats =
        document.createElement("div");

    stats.className =
        "leaderboard-game-stats";

    stats.innerHTML =
        '<div class="leaderboard-stat">' +
            '<span class="leaderboard-stat-icon">🎮</span>' +
            '<div>' +
                '<strong>' +
                    data.length +
                '</strong>' +
                '<span>Games Played</span>' +
            '</div>' +
        '</div>' +

        '<div class="leaderboard-stat">' +
            '<span class="leaderboard-stat-icon">⏱️</span>' +
            '<div>' +
                '<strong>' +
                    formatLeaderboardTime(
                        totalPlaytime
                    ) +
                '</strong>' +
                '<span>Total Playtime</span>' +
            '</div>' +
        '</div>';

    leaderboardList.appendChild(stats);


    // =====================================
    // GAME ROWS
    // =====================================

    data.forEach(function(game, index) {

        const row =
            document.createElement("div");

        row.className =
            "leaderboard-row game-leaderboard-row";

        const rank =
            document.createElement("div");

        rank.className =
            "leaderboard-rank";

        if (index === 0) {

            rank.textContent =
                "🥇";

        }

        else if (index === 1) {

            rank.textContent =
                "🥈";

        }

        else if (index === 2) {

            rank.textContent =
                "🥉";

        }

        else {

            rank.textContent =
                "#" + (index + 1);

        }


        const gameName =
            document.createElement("div");

        gameName.className =
            "leaderboard-username";

        gameName.textContent =
            getLeaderboardGameName(
                game.game_id
            );


        const time =
            document.createElement("div");

        time.className =
            "leaderboard-time";

        time.textContent =
            formatLeaderboardTime(
                game.playtime_seconds
            );


        row.appendChild(rank);
        row.appendChild(gameName);
        row.appendChild(time);


        row.dataset.gameId =
            game.game_id;

        row.classList.add(
            "clickable-game"
        );

        row.setAttribute(
            "role",
            "button"
        );

        row.setAttribute(
            "tabindex",
            "0"
        );


        row.addEventListener(
            "click",
            function() {

                openGamePlaytime(
                    game.game_id
                );

            }
        );


        row.addEventListener(
            "keydown",
            function(event) {

                if (
                    event.key === "Enter" ||
                    event.key === " "
                ) {

                    event.preventDefault();

                    openGamePlaytime(
                        game.game_id
                    );

                }

            }
        );


        leaderboardList.appendChild(row);

    });

}


// =========================================
// OPEN GAME PLAYTIME
// =========================================

async function openGamePlaytime(gameId) {

    if (!gamePlaytimeOverlay) {
        return;
    }

    const gameName =
        getLeaderboardGameName(
            gameId
        );

    gamePlaytimeTitle.textContent =
        "🎮 " + gameName;

    gamePlaytimeDescription.textContent =
        "Player contributions";

    gamePlaytimeTotal.textContent =
        "Loading...";

    gamePlaytimeList.innerHTML =
        '<div class="game-playtime-loading">Loading player contributions...</div>';

    gamePlaytimeOverlay.classList.add(
        "open"
    );


    const result =
        await supabaseClient.rpc(
            "get_game_players_playtime",
            {
                p_game_id: gameId
            }
        );


    if (result.error) {

        console.error(
            "Could not load game player playtime:",
            result.error
        );

        gamePlaytimeTotal.textContent =
            "Error";

        gamePlaytimeList.innerHTML =
            '<div class="game-playtime-loading">Could not load player contributions.</div>';

        return;
    }


    const data =
        result.data;


    gamePlaytimeList.innerHTML = "";


    if (
        !data ||
        data.length === 0
    ) {

        gamePlaytimeTotal.textContent =
            "0s";

        gamePlaytimeList.innerHTML =
            '<div class="game-playtime-loading">No playtime recorded.</div>';

        return;
    }


    // =====================================
    // TOTAL
    // =====================================

    let total =
        0;

    data.forEach(function(player) {

        total +=
            Number(
                player.playtime_seconds
            ) || 0;

    });


    gamePlaytimeTotal.textContent =
        formatLeaderboardTime(
            total
        );


    // =====================================
    // PLAYER ROWS
    // =====================================

    data.forEach(function(player, index) {

        const row =
            document.createElement("div");

        row.className =
            "game-playtime-row";


        const rank =
            document.createElement("div");

        rank.className =
            "game-playtime-rank";


        if (index === 0) {

            rank.textContent =
                "🥇";

        }

        else if (index === 1) {

            rank.textContent =
                "🥈";

        }

        else if (index === 2) {

            rank.textContent =
                "🥉";

        }

        else {

            rank.textContent =
                "#" + (index + 1);

        }


        const username =
            document.createElement("div");

        username.className =
            "game-playtime-username";

        const playerUsername =
            player.username ||
            player.display_name ||
            "User";

        username.textContent =
            playerUsername;


        const time =
            document.createElement("div");

        time.className =
            "game-playtime-time";

        time.textContent =
            formatLeaderboardTime(
                player.playtime_seconds
            );


        row.appendChild(rank);
        row.appendChild(username);
        row.appendChild(time);


        const profileUserId =
            player.user_id ||
            player.id ||
            null;


        if (profileUserId) {

            row.classList.add(
                "clickable-profile"
            );

            row.setAttribute(
                "role",
                "button"
            );

            row.setAttribute(
                "tabindex",
                "0"
            );


            row.addEventListener(
                "click",
                function() {

                    if (
                        typeof openUserProfile ===
                        "function"
                    ) {

                        openUserProfile(
                            profileUserId,
                            playerUsername
                        );

                    }

                }
            );


            row.addEventListener(
                "keydown",
                function(event) {

                    if (
                        event.key === "Enter" ||
                        event.key === " "
                    ) {

                        event.preventDefault();

                        if (
                            typeof openUserProfile ===
                            "function"
                        ) {

                            openUserProfile(
                                profileUserId,
                                playerUsername
                            );

                        }

                    }

                }
            );

        }


        gamePlaytimeList.appendChild(row);

    });

}


// =========================================
// USERS TAB
// =========================================

if (leaderboardUsersTab) {

    leaderboardUsersTab.addEventListener(
        "click",
        async function() {

            currentLeaderboardMode =
                "users";

            leaderboardUsersTab.classList.add(
                "active"
            );

            leaderboardGamesTab.classList.remove(
                "active"
            );

            leaderboardDescription.textContent =
                "Who has spent the most time gaming?";

            leaderboardGame.style.display =
                "block";

            await loadUserLeaderboard();

        }
    );

}


// =========================================
// GAMES TAB
// =========================================

if (leaderboardGamesTab) {

    leaderboardGamesTab.addEventListener(
        "click",
        async function() {

            currentLeaderboardMode =
                "games";

            leaderboardGamesTab.classList.add(
                "active"
            );

            leaderboardUsersTab.classList.remove(
                "active"
            );

            leaderboardDescription.textContent =
                "Which games have been played the most?";

            leaderboardGame.style.display =
                "none";

            await loadGameLeaderboard();

        }
    );

}


// =========================================
// OPEN LEADERBOARD
// =========================================

if (leaderboardButton) {

    leaderboardButton.addEventListener(
        "click",
        async function(event) {

            event.preventDefault();
            event.stopPropagation();

            if (
                typeof accountMenu !==
                "undefined"
            ) {

                accountMenu.classList.remove(
                    "open"
                );

            }

            leaderboardOverlay.classList.add(
                "open"
            );

            setupLeaderboardGames();

            currentLeaderboardMode =
                "users";

            leaderboardUsersTab.classList.add(
                "active"
            );

            leaderboardGamesTab.classList.remove(
                "active"
            );

            leaderboardGame.style.display =
                "block";

            await loadUserLeaderboard();

        }
    );

}


// =========================================
// CLOSE LEADERBOARD
// =========================================

if (closeLeaderboard) {

    closeLeaderboard.addEventListener(
        "click",
        function() {

            leaderboardOverlay.classList.remove(
                "open"
            );

        }
    );

}


// =========================================
// CLOSE GAME PLAYTIME
// =========================================

if (closeGamePlaytime) {

    closeGamePlaytime.addEventListener(
        "click",
        function() {

            gamePlaytimeOverlay.classList.remove(
                "open"
            );

        }
    );

}


// =========================================
// CLICK OUTSIDE LEADERBOARD
// =========================================

if (leaderboardOverlay) {

    leaderboardOverlay.addEventListener(
        "click",
        function(event) {

            if (
                event.target ===
                leaderboardOverlay
            ) {

                leaderboardOverlay.classList.remove(
                    "open"
                );

            }

        }
    );

}


// =========================================
// CLICK OUTSIDE GAME PLAYTIME
// =========================================

if (gamePlaytimeOverlay) {

    gamePlaytimeOverlay.addEventListener(
        "click",
        function(event) {

            if (
                event.target ===
                gamePlaytimeOverlay
            ) {

                gamePlaytimeOverlay.classList.remove(
                    "open"
                );

            }

        }
    );

}


// =========================================
// ESCAPE KEY
// =========================================

document.addEventListener(
    "keydown",
    function(event) {

        if (event.key !== "Escape") {
            return;
        }

        if (
            leaderboardOverlay &&
            leaderboardOverlay.classList.contains(
                "open"
            )
        ) {

            leaderboardOverlay.classList.remove(
                "open"
            );

        }

        if (
            gamePlaytimeOverlay &&
            gamePlaytimeOverlay.classList.contains(
                "open"
            )
        ) {

            gamePlaytimeOverlay.classList.remove(
                "open"
            );

        }

    }
);


// =========================================
// CHANGE GAME FILTER
// =========================================

if (leaderboardGame) {

    leaderboardGame.addEventListener(
        "change",
        async function() {

            if (
                currentLeaderboardMode ===
                "users"
            ) {

                await loadUserLeaderboard();

            }

        }
    );

}
document.addEventListener("DOMContentLoaded", () => {
      const suggestButton = document.getElementById("suggestButton");
      const suggestOverlay = document.getElementById("suggestOverlay");
      const closeSuggest = document.getElementById("closeSuggest");
      const suggestForm = document.getElementById("suggestForm");
      const suggestStatus = document.getElementById("suggestStatus");
      const submitSuggestion = document.getElementById("submitSuggestion");

      function openSuggestions() {
        suggestOverlay.classList.add("open");
        document.getElementById("suggestGameName")?.focus();
      }

      function closeSuggestions() {
        suggestOverlay.classList.remove("open");
        suggestStatus.textContent = "";
      }

      suggestButton.addEventListener("click", async function () {
    const user = await getCurrentUser();

    if (!user) {
        alert("Please log in to suggest a game!");
        loginOverlay.classList.add("open");
        return;
    }

    openSuggestions();
});
      closeSuggest.addEventListener("click", closeSuggestions);

      suggestOverlay.addEventListener("click", (event) => {
        if (event.target === suggestOverlay) closeSuggestions();
      });

      document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && suggestOverlay.classList.contains("open")) {
          closeSuggestions();
        }
      });

      suggestForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const gameName = document.getElementById("suggestGameName").value.trim();
        const gameUrl = document.getElementById("suggestGameUrl").value.trim();
        const reason = document.getElementById("suggestReason").value.trim();

        if (!gameName) return;

        if (typeof supabaseClient === "undefined") {
          suggestStatus.textContent = "Supabase isn't loaded. Please try again.";
          return;
        }

        submitSuggestion.disabled = true;
        suggestStatus.textContent = "Submitting...";

        try {
          const { data: { user } } = await supabaseClient.auth.getUser();

          const { error } = await supabaseClient
            .from("game_suggestions")
            .insert({
              game_name: gameName,
              game_url: gameUrl || null,
              reason: reason || null,
              user_id: user?.id || null
            });

          if (error) throw error;

          suggestStatus.textContent = "Suggestion submitted!";
          suggestForm.reset();

          setTimeout(closeSuggestions, 1200);
        } catch (error) {
          console.error("Suggestion error:", error);
          suggestStatus.textContent = "Couldn't submit the suggestion. Please try again.";
        } finally {
          submitSuggestion.disabled = false;
        }
      });
    });


// Inside Script.js (Look for your click/view tracking listener)


// =========================================
