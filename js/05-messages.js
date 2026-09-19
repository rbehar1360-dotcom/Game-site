// PRIVATE MESSAGES / INBOX
// =========================================

const messagesButton =
    document.getElementById("messagesButton");

const messagesOverlay =
    document.getElementById("messagesOverlay");

const closeMessages =
    document.getElementById("closeMessages");

const conversationList =
    document.getElementById("conversationList");

const privateMessages =
    document.getElementById("privateMessages");

const privateChatUsername =
    document.getElementById("privateChatUsername");

const privateChatStatus =
    document.getElementById("privateChatStatus");

const privateMessageForm =
    document.getElementById("privateMessageForm");

const privateMessageInput =
    document.getElementById("privateMessageInput");

const privateMessageSend =
    document.getElementById("privateMessageSend");

const unreadMessagesBadge =
    document.getElementById("unreadMessagesBadge");


let currentPrivateUser = null;
let privateMessagesChannel = null;


// =========================================
// OPEN INBOX
// =========================================

if (messagesButton) {
    messagesButton.addEventListener("click", async function () {
        const user = await getCurrentUser();

        if (!user) {
            alert("Please log in to use messages.");

            if (loginOverlay) {
                loginOverlay.classList.add("open");
            }

            return;
        }

        if (accountMenu) {
            accountMenu.classList.remove("open");
        }

        if (messagesOverlay) {
            messagesOverlay.classList.add("open");
        }

        await loadConversations();
        await updateUnreadCount();
    });
} else {
    console.error(
        "Private messaging error: #messagesButton was not found."
    );
}
// =========================================
// CLOSE INBOX
// =========================================

if (closeMessages) {
    closeMessages.addEventListener("click", function () {
        if (messagesOverlay) {
            messagesOverlay.classList.remove("open");
        }
    });
}


// =========================================
// CLICK OUTSIDE
// =========================================

if (messagesOverlay) {
    messagesOverlay.addEventListener("click", function (event) {
        if (event.target === messagesOverlay) {
            messagesOverlay.classList.remove("open");
        }
    });
}

// =========================================
// FIND USER
// =========================================

async function findUserByUsername(username) {
    const { data, error } = await supabaseClient.rpc(
        "find_user_by_username",
        {
            search_username: username
        }
    );

    if (error) {
        console.error("User search error:", error);
        return null;
    }

    if (!data || data.length === 0) {
        return null;
    }

    return data[0];
}

// =========================================
// LOAD CONVERSATIONS
// =========================================

async function loadConversations() {

    const user = await getCurrentUser();

    if (!user) return;


    conversationList.innerHTML =
        `<div class="messages-loading">
            Loading conversations...
        </div>`;


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

        console.error(
            "Could not load conversations:",
            error
        );

        conversationList.innerHTML =
            `<div class="messages-loading">
                Could not load messages.
            </div>`;

        return;

    }


    /*
     * Build one conversation per user.
     */

    const conversations = new Map();


    data.forEach(message => {

        const otherUserId =
            message.sender_id === user.id
                ? message.recipient_id
                : message.sender_id;


        if (!conversations.has(otherUserId)) {

            conversations.set(
                otherUserId,
                {
                    userId: otherUserId,
                    latest: message,
                    unread: 0
                }
            );

        }


        if (
            message.recipient_id === user.id &&
            !message.read_at
        ) {

            conversations.get(
                otherUserId
            ).unread++;

        }

    });


    conversationList.innerHTML = "";


    if (conversations.size === 0) {

        conversationList.innerHTML =
            `<div class="messages-loading">
                No conversations yet.
            </div>`;

        return;

    }


    conversations.forEach(conversation => {

        const message =
            conversation.latest;


        const otherUserId =
            conversation.userId;


        /*
         * We don't have the other user's username
         * directly in private_messages, so get it
         * from their auth profile.
         */

        loadConversationUser(
            otherUserId,
            conversation
        );

    });

}


// =========================================
// LOAD USERNAME FOR CONVERSATION
// =========================================

async function loadConversationUser(
    userId,
    conversation
) {

    /*
     * We use the private-message participants
     * to build the inbox.
     *
     * For now, search by UUID through a secure RPC.
     */

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

        return;

    }


    const username =
        data?.[0]?.username || "Unknown User";


    const item =
        document.createElement("div");

    item.className =
        "conversation-item";


    item.dataset.userId =
        userId;


    const unreadHTML =
        conversation.unread > 0
            ? `<span class="conversation-unread">
                    ${conversation.unread}
               </span>`
            : "";


    item.innerHTML = `
        <div class="conversation-name">
            ${username}
            ${unreadHTML}
        </div>

        <div class="conversation-preview">
            ${escapePrivateHTML(
                conversation.latest.message
            )}
        </div>
    `;


    item.addEventListener(
        "click",
        function () {

            openPrivateConversation(
                userId,
                username
            );

        }
    );


    conversationList.appendChild(item);

}


// =========================================
// OPEN CONVERSATION
// =========================================

async function openPrivateConversation(
    userId,
    username
) {

    const user =
        await getCurrentUser();

    if (!user) return;


    currentPrivateUser = {
        id: userId,
        username: username
    };


    privateChatUsername.textContent =
        username;

    privateChatStatus.textContent =
        "Private conversation";


    privateMessageInput.disabled =
        false;

    privateMessageSend.disabled =
        false;


    document
        .querySelectorAll(".conversation-item")
        .forEach(item => {

            item.classList.toggle(
                "active",
                item.dataset.userId === userId
            );

        });


    await loadPrivateMessages(
        user.id,
        userId
    );


    await markMessagesRead(
        user.id,
        userId
    );


    await loadConversations();

}


// =========================================
// LOAD PRIVATE MESSAGES
// =========================================

async function loadPrivateMessages(
    currentUserId,
    otherUserId
) {

    privateMessages.innerHTML =
        `<div class="messages-loading">
            Loading messages...
        </div>`;


    const { data, error } =
        await supabaseClient
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
            `<div class="messages-loading">
                Could not load messages.
            </div>`;

        return;

    }


    privateMessages.innerHTML = "";


    if (!data || data.length === 0) {

        privateMessages.innerHTML =
            `<div class="private-empty">
                <div class="private-empty-icon">
                    ✉️
                </div>

                <h3>No messages yet</h3>

                <p>
                    Send the first message.
                </p>
            </div>`;

        return;

    }


    data.forEach(message => {

        addPrivateMessage(
            message,
            currentUserId
        );

    });


    scrollPrivateMessages();

}


// =========================================
// DISPLAY PRIVATE MESSAGE
// =========================================

function addPrivateMessage(message, currentUserId) {
    if (!message || !message.id) return;

    // Prevent duplicate messages
    if (
        privateMessages.querySelector(
            `[data-message-id="${CSS.escape(String(message.id))}"]`
        )
    ) {
        return;
    }

    const wrapper = document.createElement("div");
    wrapper.className = "private-message";
    wrapper.dataset.messageId = message.id;

    const mine = message.sender_id === currentUserId;

    if (mine) {
        wrapper.classList.add("mine");
    }

    const bubble = document.createElement("div");
    bubble.className = "private-message-bubble";

    const content = document.createElement("div");
    content.textContent = message.message || "";

    const time = document.createElement("div");
    time.className = "private-message-time";

    time.textContent = new Date(
        message.created_at
    ).toLocaleString([], {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit"
    });

    bubble.append(content, time);
    wrapper.appendChild(bubble);
    privateMessages.appendChild(wrapper);
}
// =========================================
// GAME HUB EMOJI PICKER
// =========================================

(function setupEmojiPickers() {
    const emojiCategories = {
        "Smileys": [
            "😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣",
            "😊", "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰",
            "😘", "😗", "😙", "😚", "😋", "😛", "😝", "😜",
            "🤪", "🤨", "🧐", "🤓", "😎", "🤩", "🥳", "😏",
            "😒", "😞", "😔", "😟", "😕", "🙁", "☹️", "😣",
            "😖", "😫", "😩", "🥺", "😢", "😭", "😤", "😠",
            "😡", "🤬", "🤯", "😳", "🥵", "🥶", "😱", "😨",
            "😰", "😥", "😓", "🤗", "🤔", "🫡", "🤭", "🤫",
            "🤥", "😶", "😐", "😑", "😬", "🙄", "😯", "😦",
            "😧", "😮", "😲", "🥱", "😴", "🤤", "😪", "😵",
            "🤐", "🤑", "🤠", "😈", "👿", "🤡", "👻", "💀",
            "👽", "🤖", "🎃", "😺", "😸", "😹", "😻", "😼",
            "😽", "🙀", "😿", "😾"
        ],

        "Gestures": [
            "👍", "👎", "👌", "✌️", "🤞", "🤟", "🤘", "🤙",
            "👈", "👉", "👆", "👇", "☝️", "✋", "🤚", "🖐️",
            "🖖", "👋", "🤏", "💪", "🙏", "👏", "🙌", "👐",
            "🤝", "🫶", "👊", "✍️", "💅", "🤳"
        ],

        "Hearts": [
            "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍",
            "🤎", "💔", "❣️", "💕", "💞", "💓", "💗", "💖",
            "💘", "💝", "💟", "❤️‍🔥", "💯", "✨", "💫", "⭐",
            "🌟", "🔥"
        ],

        "Objects": [
            "🎮", "🕹️", "🎯", "🏆", "🥇", "🥈", "🥉", "🎲",
            "⚽", "🏀", "🏈", "⚾", "🎸", "🎧", "🎵", "🎶",
            "💻", "🖥️", "📱", "⌨️", "🖱️", "🔒", "🔑", "💡",
            "🚀", "💎", "💰", "🎁", "🎉", "🎊", "📌", "📢"
        ],

        "Symbols": [
            "✅", "❌", "⚡", "❗", "❓", "‼️", "⁉️", "⭕",
            "🚫", "🔴", "🟠", "🟡", "🟢", "🔵", "🟣", "⚫",
            "⚪", "🟤", "🔺", "🔻", "▶️", "⏸️", "⏩", "⏪",
            "🔔", "🔕", "✔️", "☑️", "♻️", "⚠️"
        ]
    };

    function createPicker(input, form) {
        if (!input || !form) return;

        if (form.querySelector(".emoji-picker-container")) {
            return;
        }

        const container = document.createElement("div");
        container.className = "emoji-picker-container";

        const button = document.createElement("button");
        button.type = "button";
        button.className = "emoji-picker-toggle";
        button.textContent = "😊";
        button.title = "Open emoji picker";
        button.setAttribute("aria-label", "Open emoji picker");
        button.setAttribute("aria-expanded", "false");

        const picker = document.createElement("div");
        picker.className = "emoji-picker-panel";
        picker.hidden = true;

        const header = document.createElement("div");
        header.className = "emoji-picker-header";

        const title = document.createElement("div");
        title.className = "emoji-picker-title";
        title.textContent = "Choose an emoji";

        const closeButton = document.createElement("button");
        closeButton.type = "button";
        closeButton.className = "emoji-picker-close";
        closeButton.textContent = "✕";
        closeButton.setAttribute("aria-label", "Close emoji picker");

        header.append(title, closeButton);

        const search = document.createElement("input");
        search.type = "search";
        search.className = "emoji-search";
        search.placeholder = "Search emojis...";
        search.autocomplete = "off";

        const categories = document.createElement("div");
        categories.className = "emoji-categories";

        const emojiGrid = document.createElement("div");
        emojiGrid.className = "emoji-grid";

        let activeCategory = Object.keys(emojiCategories)[0];

        function renderCategory(category) {
            activeCategory = category;
            emojiGrid.innerHTML = "";

            emojiCategories[category].forEach(emoji => {
                const emojiButton = document.createElement("button");

                emojiButton.type = "button";
                emojiButton.className = "emoji-choice";
                emojiButton.textContent = emoji;
                emojiButton.title = emoji;

                emojiButton.addEventListener("click", () => {
                    const start = input.selectionStart ?? input.value.length;
                    const end = input.selectionEnd ?? input.value.length;

                    input.value =
                        input.value.slice(0, start) +
                        emoji +
                        input.value.slice(end);

                    input.focus();

                    const cursorPosition = start + emoji.length;

                    input.setSelectionRange(
                        cursorPosition,
                        cursorPosition
                    );

                    // Intentionally stays open.
                });

                emojiGrid.appendChild(emojiButton);
            });
        }

        function renderCategories() {
            categories.innerHTML = "";

            Object.keys(emojiCategories).forEach(category => {
                const categoryButton = document.createElement("button");

                categoryButton.type = "button";
                categoryButton.className = "emoji-category";
                categoryButton.textContent = category;

                categoryButton.classList.toggle(
                    "active",
                    category === activeCategory
                );

                categoryButton.addEventListener("click", () => {
                    search.value = "";
                    renderCategory(category);

                    categories
                        .querySelectorAll(".emoji-category")
                        .forEach(button => {
                            button.classList.toggle(
                                "active",
                                button === categoryButton
                            );
                        });
                });

                categories.appendChild(categoryButton);
            });
        }

        search.addEventListener("input", () => {
            const query = search.value.toLowerCase().trim();

            if (!query) {
                renderCategory(activeCategory);
                return;
            }

            emojiGrid.innerHTML = "";

            Object.values(emojiCategories)
                .flat()
                .filter(emoji => emoji.includes(query))
                .forEach(emoji => {
                    const emojiButton = document.createElement("button");

                    emojiButton.type = "button";
                    emojiButton.className = "emoji-choice";
                    emojiButton.textContent = emoji;

                    emojiButton.addEventListener("click", () => {
                        const start = input.selectionStart ?? input.value.length;
                        const end = input.selectionEnd ?? input.value.length;

                        input.value =
                            input.value.slice(0, start) +
                            emoji +
                            input.value.slice(end);

                        input.focus();

                        const cursorPosition = start + emoji.length;

                        input.setSelectionRange(
                            cursorPosition,
                            cursorPosition
                        );
                    });

                    emojiGrid.appendChild(emojiButton);
                });
        });

        function closePicker() {
            picker.hidden = true;
            button.setAttribute("aria-expanded", "false");
        }

        function togglePicker() {
            const isOpen = !picker.hidden;

            document
                .querySelectorAll(".emoji-picker-panel")
                .forEach(otherPicker => {
                    if (otherPicker !== picker) {
                        otherPicker.hidden = true;
                    }
                });

            picker.hidden = isOpen;

            button.setAttribute(
                "aria-expanded",
                String(!isOpen)
            );

            if (!isOpen) {
                input.focus();
            }
        }

        button.addEventListener("click", event => {
            event.stopPropagation();
            togglePicker();
        });

        closeButton.addEventListener("click", event => {
            event.stopPropagation();
            closePicker();
            input.focus();
        });

        picker.addEventListener("click", event => {
            event.stopPropagation();
        });

        document.addEventListener("click", event => {
            if (
                !container.contains(event.target)
            ) {
                closePicker();
            }
        });

        document.addEventListener("keydown", event => {
            if (event.key === "Escape") {
                closePicker();
            }
        });

        renderCategories();
        renderCategory(activeCategory);

        picker.append(
            header,
            search,
            categories,
            emojiGrid
        );

        container.append(button, picker);

        form.insertBefore(container, input);
    }

    createPicker(
        document.getElementById("chatInput"),
        document.getElementById("chatForm")
    );

    createPicker(
        document.getElementById("privateMessageInput"),
        document.getElementById("privateMessageForm")
    );
})();

// =========================================
// SEND PRIVATE MESSAGE
// =========================================

privateMessageForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const message =
            privateMessageInput.value.trim();


        if (!message) return;


        const user =
            await getCurrentUser();


        if (!user) return;


        if (!currentPrivateUser) {

            alert(
                "Select a conversation first."
            );

            return;

        }


        privateMessageInput.disabled =
            true;

        privateMessageSend.disabled =
            true;


        const { error } =
            await supabaseClient
                .from("private_messages")
                .insert({
                    sender_id: user.id,
                    recipient_id:
                        currentPrivateUser.id,
                    message: message
                });


        if (error) {

            console.error(
                "Could not send private message:",
                error
            );

            alert(
                "Could not send message."
            );

        } else {

            privateMessageInput.value = "";

            await loadPrivateMessages(
                user.id,
                currentPrivateUser.id
            );

            await loadConversations();

        }


        privateMessageInput.disabled =
            false;

        privateMessageSend.disabled =
            false;

        privateMessageInput.focus();

    }
);


// =========================================
// MARK MESSAGES READ
// =========================================

async function markMessagesRead(
    currentUserId,
    otherUserId
) {

    const { error } =
        await supabaseClient
            .from("private_messages")
            .update({
                read_at: new Date().toISOString()
            })
            .eq(
                "recipient_id",
                currentUserId
            )
            .eq(
                "sender_id",
                otherUserId
            )
            .is(
                "read_at",
                null
            );


    if (error) {

        console.error(
            "Could not mark messages read:",
            error
        );

    }

}


// =========================================
// UNREAD COUNT
// =========================================

async function updateUnreadCount() {

    const user =
        await getCurrentUser();


    if (!user) return;


    const { count, error } =
        await supabaseClient
            .from("private_messages")
            .select(
                "*",
                {
                    count: "exact",
                    head: true
                }
            )
            .eq(
                "recipient_id",
                user.id
            )
            .is(
                "read_at",
                null
            );


    if (error) {

        console.error(
            "Could not get unread count:",
            error
        );

        return;

    }


    if (count > 0) {

        unreadMessagesBadge.textContent =
            count > 99 ? "99+" : count;

        unreadMessagesBadge.classList.add(
            "visible"
        );

    } else {

        unreadMessagesBadge.textContent =
            "0";

        unreadMessagesBadge.classList.remove(
            "visible"
        );

    }

}


// =========================================
// SCROLL
// =========================================

function scrollPrivateMessages() {

    privateMessages.scrollTop =
        privateMessages.scrollHeight;

}


// =========================================
// ESCAPE HTML
// =========================================

function escapePrivateHTML(text) {

    const div =
        document.createElement("div");

    div.textContent =
        text;

    return div.innerHTML;

}

// =========================================
// PRIVATE MESSAGE REALTIME
// =========================================

async function setupPrivateMessageRealtime() {

    const user = await getCurrentUser();

    if (!user) return;


    // Prevent duplicate subscriptions
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

                async function (payload) {

                    const message =
                        payload.new;


                    /*
                     * Ignore messages that don't
                     * involve the current user.
                     */

                    if (
                        message.sender_id !== user.id &&
                        message.recipient_id !== user.id
                    ) {
                        return;
                    }


                    /*
                     * If we're currently talking
                     * to this person, immediately
                     * display the message.
                     */

                    if (
                        currentPrivateUser &&
                        (
                            message.sender_id ===
                                currentPrivateUser.id
                            ||
                            message.recipient_id ===
                                currentPrivateUser.id
                        )
                    ) {

                        /*
                         * Don't duplicate our own
                         * message if we already loaded it.
                         */

                        const existingMessages =
                            privateMessages.querySelectorAll(
                                ".private-message"
                            );


                        if (existingMessages.length === 0) {

                            addPrivateMessage(
                                message,
                                user.id
                            );

                        } else {

                            /*
                             * Reloading is safer than
                             * trying to reconstruct the
                             * entire conversation state.
                             */

                            await loadPrivateMessages(
                                user.id,
                                currentPrivateUser.id
                            );

                        }


                        scrollPrivateMessages();

                    }


                    /*
                     * Refresh inbox previews and
                     * unread count.
                     */

                    await loadConversations();

                    await updateUnreadCount();

                }
            )

            .subscribe(function (status) {

                console.log(
                    "Private messages realtime:",
                    status
                );

            });

}


// =========================================
// START PRIVATE MESSAGE REALTIME
// =========================================

setupPrivateMessageRealtime();
// =========================================
