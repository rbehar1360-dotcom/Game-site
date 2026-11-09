(function () {
    if (window.gameMessageNotificationsLoaded) return;
    window.gameMessageNotificationsLoaded = true;

    const supabase = window.supabaseClient;
    if (!supabase) {
        console.warn("Game message notifications: Supabase is not available.");
        return;
    }

    const seenMessageIds = new Set();
    const notifications = [];
    let channel = null;
    let currentUserId = null;
    let connectionAttempt = 0;
    let isMenuOpen = false;
    const popupPreferenceKey = "gameHubInGameMessagePopups";

    function areGameMessagePopupsEnabled() {
        try {
            return window.localStorage.getItem(popupPreferenceKey) !== "false";
        } catch (error) {
            console.error("Could not read the in-game message popup setting:", error);
            return false;
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
                left: 16px;
                z-index: 2147483647;
                width: min(360px, calc(100vw - 32px));
                color: var(--text, #fff);
                font-family: Arial, sans-serif;
            }
            #gameMessageNotificationContainer .message-notification-toggle {
                display: flex;
                align-items: center;
                gap: 9px;
                min-height: 42px;
                padding: 0 14px;
                box-sizing: border-box;
                border: 1px solid rgba(255,255,255,.2);
                border-radius: 10px;
                background: rgba(8, 20, 29, .92);
                color: inherit;
                box-shadow: 0 8px 26px rgba(0,0,0,.35);
                cursor: pointer;
                font-size: 13px;
                font-weight: 700;
            }
            #gameMessageNotificationContainer .message-notification-count {
                display: inline-grid;
                min-width: 20px;
                height: 20px;
                place-items: center;
                padding: 0 5px;
                border-radius: 10px;
                background: #e44;
                color: white;
                font-size: 11px;
            }
            #gameMessageNotificationContainer .message-notification-count[hidden] {
                display: none;
            }
            #gameMessageNotificationContainer .message-notification-list {
                display: flex;
                max-height: min(55vh, 420px);
                flex-direction: column;
                gap: 7px;
                margin-top: 8px;
                overflow-y: auto;
            }
            #gameMessageNotificationContainer .message-notification-list[hidden] {
                display: none;
            }
            #gameMessageNotificationContainer .message-notification {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 10px;
                border: 1px solid rgba(255,255,255,.16);
                border-radius: 10px;
                background: rgba(8, 20, 29, .96);
                color: inherit;
                box-shadow: 0 8px 26px rgba(0,0,0,.35);
            }
            #gameMessageNotificationContainer .message-notification-content {
                display: flex;
                min-width: 0;
                flex: 1;
                flex-direction: column;
                gap: 3px;
            }
            #gameMessageNotificationContainer .message-notification-content strong {
                font-size: 13px;
            }
            #gameMessageNotificationContainer .message-notification-content span {
                overflow: hidden;
                opacity: .75;
                font-size: 12px;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            #gameMessageNotificationContainer .message-notification-actions {
                display: flex;
                align-items: center;
                gap: 5px;
            }
            #gameMessageNotificationContainer .message-notification-open,
            #gameMessageNotificationContainer .message-notification-close {
                min-height: 30px;
                padding: 0 9px;
                border: 0;
                border-radius: 7px;
                cursor: pointer;
            }
            #gameMessageNotificationContainer .message-notification-open {
                background: var(--accent, #00bcd4);
                color: #06121a;
                font-weight: 700;
            }
            #gameMessageNotificationContainer .message-notification-close {
                background: rgba(255,255,255,.1);
                color: inherit;
            }
        `;
        document.head.appendChild(style);

        container = document.createElement("div");
        container.id = "gameMessageNotificationContainer";
        container.className = "message-notification-container";
        const toggle = document.createElement("button");
        toggle.type = "button";
        toggle.className = "message-notification-toggle";
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-controls", "gameMessageNotificationList");
        toggle.textContent = "🔔 Messages";

        const count = document.createElement("span");
        count.className = "message-notification-count";
        count.setAttribute("aria-label", "Unread message notifications");
        toggle.appendChild(count);

        const list = document.createElement("div");
        list.id = "gameMessageNotificationList";
        list.className = "message-notification-list";
        list.hidden = true;
        list.setAttribute("aria-live", "polite");
        toggle.addEventListener("click", () => {
            isMenuOpen = !isMenuOpen;
            toggle.setAttribute("aria-expanded", String(isMenuOpen));
            list.hidden = !isMenuOpen;
        });

        container.append(toggle, list);
        document.body.appendChild(container);
        return container;
    }

    function renderNotifications() {
        const container = getContainer();
        const toggle = container.querySelector(".message-notification-toggle");
        const count = toggle.querySelector(".message-notification-count");
        const list = container.querySelector(".message-notification-list");

        count.textContent = String(notifications.length);
        count.hidden = notifications.length === 0;
        list.replaceChildren();

        notifications.forEach(notification => {
            list.appendChild(notification.element);
        });
        list.hidden = !isMenuOpen;
        toggle.setAttribute("aria-expanded", String(isMenuOpen));
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
            const index = notifications.findIndex(item => item.element === toast);
            if (index !== -1) notifications.splice(index, 1);
            renderNotifications();
        });

        const close = document.createElement("button");
        close.type = "button";
        close.className = "message-notification-close";
        close.setAttribute("aria-label", "Dismiss message notification");
        close.textContent = "×";
        close.addEventListener("click", () => {
            const index = notifications.findIndex(item => item.element === toast);
            if (index !== -1) notifications.splice(index, 1);
            renderNotifications();
        });

        actions.append(open, close);
        content.append(sender, preview);
        toast.append(avatar, content, actions);
        notifications.unshift({ element: toast, sender, avatar, open });
        if (notifications.length > 50) notifications.pop();
        renderNotifications();
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
                if (typeof setRankedUsername === "function") {
                    setRankedUsername(
                        notification.sender,
                        data[0].username,
                        message.sender_id
                    );
                } else {
                    notification.sender.textContent = data[0].username;
                }
                notification.avatar.textContent = data[0].username.trim().charAt(0).toUpperCase() || "?";
            }
        } catch (error) {
            console.warn("Could not load message sender username:", error);
        }
    }

    window.addEventListener("storage", event => {
        if (event.key === popupPreferenceKey) {
            applyPopupPreference(areGameMessagePopupsEnabled());
        }
    });

    window.addEventListener("gamehub:message-popup-preference", event => {
        applyPopupPreference(Boolean(event.detail?.enabled));
    });

    function applyPopupPreference(enabled) {
        if (!enabled) {
            notifications.splice(0, notifications.length);
            isMenuOpen = false;
            document.getElementById("gameMessageNotificationContainer")?.remove();
            return;
        }

        if (notifications.length) renderNotifications();
    }

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