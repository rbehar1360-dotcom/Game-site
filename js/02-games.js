// =========================================
// GAME LIKES
// =========================================

async function getCurrentUser() {
    const { data, error } =
        await window.getCurrentAuthUserResponse();

    if (error) {
        console.error(
            "Could not get current user:",
            error
        );

        return null;
    }

    return data?.user || null;
}


async function setupLikes() {

    const gameWrappers =
        document.querySelectorAll(".game-wrapper");

    // Get the current user ONCE.
    const user = await getCurrentUser();

    // Collect all valid game cards.
    const gameData = [];

    gameWrappers.forEach(wrapper => {

        const gameId =
            wrapper.dataset.gameId;

        if (!gameId) {
            return;
        }

        const likeButton =
            wrapper.querySelector(".like-button");

        const likeCount =
            wrapper.querySelector(".like-count");

        if (!likeButton || !likeCount) {
            return;
        }

        gameData.push({
            wrapper,
            gameId,
            likeButton,
            likeCount
        });

    });


    if (!gameData.length) {
        return;
    }


    const gameIds = [...new Set(gameData.map(game => game.gameId))];
    const { data: likeCounts, error: likeCountsError } =
        await supabaseClient.rpc("get_like_counts_for_games", {
            p_game_ids: gameIds
        });

    if (likeCountsError) {
        console.error("Could not load game like counts:", likeCountsError);
    } else {
        const countsByGameId = new Map(
            (likeCounts || []).map(row => [row.game_id, row.like_count])
        );

        gameData.forEach(game => {
            game.likeCount.textContent =
                countsByGameId.get(game.gameId) || 0;
        });
    }


    // =========================================
    // LOAD USER'S LIKES ONCE
    // =========================================

    let likedGameIds = new Set();

    if (user) {

        const { data: userLikes, error } =
            await supabaseClient
                .from("likes")
                .select("game_id")
                .eq("user_id", user.id);

        if (error) {

            console.error(
                "Could not load user's likes:",
                error
            );

        } else {

            likedGameIds = new Set(
                (userLikes || []).map(
                    like => like.game_id
                )
            );

        }

    }


    // =========================================
    // UPDATE LIKE BUTTONS
    // =========================================

    gameData.forEach(game => {

        if (likedGameIds.has(game.gameId)) {

            game.likeButton.classList.add(
                "liked"
            );

        }

    });


    // =========================================
    // LIKE BUTTON CLICK
    // =========================================

    gameData.forEach(game => {

        game.likeButton.addEventListener(
            "click",
            async function(event) {

                event.preventDefault();
                event.stopPropagation();


                const user =
                    await getCurrentUser();


                if (!user) {

                    alert(
                        "Please log in to like games! ❤️"
                    );

                    return;
                }


                // =========================================
                // CHECK EXISTING LIKE
                // =========================================

                const {
                    data: existingLike,
                    error: findError
                } =
                    await supabaseClient
                        .from("likes")
                        .select("id")
                        .eq("user_id", user.id)
                        .eq("game_id", game.gameId)
                        .maybeSingle();


                if (findError) {

                    console.error(
                        "Could not check like:",
                        findError
                    );

                    return;
                }


                // =========================================
                // REMOVE LIKE
                // =========================================

                if (existingLike) {

                    const { error } =
                        await supabaseClient
                            .from("likes")
                            .delete()
                            .eq(
                                "id",
                                existingLike.id
                            );


                    if (error) {

                        console.error(
                            "Could not remove like:",
                            error
                        );

                        return;
                    }


                    game.likeButton.classList.remove(
                        "liked"
                    );


                    game.likeCount.textContent =
                        Math.max(
                            0,
                            Number(
                                game.likeCount.textContent
                            ) - 1
                        );

                }


                // =========================================
                // ADD LIKE
                // =========================================

                else {

                    const { error } =
                        await supabaseClient
                            .from("likes")
                            .insert({
                                user_id: user.id,
                                game_id: game.gameId
                            });


                    if (error) {

                        console.error(
                            "Could not add like:",
                            error
                        );

                        return;
                    }


                    game.likeButton.classList.add(
                        "liked"
                    );


                    game.likeCount.textContent =
                        Number(
                            game.likeCount.textContent
                        ) + 1;

                }

            }
        );

    });

}


// =========================================
// START LIKE SYSTEM
// =========================================

setupLikes();

// =========================================
// GAME VIEW TRACKING
// =========================================

console.log("VIEW TRACKING SCRIPT LOADED");

document.querySelectorAll(".game-link").forEach(link => {

    link.addEventListener("click", async (event) => {

        const wrapper = link.closest(".game-wrapper");

        // Ignore non-game links
        if (!wrapper) return;

        const gameId = wrapper.dataset.gameId;

        if (!gameId) return;

        // Stop navigation temporarily
        event.preventDefault();

        console.log("Recording view for:", gameId);

        try {

            const { error } = await supabaseClient.rpc(
                "increment_game_view",
                {
                    game_id: gameId
                }
            );

            if (error) {

                console.error(
                    "Failed to record game view:",
                    error
                );

            } else {

                console.log(
                    "View recorded successfully:",
                    gameId
                );

            }

        } catch (error) {

            console.error(
                "View tracking error:",
                error
            );

        }

        // Continue to the game
        window.location.href = link.href;

    });

});

// =========================================
// GAME FAVORITES
// =========================================

// =========================================
// GAME FAVORITES
// =========================================

let favoritesUserId = null;
let favoritesInitialized = false;
let favoritesRequestId = 0;
let favoritesLoadingUserId = null;
let favoritesLoadPromise = null;
const favoriteGameIds = new Set();

/*
 * Favorites are handled with event delegation so sorting the game cards
 * never breaks the buttons or creates duplicate click listeners.
 */

function getFavoriteButtons() {
    return document.querySelectorAll(".favorite-button");
}

function setFavoriteButton(button, isFavorite) {
    if (!button) return;

    button.textContent = isFavorite ? "★" : "☆";
    button.classList.toggle("favorited", isFavorite);

    const wrapper = button.closest(".game-wrapper");
    const title =
        wrapper?.querySelector(".title")?.textContent?.trim() || "game";

    button.setAttribute(
        "aria-label",
        isFavorite
            ? `Remove ${title} from favorites`
            : `Add ${title} to favorites`
    );
}

function clearFavoriteUI() {
    getFavoriteButtons().forEach(button => {
        setFavoriteButton(button, false);
    });
}

async function getCurrentUser() {
    const { data, error } = await window.getCurrentAuthUserResponse();

    if (error) {
        console.error("Could not get current user:", error);
        return null;
    }

    return data?.user || null;
}

async function loadFavorites(user = null) {
    if (!user) {
        user = await getCurrentUser();
    }

    if (!user) {
        favoritesRequestId++;
        favoritesUserId = null;
        favoriteGameIds.clear();
        clearFavoriteUI();
        return;
    }

    if (favoritesLoadingUserId === user.id && favoritesLoadPromise) {
        return favoritesLoadPromise;
    }

    const requestId = ++favoritesRequestId;
    favoritesUserId = user.id;

    const request = (async () => {
        const { data: favorites, error } = await supabaseClient
            .from("favorites")
            .select("game_id")
            .eq("user_id", user.id);

        if (error) {
            console.error("Could not load favorites:", error);
            return;
        }

        if (requestId !== favoritesRequestId) return;

        const loadedFavoriteIds = new Set(
            (favorites || []).map(favorite => favorite.game_id)
        );

        favoriteGameIds.clear();
        loadedFavoriteIds.forEach(gameId => favoriteGameIds.add(gameId));

        getFavoriteButtons().forEach(button => {
            const wrapper = button.closest(".game-wrapper");
            const gameId = wrapper?.dataset.gameId;

            setFavoriteButton(button, favoriteGameIds.has(gameId));
        });

        await sortFavoriteGames(favoriteGameIds);
    })();

    favoritesLoadingUserId = user.id;
    favoritesLoadPromise = request;

    try {
        await request;
    } finally {
        if (favoritesLoadPromise === request) {
            favoritesLoadingUserId = null;
            favoritesLoadPromise = null;
        }
    }
}

async function sortFavoriteGames(favoriteIds = null) {
    const gameGrid = document.querySelector(".game-grid");

    if (!gameGrid) return;

    // Save each game's ORIGINAL position once.
    // This prevents games from permanently staying at the top
    // after being unfavorited.
    const allGames = Array.from(
        gameGrid.querySelectorAll(".game-wrapper")
    );

    allGames.forEach((game, index) => {
        if (game.dataset.originalIndex === undefined) {
            game.dataset.originalIndex = index;
        }
    });

    if (!favoriteIds) {
        const user = await getCurrentUser();

        if (!user) {
            clearFavoriteUI();
            return;
        }

        const { data: favorites, error } = await supabaseClient
            .from("favorites")
            .select("game_id")
            .eq("user_id", user.id);

        if (error) {
            console.error("Could not get favorites:", error);
            return;
        }

        favoriteIds = new Set(
            (favorites || []).map(favorite => favorite.game_id)
        );
    }

    const games = Array.from(
        gameGrid.querySelectorAll(".game-wrapper")
    );

    games.sort((a, b) => {

        const aFavorite =
            favoriteIds.has(a.dataset.gameId);

        const bFavorite =
            favoriteIds.has(b.dataset.gameId);

        // Favorite games always go first.
        if (aFavorite && !bFavorite) return -1;
        if (!aFavorite && bFavorite) return 1;

        // If they're both favorites OR both aren't favorites,
        // put them back according to their ORIGINAL position.
        return (
            Number(a.dataset.originalIndex) -
            Number(b.dataset.originalIndex)
        );
    });

    const fragment = document.createDocumentFragment();

    games.forEach(game => {
        fragment.appendChild(game);
    });

    gameGrid.appendChild(fragment);
}

async function toggleFavorite(button) {
    if (!button || button.dataset.favoriteBusy === "true") {
        return;
    }

    const wrapper = button.closest(".game-wrapper");

    if (!wrapper) return;

    const gameId = wrapper.dataset.gameId;

    if (!gameId) return;

    const user = await getCurrentUser();

    if (!user) {
        alert("Please log in to favorite games! ⭐");
        return;
    }

    // Prevent rapid double-clicks from creating duplicate requests.
    button.dataset.favoriteBusy = "true";

    try {

        const { data: existingFavorite, error: findError } =
            await supabaseClient
                .from("favorites")
                .select("id")
                .eq("user_id", user.id)
                .eq("game_id", gameId)
                .maybeSingle();

        if (findError) {
            console.error("Could not check favorite:", findError);
            return;
        }

        // =========================================
        // REMOVE FAVORITE
        // =========================================

        if (existingFavorite) {

            const { error } = await supabaseClient
                .from("favorites")
                .delete()
                .eq("user_id", user.id)
                .eq("game_id", gameId);

            if (error) {
                console.error(
                    "Could not remove favorite:",
                    error
                );

                return;
            }

            favoriteGameIds.delete(gameId);
            setFavoriteButton(button, false);
        }

        // =========================================
        // ADD FAVORITE
        // =========================================

        else {

            const { error } = await supabaseClient
                .from("favorites")
                .insert({
                    user_id: user.id,
                    game_id: gameId
                });

            if (error) {
                console.error(
                    "Could not add favorite:",
                    error
                );

                return;
            }

            favoriteGameIds.add(gameId);
            setFavoriteButton(button, true);
        }

        await sortFavoriteGames(favoriteGameIds);
        checkAchievements();
    }

    finally {
        button.dataset.favoriteBusy = "false";
    }
}


// =========================================
// FAVORITE CLICK HANDLER
// =========================================

// ONE listener handles every favorite button.
// This means sorting/reordering the cards will NOT
// break the buttons or create duplicate listeners.

if (!favoritesInitialized) {

    favoritesInitialized = true;

    document.addEventListener("click", function(event) {

        const button =
            event.target.closest(".favorite-button");

        if (!button) return;

        event.preventDefault();
        event.stopPropagation();

        toggleFavorite(button);

    });
}


// =========================================
// AUTH STATE CHANGES
// =========================================

// Automatically refresh favorites when:
// - User logs in
// - User logs out
// - Session changes

loadFavorites();

supabaseClient.auth.onAuthStateChange(
    async (_event, session) => {

        const newUserId =
            session?.user?.id || null;

        // Nothing changed.
        if (
            newUserId === favoritesUserId &&
            favoritesUserId !== null
        ) {
            return;
        }

        // Logged out
        if (!newUserId) {

            favoritesRequestId++;

            favoritesUserId = null;
            favoriteGameIds.clear();

            clearFavoriteUI();

            return;
        }

        // Logged in
        await loadFavorites(session.user);

    }
);

// =========================================
