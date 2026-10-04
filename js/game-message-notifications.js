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

    function getContainer() {
        let container = document.getElementById("gameMessageNotificationContainer");
        if (container) return container;

        const style = document.createElement("style");
        style.textContent = `
            #gameMessageNotificationContainer {
                position: fixed;
                top: 16px;
                right: 16px;
                z-index: 2147483647;
                display: flex;
                width: min(380px, calc(100vw - 32px));
                flex-direction: column;
                gap: 8px;
                pointer-events: none;
                font-family: system-ui, sans-serif;
            }
            .game-message-notification {
                display: flex;
                align-items: flex-start;
                gap: 12px;
                padding: 14px;
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 10px;
                background: #171a20;
                color: #f5f6f8;
                box-shadow: 0 12px 36px rgba(0, 0, 0, 0.45);
                pointer-events: auto;
                animation: game-message-notification-in 180ms ease-out;
            }
            .game-message-notification-content {
                display: flex;
                min-width: 0;
                flex: 1;
                flex-direction: column;
                gap: 4px;
            }
            .game-message-notification-content strong {
                overflow: hidden;
                color: #fff;
                font-size: 14px;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            .game-message-notification-content span {
                overflow: hidden;
                color: #c5c9d1;
                font-size: 13px;
                line-height: 1.4;
                overflow-wrap: anywhere;
            }
            .game-message-notification-close {
                width: 28px;
                height: 28px;
                flex: 0 0 28px;
                border: 0;
                border-radius: 6px;
                background: transparent;
                color: #e6e8ec;
                cursor: pointer;
                font-size: 20px;
                line-height: 1;
            }
            .game-message-notification-close:hover {
                background: rgba(255, 255, 255, 0.12);
            }
            @keyframes game-message-notification-in {
                from { opacity: 0; transform: translateY(-8px); }
                to { opacity: 1; transform: translateY(0); }
            }
            @media (max-width: 480px) {
                #gameMessageNotificationContainer {
                    top: 10px;
                    right: 10px;
                    width: calc(100vw - 20px);
                }
            }
        `;
        document.head.appendChild(style);

        container = document.createElement("div");
        container.id = "gameMessageNotificationContainer";
        container.setAttribute("aria-live", "polite");
        container.setAttribute("aria-atomic", "false");
        document.body.appendChild(container);
        return container;
    }

    function showNotification(username, message) {
        const toast = document.createElement("div");
        toast.className = "game-message-notification";
        toast.setAttribute("role", "status");

        const content = document.createElement("div");
        content.className = "game-message-notification-content";

        const sender = document.createElement("strong");
        sender.textContent = username;

        const preview = document.createElement("span");
        preview.textContent = message.startsWith("[[GIF]]")
            ? "Sent you a GIF"
            : message.replace(/\s+/g, " ").trim() || "Sent you a message";

        const close = document.createElement("button");
        close.type = "button";
        close.className = "game-message-notification-close";
        close.setAttribute("aria-label", "Dismiss message notification");
        close.textContent = "×";
        close.addEventListener("click", () => toast.remove());

        content.append(sender, preview);
        toast.append(content, close);
        getContainer().prepend(toast);

        window.setTimeout(() => toast.remove(), 8000);
        return sender;
    }

    async function showIncomingMessage(message) {
        if (!message || message.recipient_id !== currentUserId) return;
        if (message.sender_id === currentUserId) return;
        if (message.id && seenMessageIds.has(message.id)) return;

        if (message.id) {
            seenMessageIds.add(message.id);
            if (seenMessageIds.size > 100) {
                seenMessageIds.delete(seenMessageIds.values().next().value);
            }
        }

        const sender = showNotification(
            "New message",
            typeof message.message === "string" ? message.message : ""
        );

        try {
            const { data, error } = await supabase.rpc("find_username_by_id", {
                search_user_id: message.sender_id
            });
            if (!error && data?.[0]?.username && message.recipient_id === currentUserId) {
                sender.textContent = data[0].username;
            }
        } catch (error) {
            console.warn("Could not load message sender username:", error);
        }
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