(function () {
    const container = document.querySelector(".game-container");
    const frame = document.getElementById("gameFrame");

    window.gameLoaded = function () {
        const loading = document.getElementById("loading");
        if (loading) loading.style.display = "none";
    };

    window.goFullscreen = function () {
        if (!container) return;
        container.classList.add("css-fullscreen");
        document.body.style.overflow = "hidden";
        focusGame();
    };

    window.exitFullscreen = function () {
        if (!container) return;
        container.classList.remove("css-fullscreen");
        document.body.style.overflow = "";
        focusGame();
    };

    function focusGame() {
        if (!frame) return;
        window.setTimeout(function () {
            frame.focus();
            try {
                frame.contentWindow.focus();
            } catch (_) {
                // The embedded game may be cross-origin.
            }
        }, 100);
    }

    document.addEventListener("keydown", function (event) {
        if (event.key === "F11") {
            event.preventDefault();
            if (container.classList.contains("css-fullscreen")) {
                window.exitFullscreen();
            } else {
                window.goFullscreen();
            }
        } else if (event.key === "Escape" && container.classList.contains("css-fullscreen")) {
            window.setTimeout(focusGame, 100);
        }
    });
})();