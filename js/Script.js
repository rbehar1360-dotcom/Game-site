function FilterGames() {
    const input = document.getElementById('searchInput');
    const filter = input.value.toLowerCase().trim();
    const gameLinks = document.getElementsByClassName('game-wrapper');

    const fuzzyPattern = new RegExp(filter.split('').join('.*'), 'i');

    for (let i = 0; i < gameLinks.length; i++) {
        const title = gameLinks[i].querySelector('.title').textContent.toLowerCase();
        if (filter === "" || title.includes(filter) || fuzzyPattern.test(title)) {
            gameLinks[i].style.display = "";
        } else {
            gameLinks[i].style.display = "none";
        }
    }
}

// =========================================
// LOGIN WINDOW
// =========================================

const loginButton = document.getElementById("loginButton");

const loginOverlay = document.getElementById("loginOverlay");

const closeLogin = document.getElementById("closeLogin");




// Close login window

closeLogin.addEventListener("click", function() {

    loginOverlay.classList.remove("open");

});


// Close when clicking outside the window

loginOverlay.addEventListener("click", function(event) {

    if (event.target === loginOverlay) {

        loginOverlay.classList.remove("open");

    }

});

// =========================================
// LOGIN / SIGNUP MODE
// =========================================

const signupButton = document.getElementById("signupButton");

const usernameField = document.getElementById("usernameField");

const loginSubmit = document.getElementById("loginSubmit");

const accountPrompt = document.getElementById("accountPrompt");

let signupMode = false;


signupButton.addEventListener("click", function() {

    signupMode = !signupMode;


    if (signupMode) {

        // Switch to signup

        usernameField.style.display = "block";

        loginSubmit.textContent = "Create Account";

        accountPrompt.textContent = "Already have an account?";

        signupButton.textContent = "Login";

        document.querySelector(".login-header h2").textContent = "👤 Create Account";

    } 
    
    else {

        // Switch back to login

        usernameField.style.display = "none";

        loginSubmit.textContent = "Login";

        accountPrompt.textContent = "Don't have an account?";

        signupButton.textContent = "Sign up";

        document.querySelector(".login-header h2").textContent = "👤 Login";

    }

});

// =========================================
// SUPABASE AUTHENTICATION
// =========================================

const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", async function(event) {

    event.preventDefault();

    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    // =========================
    // SIGN UP
    // =========================

    if (signupMode) {

        const username = document.getElementById("loginUsername").value;

        if (!username) {
            alert("Please enter a username.");
            return;
        }

        const { data, error } = await supabaseClient.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    username: username
                }
            }
        });

        if (error) {

            alert(error.message);

            return;
        }

        alert("Account created! Check your email if confirmation is required.");

        console.log("Created user:", data);

        loginOverlay.classList.remove("open");

    }


    // =========================
    // LOGIN
    // =========================

    else {

        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) {

            alert(error.message);

            return;
        }

        console.log("Logged in:", data);

alert("Login successful! 🎉");

loginOverlay.classList.remove("open");

// Immediately update the account button
await updateAccountUI();
    }

});

// =========================================
// ACCOUNT STATE
// =========================================

const accountMenu = document.getElementById("accountMenu");

const accountUsername = document.getElementById("accountUsername");

const accountEmail = document.getElementById("accountEmail");

const logoutButton = document.getElementById("logoutButton");


// =========================================
// CHECK LOGIN STATE
// =========================================

async function updateAccountUI() {

    const { data } = await supabaseClient.auth.getUser();

    const user = data.user;


    if (user) {

        // User is logged in

        loginButton.textContent = "👤 Account";

        accountEmail.textContent = user.email;

        accountUsername.textContent =
            user.user_metadata?.username || "User";

    }

    else {

        // User is logged out

        loginButton.textContent = "👤 Login";

    }

}


// Check immediately

updateAccountUI();


// =========================================
// ACCOUNT MENU
// =========================================

loginButton.addEventListener("click", async function() {

    const { data } = await supabaseClient.auth.getUser();

    if (!data.user) {

        loginOverlay.classList.add("open");

        return;

    }

    accountMenu.classList.toggle("open");

});

// =========================================
// CLOSE ACCOUNT MENU WHEN CLICKING OUTSIDE
// =========================================

document.addEventListener("click", function(event) {

    // If the menu isn't open, nothing to do
    if (!accountMenu.classList.contains("open")) {
        return;
    }

    // If we clicked the account button, let its own
    // click handler handle opening/closing
    if (loginButton.contains(event.target)) {
        return;
    }

    // If we clicked inside the account menu, keep it open
    if (accountMenu.contains(event.target)) {
        return;
    }

    // Otherwise, close the menu
    accountMenu.classList.remove("open");

});


// =========================================
// LOGOUT
// =========================================

logoutButton.addEventListener("click", async function() {

    const { error } = await supabaseClient.auth.signOut();

    if (error) {

        console.error(error);

        return;

    }

    accountMenu.classList.remove("open");

    loginButton.textContent = "👤 Login";

    alert("Logged out!");

});

// =========================================
// GAME LIKES
// =========================================

async function setupLikes() {

    const gameWrappers =
        document.querySelectorAll(".game-wrapper");


    for (const wrapper of gameWrappers) {

        const gameId =
            wrapper.dataset.gameId;

        const likeButton =
            wrapper.querySelector(".like-button");

        const likeCount =
            wrapper.querySelector(".like-count");


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


        likeCount.textContent = count || 0;


        // -----------------------------------------
        // CHECK IF CURRENT USER LIKED
        // -----------------------------------------

        const { data: userData } =
            await supabaseClient.auth.getUser();

        const user = userData.user;


        if (user) {

            const { data: existingLike } =
                await supabaseClient

                    .from("likes")

                    .select("id")

                    .eq("user_id", user.id)

                    .eq("game_id", gameId)

                    .maybeSingle();


            if (existingLike) {

                likeButton.classList.add("liked");

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


                // Check login

                const { data: userData } =
                    await supabaseClient.auth.getUser();

                const user = userData.user;


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

                            .eq("id", existingLike.id);


                    if (error) {

                        console.error(error);

                        return;
                    }


                    likeButton.classList.remove(
                        "liked"
                    );


                    likeCount.textContent =
                        Math.max(
                            0,
                            Number(likeCount.textContent) - 1
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

                        console.error(error);

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
// MY STATS
// =========================================

const statsButton =
    document.getElementById("statsButton");

const statsOverlay =
    document.getElementById("statsOverlay");

const closeStats =
    document.getElementById("closeStats");


// =========================================
// OPEN STATS
// =========================================

statsButton.addEventListener("click", async function() {

    statsOverlay.classList.add("open");

    accountMenu.classList.remove("open");

    await loadStats();

});


// =========================================
// CLOSE STATS
// =========================================

closeStats.addEventListener("click", function() {

    statsOverlay.classList.remove("open");

});


// =========================================
// CLICK OUTSIDE STATS
// =========================================

statsOverlay.addEventListener("click", function(event) {

    if (event.target === statsOverlay) {

        statsOverlay.classList.remove("open");

    }

});


// =========================================
// FORMAT PLAYTIME
// =========================================

function formatPlaytime(seconds) {

    seconds = Number(seconds) || 0;

    const hours =
        Math.floor(seconds / 3600);

    const minutes =
        Math.floor((seconds % 3600) / 60);

    const secs =
        seconds % 60;


    if (hours > 0) {

        return `${hours}h ${minutes}m`;

    }


    if (minutes > 0) {

        return `${minutes}m ${secs}s`;

    }


    return `${secs}s`;

}


// =========================================
// LOAD STATS
// =========================================

async function loadStats() {

    const user =
        await getCurrentUser();


    if (!user) {

        alert(
            "Please log in to view your stats! 📊"
        );

        statsOverlay.classList.remove("open");

        return;

    }


    const { data, error } =
        await supabaseClient

            .from("game_playtime")

            .select(
                "game_id, playtime_seconds, last_played"
            )

            .eq(
                "user_id",
                user.id
            )

            .order(
                "playtime_seconds",
                {
                    ascending: false
                }
            );


    if (error) {

        console.error(
            "Could not load stats:",
            error
        );

        return;

    }


    const games =
        data || [];


    // =========================================
    // TOTAL PLAYTIME
    // =========================================

    const totalSeconds =
        games.reduce(
            (total, game) =>
                total +
                Number(game.playtime_seconds || 0),
            0
        );


    document.getElementById(
        "totalPlaytime"
    ).textContent =
        formatPlaytime(totalSeconds);


    // =========================================
    // GAMES PLAYED
    // =========================================

    document.getElementById(
        "gamesPlayed"
    ).textContent =
        games.length;


    // =========================================
    // MOST PLAYED
    // =========================================

    const mostPlayed =
        games.length > 0
            ? games[0]
            : null;


    if (mostPlayed) {

        const wrapper =
            document.querySelector(
                `.game-wrapper[data-game-id="${mostPlayed.game_id}"]`
            );


        const title =
            wrapper
                ?.querySelector(".title")
                ?.textContent
                ?.trim()
            || mostPlayed.game_id;


        document.getElementById(
            "mostPlayed"
        ).textContent = title;

    }

    else {

        document.getElementById(
            "mostPlayed"
        ).textContent =
            "None yet";

    }


    // =========================================
    // GAME BREAKDOWN
    // =========================================

    const playtimeList =
        document.getElementById(
            "playtimeList"
        );


    if (games.length === 0) {

        playtimeList.innerHTML =
            "<p>No playtime recorded yet! 🎮</p>";

        return;

    }


    playtimeList.innerHTML = "";


    games.forEach(game => {

        const wrapper =
            document.querySelector(
                `.game-wrapper[data-game-id="${game.game_id}"]`
            );


        const title =
            wrapper
                ?.querySelector(".title")
                ?.textContent
                ?.trim()
            || game.game_id;


        const row =
            document.createElement("div");


        row.className =
            "playtime-game";


        row.innerHTML = `

            <span class="playtime-game-name">
                ${title}
            </span>

            <span class="playtime-game-time">
                ${formatPlaytime(game.playtime_seconds)}
            </span>

        `;


        playtimeList.appendChild(row);

    });

}

// =========================================
// COIN SYSTEM
// =========================================

const coinBalance =
    document.getElementById("coinBalance");

const shopCoinBalance =
    document.getElementById("shopCoinBalance");


// =========================================
// LOAD COINS
// =========================================

async function loadCoinBalance() {

    const user =
        await getCurrentUser();


    if (!user) {

        if (coinBalance) {
            coinBalance.textContent = "0";
        }

        if (shopCoinBalance) {
            shopCoinBalance.textContent = "0";
        }

        return;

    }


    const { data, error } =
        await supabaseClient

            .from("user_coins")

            .select("coins")

            .eq("user_id", user.id)

            .maybeSingle();


    if (error) {

        console.error(
            "Could not load coins:",
            error
        );

        return;

    }


    const coins =
        data?.coins || 0;


    if (coinBalance) {
        coinBalance.textContent = coins;
    }

    if (shopCoinBalance) {
        shopCoinBalance.textContent = coins;
    }

}


// =========================================
// SHOP
// =========================================

const shopButton =
    document.getElementById("shopButton");

const shopOverlay =
    document.getElementById("shopOverlay");

const closeShop =
    document.getElementById("closeShop");

const shopItems =
    document.getElementById("shopItems");


shopButton.addEventListener(
    "click",
    async function () {

        const user =
            await getCurrentUser();


        if (!user) {

            alert(
                "Please log in to use the shop! 🛒"
            );

            return;

        }


        accountMenu.classList.remove("open");

        shopOverlay.classList.add("open");

        await loadCoinBalance();

        await loadShop();

    }
);


// =========================================
// CLOSE SHOP
// =========================================

closeShop.addEventListener(
    "click",
    function () {

        shopOverlay.classList.remove("open");

    }
);


shopOverlay.addEventListener(
    "click",
    function (event) {

        if (
            event.target === shopOverlay
        ) {

            shopOverlay.classList.remove("open");

        }

    }
);


// =========================================
// LOAD SHOP
// =========================================

async function loadShop() {

    shopItems.innerHTML =
        "<p>Loading shop...</p>";


    const { data, error } =
        await supabaseClient

            .from("shop_items")

            .select("*")

            .eq("active", true)

            .order("price", {
                ascending: true
            });


    if (error) {

        console.error(
            "Could not load shop:",
            error
        );

        shopItems.innerHTML =
            "<p>Could not load shop.</p>";

        return;

    }


    if (!data || data.length === 0) {

        shopItems.innerHTML =
            "<p>The shop is empty.</p>";

        return;

    }


    shopItems.innerHTML = "";


    data.forEach(item => {

        const card =
            document.createElement("div");


        card.className =
            "shop-item";


        card.innerHTML = `

            <div>

                <div class="shop-item-icon">
                    🛍️
                </div>

                <div class="shop-item-name">
                    ${item.name}
                </div>

                <div class="shop-item-description">
                    ${item.description}
                </div>

                <div class="shop-item-price">
                    🪙 ${item.price}
                </div>

            </div>

            <button
                class="shop-buy-button"
                data-item-id="${item.id}"
            >
                Buy
            </button>

        `;


        const buyButton =
            card.querySelector(
                ".shop-buy-button"
            );


        buyButton.addEventListener(
            "click",
            function () {

                buyShopItem(
                    item.id,
                    item.name
                );

            }
        );


        shopItems.appendChild(card);

    });

}


// =========================================
// BUY ITEM
// =========================================

async function buyShopItem(
    itemId,
    itemName
) {

    const user =
        await getCurrentUser();


    if (!user) {

        alert(
            "Please log in first! 👤"
        );

        return;

    }


    const confirmed =
        confirm(
            `Buy "${itemName}"?`
        );


    if (!confirmed) {
        return;
    }


    const { error } =
        await supabaseClient.rpc(
            "purchase_shop_item",
            {
                p_item_id: itemId
            }
        );


    if (error) {

        console.error(
            "Purchase failed:",
            error
        );

        alert(
            error.message
        );

        return;

    }


    alert(
        `You bought ${itemName}! 🛒`
    );


    await loadCoinBalance();

    await loadShop();

}

// =========================================
// CHAT SYSTEM
// =========================================

const chatButton = document.getElementById("chatButton");
const chatOverlay = document.getElementById("chatOverlay");
const closeChat = document.getElementById("closeChat");

const chatMessages = document.getElementById("chatMessages");
const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");


// =========================================
// OPEN CHAT
// =========================================

chatButton.addEventListener("click", async function () {

    const user = await getCurrentUser();

    if (!user) {

        alert("Please log in to use chat! 💬");

        loginOverlay.classList.add("open");

        return;
    }

    chatOverlay.classList.add("open");

    await loadChatMessages();

    chatInput.focus();

});


// =========================================
// CLOSE CHAT
// =========================================

closeChat.addEventListener("click", function () {

    chatOverlay.classList.remove("open");

});


// =========================================
// CLICK OUTSIDE CHAT
// =========================================

chatOverlay.addEventListener("click", function (event) {

    if (event.target === chatOverlay) {

        chatOverlay.classList.remove("open");

    }

});


// =========================================
// LOAD MESSAGES
// =========================================

async function loadChatMessages() {

    chatMessages.innerHTML =
        `<div class="chat-loading">
            Loading messages...
        </div>`;


    const { data, error } = await supabaseClient

        .from("chat_messages")

        .select("*")

        .eq("channel", "general")

        .order("created_at", {
            ascending: true
        })

        .limit(100);


    if (error) {

        console.error(
            "Could not load chat:",
            error
        );

        chatMessages.innerHTML =
            `<div class="chat-loading">
                Could not load messages.
            </div>`;

        return;
    }


    chatMessages.innerHTML = "";


    if (!data || data.length === 0) {

        chatMessages.innerHTML =
            `<div class="chat-empty">
              
            </div>`;

        return;
    }


    data.forEach(message => {

        addChatMessage(message);

    });


    scrollChatToBottom();

}


// =========================================
// DISPLAY MESSAGE
// =========================================

function addChatMessage(message) {

    const messageElement =
        document.createElement("div");

    messageElement.className =
        "chat-message";

    messageElement.dataset.messageId = message.id;


    const currentUser =
        supabaseClient.auth.getUser();


    // Username

    const username =
        document.createElement("div");

    username.className =
        "chat-message-username";

    username.textContent =
        message.username;


    // Message

    const content =
        document.createElement("div");

    content.className =
        "chat-message-content";

    // IMPORTANT:
    // textContent prevents HTML injection

    content.textContent =
        message.content;


    // Time

    const time =
        document.createElement("div");

    time.className =
        "chat-message-time";

    const date =
        new Date(message.created_at);

    time.textContent =
        date.toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit"
        });


    messageElement.appendChild(username);

    messageElement.appendChild(content);

    messageElement.appendChild(time);


    chatMessages.appendChild(
        messageElement
    );

}


// =========================================
// SEND MESSAGE
// =========================================

chatForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const content =
            chatInput.value.trim();


        if (!content) {
            return;
        }


        const user =
            await getCurrentUser();


        if (!user) {

            alert(
                "Please log in to send messages!"
            );

            return;
        }


        const username =
            user.user_metadata?.username ||
            "User";


        chatInput.disabled = true;


        const { error } =
            await supabaseClient

                .from("chat_messages")

                .insert({

                    user_id: user.id,

                    username: username,

                    content: content,

                    channel: "general"

                });


        if (error) {

            console.error(
                "Could not send message:",
                error
            );

            alert(
                "Could not send message."
            );

        } else {

            chatInput.value = "";

        }


        chatInput.disabled = false;

        chatInput.focus();

    }
);


// =========================================
// REALTIME CHAT
// =========================================

const chatChannel =
    supabaseClient

        .channel("general-chat")

        // =========================================
        // NEW MESSAGE
        // =========================================

        .on(
            "postgres_changes",
            {
                event: "INSERT",
                schema: "public",
                table: "chat_messages",
                filter: "channel=eq.general"
            },


            function (payload) {

                if (
                    !chatOverlay.classList.contains("open")
                ) {
                    return;
                }

                addChatMessage(payload.new);

                scrollChatToBottom();

            }
        )


        // =========================================
        // DELETED MESSAGE
        // =========================================

        .on(
            "postgres_changes",
            {
                event: "DELETE",
                schema: "public",
                table: "chat_messages"
            },

            function (payload) {

                const deletedMessage =
                    document.querySelector(
                        `[data-message-id="${payload.old.id}"]`
                    );

                if (deletedMessage) {

                    deletedMessage.remove();

                }

            }
        )


        // =========================================
        // CONNECT TO REALTIME
        // =========================================

        .subscribe();
// =========================================
// SCROLL CHAT
// =========================================

function scrollChatToBottom() {

    chatMessages.scrollTop =
        chatMessages.scrollHeight;

}

// =========================================
// PRIVATE MESSAGES / INBOX
// =========================================

const messagesButton =
    document.getElementById("messagesButton");

const messagesOverlay =
    document.getElementById("messagesOverlay");

const closeMessages =
    document.getElementById("closeMessages");

const conversationList =
    document.getElementById("conversationList");

const privateMessages =
    document.getElementById("privateMessages");

const privateChatUsername =
    document.getElementById("privateChatUsername");

const privateChatStatus =
    document.getElementById("privateChatStatus");

const privateMessageForm =
    document.getElementById("privateMessageForm");

const privateMessageInput =
    document.getElementById("privateMessageInput");

const privateMessageSend =
    document.getElementById("privateMessageSend");

const unreadMessagesBadge =
    document.getElementById("unreadMessagesBadge");


let currentPrivateUser = null;
let privateMessagesChannel = null;


// =========================================
// OPEN INBOX
// =========================================

messagesButton.addEventListener("click", async function () {

    const user = await getCurrentUser();

    if (!user) {
        alert("Please log in to use messages.");
        loginOverlay.classList.add("open");
        return;
    }

    accountMenu.classList.remove("open");

    messagesOverlay.classList.add("open");

    await loadConversations();

    await updateUnreadCount();

});


// =========================================
// CLOSE INBOX
// =========================================

closeMessages.addEventListener("click", function () {

    messagesOverlay.classList.remove("open");

});


// =========================================
// CLICK OUTSIDE
// =========================================

messagesOverlay.addEventListener(
    "click",
    function (event) {

        if (event.target === messagesOverlay) {

            messagesOverlay.classList.remove("open");

        }

    }
);


// =========================================
// FIND USER
// =========================================

async function findUserByUsername(username) {

    const { data, error } =
        await supabaseClient.rpc(
            "find_user_by_username",
            {
                search_username: username
            }
        );

    if (error) {

        console.error(
            "Could not find user:",
            error
        );

        return null;

    }

    return data?.[0] || null;

}


// =========================================
// LOAD CONVERSATIONS
// =========================================

async function loadConversations() {

    const user = await getCurrentUser();

    if (!user) return;


    conversationList.innerHTML =
        `<div class="messages-loading">
            Loading conversations...
        </div>`;


    const { data, error } =
        await supabaseClient
            .from("private_messages")
            .select("*")
            .or(
                `sender_id.eq.${user.id},recipient_id.eq.${user.id}`
            )
            .order("created_at", {
                ascending: false
            });


    if (error) {

        console.error(
            "Could not load conversations:",
            error
        );

        conversationList.innerHTML =
            `<div class="messages-loading">
                Could not load messages.
            </div>`;

        return;

    }


    /*
     * Build one conversation per user.
     */

    const conversations = new Map();


    data.forEach(message => {

        const otherUserId =
            message.sender_id === user.id
                ? message.recipient_id
                : message.sender_id;


        if (!conversations.has(otherUserId)) {

            conversations.set(
                otherUserId,
                {
                    userId: otherUserId,
                    latest: message,
                    unread: 0
                }
            );

        }


        if (
            message.recipient_id === user.id &&
            !message.read_at
        ) {

            conversations.get(
                otherUserId
            ).unread++;

        }

    });


    conversationList.innerHTML = "";


    if (conversations.size === 0) {

        conversationList.innerHTML =
            `<div class="messages-loading">
                No conversations yet.
            </div>`;

        return;

    }


    conversations.forEach(conversation => {

        const message =
            conversation.latest;


        const otherUserId =
            conversation.userId;


        /*
         * We don't have the other user's username
         * directly in private_messages, so get it
         * from their auth profile.
         */

        loadConversationUser(
            otherUserId,
            conversation
        );

    });

}


// =========================================
// LOAD USERNAME FOR CONVERSATION
// =========================================

async function loadConversationUser(
    userId,
    conversation
) {

    /*
     * We use the private-message participants
     * to build the inbox.
     *
     * For now, search by UUID through a secure RPC.
     */

    const { data, error } =
        await supabaseClient.rpc(
            "find_username_by_id",
            {
                search_user_id: userId
            }
        );


    if (error) {

        console.error(
            "Could not load username:",
            error
        );

        return;

    }


    const username =
        data?.[0]?.username || "Unknown User";


    const item =
        document.createElement("div");

    item.className =
        "conversation-item";


    item.dataset.userId =
        userId;


    const unreadHTML =
        conversation.unread > 0
            ? `<span class="conversation-unread">
                    ${conversation.unread}
               </span>`
            : "";


    item.innerHTML = `
        <div class="conversation-name">
            ${username}
            ${unreadHTML}
        </div>

        <div class="conversation-preview">
            ${escapePrivateHTML(
                conversation.latest.message
            )}
        </div>
    `;


    item.addEventListener(
        "click",
        function () {

            openPrivateConversation(
                userId,
                username
            );

        }
    );


    conversationList.appendChild(item);

}


// =========================================
// OPEN CONVERSATION
// =========================================

async function openPrivateConversation(
    userId,
    username
) {

    const user =
        await getCurrentUser();

    if (!user) return;


    currentPrivateUser = {
        id: userId,
        username: username
    };


    privateChatUsername.textContent =
        username;

    privateChatStatus.textContent =
        "Private conversation";


    privateMessageInput.disabled =
        false;

    privateMessageSend.disabled =
        false;


    document
        .querySelectorAll(".conversation-item")
        .forEach(item => {

            item.classList.toggle(
                "active",
                item.dataset.userId === userId
            );

        });


    await loadPrivateMessages(
        user.id,
        userId
    );


    await markMessagesRead(
        user.id,
        userId
    );


    await loadConversations();

}


// =========================================
// LOAD PRIVATE MESSAGES
// =========================================

async function loadPrivateMessages(
    currentUserId,
    otherUserId
) {

    privateMessages.innerHTML =
        `<div class="messages-loading">
            Loading messages...
        </div>`;


    const { data, error } =
        await supabaseClient
            .from("private_messages")
            .select("*")
            .or(
                `and(sender_id.eq.${currentUserId},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${currentUserId})`
            )
            .order("created_at", {
                ascending: true
            });


    if (error) {

        console.error(
            "Could not load private messages:",
            error
        );

        privateMessages.innerHTML =
            `<div class="messages-loading">
                Could not load messages.
            </div>`;

        return;

    }


    privateMessages.innerHTML = "";


    if (!data || data.length === 0) {

        privateMessages.innerHTML =
            `<div class="private-empty">
                <div class="private-empty-icon">
                    ✉️
                </div>

                <h3>No messages yet</h3>

                <p>
                    Send the first message.
                </p>
            </div>`;

        return;

    }


    data.forEach(message => {

        addPrivateMessage(
            message,
            currentUserId
        );

    });


    scrollPrivateMessages();

}


// =========================================
// DISPLAY PRIVATE MESSAGE
// =========================================

function addPrivateMessage(
    message,
    currentUserId
) {

    const wrapper =
        document.createElement("div");


    wrapper.className =
        "private-message";


    const mine =
        message.sender_id === currentUserId;


    if (mine) {

        wrapper.classList.add("mine");

    }


    const bubble =
        document.createElement("div");


    bubble.className =
        "private-message-bubble";


    const content =
        document.createElement("div");


    content.textContent =
        message.message;


    const time =
        document.createElement("div");


    time.className =
        "private-message-time";


    time.textContent =
        new Date(
            message.created_at
        ).toLocaleString([], {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit"
        });


    bubble.appendChild(content);

    bubble.appendChild(time);

    wrapper.appendChild(bubble);

    privateMessages.appendChild(wrapper);

}


// =========================================
// SEND PRIVATE MESSAGE
// =========================================

privateMessageForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const message =
            privateMessageInput.value.trim();


        if (!message) return;


        const user =
            await getCurrentUser();


        if (!user) return;


        if (!currentPrivateUser) {

            alert(
                "Select a conversation first."
            );

            return;

        }


        privateMessageInput.disabled =
            true;

        privateMessageSend.disabled =
            true;


        const { error } =
            await supabaseClient
                .from("private_messages")
                .insert({
                    sender_id: user.id,
                    recipient_id:
                        currentPrivateUser.id,
                    message: message
                });


        if (error) {

            console.error(
                "Could not send private message:",
                error
            );

            alert(
                "Could not send message."
            );

        } else {

            privateMessageInput.value = "";

            await loadPrivateMessages(
                user.id,
                currentPrivateUser.id
            );

            await loadConversations();

        }


        privateMessageInput.disabled =
            false;

        privateMessageSend.disabled =
            false;

        privateMessageInput.focus();

    }
);


// =========================================
// MARK MESSAGES READ
// =========================================

async function markMessagesRead(
    currentUserId,
    otherUserId
) {

    const { error } =
        await supabaseClient
            .from("private_messages")
            .update({
                read_at: new Date().toISOString()
            })
            .eq(
                "recipient_id",
                currentUserId
            )
            .eq(
                "sender_id",
                otherUserId
            )
            .is(
                "read_at",
                null
            );


    if (error) {

        console.error(
            "Could not mark messages read:",
            error
        );

    }

}


// =========================================
// UNREAD COUNT
// =========================================

async function updateUnreadCount() {

    const user =
        await getCurrentUser();


    if (!user) return;


    const { count, error } =
        await supabaseClient
            .from("private_messages")
            .select(
                "*",
                {
                    count: "exact",
                    head: true
                }
            )
            .eq(
                "recipient_id",
                user.id
            )
            .is(
                "read_at",
                null
            );


    if (error) {

        console.error(
            "Could not get unread count:",
            error
        );

        return;

    }


    if (count > 0) {

        unreadMessagesBadge.textContent =
            count > 99 ? "99+" : count;

        unreadMessagesBadge.classList.add(
            "visible"
        );

    } else {

        unreadMessagesBadge.textContent =
            "0";

        unreadMessagesBadge.classList.remove(
            "visible"
        );

    }

}


// =========================================
// SCROLL
// =========================================

function scrollPrivateMessages() {

    privateMessages.scrollTop =
        privateMessages.scrollHeight;

}


// =========================================
// ESCAPE HTML
// =========================================

function escapePrivateHTML(text) {

    const div =
        document.createElement("div");

    div.textContent =
        text;

    return div.innerHTML;

}

// =========================================
// PRIVATE MESSAGE REALTIME
// =========================================

async function setupPrivateMessageRealtime() {

    const user = await getCurrentUser();

    if (!user) return;


    // Prevent duplicate subscriptions
    if (privateMessagesChannel) {

        await supabaseClient.removeChannel(
            privateMessagesChannel
        );

    }


    privateMessagesChannel =
        supabaseClient
            .channel(
                `private-messages-${user.id}`
            )

            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "private_messages"
                },

                async function (payload) {

                    const message =
                        payload.new;


                    /*
                     * Ignore messages that don't
                     * involve the current user.
                     */

                    if (
                        message.sender_id !== user.id &&
                        message.recipient_id !== user.id
                    ) {
                        return;
                    }


                    /*
                     * If we're currently talking
                     * to this person, immediately
                     * display the message.
                     */

                    if (
                        currentPrivateUser &&
                        (
                            message.sender_id ===
                                currentPrivateUser.id
                            ||
                            message.recipient_id ===
                                currentPrivateUser.id
                        )
                    ) {

                        /*
                         * Don't duplicate our own
                         * message if we already loaded it.
                         */

                        const existingMessages =
                            privateMessages.querySelectorAll(
                                ".private-message"
                            );


                        if (existingMessages.length === 0) {

                            addPrivateMessage(
                                message,
                                user.id
                            );

                        } else {

                            /*
                             * Reloading is safer than
                             * trying to reconstruct the
                             * entire conversation state.
                             */

                            await loadPrivateMessages(
                                user.id,
                                currentPrivateUser.id
                            );

                        }


                        scrollPrivateMessages();

                    }


                    /*
                     * Refresh inbox previews and
                     * unread count.
                     */

                    await loadConversations();

                    await updateUnreadCount();

                }
            )

            .subscribe(function (status) {

                console.log(
                    "Private messages realtime:",
                    status
                );

            });

}


// =========================================
// START PRIVATE MESSAGE REALTIME
// =========================================

setupPrivateMessageRealtime();

// =========================================
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


// =========================================
// FORMAT PLAYTIME
// =========================================

function formatLeaderboardTime(seconds) {

    seconds = Number(seconds) || 0;

    const days = Math.floor(seconds / 86400);

    const hours = Math.floor(
        (seconds % 86400) / 3600
    );

    const minutes = Math.floor(
        (seconds % 3600) / 60
    );

    if (days > 0) {
        return `${days}d ${hours}h ${minutes}m`;
    }

    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }

    if (minutes > 0) {
        return `${minutes}m`;
    }

    return `${seconds}s`;
}


// =========================================
// LOAD LEADERBOARD
// =========================================

async function loadPlaytimeLeaderboard() {

    leaderboardList.innerHTML = `
        <div class="leaderboard-loading">
            Loading leaderboard...
        </div>
    `;

    const gameId =
        leaderboardGame.value || null;

    const { data, error } =
        await supabaseClient.rpc(
            "get_playtime_leaderboard",
            {
                p_game_id: gameId,
                p_limit: 25
            }
        );

    if (error) {

        console.error(
            "Could not load playtime leaderboard:",
            error
        );

        leaderboardList.innerHTML = `
            <div class="leaderboard-loading">
                Could not load leaderboard.
            </div>
        `;

        return;
    }


    leaderboardList.innerHTML = "";


    if (!data || data.length === 0) {

        leaderboardList.innerHTML = `
            <div class="leaderboard-loading">
                No playtime recorded yet.
            </div>
        `;

        return;
    }


    data.forEach((player, index) => {

        const row =
            document.createElement("div");

        row.className =
            "leaderboard-row";


        const rank =
            document.createElement("div");

        rank.className =
            "leaderboard-rank";


        if (index === 0) {
            rank.textContent = "🥇";
        }

        else if (index === 1) {
            rank.textContent = "🥈";
        }

        else if (index === 2) {
            rank.textContent = "🥉";
        }

        else {
            rank.textContent = `#${index + 1}`;
        }


        const username =
            document.createElement("div");

        username.className =
            "leaderboard-username";

        username.textContent =
            player.username || "Unknown User";


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

        leaderboardList.appendChild(row);

    });

}


// =========================================
// POPULATE GAME SELECTOR
// =========================================

function setupLeaderboardGames() {

    if (!leaderboardGame) return;

    leaderboardGame.innerHTML = `
        <option value="">
            🌎 All Games
        </option>
    `;


    const wrappers =
        document.querySelectorAll(
            ".game-wrapper[data-game-id]"
        );


    const games = [];


    wrappers.forEach(wrapper => {

        const gameId =
            wrapper.dataset.gameId;

        const titleElement =
            wrapper.querySelector(".title");

        if (!gameId) return;

        const title =
            titleElement
                ? titleElement.textContent.trim()
                : gameId;


        if (
            !games.some(
                game => game.id === gameId
            )
        ) {

            games.push({
                id: gameId,
                title: title
            });

        }

    });


    games
        .sort((a, b) =>
            a.title.localeCompare(b.title)
        )
        .forEach(game => {

            const option =
                document.createElement("option");

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
// OPEN LEADERBOARD
// =========================================

// =========================================
// OPEN LEADERBOARD
// =========================================

if (leaderboardButton) {

    leaderboardButton.addEventListener(
        "click",
        async function(event) {

            // Prevent the account-menu outside-click
            // handler from interfering
            event.preventDefault();
            event.stopPropagation();

            // Close account menu
            accountMenu.classList.remove("open");

            // Open leaderboard
            leaderboardOverlay.classList.add("open");

            // Populate game dropdown
            setupLeaderboardGames();

            // Load leaderboard data
            await loadPlaytimeLeaderboard();

        }
    );

}
// =========================================
// CLOSE LEADERBOARD
// =========================================

if (closeLeaderboard) {

    closeLeaderboard.addEventListener(
        "click",
        function () {

            leaderboardOverlay.classList.remove(
                "open"
            );

        }
    );

}


// =========================================
// CLICK OUTSIDE
// =========================================

if (leaderboardOverlay) {

    leaderboardOverlay.addEventListener(
        "click",
        function (event) {

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
// CHANGE GAME
// =========================================

if (leaderboardGame) {

    leaderboardGame.addEventListener(
        "change",
        async function () {

            await loadPlaytimeLeaderboard();

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

      suggestButton.addEventListener("click", openSuggestions);
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