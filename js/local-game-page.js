(function () {
    const scriptUrl = document.currentScript && document.currentScript.src;

    function addStylesheet() {
        if (!scriptUrl || document.querySelector('link[data-local-game-page="styles"], link[href$="local-game-page.css"]')) return;

        const stylesheet = document.createElement("link");
        stylesheet.rel = "stylesheet";
        stylesheet.href = new URL("../css/local-game-page.css", scriptUrl).href;
        stylesheet.dataset.localGamePage = "styles";
        document.head.appendChild(stylesheet);
    }

    function initialize() {
        if (window.localGamePageInitialized) return;
        window.localGamePageInitialized = true;

        const frame = document.getElementById("gameFrame") || document.querySelector("iframe");
        const container = document.querySelector(".game-container") ||
            document.getElementById("Calc") ||
            (frame && frame.parentElement) ||
            document.querySelector(".game-wrapper") ||
            document.body;

        if (!container) return;

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

        window.goFullscreen = function () {
            container.classList.add("local-game-fullscreen");
            if (container.classList.contains("game-container")) {
                container.classList.add("css-fullscreen");
            }
            document.body.style.overflow = "hidden";
            focusGame();
        };

        window.exitFullscreen = function () {
            container.classList.remove("local-game-fullscreen", "css-fullscreen");
            document.body.style.overflow = "";
            focusGame();
        };

        window.gameLoaded = function () {
            const loading = document.getElementById("loading");
            if (loading) loading.style.display = "none";
        };

        const fullscreenButton = Array.from(document.querySelectorAll("button")).find(function (button) {
            return !button.classList.contains("fullscreen-exit") &&
                (/fullscreen/i.test(button.textContent) || /goFullscreen/.test(button.getAttribute("onclick") || ""));
        });

        if (fullscreenButton) {
            fullscreenButton.type = "button";
            fullscreenButton.onclick = window.goFullscreen;
        } else {
            const controls = document.createElement("div");
            controls.className = "controls";
            const button = document.createElement("button");
            button.type = "button";
            button.textContent = "Fullscreen";
            button.onclick = window.goFullscreen;
            controls.appendChild(button);
            if (container === document.body || container === document.documentElement) {
                container.appendChild(controls);
            } else {
                container.insertAdjacentElement("afterend", controls);
            }
        }

        let exitButton = container.querySelector(".fullscreen-exit");
        if (!exitButton) {
            exitButton = document.createElement("button");
            exitButton.className = "fullscreen-exit";
            exitButton.textContent = "✕ Exit Fullscreen";
            container.appendChild(exitButton);
        }
        exitButton.type = "button";
        exitButton.title = "Exit Fullscreen";
        exitButton.setAttribute("aria-label", "Exit Fullscreen");
        exitButton.onclick = window.exitFullscreen;

        document.addEventListener("keydown", function (event) {
            if (event.key === "F11") {
                event.preventDefault();
                event.stopImmediatePropagation();
                if (container.classList.contains("local-game-fullscreen")) {
                    window.exitFullscreen();
                } else {
                    window.goFullscreen();
                }
            } else if (event.key === "Escape" && container.classList.contains("local-game-fullscreen")) {
                window.exitFullscreen();
            }
        }, true);

    }

    addStylesheet();

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initialize, { once: true });
    } else {
        initialize();
    }
})();