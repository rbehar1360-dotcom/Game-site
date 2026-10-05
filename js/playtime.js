// =========================================
// GAME PLAYTIME TRACKER (FIXED)
// =========================================

(function () {

    // =========================================
    // GAME ID
    // =========================================

    function getGameId() {
        const pathname = window.location.pathname;
        const filename = pathname.substring(pathname.lastIndexOf('/') + 1).split('?')[0].split('#')[0];

        const gameMap = {
            "GeometryDash.html": "geometry-dash",
            "snake.html": "snake",
            "pi.html": "pi",
            "Iframetester.html": "iframe-tester",
            "calc.html": "calculator",
            "BasketBallLegends2020.html": "basketball-legends",
            "cookieclicker.html": "cookie-clicker",
            "EaglerCraft.html": "eaglercraft",
            "Chess.html": "chess",
            "Snowball.html": "snowball",
            "SpaceWaves.html": "space-waves",
            "Raffle.html": "raffle",
            "PressTheButton.html": "press-the-button",
            "SlimeRancher.html": "slime-rancher",
            "GrindCraft.html": "GrindCraft",
            "Stickmanhook.html": "stickman-hook",
            "Slope.html": "slope",
            "Wordcounter.html": "word-counter",
            "Motom.html": "moto-x3m",
            "SuperMario.html": "super-mario-64",
            "LearnHowToFly3.html": "learn-how-to-fly-3",
            "SansFight.html": "sans-fight",
            "AntArt.html": "AntArt",
            "FireBoyandWaterGirl.html": "FireBoyWaterGirl",
            "DriftBoss.html": "DriftBoss",
            "PVZ.html": "PVZ",
            "SubwaySurfers.html": "SubwaySurfers",
            "FridayNightFunkin.html": "FridayNightFunkin",
            "StreetRacer.html": "StreetRacer",
            "Tag.html": "Tag",
            "CountMasters.html": "CountMasters",
            "SilkSong.html": "SilkSong",
            "TimeShooter2.html": "TimeShooter2",
            "StrangeRopePolice.html": "StrangeRopePolice",
            "KickTheBuddy.html": "KickTheBuddy",
            "PVZ2.html": "PVZ2",
            "IdleMiningEmpire.html": "IdleMiningEmpire",
            "StarDewValley.html": "StardewValley",
            "DuckLife1.html": "Duck Life 1",
            "DuckLife2.html": "Duck Life 2",
            "DuckLife3.html": "Duck Life 3",
            "DuckLife4.html": "Duck Life 4",
            "DuckLife5.html": "Duck Life 5",
            "FNAFSisterLocation.html": "FNAF Sister Location",
            "FNAF1.html": "FNAF 1",
            "FNAF2.html": "FNAF 2",
            "FNAF3.html": "FNAF 3",
            "FNAF4.html": "FNAF 4",
            "FiveNightsAtEpsteins.html": "Five Nights at Epstein's",
            "Balatro.html": "Balatro",
            "BasketRandom.html": "Basket Random",
            "SoccerRandom.html": "Soccer Random",
            "VolleyRandom.html": "Volley Random",
            "BoxingRandom.html": "Boxing Random",
            "BlackJack.html": "Black Jack",
            "BasketBallFrvr.html": "BasketBallFrvr",
            "BitPlanes.html": "BitPlanes",
            "BobTheRobber.html": "BobTheRobber",
            "DogeMiner.html": "DogeMiner",
            "DogeMiner2.html": "DogeMiner2",
            "FruitNinja.html": "FruitNinja",
            "JohnnyTrigger.html": "JohnnyTrigger",
            "MotoX3m2.html": "MotoX3m2",
            "MotoX3m3.html": "MotoX3m3",
            "MrMine.html": "MrMine",
            "RoofTopSnipers.html": "RoofTopSnipers",
            "RoofTopSnipers2.html": "RoofTopSnipers2",
            "Run3.html": "Run3",
            "Wheely.html": "Wheely",
            "Wheely2.html": "Wheely2",
            "Wheely3.html": "Wheely3",
            "Wheely4.html": "Wheely4",
            "Wheely5.html": "Wheely5",
            "Wheely6.html": "Wheely6",
            "Wheely7.html": "Wheely7",
            "Wheely8.html": "Wheely8",
            "WorldsHardestGame.html": "WorldsHardestGame",
            "YouVS100Skibidi.html": "YouVS100Skibidi"
        };

        return gameMap[filename] || null;
    }

    const gameId = getGameId();

    window.gameId = gameId;

    const signupReminderStorageKey = "gamehub-signup-reminder-seconds";
    const signupReminderShownKey = "gamehub-signup-reminder-shown";
    const signupReminderAfterSeconds = 15 * 60;
    let gameNotificationChannel = null;
    let gameNotificationUserId = null;

    function getNotificationContainer() {
        let container = document.getElementById("gameNotificationContainer");

        if (!container) {
            container = document.createElement("div");
            container.id = "gameNotificationContainer";
            container.className = "game-notification-container";
            document.body.appendChild(container);
        }

        return container;
    }

    function showGameToast(title, message, kind = "info") {
        const toast = document.createElement("div");
        toast.className = `game-notification game-notification-${kind}`;

        const content = document.createElement("div");
        content.className = "game-notification-content";

        const heading = document.createElement("strong");
        heading.textContent = title;
        content.appendChild(heading);

        if (message) {
            const preview = document.createElement("span");
            preview.textContent = message;
            content.appendChild(preview);
        }

        const closeButton = document.createElement("button");
        closeButton.type = "button";
        closeButton.className = "game-notification-close";
        closeButton.setAttribute("aria-label", "Dismiss notification");
        closeButton.textContent = "×";
        closeButton.addEventListener("click", () => toast.remove());

        toast.append(content, closeButton);
        getNotificationContainer().prepend(toast);
        requestAnimationFrame(() => toast.classList.add("show"));

        window.setTimeout(() => {
            toast.classList.remove("show");
            window.setTimeout(() => toast.remove(), 250);
        }, 6000);
    }

    function showSignupReminder() {
        if (document.getElementById("gameSignupReminder")) return;

        const overlay = document.createElement("div");
        overlay.id = "gameSignupReminder";
        overlay.className = "game-signup-reminder-overlay";
        overlay.setAttribute("role", "dialog");
        overlay.setAttribute("aria-modal", "true");
        overlay.setAttribute("aria-labelledby", "gameSignupReminderTitle");

        const dialog = document.createElement("div");
        dialog.className = "game-signup-reminder";

        const heading = document.createElement("h2");
        heading.id = "gameSignupReminderTitle";
        heading.textContent = "Keep your progress";

        const description = document.createElement("p");
        description.textContent = "If you play the site and want to earn rewards and save your progress, sign up for an account.";

        const actions = document.createElement("div");
        actions.className = "game-signup-reminder-actions";

        const dismissButton = document.createElement("button");
        dismissButton.type = "button";
        dismissButton.className = "game-signup-reminder-dismiss";
        dismissButton.textContent = "Not now";
        dismissButton.addEventListener("click", () => overlay.remove());

        const signupButton = document.createElement("button");
        signupButton.type = "button";
        signupButton.className = "game-signup-reminder-confirm";
        signupButton.textContent = "Okay";
        signupButton.addEventListener("click", () => {
            const signupUrl = new URL("../index.html?signup=1", window.location.href);
            const signupWindow = window.open(signupUrl.href, "_blank");

            if (signupWindow) {
                signupWindow.opener = null;
            } else {
                window.location.assign(signupUrl.href);
            }
        });

        actions.append(dismissButton, signupButton);
        dialog.append(heading, description, actions);
        overlay.appendChild(dialog);
        document.body.appendChild(overlay);
        signupButton.focus();
    }

    async function setupGameNotifications() {
        const supabase = getSupabase();
        if (!supabase) return;

        try {
            const { data: { user }, error } = await supabase.auth.getUser();
            if (error || !user) return;
            if (gameNotificationUserId === user.id) return;

            if (gameNotificationChannel) {
                await supabase.removeChannel(gameNotificationChannel);
            }

            const { data: coinData } = await supabase
                .from("user_coins")
                .select("coins")
                .eq("user_id", user.id)
                .maybeSingle();
            let lastCoinBalance = coinData ? Number(coinData.coins) || 0 : null;

            gameNotificationUserId = user.id;
            gameNotificationChannel = supabase
                .channel(`game-notifications-${user.id}`)
                .on("postgres_changes", {
                    event: "UPDATE",
                    schema: "public",
                    table: "user_coins",
                    filter: `user_id=eq.${user.id}`
                }, coinEvent => {
                    const newBalance = Number(coinEvent.new?.coins) || 0;
                    const coinsEarned = lastCoinBalance === null
                        ? 0
                        : newBalance - lastCoinBalance;
                    lastCoinBalance = newBalance;

                    if (coinsEarned > 0) {
                        showGameToast(`+${coinsEarned} coin${coinsEarned === 1 ? "" : "s"}`, "", "coin");
                    }
                })
                .on("postgres_changes", {
                    event: "INSERT",
                    schema: "public",
                    table: "user_coins",
                    filter: `user_id=eq.${user.id}`
                }, coinEvent => {
                    const newBalance = Number(coinEvent.new?.coins) || 0;
                    const coinsEarned = newBalance - (lastCoinBalance || 0);
                    lastCoinBalance = newBalance;

                    if (coinsEarned > 0) {
                        showGameToast(`+${coinsEarned} coin${coinsEarned === 1 ? "" : "s"}`, "", "coin");
                    }
                })
                .subscribe();
        } catch (error) {
            console.error("Game notifications could not be initialized:", error);
        }
    }

    setupGameNotifications();
    const supabase = getSupabase();
    if (supabase) {
        supabase.auth.onAuthStateChange(event => {
            if (event === "SIGNED_IN") {
                window.setTimeout(setupGameNotifications, 0);
            } else if (event === "SIGNED_OUT" && gameNotificationChannel) {
                const channel = gameNotificationChannel;
                gameNotificationChannel = null;
                gameNotificationUserId = null;
                window.setTimeout(() => supabase.removeChannel(channel), 0);
            }
        });
    }

    function readSessionValue(key) {
        try {
            return sessionStorage.getItem(key);
        } catch (_) {
            return null;
        }
    }

    function writeSessionValue(key, value) {
        try {
            sessionStorage.setItem(key, value);
        } catch (_) {}
    }

    let signupReminderSeconds = Number(readSessionValue(signupReminderStorageKey)) || 0;
    let signupReminderShown = readSessionValue(signupReminderShownKey) === "true";
    let signupAuthCheckPending = false;

    window.setInterval(async () => {
        if (
            document.visibilityState !== "visible" ||
            !document.hasFocus() ||
            signupReminderShown
        ) return;

        signupReminderSeconds += 1;
        writeSessionValue(signupReminderStorageKey, String(signupReminderSeconds));

        if (signupReminderSeconds < signupReminderAfterSeconds || signupAuthCheckPending) return;

        const authClient = getSupabase();
        if (!authClient) return;

        signupAuthCheckPending = true;
        try {
            const { data: { session }, error } = await authClient.auth.getSession();
            if (error) return;

            signupReminderShown = true;
            writeSessionValue(signupReminderShownKey, "true");

            if (!session?.user) {
                showSignupReminder();
            }
        } finally {
            signupAuthCheckPending = false;
        }
    }, 1000);

    const currentScript = document.currentScript;
    if (currentScript && currentScript.src) {
        const commentsScript = document.createElement("script");
        commentsScript.src = new URL("comments.js", currentScript.src).href;
        document.head.appendChild(commentsScript);

        const localGamePageScript = document.createElement("script");
        localGamePageScript.src = new URL("local-game-page.js", currentScript.src).href;
        document.head.appendChild(localGamePageScript);

        const messageNotificationsScript = document.createElement("script");
        messageNotificationsScript.src = new URL("game-message-notifications.js", currentScript.src).href;
        document.head.appendChild(messageNotificationsScript);
    }

    if (!gameId) {
        console.warn("⏱️ Could not determine game ID.");
        return;
    }

    // =========================================
    // TIMER & LOCKS
    // =========================================

    let lastSaveTime = Date.now();
    let isSaving = false;

    function getSupabase() {
        if (typeof supabaseClient === "undefined") {
            console.warn("⏱️ Supabase client isn't loaded.");
            return null;
        }
        return supabaseClient;
    }

    // =========================================
    // SAVE PLAYTIME
    // =========================================

    async function savePlaytime() {
        // Prevent overlapping runs
        if (isSaving) return;

        const supabase = getSupabase();
        if (!supabase) return;

        const now = Date.now();
        const seconds = Math.floor((now - lastSaveTime) / 1000);

        // Don't issue requests for 0 seconds
        if (seconds <= 0) return;

        isSaving = true;

        try {
            // Check auth user
            const { data: { user }, error: authError } = await supabase.auth.getUser();

            if (authError || !user) {
                // Advance lastSaveTime so we don't accumulate unsaved time for logged-out users
                lastSaveTime = now;
                return;
            }

            // Execute RPC call
            const { error: rpcError } = await supabase.rpc("add_game_playtime", {
                p_game_id: gameId,
                p_seconds: seconds
            });

            if (rpcError) {
                console.error("⏱️ RPC Save Error:", rpcError.message);
                // We do NOT update lastSaveTime here so it retries these seconds on the next loop
                return;
            }

            // Success: update timestamp
            lastSaveTime = now;
            console.log(`⏱️ Successfully saved +${seconds}s for ${gameId}`);

        } catch (err) {
            console.error("⏱️ Unexpected tracker error:", err);
        } finally {
            // ALWAYS release lock
            isSaving = false;
        }
    }

    // =========================================
    // SAFE LOOP (Recursive setTimeout prevents overlapping calls)
    // =========================================

    // =========================================
// TRACKER LOOP
// =========================================
function isGameActive() {
    return document.visibilityState === "visible" && document.hasFocus();
}
async function trackerLoop() {

    if (isGameActive()) {
        await savePlaytime();
    }

    setTimeout(trackerLoop, 5000);
}
    // Start loop
    trackerLoop();

    // =========================================
    // VISIBILITY & UNLOAD HANDLERS
    // =========================================

    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "hidden") {
            savePlaytime();
        } else {
            // Reset anchor when returning to tab so background time isn't counted
            lastSaveTime = Date.now();
        }
    });

    window.addEventListener("pagehide", () => {
        savePlaytime();
    });

    console.log(`⏱️ Playtime tracking initialized for: ${gameId}`);

})();

