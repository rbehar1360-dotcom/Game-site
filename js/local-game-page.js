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

        let controls = fullscreenButton ? fullscreenButton.closest(".controls") : null;
        if (!controls && container.nextElementSibling &&
            container.nextElementSibling.classList.contains("controls")) {
            controls = container.nextElementSibling;
        }
        const controlsBar = controls || document.createElement("div");
        controlsBar.classList.add("controls", "game-controls");

        if (fullscreenButton) {
            fullscreenButton.type = "button";
            fullscreenButton.classList.add("fullscreen-button");
            fullscreenButton.onclick = window.goFullscreen;
            if (!controlsBar.contains(fullscreenButton)) {
                controlsBar.appendChild(fullscreenButton);
            }
        } else {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "fullscreen-button";
            button.textContent = "Fullscreen";
            button.onclick = window.goFullscreen;
            controlsBar.appendChild(button);
        }

        let reportButton = controlsBar.querySelector(".report-problem-button");
        if (!reportButton) {
            reportButton = document.createElement("button");
            reportButton.type = "button";
            reportButton.className = "report-problem-button";
            reportButton.textContent = "Report Problem";
            reportButton.addEventListener("click", openReportDialog);
            controlsBar.appendChild(reportButton);
        }

        if (container === document.body || container === document.documentElement) {
            document.body.appendChild(controlsBar);
        } else if (container.nextElementSibling !== controlsBar) {
            container.insertAdjacentElement("afterend", controlsBar);
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

    function openReportDialog() {
        let overlay = document.getElementById("gameReportOverlay");
        if (!overlay) {
            overlay = document.createElement("div");
            overlay.id = "gameReportOverlay";
            overlay.className = "game-report-overlay";
            overlay.innerHTML = `
                <section class="game-report-dialog" role="dialog" aria-modal="true" aria-labelledby="gameReportTitle">
                    <button class="game-report-close" type="button" aria-label="Close report form">×</button>
                    <h2 id="gameReportTitle">Report a problem</h2>
                    <p>Tell us what went wrong with this game.</p>
                    <form class="game-report-form">
                        <label for="gameReportDetails">Problem details</label>
                        <textarea id="gameReportDetails" name="details" maxlength="1500" minlength="10" required placeholder="Describe the problem (10–1500 characters)."></textarea>
                        <p class="game-report-status" role="status" aria-live="polite"></p>
                        <div class="game-report-actions">
                            <button class="game-report-cancel" type="button">Cancel</button>
                            <button class="game-report-submit" type="submit">Send Report</button>
                        </div>
                    </form>
                </section>
            `;
            document.body.appendChild(overlay);

            const closeDialog = function () {
                overlay.classList.remove("open");
                document.body.style.overflow = "";
            };
            overlay.querySelector(".game-report-close").addEventListener("click", closeDialog);
            overlay.querySelector(".game-report-cancel").addEventListener("click", closeDialog);
            overlay.addEventListener("click", function (event) {
                if (event.target === overlay) closeDialog();
            });
            overlay.querySelector(".game-report-form").addEventListener("submit", submitGameReport);
        }

        overlay.classList.add("open");
        document.body.style.overflow = "hidden";
        const details = overlay.querySelector("#gameReportDetails");
        const status = overlay.querySelector(".game-report-status");
        details.value = "";
        status.textContent = "";
        overlay.querySelector(".game-report-submit").disabled = false;
        details.focus();
    }

    async function submitGameReport(event) {
        event.preventDefault();

        const form = event.currentTarget;
        const details = form.elements.details.value.trim();
        const status = form.querySelector(".game-report-status");
        const submitButton = form.querySelector(".game-report-submit");
        const client = window.supabaseClient;

        if (!client) {
            console.error("Could not submit game report: Supabase client is unavailable.");
            status.textContent = "Reports are unavailable right now. Please try again later.";
            return;
        }

        if (details.length < 10 || details.length > 1500) {
            status.textContent = "Please enter between 10 and 1500 characters.";
            return;
        }

        submitButton.disabled = true;
        status.textContent = "Sending report...";
        try {
            const { data: { user }, error: userError } = await client.auth.getUser();
            if (userError) throw userError;

            const frame = document.getElementById("gameFrame") || document.querySelector("iframe");
            const heading = document.querySelector(".header h1, header h1, h1");
            const gameName = frame && frame.title
                ? frame.title
                : heading
                    ? heading.textContent.replace(/^🎮\s*/, "").trim()
                    : document.title.split("|")[0].trim();

            const { error } = await client.from("game_issue_reports").insert({
                game_name: gameName,
                game_url: window.location.href,
                report_text: details,
                user_id: user ? user.id : null
            });
            if (error) throw error;

            status.textContent = "Thanks — your report has been sent to the moderators.";
            form.reset();
            window.setTimeout(function () {
                const overlay = document.getElementById("gameReportOverlay");
                if (overlay) {
                    overlay.classList.remove("open");
                    document.body.style.overflow = "";
                }
            }, 1800);
        } catch (error) {
            console.error("Could not submit game report:", error);
            status.textContent = "Couldn't send your report. Please try again.";
            submitButton.disabled = false;
        }
    }

    addStylesheet();

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initialize, { once: true });
    } else {
        initialize();
    }
})();