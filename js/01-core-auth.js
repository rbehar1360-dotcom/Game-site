// =========================================
// GAME DISCOVERY / SEARCH / SORT
// =========================================

let gameDiscoveryInitialized = false;

const gameDiscoveryStats = new Map();

let currentGameSort = "default";

let gamePlaytimeLoaded = false;
let gamePlaytimeLoading = false;


// =========================================
// GET GAME ELEMENTS
// =========================================

function getGameWrappers() {

    return Array.from(
        document.querySelectorAll(".game-wrapper")
    );

}


// =========================================
// GET GAME TITLE
// =========================================

function getGameTitle(game) {

    return (
        game
            .querySelector(".title")
            ?.textContent
            ?.trim()
        || ""
    );

}


// =========================================
// GET LIKE COUNT
// =========================================

function getGameLikeCount(game) {

    const count =
        game.querySelector(".like-count");

    return Number(
        count?.textContent || 0
    );

}


// =========================================
// GET FAVORITE STATE
// =========================================

function isGameFavorite(game) {

    return !!game.querySelector(
        ".favorite-button.favorited"
    );

}


// =========================================
// LOAD PLAYTIME
// =========================================

async function loadGamePlaytime() {

    // Already loaded.
    if (gamePlaytimeLoaded) {
        return true;
    }

    // Another request is already running.
    if (gamePlaytimeLoading) {

        while (gamePlaytimeLoading) {
            await new Promise(resolve =>
                setTimeout(resolve, 50)
            );
        }

        return gamePlaytimeLoaded;
    }


    gamePlaytimeLoading = true;


    try {

        gameDiscoveryStats.clear();


        /*
         * We only need totals grouped by game.
         *
         * If the user is logged out and RLS blocks this
         * table, don't break the entire discovery system.
         */

        const { data, error } =
            await supabaseClient
                .from("game_playtime")
                .select(
                    "game_id, playtime_seconds"
                );


        if (error) {

            console.warn(
                "Playtime data unavailable:",
                error.message
            );

            return false;
        }


        (data || []).forEach(row => {

            const gameId =
                row.game_id;

            const seconds =
                Number(
                    row.playtime_seconds
                ) || 0;


            gameDiscoveryStats.set(
                gameId,
                (
                    gameDiscoveryStats.get(gameId)
                    || 0
                ) + seconds
            );

        });


        gamePlaytimeLoaded = true;

        return true;

    }

    catch (error) {

        console.warn(
            "Could not load game playtime:",
            error
        );

        return false;

    }

    finally {

        gamePlaytimeLoading = false;

    }

}


// =========================================
// FUZZY SEARCH
// =========================================

function gameMatchesSearch(
    title,
    search
) {

    if (!search) {
        return true;
    }


    const normalizedTitle =
        title
            .toLowerCase()
            .replace(
                /[^a-z0-9]/g,
                ""
            );


    const normalizedSearch =
        search
            .toLowerCase()
            .replace(
                /[^a-z0-9]/g,
                ""
            );


    if (!normalizedSearch) {
        return true;
    }


    // Normal substring match.
    if (
        normalizedTitle.includes(
            normalizedSearch
        )
    ) {

        return true;

    }


    // Fuzzy character matching.
    let searchIndex = 0;


    for (
        let i = 0;
        i < normalizedTitle.length;
        i++
    ) {

        if (
            normalizedTitle[i] ===
            normalizedSearch[searchIndex]
        ) {

            searchIndex++;


            if (
                searchIndex ===
                normalizedSearch.length
            ) {

                return true;

            }

        }

    }


    return false;

}


// =========================================
// SEARCH RELEVANCE
// =========================================

function getSearchScore(
    title,
    search
) {

    if (!search) {
        return 0;
    }


    const normalizedTitle =
        title.toLowerCase();


    const normalizedSearch =
        search.toLowerCase();


    if (
        normalizedTitle ===
        normalizedSearch
    ) {

        return 1000;

    }


    if (
        normalizedTitle.startsWith(
            normalizedSearch
        )
    ) {

        return 500;

    }


    if (
        normalizedTitle.includes(
            normalizedSearch
        )
    ) {

        return 250;

    }


    let score = 0;
    let position = 0;


    for (
        const character of normalizedSearch
    ) {

        const found =
            normalizedTitle.indexOf(
                character,
                position
            );


        if (found === -1) {
            return 0;
        }


        score +=
            10 -
            Math.min(
                found - position,
                10
            );


        position = found + 1;

    }


    return score;

}


// =========================================
// SORT GAMES
// =========================================

function sortGameWrappers(
    games,
    search
) {

    return games.sort(
        (a, b) => {

            const titleA =
                getGameTitle(a);

            const titleB =
                getGameTitle(b);


            const idA =
                a.dataset.gameId;

            const idB =
                b.dataset.gameId;


            // =========================================
            // DEFAULT
            // =========================================

            if (
                currentGameSort ===
                "default"
            ) {

                return (
                    Number(
                        a.dataset.originalIndex
                    )
                    -
                    Number(
                        b.dataset.originalIndex
                    )
                );

            }


            // =========================================
            // SEARCH RELEVANCE
            // =========================================

            if (
                search &&
                currentGameSort ===
                "relevance"
            ) {

                return (
                    getSearchScore(
                        titleB,
                        search
                    )
                    -
                    getSearchScore(
                        titleA,
                        search
                    )
                );

            }


            // =========================================
            // A-Z
            // =========================================

            if (
                currentGameSort ===
                "az"
            ) {

                return titleA.localeCompare(
                    titleB
                );

            }


            // =========================================
            // Z-A
            // =========================================

            if (
                currentGameSort ===
                "za"
            ) {

                return titleB.localeCompare(
                    titleA
                );

            }


            // =========================================
            // MOST LIKED
            // =========================================

            if (
                currentGameSort ===
                "liked"
            ) {

                return (
                    getGameLikeCount(b)
                    -
                    getGameLikeCount(a)
                );

            }


            // =========================================
            // MOST PLAYED
            // =========================================

            if (
                currentGameSort ===
                "played"
            ) {

                return (
                    (
                        gameDiscoveryStats.get(
                            idB
                        ) || 0
                    )
                    -
                    (
                        gameDiscoveryStats.get(
                            idA
                        ) || 0
                    )
                );

            }


            // =========================================
            // FAVORITES FIRST
            // =========================================

            if (
                currentGameSort ===
                "favorites"
            ) {

                const favoriteA =
                    isGameFavorite(a);

                const favoriteB =
                    isGameFavorite(b);


                if (
                    favoriteA &&
                    !favoriteB
                ) {

                    return -1;

                }


                if (
                    !favoriteA &&
                    favoriteB
                ) {

                    return 1;

                }


                return (
                    Number(
                        a.dataset.originalIndex
                    )
                    -
                    Number(
                        b.dataset.originalIndex
                    )
                );

            }


            return 0;

        }
    );

}


// =========================================
// UPDATE GAME DISCOVERY
// =========================================

function updateGameDiscovery() {

    const searchInput =
        document.getElementById(
            "searchInput"
        );


    const gameGrid =
        document.querySelector(
            ".game-grid"
        );


    const noGamesFound =
        document.getElementById(
            "noGamesFound"
        );


    const resultCount =
        document.getElementById(
            "gameResultCount"
        );


    const clearButton =
        document.getElementById(
            "clearSearch"
        );


    if (
        !searchInput ||
        !gameGrid
    ) {

        return;

    }


    const search =
        searchInput.value
            .toLowerCase()
            .trim();


    const allGames =
        getGameWrappers();


    // =========================================
    // SAVE ORIGINAL ORDER
    // =========================================

    allGames.forEach(
        (game, index) => {

            if (
                game.dataset.originalIndex ===
                undefined
            ) {

                game.dataset.originalIndex =
                    index;

            }

        }
    );


    // =========================================
    // FIND MATCHES
    // =========================================

    const matchingGames =
        allGames.filter(
            game =>
                gameMatchesSearch(
                    getGameTitle(game),
                    search
                )
        );


    // =========================================
    // SHOW / HIDE
    // =========================================

    allGames.forEach(
        game => {

            const isMatch =
                matchingGames.includes(
                    game
                );


            game.style.display =
                isMatch
                    ? ""
                    : "none";

        }
    );


    // =========================================
    // SORT
    // =========================================

    const sortedGames =
        sortGameWrappers(
            [...matchingGames],
            search
        );


    const fragment =
        document.createDocumentFragment();


    sortedGames.forEach(
        game => {

            fragment.appendChild(
                game
            );

        }
    );


    gameGrid.appendChild(
        fragment
    );


    // =========================================
    // RESULT COUNT
    // =========================================

    if (resultCount) {

        resultCount.textContent =
            `${matchingGames.length} ${
                matchingGames.length === 1
                    ? "game"
                    : "games"
            }`;

    }


    // =========================================
    // CLEAR BUTTON
    // =========================================

    if (clearButton) {

        clearButton.classList.toggle(
            "visible",
            search.length > 0
        );

    }


    // =========================================
    // NO RESULTS
    // =========================================

    if (noGamesFound) {

        noGamesFound.style.display =
            matchingGames.length === 0
                ? ""
                : "none";

    }

}


// =========================================
// INITIALIZE GAME DISCOVERY
// =========================================

function setupGameDiscovery() {

    if (
        gameDiscoveryInitialized
    ) {

        return;

    }


    const searchInput =
        document.getElementById(
            "searchInput"
        );


    if (!searchInput) {

        console.warn(
            "Game discovery: search input not found."
        );

        return;

    }


    gameDiscoveryInitialized = true;


    const clearButton =
        document.getElementById(
            "clearSearch"
        );


    const noGamesClear =
        document.getElementById(
            "noGamesClear"
        );


    const filterButtons =
        document.querySelectorAll(
            ".game-filter"
        );


    // =========================================
    // SEARCH
    // =========================================

    searchInput.addEventListener(
        "input",
        updateGameDiscovery
    );


    // =========================================
    // FILTER BUTTONS
    // =========================================

    filterButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                async function() {

                    const requestedSort =
                        button.dataset.sort;


                    // Safety check.
                    if (!requestedSort) {
                        return;
                    }


                    currentGameSort =
                        requestedSort;


                    filterButtons.forEach(
                        otherButton => {

                            otherButton.classList.remove(
                                "active"
                            );

                        }
                    );


                    button.classList.add(
                        "active"
                    );


                    // =========================================
                    // MOST PLAYED
                    // =========================================

                    if (
                        currentGameSort ===
                        "played"
                    ) {

                        /*
                         * Don't let a failed Supabase
                         * playtime request break filtering.
                         */

                        await loadGamePlaytime();

                    }


                    /*
                     * Every other filter works completely
                     * locally and does NOT require login.
                     */

                    updateGameDiscovery();

                }
            );

        }
    );


    // =========================================
    // CLEAR SEARCH
    // =========================================

    function clearSearch() {

        searchInput.value = "";

        currentGameSort = "default";

        filterButtons.forEach(
            button => {

                button.classList.toggle(
                    "active",
                    button.dataset.sort ===
                    "default"
                );

            }
        );


        updateGameDiscovery();

        searchInput.focus();

    }


    if (clearButton) {

        clearButton.addEventListener(
            "click",
            clearSearch
        );

    }


    if (noGamesClear) {

        noGamesClear.addEventListener(
            "click",
            clearSearch
        );

    }


    // =========================================
    // ESCAPE
    // =========================================

    searchInput.addEventListener(
        "keydown",
        event => {

            if (
                event.key ===
                "Escape"
            ) {

                clearSearch();

            }

        }
    );


    // =========================================
    // INITIAL LOAD
    // =========================================

    updateGameDiscovery();

}


// =========================================
// START
// =========================================

setupGameDiscovery();
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

const loginDescription = document.getElementById("loginDescription");
const forgotPasswordButton = document.getElementById("forgotPasswordButton");
const resetRequestForm = document.getElementById("resetRequestForm");
const updatePasswordForm = document.getElementById("updatePasswordForm");
const authStatus = document.getElementById("authStatus");
const signupText = document.getElementById("signupText");

let signupMode = false;
let authView = "login";

function setAuthStatus(message, state = "info") {
    authStatus.textContent = message;
    authStatus.dataset.state = state;
    authStatus.hidden = !message;
}

function setAuthView(view) {
    authView = view;
    const isLogin = view === "login";
    const isSignup = view === "signup";

    loginForm.hidden = !isLogin && !isSignup;
    resetRequestForm.hidden = view !== "request-reset";
    updatePasswordForm.hidden = view !== "update-password";
    forgotPasswordButton.hidden = !isLogin;
    signupText.hidden = !isLogin && !isSignup;

    if (view === "request-reset") {
        document.querySelector(".login-header h2").textContent = "Reset password";
        loginDescription.textContent = "Enter your email and we’ll send you a password reset link.";
    } else if (view === "update-password") {
        document.querySelector(".login-header h2").textContent = "Choose a new password";
        loginDescription.textContent = "Enter and confirm your new password below.";
    } else if (isSignup) {
        document.querySelector(".login-header h2").textContent = "👤 Create Account";
        loginDescription.textContent = "Create an account to save your game stats, likes, and favorites.";
    } else {
        document.querySelector(".login-header h2").textContent = "👤 Login";
        loginDescription.textContent = "Login to save your game stats, likes, and favorites.";
    }

    setAuthStatus("");
}


signupButton.addEventListener("click", function() {

    signupMode = !signupMode;


    if (signupMode) {
        setAuthView("signup");

        // Switch to signup

        usernameField.style.display = "block";

        loginSubmit.textContent = "Create Account";

        accountPrompt.textContent = "Already have an account?";

        signupButton.textContent = "Login";

        document.querySelector(".login-header h2").textContent = "👤 Create Account";

    } 

    else {
        setAuthView("login");

        // Switch back to login

        usernameField.style.display = "none";

        loginSubmit.textContent = "Login";

        accountPrompt.textContent = "Don't have an account?";

        signupButton.textContent = "Sign up";

        document.querySelector(".login-header h2").textContent = "👤 Login";

    }

});

forgotPasswordButton.addEventListener("click", function() {
    document.getElementById("resetEmail").value =
        document.getElementById("loginEmail").value.trim();
    setAuthView("request-reset");
});

document.getElementById("backToLogin").addEventListener("click", function() {
    signupMode = false;
    setAuthView("login");
});

// =========================================
// SUPABASE AUTHENTICATION
// =========================================

const loginForm = document.getElementById("loginForm");

if (new URLSearchParams(window.location.search).get("signup") === "1") {
    signupButton.click();
    loginOverlay.classList.add("open");
}

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

resetRequestForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const submitButton = resetRequestForm.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    setAuthStatus("");

    const redirectUrl = new URL(window.location.href);
    redirectUrl.searchParams.set("password-reset", "1");
    redirectUrl.hash = "";

    try {
        const { error } = await supabaseClient.auth.resetPasswordForEmail(
            document.getElementById("resetEmail").value.trim(),
            { redirectTo: redirectUrl.toString() }
        );

        if (error) {
            setAuthStatus(error.message, "error");
            return;
        }

        setAuthStatus(
            "If an account exists for that email, you’ll receive a password reset link shortly.",
            "success"
        );
    } catch (error) {
        console.error("Password reset request failed:", error);
        setAuthStatus("Could not send the reset email. Please try again.", "error");
    } finally {
        submitButton.disabled = false;
    }
});

updatePasswordForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const newPassword = document.getElementById("newPassword").value;
    const confirmNewPassword = document.getElementById("confirmNewPassword").value;

    if (newPassword !== confirmNewPassword) {
        setAuthStatus("The passwords do not match.", "error");
        return;
    }

    const submitButton = updatePasswordForm.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    setAuthStatus("");

    try {
        const { error } = await supabaseClient.auth.updateUser({ password: newPassword });

        if (error) {
            setAuthStatus(error.message, "error");
            return;
        }

        const cleanUrl = new URL(window.location.href);
        cleanUrl.searchParams.delete("password-reset");
        cleanUrl.hash = "";
        window.history.replaceState({}, document.title, cleanUrl.toString());

        loginOverlay.classList.remove("open");
        updatePasswordForm.reset();
        await updateAccountUI();
        alert("Your password has been updated.");
    } catch (error) {
        console.error("Password update failed:", error);
        setAuthStatus("Could not update your password. Please try again.", "error");
    } finally {
        submitButton.disabled = false;
    }
});

const recoveryRequested =
    new URLSearchParams(window.location.search).get("password-reset") === "1" ||
    new URLSearchParams(window.location.search).get("type") === "recovery" ||
    new URLSearchParams(window.location.hash.slice(1)).get("type") === "recovery";

supabaseClient.auth.onAuthStateChange((event, session) => {
    if (event === "PASSWORD_RECOVERY" && session) {
        loginOverlay.classList.add("open");
        setAuthView("update-password");
    }
});

if (recoveryRequested) {
    loginOverlay.classList.add("open");

    supabaseClient.auth.getSession().then(({ data, error }) => {
        if (error) {
            console.error("Could not verify password recovery session:", error);
            setAuthView("login");
            setAuthStatus("Could not verify this reset link. Please request a new one.", "error");
            return;
        }

        if (data.session) {
            setAuthView("update-password");
            return;
        }

        setAuthView("login");
        setAuthStatus("This reset link is invalid or expired. Request a new one to continue.", "error");
    }).catch(error => {
        console.error("Could not load password recovery session:", error);
        setAuthView("login");
        setAuthStatus("Could not verify this reset link. Please request a new one.", "error");
    });
}

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

    // Refresh coin balance whenever account menu opens
    if (accountMenu.classList.contains("open")) {
        await loadCoinBalance();
    }

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
