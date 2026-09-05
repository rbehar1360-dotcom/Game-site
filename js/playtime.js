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
            "PaperMinecraft.html": "paper-minecraft",
            "Stickmanhook.html": "stickman-hook",
            "Slope.html": "slope",
            "Wordcounter.html": "word-counter",
            "Motom.html": "moto-x3m",
            "SuperMario.html": "super-mario-64",
            "LearnHowToFly3.html": "learn-how-to-fly-3",
            "SansFight.html": "sans-fight"
        };

        return gameMap[filename] || null;
    }

    const gameId = getGameId();

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
    const cssFullscreen =
        document.querySelector(".game-container.css-fullscreen");

    return (
        document.visibilityState === "visible" ||
        cssFullscreen !== null
    );
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

