// PRIVATE MESSAGES
// =========================================

const messagesButton = document.getElementById("messagesButton");
const messagesOverlay = document.getElementById("messagesOverlay");
const closeMessages = document.getElementById("closeMessages");
const conversationList = document.getElementById("conversationList");
const privateMessages = document.getElementById("privateMessages");
const privateChatUsername = document.getElementById("privateChatUsername");
const privateChatStatus = document.getElementById("privateChatStatus");
const privateMessageForm = document.getElementById("privateMessageForm");
const privateMessageInput = document.getElementById("privateMessageInput");
const privateMessageSend = document.getElementById("privateMessageSend");
const unreadMessagesBadge = document.getElementById("unreadMessagesBadge");
const messageUserSearch = document.getElementById("messageUserSearch");
const enableMessageNotifications = document.getElementById("enableMessageNotifications");

let currentPrivateUser = null;
let privateMessagesChannel = null;
let typingTimeout = null;
let isTyping = false;
let audioContext = null;
let conversationData = [];
let conversationLoadSequence = 0;
let activeMessageUserId = null;

const GIF_PREFIX = "[[GIF]]";

const gifOptions = [
    { name: "Nope", url: "https://media.giphy.com/media/111ebonMs90YLu/giphy.gif" },
    { name: "Confused", url: "https://media.giphy.com/media/ICOgUNjpvO0PC/giphy.gif" },
    { name: "Laughing", url: "https://media.giphy.com/media/26ufdipQqU2lhNA4g/giphy.gif" },
    { name: "Excited", url: "https://media.giphy.com/media/5VKbvrjxpVJCM/giphy.gif" },
    { name: "Shocked", url: "https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif" },
    { name: "Clap", url: "https://media.giphy.com/media/3o6Zt4HU9uwXmXSAuI/giphy.gif" },
    { name: "What", url: "https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif" },
    { name: "Happy", url: "https://media.giphy.com/media/8fen5LSZcHQ5O/giphy.gif" },
    { name: "Cry", url: "https://media.giphy.com/media/xT9IgG50Fb7Mi0prBC/giphy.gif" }
];

const emojiCategories = {
    "Smileys": [
        "😀","😃","😄","😁","😆","😅","😂","🤣","😊","😇","🙂","🙃","😉","😌","😍","🥰","😘","😗","😙","😚","😋","😛","😝","😜","🤪","🤨","🧐","🤓","😎","🤩","🥳","😏","😒","😞","😔","😟","😕","🙁","☹️","😣","😖","😫","😩","🥺","😢","😭","😤","😠","😡","🤬","🤯","😳","🥵","🥶","😱","😨","😰","😥","😓","🤗","🤔","🫡","🤭","🤫","🤥","😶","😐","😑","😬","🙄","😯","😦","😧","😮","😲","🥱","😴","🤤","😪","😵","🤐","🤑","🤠","😈","👿","🤡","👻","💀","👽","🤖","🎃"
    ],
    "Gestures": [
        "👍","👎","👌","✌️","🤞","🤟","🤘","🤙","👈","👉","👆","👇","☝️","✋","🤚","🖐️","🖖","👋","🤏","💪","🙏","👏","🙌","👐","🤝","🫶","👊","✍️","💅","🤳"
    ],
    "Hearts": [
        "❤️","🧡","💛","💚","💙","💜","🖤","🤍","🤎","💔","❣️","💕","💞","💓","💗","💖","💘","💝","💟","❤️‍🔥","💯","✨","💫","⭐","🌟","🔥"
    ],
    "Games": [
        "🎮","🕹️","🎯","🏆","🥇","🥈","🥉","🎲","⚽","🏀","🏈","⚾","🎸","🎧","🎵","🎶","💻","🖥️","📱","⌨️","🖱️","🚀","💎","💰","🎁","🎉","🎊"
    ],
    "Symbols": [
        "✅","❌","⚡","❗","❓","‼️","⁉️","⭕","🚫","🔴","🟠","🟡","🟢","🔵","🟣","⚫","⚪","🟤","🔺","🔻","▶️","⏸️","⏩","⏪","🔔","🔕","✔️","☑️","♻️","⚠️"
    ]
};

function safeUser(user) {
    return user && user.id ? user : null;
}

async function findUserByUsername(username) {
    const { data, error } = await supabaseClient.rpc("find_user_by_username", {
        search_username: username
    });

    if (error) {
        console.error("User search error:", error);
        return null;
    }

    return data?.[0] || null;
}

function isMessagesOpen() {
    return messagesOverlay?.classList.contains("open");
}

function isWindowFocused() {
    return document.visibilityState === "visible" && document.hasFocus();
}

function getMessagePreview(value) {
    if (!value) return "";
    if (value.startsWith(GIF_PREFIX)) return "GIF";
    return value.replace(/\s+/g, " ").trim();
}

function getAvatarLetter(username) {
    return (username || "?").trim().charAt(0).toUpperCase() || "?";
}

function formatMessageTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const sameDay = date.toDateString() === now.toDateString();

    if (sameDay) {
        return date.toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit"
        });
    }

    return date.toLocaleDateString([], {
        month: "short",
        day: "numeric"
    }) + " " + date.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit"
    });
}

function escapePrivateHTML(text) {
    const div = document.createElement("div");
    div.textContent = text ?? "";
    return div.innerHTML;
}

function createNotificationSound() {
    try {
        audioContext ||= new (window.AudioContext || window.webkitAudioContext)();

        if (audioContext.state === "suspended") {
            audioContext.resume();
        }

        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();

        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(660, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(
            880,
            audioContext.currentTime + 0.09
        );

        gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(
            0.08,
            audioContext.currentTime + 0.015
        );
        gain.gain.exponentialRampToValueAtTime(
            0.0001,
            audioContext.currentTime + 0.16
        );

        oscillator.connect(gain);
        gain.connect(audioContext.destination);

        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.17);
    } catch (_) {}
}

function updateNotificationButton() {
    if (!enableMessageNotifications) return;

    if (!("Notification" in window)) {
        enableMessageNotifications.hidden = true;
        return;
    }

    if (Notification.permission === "granted") {
        enableMessageNotifications.textContent = "✓ Notifications On";
        enableMessageNotifications.classList.add("enabled");
        enableMessageNotifications.title =
            "Browser notifications are enabled for incoming texts.";
    } else if (Notification.permission === "denied") {
        enableMessageNotifications.textContent = "Notifications Blocked";
        enableMessageNotifications.classList.remove("enabled");
        enableMessageNotifications.title =
            "Allow notifications for this site in your browser settings.";
    } else {
        enableMessageNotifications.textContent = "🔔 Enable Notifications";
        enableMessageNotifications.classList.remove("enabled");
        enableMessageNotifications.title =
            "Allow browser notifications for incoming texts.";
    }
}

async function requestMessageNotifications() {
    if (!("Notification" in window)) return;

    try {
        const permission = await Notification.requestPermission();

        updateNotificationButton();

        if (permission === "granted") {
            showMessageToast(
                "Notifications enabled",
                "You will be alerted when new messages arrive.",
                null,
                false
            );
        }
    } catch (error) {
        console.error("Notification permission error:", error);
    }
}

function showMessageToast(username, message, messageId, allowOpen = true) {
    let container = document.getElementById(
        "messageNotificationContainer"
    );

    if (!container) {
        container = document.createElement("div");
        container.id = "messageNotificationContainer";
        container.className = "message-notification-container";
        document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = "message-notification";

    if (messageId) {
        toast.dataset.messageId = messageId;
    }

    const avatar = document.createElement("div");
    avatar.className = "message-notification-avatar";
    avatar.textContent = getAvatarLetter(username);

    const content = document.createElement("div");
    content.className = "message-notification-content";

    const name = document.createElement("strong");
    name.textContent = username || "New message";

    const preview = document.createElement("span");
    preview.textContent = getMessagePreview(message);

    content.append(name, preview);

    const actions = document.createElement("div");
    actions.className = "message-notification-actions";

    if (allowOpen) {
        const openButton = document.createElement("button");

        openButton.type = "button";
        openButton.className = "message-notification-open";
        openButton.textContent = "Open";

        openButton.addEventListener("click", async () => {
            toast.remove();

            if (messagesOverlay) {
                messagesOverlay.classList.add("open");
            }

            await loadConversations();

            if (messageId) {
                const conversation = conversationData.find(
                    item => item.latest?.id === messageId
                );

                if (conversation) {
                    await openPrivateConversation(
                        conversation.userId,
                        conversation.username
                    );
                }
            }
        });

        actions.appendChild(openButton);
    }

    const closeButton = document.createElement("button");

    closeButton.type = "button";
    closeButton.className = "message-notification-close";
    closeButton.textContent = "×";
    closeButton.setAttribute(
        "aria-label",
        "Dismiss notification"
    );

    closeButton.addEventListener("click", () => {
        toast.remove();
    });

    actions.appendChild(closeButton);

    toast.append(avatar, content, actions);
    container.prepend(toast);

    requestAnimationFrame(() => {
        toast.classList.add("show");
    });

    setTimeout(() => {
        toast.classList.remove("show");

        setTimeout(() => {
            toast.remove();
        }, 250);
    }, 6500);
}

function showBrowserMessageNotification(username, message) {
    if (
        !("Notification" in window) ||
        Notification.permission !== "granted"
    ) {
        return;
    }

    try {
        const notification = new Notification(
            `New message from ${username}`,
            {
                body: getMessagePreview(message),
                tag: "gamehub-private-message",
                renotify: true
            }
        );

        notification.onclick = () => {
            window.focus();

            if (messagesOverlay) {
                messagesOverlay.classList.add("open");
            }

            notification.close();
        };
    } catch (_) {}
}

function scrollPrivateMessages() {
    if (privateMessages) {
        privateMessages.scrollTop = privateMessages.scrollHeight;
    }
}

function isGifMessage(value) {
    return typeof value === "string" &&
        value.startsWith(GIF_PREFIX);
}

function getGifUrl(value) {
    return value.slice(GIF_PREFIX.length).trim();
}

function isSafeGifUrl(url) {
    try {
        const parsed = new URL(url);

        if (parsed.protocol !== "https:") {
            return false;
        }

        return [
            "media.giphy.com",
            "i.giphy.com",
            "media.tenor.com",
            "c.tenor.com"
        ].includes(parsed.hostname);
    } catch (_) {
        return false;
    }
}

function appendMessageContent(container, messageText) {
    if (
        isGifMessage(messageText) &&
        isSafeGifUrl(getGifUrl(messageText))
    ) {
        const img = document.createElement("img");

        img.className = "private-message-gif";
        img.src = getGifUrl(messageText);
        img.alt = "GIF";
        img.loading = "lazy";
        img.referrerPolicy = "no-referrer";

        img.addEventListener("error", () => {
            img.replaceWith(
                document.createTextNode("GIF could not be loaded.")
            );
        });

        container.appendChild(img);
        return;
    }

    const text = document.createElement("div");

    text.className = "private-message-text";
    text.textContent = messageText || "";

    container.appendChild(text);
}

function addPrivateMessage(message, currentUserId) {
    if (!message?.id || !privateMessages) {
        return false;
    }

    const messageId = String(message.id);

    if (
        privateMessages.querySelector(
            `[data-message-id="${CSS.escape(messageId)}"]`
        )
    ) {
        return false;
    }

    const empty = privateMessages.querySelector(
        ".private-empty"
    );

    if (empty) {
        empty.remove();
    }

    const wrapper = document.createElement("div");

    wrapper.className = "private-message";
    wrapper.dataset.messageId = messageId;

    const mine = message.sender_id === currentUserId;

    if (mine) {
        wrapper.classList.add("mine");
    }

    const bubble = document.createElement("div");
    bubble.className = "private-message-bubble";

    appendMessageContent(
        bubble,
        message.message || ""
    );

    const meta = document.createElement("div");
    meta.className = "private-message-meta";

    const time = document.createElement("span");
    time.className = "private-message-time";
    time.textContent = formatMessageTime(
        message.created_at
    );

    meta.appendChild(time);
    bubble.appendChild(meta);
    wrapper.appendChild(bubble);
    privateMessages.appendChild(wrapper);

    return true;
}

async function loadPrivateMessages(
    currentUserId,
    otherUserId
) {
    if (!privateMessages) return;

    privateMessages.innerHTML =
        `<div class="messages-loading">Loading messages...</div>`;

    const { data, error } = await supabaseClient
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
            `<div class="messages-loading">Could not load messages.</div>`;

        return;
    }

    privateMessages.innerHTML = "";

    if (!data?.length) {
        privateMessages.innerHTML = `
            <div class="private-empty">
                <div class="private-empty-icon">💬</div>
                <h3>No messages yet</h3>
                <p>Send the first message.</p>
            </div>
        `;

        return;
    }

    data.forEach(message => {
        addPrivateMessage(message, currentUserId);
    });

    scrollPrivateMessages();
}

async function loadConversationUser(
    userId,
    conversation
) {
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

        return null;
    }

    const username =
        data?.[0]?.username ||
        "Unknown User";

    conversation.username = username;

    return conversation;
}

function renderConversations(filter = "") {
    if (!conversationList) return;

    const search = filter
        .trim()
        .toLowerCase();

    const filtered = conversationData.filter(
        item =>
            !search ||
            item.username
                .toLowerCase()
                .includes(search) ||
            getMessagePreview(
                item.latest?.message
            )
                .toLowerCase()
                .includes(search)
    );

    conversationList.innerHTML = "";

    if (!filtered.length) {
        conversationList.innerHTML =
            `<div class="messages-loading">${
                conversationData.length
                    ? "No conversations match your search."
                    : "No conversations yet."
            }</div>`;

        return;
    }

    filtered.forEach(conversation => {
        const item = document.createElement("button");

        item.type = "button";
        item.className = "conversation-item";
        item.dataset.userId = conversation.userId;

        if (
            currentPrivateUser?.id ===
            conversation.userId
        ) {
            item.classList.add("active");
        }

        const avatar = document.createElement("span");

        avatar.className = "conversation-avatar";
        avatar.textContent =
            getAvatarLetter(
                conversation.username
            );

        const body = document.createElement("span");
        body.className = "conversation-main";

        const top = document.createElement("span");
        top.className = "conversation-top";

        const name = document.createElement("strong");
        name.textContent =
            conversation.username;

        const time = document.createElement("time");
        time.textContent =
            formatMessageTime(
                conversation.latest.created_at
            );

        top.append(name, time);

        const preview = document.createElement("span");
        preview.className =
            "conversation-preview";

        preview.textContent =
            getMessagePreview(
                conversation.latest.message
            );

        body.append(top, preview);
        item.append(avatar, body);

        if (conversation.unread > 0) {
            const unread =
                document.createElement("span");

            unread.className =
                "conversation-unread";

            unread.textContent =
                conversation.unread > 99
                    ? "99+"
                    : conversation.unread;

            item.appendChild(unread);
        }

        item.addEventListener(
            "click",
            () =>
                openPrivateConversation(
                    conversation.userId,
                    conversation.username
                )
        );

        conversationList.appendChild(item);
    });
}

async function loadConversations() {
    const requestId = ++conversationLoadSequence;
    const user = await getCurrentUser();

    if (requestId !== conversationLoadSequence) return;

    if (!safeUser(user) || !conversationList) {
        conversationData = [];
        updateUnreadCount();
        return;
    }

    conversationList.innerHTML =
        `<div class="messages-loading">Loading conversations...</div>`;

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
        if (requestId !== conversationLoadSequence) return;

        console.error(
            "Could not load conversations:",
            error
        );

        conversationData = [];

        conversationList.innerHTML =
            `<div class="messages-loading">Could not load messages.</div>`;

        return;
    }

    if (requestId !== conversationLoadSequence) return;

    const map = new Map();

    (data || []).forEach(message => {
        const otherUserId =
            message.sender_id === user.id
                ? message.recipient_id
                : message.sender_id;

        if (!map.has(otherUserId)) {
            map.set(otherUserId, {
                userId: otherUserId,
                latest: message,
                unread: 0,
                username: "Unknown User"
            });
        }

        if (
            message.recipient_id === user.id &&
            !message.read_at
        ) {
            map.get(otherUserId).unread++;
        }
    });

    const nextConversationData =
        Array.from(map.values());

    await Promise.all(
        nextConversationData.map(
            conversation =>
                loadConversationUser(
                    conversation.userId,
                    conversation
                )
        )
    );

    if (requestId !== conversationLoadSequence) return;

    conversationData = nextConversationData;

    conversationData.sort(
        (a, b) =>
            new Date(
                b.latest.created_at
            ) -
            new Date(
                a.latest.created_at
            )
    );

    renderConversations(
        messageUserSearch?.value || ""
    );

    updateUnreadCount();
}

async function openPrivateConversation(
    userId,
    username
) {
    const user = await getCurrentUser();

    if (!safeUser(user)) return;

    currentPrivateUser = {
        id: userId,
        username
    };

    if (privateChatUsername) {
        privateChatUsername.textContent =
            username;
    }

    if (privateChatStatus) {
        privateChatStatus.textContent =
            "Private conversation";
    }

    if (privateMessageInput) {
        privateMessageInput.disabled = false;
        privateMessageInput.focus();
    }

    if (privateMessageSend) {
        privateMessageSend.disabled = false;
    }

    await loadPrivateMessages(
        user.id,
        userId
    );

    await markMessagesRead(
        user.id,
        userId
    );

    await loadConversations();
    await updateUnreadCount();
}

async function markMessagesRead(
    currentUserId,
    otherUserId
) {
    const { error } = await supabaseClient.rpc(
        "mark_private_messages_read",
        { p_sender_id: otherUserId }
    );

    if (error) {
        console.error(
            "Could not mark messages read:",
            error
        );
        return;
    }

    const conversation = conversationData.find(
        item => item.userId === otherUserId
    );

    if (conversation) {
        conversation.unread = 0;
    }

    updateUnreadCount();
}

function updateUnreadCount() {
    if (!unreadMessagesBadge) return;

    const count = conversationData.reduce(
        (total, conversation) =>
            total + (Number(conversation.unread) || 0),
        0
    );

    if (count > 0) {
        unreadMessagesBadge.textContent = count > 99 ? "99+" : count;
        unreadMessagesBadge.setAttribute(
            "aria-label",
            `${count} unread ${count === 1 ? "text" : "texts"}`
        );

        unreadMessagesBadge.classList.add(
            "visible"
        );
    } else {
        unreadMessagesBadge.textContent = "0";
        unreadMessagesBadge.removeAttribute("aria-label");

        unreadMessagesBadge.classList.remove(
            "visible"
        );
    }
}

function sendTypingBroadcast() {
    if (
        !privateMessagesChannel ||
        !currentPrivateUser
    ) {
        return;
    }

    getCurrentUser().then(user => {
        if (!user) return;

        privateMessagesChannel.send({
            type: "broadcast",
            event: "typing",
            payload: {
                sender_id: user.id,
                recipient_id:
                    currentPrivateUser.id,
                username:
                    user.user_metadata?.username ||
                    "Someone",
                typing: true
            }
        }).catch(() => {});
    });
}

function setupTyping() {
    if (!privateMessageInput) return;

    privateMessageInput.addEventListener(
        "input",
        () => {
            if (
                !currentPrivateUser ||
                !privateMessageInput.value.trim()
            ) {
                return;
            }

            sendTypingBroadcast();

            isTyping = true;

            clearTimeout(typingTimeout);

            typingTimeout = setTimeout(() => {
                isTyping = false;
            }, 1200);
        }
    );
}

function setTypingStatus(
    username,
    visible
) {
    if (!privateChatStatus) return;

    if (
        visible &&
        currentPrivateUser?.username === username
    ) {
        privateChatStatus.textContent =
            `${username} is typing...`;
    } else if (currentPrivateUser) {
        privateChatStatus.textContent =
            "Private conversation";
    }
}

function setupPrivateMessageRealtime() {
    getCurrentUser().then(async user => {
        if (!safeUser(user)) return;

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
                    async payload => {
                        const message =
                            payload.new;

                        if (
                            !message ||
                            (
                                message.sender_id !==
                                    user.id &&
                                message.recipient_id !==
                                    user.id
                            )
                        ) {
                            return;
                        }

                        const incoming =
                            message.recipient_id ===
                            user.id;

                        const isCurrentConversation =
                            currentPrivateUser &&
                            (
                                message.sender_id ===
                                    currentPrivateUser.id ||
                                message.recipient_id ===
                                    currentPrivateUser.id
                            );

                        if (isCurrentConversation) {
                            const added =
                                addPrivateMessage(
                                    message,
                                    user.id
                                );

                            if (added) {
                                scrollPrivateMessages();
                            }

                            if (
                                incoming &&
                                isMessagesOpen() &&
                                isWindowFocused()
                            ) {
                                await markMessagesRead(
                                    user.id,
                                    message.sender_id
                                );
                            }
                        }

                        await loadConversations();
                        await updateUnreadCount();

                        if (incoming) {
                            const shouldToast =
                                !isMessagesOpen() ||
                                !isWindowFocused() ||
                                !isCurrentConversation;

                            const senderConversation =
                                conversationData.find(
                                    item =>
                                        item.userId ===
                                        message.sender_id
                                );

                            const senderName =
                                senderConversation?.username ||
                                "New message";

                            if (shouldToast) {
                                createNotificationSound();

                                showMessageToast(
                                    senderName,
                                    message.message,
                                    message.id,
                                    true
                                );

                                showBrowserMessageNotification(
                                    senderName,
                                    message.message
                                );
                            } else {
                                createNotificationSound();
                            }
                        }
                    }
                )
                .on(
                    "postgres_changes",
                    {
                        event: "UPDATE",
                        schema: "public",
                        table: "private_messages"
                    },
                    async payload => {
                        const message =
                            payload.new;

                        if (
                            !message ||
                            (
                                message.sender_id !==
                                    user.id &&
                                message.recipient_id !==
                                    user.id
                            )
                        ) {
                            return;
                        }

                        await loadConversations();
                        await updateUnreadCount();
                    }
                )
                .on(
                    "broadcast",
                    {
                        event: "typing"
                    },
                    payload => {
                        const data =
                            payload.payload || {};

                        if (
                            !currentPrivateUser ||
                            data.recipient_id !==
                                user.id
                        ) {
                            return;
                        }

                        if (
                            data.sender_id !==
                            currentPrivateUser.id
                        ) {
                            return;
                        }

                        setTypingStatus(
                            data.username,
                            Boolean(data.typing)
                        );

                        clearTimeout(
                            typingTimeout
                        );

                        typingTimeout =
                            setTimeout(() => {
                                setTypingStatus(
                                    data.username,
                                    false
                                );
                            }, 1400);
                    }
                )
                .subscribe(status => {
                    console.log(
                        "Private messages realtime:",
                        status
                    );
                });
    });
}

async function sendPrivateMessage(
    messageValue
) {
    const message =
        messageValue.trim();

    if (!message) return;

    const user =
        await getCurrentUser();

    if (
        !safeUser(user) ||
        !currentPrivateUser
    ) {
        return;
    }

    privateMessageSend.disabled = true;

    const { error } =
        await supabaseClient
            .from("private_messages")
            .insert({
                sender_id: user.id,
                recipient_id:
                    currentPrivateUser.id,
                message
            });

    if (error) {
        console.error(
            "Could not send private message:",
            error
        );

        showMessageToast(
            "Message failed",
            "Could not send your message.",
            null,
            false
        );
    } else {
        privateMessageInput.value = "";
    }

    privateMessageSend.disabled = false;
    privateMessageInput.focus();
}

function insertAtCursor(
    input,
    value
) {
    const start =
        input.selectionStart ??
        input.value.length;

    const end =
        input.selectionEnd ??
        input.value.length;

    input.value =
        input.value.slice(0, start) +
        value +
        input.value.slice(end);

    const cursor =
        start + value.length;

    input.focus();

    input.setSelectionRange(
        cursor,
        cursor
    );
}

function setupEmojiPicker() {
    if (
        !privateMessageForm ||
        !privateMessageInput ||
        privateMessageForm.querySelector(
            ".emoji-picker-container"
        )
    ) {
        return;
    }

    const container =
        document.createElement("div");

    container.className =
        "emoji-picker-container";

    const button =
        document.createElement("button");

    button.type = "button";
    button.className =
        "message-tool-button emoji-picker-toggle";
    button.textContent = "😊";
    button.title = "Emoji";
    button.setAttribute(
        "aria-label",
        "Open emoji picker"
    );
    button.setAttribute(
        "aria-expanded",
        "false"
    );

    const panel =
        document.createElement("div");

    panel.className =
        "emoji-picker-panel";

    panel.hidden = true;

    const top =
        document.createElement("div");

    top.className =
        "emoji-picker-header";

    top.innerHTML =
        `<strong>Emoji</strong>`;

    const close =
        document.createElement("button");

    close.type = "button";
    close.className =
        "picker-close-button";
    close.textContent = "×";

    top.appendChild(close);

    const search =
        document.createElement("input");

    search.className =
        "emoji-search";

    search.type = "search";
    search.placeholder =
        "Search emojis...";
    search.autocomplete = "off";

    const categories =
        document.createElement("div");

    categories.className =
        "emoji-categories";

    const grid =
        document.createElement("div");

    grid.className =
        "emoji-grid";

    let activeCategory =
        Object.keys(emojiCategories)[0];

    function renderEmojis(list) {
        grid.innerHTML = "";

        list.forEach(emoji => {
            const emojiButton =
                document.createElement("button");

            emojiButton.type = "button";
            emojiButton.className =
                "emoji-choice";
            emojiButton.textContent =
                emoji;
            emojiButton.title = emoji;

            emojiButton.addEventListener(
                "click",
                () =>
                    insertAtCursor(
                        privateMessageInput,
                        emoji
                    )
            );

            grid.appendChild(
                emojiButton
            );
        });
    }

    Object.keys(
        emojiCategories
    ).forEach(category => {
        const categoryButton =
            document.createElement("button");

        categoryButton.type = "button";
        categoryButton.className =
            "emoji-category";

        categoryButton.textContent =
            category;

        categoryButton.addEventListener(
            "click",
            () => {
                activeCategory =
                    category;

                search.value = "";

                categories
                    .querySelectorAll("button")
                    .forEach(item =>
                        item.classList.remove(
                            "active"
                        )
                    );

                categoryButton.classList.add(
                    "active"
                );

                renderEmojis(
                    emojiCategories[
                        category
                    ]
                );
            }
        );

        categories.appendChild(
            categoryButton
        );
    });

    categories.firstElementChild?.classList.add(
        "active"
    );

    search.addEventListener(
        "input",
        () => {
            const query =
                search.value
                    .trim()
                    .toLowerCase();

            if (!query) {
                renderEmojis(
                    emojiCategories[
                        activeCategory
                    ]
                );

                return;
            }

            renderEmojis(
                Object.values(
                    emojiCategories
                )
                    .flat()
                    .filter(
                        emoji =>
                            emoji.includes(
                                query
                            )
                    )
            );
        }
    );

    function closePicker() {
        panel.hidden = true;

        button.setAttribute(
            "aria-expanded",
            "false"
        );
    }

    button.addEventListener(
        "click",
        event => {
            event.stopPropagation();

            const open =
                !panel.hidden;

            closeAllPickers();

            panel.hidden = open;

            button.setAttribute(
                "aria-expanded",
                String(!open)
            );
        }
    );

    close.addEventListener(
        "click",
        closePicker
    );

    panel.addEventListener(
        "click",
        event =>
            event.stopPropagation()
    );

    panel.append(
        top,
        search,
        categories,
        grid
    );

    container.append(
        button,
        panel
    );

    privateMessageForm.insertBefore(
        container,
        privateMessageInput
    );

    renderEmojis(
        emojiCategories[
            activeCategory
        ]
    );
}

function setupGifPicker() {
    if (
        !privateMessageForm ||
        !privateMessageInput ||
        privateMessageForm.querySelector(
            ".gif-picker-container"
        )
    ) {
        return;
    }

    const container =
        document.createElement("div");

    container.className =
        "gif-picker-container";

    const button =
        document.createElement("button");

    button.type = "button";
    button.className =
        "message-tool-button gif-picker-toggle";
    button.textContent = "GIF";
    button.title = "GIFs";

    button.setAttribute(
        "aria-label",
        "Open GIF picker"
    );

    button.setAttribute(
        "aria-expanded",
        "false"
    );

    const panel =
        document.createElement("div");

    panel.className =
        "gif-picker-panel";

    panel.hidden = true;

    const top =
        document.createElement("div");

    top.className =
        "gif-picker-header";

    top.innerHTML =
        `<strong>GIFs</strong><span>Pick a reaction</span>`;

    const grid =
        document.createElement("div");

    grid.className =
        "gif-grid";

    gifOptions.forEach(gif => {
        const choice =
            document.createElement("button");

        choice.type = "button";
        choice.className =
            "gif-choice";
        choice.title =
            gif.name;

        const img =
            document.createElement("img");

        img.src = gif.url;
        img.alt = gif.name;
        img.loading = "lazy";
        img.referrerPolicy =
            "no-referrer";

        const label =
            document.createElement("span");

        label.textContent =
            gif.name;

        choice.append(
            img,
            label
        );

        choice.addEventListener(
            "click",
            () => {
                panel.hidden = true;

                button.setAttribute(
                    "aria-expanded",
                    "false"
                );

                sendPrivateMessage(
                    GIF_PREFIX +
                    gif.url
                );
            }
        );

        grid.appendChild(
            choice
        );
    });

    const urlRow =
        document.createElement("div");

    urlRow.className =
        "gif-url-row";

    const urlInput =
        document.createElement("input");

    urlInput.type = "url";
    urlInput.placeholder =
        "Paste a Giphy/Tenor GIF URL...";

    const urlSend =
        document.createElement("button");

    urlSend.type = "button";
    urlSend.textContent =
        "Send";

    urlSend.addEventListener(
        "click",
        () => {
            const url =
                urlInput.value.trim();

            if (!isSafeGifUrl(url)) {
                urlInput.setCustomValidity(
                    "Use a Giphy or Tenor GIF URL."
                );

                urlInput.reportValidity();

                return;
            }

            urlInput.setCustomValidity("");
            urlInput.value = "";

            panel.hidden = true;

            button.setAttribute(
                "aria-expanded",
                "false"
            );

            sendPrivateMessage(
                GIF_PREFIX + url
            );
        }
    );

    urlRow.append(
        urlInput,
        urlSend
    );

    panel.append(
        top,
        grid,
        urlRow
    );

    container.append(
        button,
        panel
    );

    privateMessageForm.insertBefore(
        container,
        privateMessageInput
    );

    button.addEventListener(
        "click",
        event => {
            event.stopPropagation();

            const open =
                !panel.hidden;

            closeAllPickers();

            panel.hidden = open;

            button.setAttribute(
                "aria-expanded",
                String(!open)
            );
        }
    );

    panel.addEventListener(
        "click",
        event =>
            event.stopPropagation()
    );
}

function closeAllPickers() {
    document
        .querySelectorAll(
            ".emoji-picker-panel, .gif-picker-panel"
        )
        .forEach(panel => {
            panel.hidden = true;
        });

    document
        .querySelectorAll(
            ".emoji-picker-toggle, .gif-picker-toggle"
        )
        .forEach(button => {
            button.setAttribute(
                "aria-expanded",
                "false"
            );
        });
}

function setupMessageUI() {
    setupEmojiPicker();
    setupGifPicker();
    setupTyping();

    document.addEventListener(
        "click",
        event => {
            if (
                !event.target.closest(
                    ".emoji-picker-container, .gif-picker-container"
                )
            ) {
                closeAllPickers();
            }
        }
    );

    document.addEventListener(
        "keydown",
        event => {
            if (event.key === "Escape") {
                closeAllPickers();
            }
        }
    );

    if (messageUserSearch) {
        messageUserSearch.addEventListener(
            "input",
            () =>
                renderConversations(
                    messageUserSearch.value
                )
        );
    }

    if (enableMessageNotifications) {
        enableMessageNotifications.addEventListener(
            "click",
            requestMessageNotifications
        );

        updateNotificationButton();
    }
}

if (messagesButton) {
    messagesButton.addEventListener(
        "click",
        async () => {
            const user =
                await getCurrentUser();

            if (!safeUser(user)) {
                alert(
                    "Please log in to use messages."
                );

                if (
                    typeof loginOverlay !==
                        "undefined" &&
                    loginOverlay
                ) {
                    loginOverlay.classList.add(
                        "open"
                    );
                }

                return;
            }

            if (
                typeof accountMenu !==
                    "undefined" &&
                accountMenu
            ) {
                accountMenu.classList.remove(
                    "open"
                );
            }

            messagesOverlay?.classList.add(
                "open"
            );

            await loadConversations();
            await updateUnreadCount();

            privateMessageInput?.focus();
        }
    );
}

closeMessages?.addEventListener(
    "click",
    () =>
        messagesOverlay?.classList.remove(
            "open"
        )
);

messagesOverlay?.addEventListener(
    "click",
    event => {
        if (
            event.target ===
            messagesOverlay
        ) {
            messagesOverlay.classList.remove(
                "open"
            );
        }
    }
);

privateMessageForm?.addEventListener(
    "submit",
    event => {
        event.preventDefault();

        sendPrivateMessage(
            privateMessageInput.value
        );
    }
);

privateMessageInput?.addEventListener(
    "keydown",
    event => {
        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {
            event.preventDefault();

            privateMessageForm?.requestSubmit();
        }
    }
);

async function refreshMessageState() {
    const user = await getCurrentUser();
    if (!safeUser(user)) return;

    if (currentPrivateUser && isMessagesOpen()) {
        await markMessagesRead(
            user.id,
            currentPrivateUser.id
        );
    }

    await loadConversations();
}

document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
        refreshMessageState();
    }
});

window.addEventListener("focus", refreshMessageState);

setupMessageUI();

supabaseClient.auth.onAuthStateChange((_event, session) => {
    const nextUserId = session?.user?.id || null;
    if (nextUserId === activeMessageUserId) return;

    activeMessageUserId = nextUserId;

    window.setTimeout(async () => {
        if (!nextUserId) {
            conversationLoadSequence++;
            conversationData = [];
            currentPrivateUser = null;
            updateUnreadCount();

            if (privateMessagesChannel) {
                const channel = privateMessagesChannel;
                privateMessagesChannel = null;
                await supabaseClient.removeChannel(channel);
            }

            if (conversationList) {
                conversationList.innerHTML =
                    `<div class="messages-loading">Sign in to view your texts.</div>`;
            }

            return;
        }

        setupPrivateMessageRealtime();
        await loadConversations();
    }, 0);
});