// GAME LIKES
// =========================================

async function setupLikes() {

    const gameWrappers =
        document.querySelectorAll(".game-wrapper");

    for (const wrapper of gameWrappers) {

        const gameId =
            wrapper.dataset.gameId;

        if (!gameId) {
            continue;
        }

        const likeButton =
            wrapper.querySelector(".like-button");

        const likeCount =
            wrapper.querySelector(".like-count");

        // Skip cards that do not have the complete like system
        if (!likeButton || !likeCount) {
            continue;
        }


        // -----------------------------------------
        // GET TOTAL LIKES
        // -----------------------------------------

        const { count, error: countError } =
            await supabaseClient
                .from("likes")
                .select("*", {
                    count: "exact",
                    head: true
                })
                .eq("game_id", gameId);


        if (countError) {

            console.error(
                "Could not get likes:",
                countError
            );

            continue;
        }


        likeCount.textContent =
            count || 0;


        // -----------------------------------------
        // CHECK IF CURRENT USER LIKED
        // -----------------------------------------

        const { data: userData } =
            await supabaseClient.auth.getUser();

        const user =
            userData.user;


        if (user) {

            const { data: existingLike } =
                await supabaseClient
                    .from("likes")
                    .select("id")
                    .eq("user_id", user.id)
                    .eq("game_id", gameId)
                    .maybeSingle();


            if (existingLike) {

                likeButton.classList.add(
                    "liked"
                );

            }

        }


        // -----------------------------------------
        // LIKE BUTTON CLICK
        // -----------------------------------------

        likeButton.addEventListener(
            "click",
            async function(event) {

                event.preventDefault();
                event.stopPropagation();


                const { data: userData } =
                    await supabaseClient.auth.getUser();

                const user =
                    userData.user;


                if (!user) {

                    alert(
                        "Please log in to like games! ❤️"
                    );

                    return;
                }


                // Check existing like

                const { data: existingLike } =
                    await supabaseClient
                        .from("likes")
                        .select("id")
                        .eq("user_id", user.id)
                        .eq("game_id", gameId)
                        .maybeSingle();


                // -----------------------------------------
                // REMOVE LIKE
                // -----------------------------------------

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


                    likeButton.classList.remove(
                        "liked"
                    );


                    likeCount.textContent =
                        Math.max(
                            0,
                            Number(
                                likeCount.textContent
                            ) - 1
                        );

                }


                // -----------------------------------------
                // ADD LIKE
                // -----------------------------------------

                else {

                    const { error } =
                        await supabaseClient
                            .from("likes")
                            .insert({
                                user_id: user.id,
                                game_id: gameId
                            });


                    if (error) {

                        console.error(
                            "Could not add like:",
                            error
                        );

                        return;
                    }


                    likeButton.classList.add(
                        "liked"
                    );


                    likeCount.textContent =
                        Number(
                            likeCount.textContent
                        ) + 1;

                }

            }
        );

    }

}


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
    const { data, error } = await supabaseClient.auth.getUser();

    if (error) {
        console.error("Could not get current user:", error);
        return null;
    }

    return data?.user || null;
}

async function loadFavorites(user = null) {
    const requestId = ++favoritesRequestId;

    if (!user) {
        user = await getCurrentUser();
    }

    // Ignore an older request if the auth state changed while loading.
    if (requestId !== favoritesRequestId) return;

    if (!user) {
        favoritesUserId = null;
        clearFavoriteUI();
        return;
    }

    favoritesUserId = user.id;

    const { data: favorites, error } = await supabaseClient
        .from("favorites")
        .select("game_id")
        .eq("user_id", user.id);

    if (error) {
        console.error("Could not load favorites:", error);
        return;
    }

    if (requestId !== favoritesRequestId) return;

    const favoriteIds = new Set(
        (favorites || []).map(favorite => favorite.game_id)
    );

    getFavoriteButtons().forEach(button => {
        const wrapper = button.closest(".game-wrapper");
        const gameId = wrapper?.dataset.gameId;

        setFavoriteButton(button, favoriteIds.has(gameId));
    });

    await sortFavoriteGames(favoriteIds);
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

        // Check the database for the actual current state.
        const { data: existingFavorite, error: findError } =
            await supabaseClient
                .from("favorites")
                .select("id")
                .eq("user_id", user.id)
                .eq("game_id", gameId)
                .maybeSingle();

        if (findError) {
            console.error(
                "Could not check favorite:",
                findError
            );

            return;
        }

        // =========================================
        // REMOVE FAVORITE
        // =========================================

        if (existingFavorite) {

            const { error } = await supabaseClient
                .from("favorites")
                .delete()
                .eq("id", existingFavorite.id)
                .eq("user_id", user.id);

            if (error) {
                console.error(
                    "Could not remove favorite:",
                    error
                );

                return;
            }

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

            setFavoriteButton(button, true);
            
        }

        // Reload from Supabase so the UI and database
        // are guaranteed to be synchronized.
        await loadFavorites(user);
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
// INITIAL FAVORITE LOAD
// =========================================

loadFavorites();


// =========================================
// AUTH STATE CHANGES
// =========================================

// Automatically refresh favorites when:
// - User logs in
// - User logs out
// - Session changes

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

            clearFavoriteUI();

            return;
        }

        // Logged in
        await loadFavorites(session.user);

    }
);

// =========================================
