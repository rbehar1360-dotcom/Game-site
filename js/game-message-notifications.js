(function () {
    if (window.gameMessageNotificationsLoaded) return;
    window.gameMessageNotificationsLoaded = true;

    const supabase = window.supabaseClient;
    if (!supabase) {
        console.warn("Game message notifications: Supabase is not available.");
        return;
    }

    const seenMessageIds = new Set();
    let channel = null;
    let currentUserId = null;
    let connectionAttempt = 0;
    const popupPreferenceKey = "gameHubInGameMessagePopups";

    function areGameMessagePopupsEnabled() {
        try {
            return window.localStorage.getItem(popupPreferenceKey) !== "false";
        } catch (error) {
            console.error("Could not read the in-game message popup setting:", error);
            return true;
        }
    }

    function getContainer() {
        let container = document.getElementById("gameMessageNotificationContainer");
        if (container) return container;

        const style = document.createElement("style");
        style.textContent = `
            #gameMessageNotificationContainer.message-notification-container {
                position: fixed;
                top: 16px;
                left: 50%;
                z-index: 2147483647;
                width: min(430px, calc(100vw - 24px));
                display: flex;
                flex-direction: column;
                gap: 8px;
                pointer-events: none;
                transform: translateX(-50%);
            }
            #gameMessageNotificationContainer .message-notification {
                display: flex;
                align-items: center;
                gap: 11px;
                min-height: 62px;
                padding: 10px 11px;
                box-sizing: border-box;
                border: 1px solid color-mix(in srgb, var(--accent) 40%, transparent);
                border-radius: 15px;
                background: color-mix(in srgb, var(--background-2) 94%, transparent);
                color: var(--text);
                box-shadow: 0 18px 50px rgba(0, 0, 0, 0.42), 0 0 24px var(--shadow);
                backdrop-filter: blur(16px);
                pointer-events: auto;
                opacity: 0;
                transform: translateY(-18px) scale(0.98);
                transition: 0.25s ease;
            }
            #gameMessageNotificationContainer .message-notification.show {
                opacity: 1;
                transform: translateY(0) scale(1);
            }
            #gameMessageNotificationContainer .message-notification-avatar {
                width: 42px;
                height: 42px;
                flex: 0 0 42px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                background: linear-gradient(135deg, var(--accent), var(--background-3));
                color: var(--background-1);
                font-weight: 800;
            }
            #gameMessageNotificationContainer .message-notification-content {
                display: flex;
                min-width: 0;
                flex: 1;
                flex-direction: column;
                gap: 3px;
            }
            #gameMessageNotificationContainer .message-notification-content strong {
                color: var(--title);
                font-size: 13px;
            }
            #gameMessageNotificationContainer .message-notification-content span {
                overflow: hidden;
                color: var(--text);
                opacity: 0.68;
                font-size: 12px;
                white-space: nowrap;
                text-overflow: ellipsis;
            }
            #gameMessageNotificationContainer .message-notification-actions {
                display: flex;
                align-items: center;
                gap: 4px;
            }
            #gameMessageNotificationContainer .message-notification-open,
            #gameMessageNotificationContainer .message-notification-close {
                border: 0;
                border-radius: 8px;
                cursor: pointer;
            }
            #gameMessageNotificationContainer .message-notification-open {
                padding: 7px 9px;
                background: var(--accent);
                color: var(--background-1);
                font-size: 11px;
                font-weight: 700;
            }
            #gameMessageNotificationContainer .message-notification-close {
                width: 28px;
                height: 28px;
                background: transparent;
                color: var(--text);
                cursor: pointer;
                font-size: 18px;
            }
            #gameMessageNotificationContainer .message-notification-close:hover {
                background: rgba(255, 255, 255, 0.08);
            }
            @media (max-width: 760px) {
                #gameMessageNotificationContainer.message-notification-container {
                    width: min(430px, calc(100vw - 24px));
                }
            }
        `;
        document.head.appendChild(style);

        container = document.createElement("div");
        container.id = "gameMessageNotificationContainer";
        container.className = "message-notification-container";
        container.setAttribute("aria-live", "polite");
        container.setAttribute("aria-atomic", "false");
        document.body.appendChild(container);
        return container;
    }

    function openGameMessages(senderId) {
        let overlay = document.getElementById("gameMessageOverlay");
        if (overlay) {
            overlay.remove();
        }

        overlay = document.createElement("div");
        overlay.id = "gameMessageOverlay";
        overlay.style.cssText = [
            "position:fixed",
            "inset:0",
            "z-index:2147483646",
            "background:rgba(0,0,0,.72)",
            "backdrop-filter:blur(5px)"
        ].join(";");

        const closeButton = document.createElement("button");
        closeButton.type = "button";
        closeButton.textContent = "×";
        closeButton.setAttribute("aria-label", "Close texting");
        closeButton.style.cssText = [
            "position:absolute",
            "top:12px",
            "right:16px",
            "z-index:2",
            "width:42px",
            "height:42px",
            "border:1px solid rgba(255,255,255,.35)",
            "border-radius:50%",
            "background:#102532",
            "color:#fff",
            "font-size:28px",
            "cursor:pointer"
        ].join(";");

        const frame = document.createElement("iframe");
        frame.title = "Texting";
        frame.style.cssText = [
            "position:absolute",
            "inset:0",
            "width:100%",
            "height:100%",
            "border:0",
            "background:transparent"
        ].join(";");

        const pageUrl = new URL("../index.html", window.location.href);
        pageUrl.searchParams.set("gameMessagesOverlay", "1");
        if (senderId) {
            pageUrl.searchParams.set("messageUserId", senderId);
        }

        const handleEscape = event => {
            if (event.key === "Escape" && overlay?.isConnected) {
                closeOverlay();
            }
        };

        const closeOverlay = () => {
            window.removeEventListener("message", handleFrameMessage);
            document.removeEventListener("keydown", handleEscape);
            overlay?.remove();
        };

        closeButton.addEventListener("click", closeOverlay);
        overlay.addEventListener("click", event => {
            if (event.target === overlay) {
                closeOverlay();
            }
        });

        const handleFrameMessage = event => {
            if (
                event.origin === window.location.origin &&
                event.source === frame.contentWindow &&
                event.data === "gamehub-close-message-overlay"
            ) {
                closeOverlay();
            }
        };

        window.addEventListener("message", handleFrameMessage);
        frame.addEventListener("load", () => {
            try {
                const style = frame.contentDocument.createElement("style");
                style.textContent = `
                    html, body {
                        width: 100%;
                        height: 100%;
                        min-height: 0 !important;
                        margin: 0 !important;
                        overflow: hidden !important;
                        background: transparent !important;
                    }
                    body > :not(#messagesOverlay) {
                        display: none !important;
                    }
                    #messagesOverlay {
                        position: fixed !important;
                        inset: 0 !important;
                        display: flex !important;
                        z-index: 1 !important;
                    }
                    #messagesOverlay .messages-window {
                        max-height: calc(100% - 32px);
                    }
                    #messagesOverlay .close-messages {
                        display: none !important;
                    }
                `;
                frame.contentDocument.head.appendChild(style);
            } catch (error) {
                console.error("Could not prepare the in-game texting overlay:", error);
            }
        });

        document.addEventListener("keydown", handleEscape);

        overlay.append(closeButton, frame);
        document.body.appendChild(overlay);
        frame.src = pageUrl.href;
    }

    function showNotification(username, message) {
        const toast = document.createElement("div");
        toast.className = "message-notification";
        toast.setAttribute("role", "status");

        const avatar = document.createElement("div");
        avatar.className = "message-notification-avatar";
        avatar.textContent = username.trim().charAt(0).toUpperCase() || "?";

        const content = document.createElement("div");
        content.className = "message-notification-content";

        const sender = document.createElement("strong");
        sender.textContent = username;

        const preview = document.createElement("span");
        preview.textContent = message.startsWith("[[GIF]]")
            ? "GIF"
            : message.replace(/\s+/g, " ").trim();

        const actions = document.createElement("div");
        actions.className = "message-notification-actions";

        const open = document.createElement("button");
        open.type = "button";
        open.className = "message-notification-open";
        open.textContent = "Open";
        open.addEventListener("click", () => {
            openGameMessages(open.dataset.senderId || "");
            toast.remove();
        });

        const close = document.createElement("button");
        close.type = "button";
        close.className = "message-notification-close";
        close.setAttribute("aria-label", "Dismiss message notification");
        close.textContent = "×";
        close.addEventListener("click", () => toast.remove());

        actions.append(open, close);
        content.append(sender, preview);
        toast.append(avatar, content, actions);
        getContainer().prepend(toast);

        requestAnimationFrame(() => toast.classList.add("show"));
        window.setTimeout(() => {
            toast.classList.remove("show");
            window.setTimeout(() => toast.remove(), 250);
        }, 6500);
        return { sender, avatar, open };
    }

    async function showIncomingMessage(message) {
        if (!message || message.recipient_id !== currentUserId) return;
        if (message.sender_id === currentUserId) return;
        if (!areGameMessagePopupsEnabled()) return;
        if (message.id && seenMessageIds.has(message.id)) return;

        if (message.id) {
            seenMessageIds.add(message.id);
            if (seenMessageIds.size > 100) {
                seenMessageIds.delete(seenMessageIds.values().next().value);
            }
        }

        const notification = showNotification(
            "New message",
            typeof message.message === "string" ? message.message : ""
        );
        notification.open.dataset.senderId = message.sender_id || "";

        try {
            const { data, error } = await supabase.rpc("find_username_by_id", {
                search_user_id: message.sender_id
            });
            if (!error && data?.[0]?.username && message.recipient_id === currentUserId) {
                notification.sender.textContent = data[0].username;
                notification.avatar.textContent = data[0].username.trim().charAt(0).toUpperCase() || "?";
            }
        } catch (error) {
            console.warn("Could not load message sender username:", error);
        }
    }

    window.addEventListener("storage", event => {
        if (
            event.key === popupPreferenceKey &&
            !areGameMessagePopupsEnabled()
        ) {
            document.getElementById("gameMessageNotificationContainer")?.remove();
        }
    });

    async function connectToUser(userId) {
        if (userId === currentUserId && channel) return;

        const attempt = ++connectionAttempt;
        const oldChannel = channel;
        channel = null;
        currentUserId = null;

        if (oldChannel) {
            try {
                await supabase.removeChannel(oldChannel);
            } catch (error) {
                console.warn("Could not clean up previous message channel:", error);
            }
        }
        if (attempt !== connectionAttempt || !userId) return;

        currentUserId = userId;
        channel = supabase
            .channel(`game-private-messages-${userId}`)
            .on("postgres_changes", {
                event: "INSERT",
                schema: "public",
                table: "private_messages"
            }, payload => {
                void showIncomingMessage(payload.new);
            })
            .subscribe(status => {
                console.log("Game private messages realtime:", status);
            });
    }

    supabase.auth.onAuthStateChange((_event, session) => {
        window.setTimeout(() => {
            void connectToUser(session?.user?.id || null);
        }, 0);
    });

    supabase.auth.getSession().then(({ data, error }) => {
        if (error) {
            console.error("Game message notifications could not read the session:", error);
            return;
        }
        void connectToUser(data.session?.user?.id || null);
    }).catch(error => {
        console.error("Game message notifications could not initialize:", error);
    });
})();