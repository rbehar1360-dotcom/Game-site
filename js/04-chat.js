// CHAT SYSTEM
// =========================================

const chatButton = document.getElementById("chatButton");
const chatOverlay = document.getElementById("chatOverlay");
const closeChat = document.getElementById("closeChat");

const chatMessages = document.getElementById("chatMessages");
const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");


// =========================================
// OPEN CHAT
// =========================================

chatButton.addEventListener("click", async function () {
    const user = await getCurrentUser();

    if (!user) {
        alert("Please log in to use chat!");
        loginOverlay.classList.add("open");
        return;
    }

    chatOverlay.classList.add("open");

    await loadChatMessages();

    chatInput.focus();
});


// =========================================
// CLOSE CHAT
// =========================================

closeChat.addEventListener("click", function () {
    chatOverlay.classList.remove("open");
});


// =========================================
// CLICK OUTSIDE CHAT
// =========================================

chatOverlay.addEventListener("click", function (event) {
    if (event.target === chatOverlay) {
        chatOverlay.classList.remove("open");
    }
});

const newMessageButton = document.getElementById("newMessageButton");

if (newMessageButton) {
    newMessageButton.addEventListener("click", async function () {
        // =========================================
// NEW MESSAGE MODAL
// =========================================

const newMessageButton = document.getElementById("newMessageButton");
const newMessageOverlay = document.getElementById("newMessageOverlay");
const closeNewMessage = document.getElementById("closeNewMessage");
const cancelNewMessage = document.getElementById("cancelNewMessage");
const newMessageForm = document.getElementById("newMessageForm");
const newMessageUsername = document.getElementById("newMessageUsername");
const newMessageError = document.getElementById("newMessageError");

function openNewMessageModal() {
    if (!newMessageOverlay) return;

    newMessageOverlay.classList.add("open");
    newMessageUsername.value = "";
    newMessageError.textContent = "";

    setTimeout(() => {
        newMessageUsername.focus();
    }, 100);
}

function closeNewMessageModal() {
    if (!newMessageOverlay) return;

    newMessageOverlay.classList.remove("open");
    newMessageForm.reset();
    newMessageError.textContent = "";
}

if (newMessageButton) {
    newMessageButton.addEventListener("click", async function () {
        const user = await getCurrentUser();

        if (!user) {
            alert("Please log in to use messages.");
            return;
        }

        openNewMessageModal();
    });
}

if (closeNewMessage) {
    closeNewMessage.addEventListener("click", closeNewMessageModal);
}

if (cancelNewMessage) {
    cancelNewMessage.addEventListener("click", closeNewMessageModal);
}

if (newMessageOverlay) {
    newMessageOverlay.addEventListener("click", function (event) {
        if (event.target === newMessageOverlay) {
            closeNewMessageModal();
        }
    });
}

document.addEventListener("keydown", function (event) {
    if (
        event.key === "Escape" &&
        newMessageOverlay &&
        newMessageOverlay.classList.contains("open")
    ) {
        closeNewMessageModal();
    }
});

if (newMessageForm) {
    newMessageForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const username = newMessageUsername.value.trim();

        if (!username) {
            newMessageError.textContent = "Enter a username first.";
            return;
        }

        newMessageError.textContent = "";
        newMessageUsername.disabled = true;

        const submitButton = newMessageForm.querySelector(
            ".new-message-submit"
        );

        submitButton.disabled = true;
        submitButton.textContent = "Searching...";

        try {
            const foundUser = await findUserByUsername(username);

            if (!foundUser) {
                newMessageError.textContent = "No user found with that username.";
                return;
            }

            const userId = foundUser.id || foundUser.user_id;
            const foundUsername = foundUser.username || username;

            if (!userId) {
                newMessageError.textContent = "This user could not be opened.";
                return;
            }

            closeNewMessageModal();
            await openPrivateConversation(userId, foundUsername);
        } catch (error) {
            console.error("New message error:", error);
            newMessageError.textContent = "Something went wrong. Try again.";
        } finally {
            newMessageUsername.disabled = false;
            submitButton.disabled = false;
            submitButton.textContent = "Continue";
        }
    });
}
// =========================================
// USER CATALOG
// =========================================

const showUserCatalog = document.getElementById("showUserCatalog");
const userCatalog = document.getElementById("userCatalog");
const userCatalogSearch = document.getElementById("userCatalogSearch");
const userCatalogList = document.getElementById("userCatalogList");
const backToMessageSearch = document.getElementById("backToMessageSearch");

let catalogUsers = [];

async function loadUserCatalog() {
    userCatalogList.innerHTML = `
        <p class="user-catalog-status">Loading users...</p>
    `;

    const { data, error } = await supabaseClient.rpc(
        "get_public_users"
    );

    console.log("Catalog users:", data);
    console.log("Catalog error:", error);

    if (error) {
        userCatalogList.innerHTML = `
            <p class="user-catalog-status">
                Could not load users.
            </p>
        `;
        return;
    }

    if (!Array.isArray(data) || data.length === 0) {
        userCatalogList.innerHTML = `
            <p class="user-catalog-status">
                No users found.
            </p>
        `;
        return;
    }

    catalogUsers = data.map(user => ({
        id: user.id,
        username: user.username || user.name || "Unknown User"
    }));

    renderUserCatalog(catalogUsers);
}

function renderUserCatalog(users) {
    userCatalogList.innerHTML = "";

    if (!users.length) {
        userCatalogList.innerHTML = `
            <p class="user-catalog-status">
                No users found.
            </p>
        `;
        return;
    }

    users.forEach(user => {
        const username = user.username || "Unknown User";
        const firstLetter = username.charAt(0).toUpperCase();

        const userButton = document.createElement("button");
        userButton.type = "button";
        userButton.className = "user-catalog-user";

        const avatar = document.createElement("span");
        avatar.className = "user-catalog-avatar";
        avatar.textContent = firstLetter;

        const info = document.createElement("span");
        info.className = "user-catalog-user-info";

        const name = document.createElement("span");
        name.className = "user-catalog-username";
        name.textContent = username;

        const label = document.createElement("span");
        label.className = "user-catalog-label";
        label.textContent = "Start a conversation";

        info.appendChild(name);
        info.appendChild(label);

        userButton.appendChild(avatar);
        userButton.appendChild(info);

        userButton.addEventListener("click", async function () {
            closeNewMessageModal();
            await openPrivateConversation(user.id, username);
        });

        userCatalogList.appendChild(userButton);
    });
}

if (showUserCatalog) {
    showUserCatalog.addEventListener("click", async function () {
        document.getElementById("newMessageForm").hidden = true;
        document.querySelector(".new-message-main-actions").hidden = true;
        document.getElementById("newMessageTitle").textContent = "Find a User";
        document.getElementById("newMessageSubtitle").textContent =
            "Browse or search registered users.";

        userCatalog.hidden = false;
        userCatalogSearch.value = "";

        await loadUserCatalog();

        setTimeout(() => {
            userCatalogSearch.focus();
        }, 100);
    });
}

if (backToMessageSearch) {
    backToMessageSearch.addEventListener("click", function () {
        userCatalog.hidden = true;
        document.getElementById("newMessageForm").hidden = false;
        document.querySelector(".new-message-main-actions").hidden = false;

        document.getElementById("newMessageTitle").textContent = "New Message";
        document.getElementById("newMessageSubtitle").textContent =
            "Search for a username or browse users.";
    });
}

if (userCatalogSearch) {
    userCatalogSearch.addEventListener("input", function () {
        const searchTerm = userCatalogSearch.value
            .trim()
            .toLowerCase();

        const filteredUsers = catalogUsers.filter(user =>
            (user.username || "").toLowerCase().includes(searchTerm)
        );

        renderUserCatalog(filteredUsers);
    });
}
        if (!username || !username.trim()) {
            return;
        }

        const user = await findUserByUsername(username.trim());

        if (!user) {
            alert("User not found.");
            return;
        }

        const userId = user.id || user.user_id;
        const foundUsername = user.username || username.trim();

        if (!userId) {
            alert("Could not find that user's ID.");
            return;
        }

        await openPrivateConversation(userId, foundUsername);
    });
}
// =========================================
// LOAD MESSAGES
// =========================================

async function loadChatMessages() {
    chatMessages.innerHTML = `
        <div class="chat-loading">
            Loading messages...
        </div>
    `;

    const { data, error } = await supabaseClient
        .from("chat_messages")
        .select("*")
        .eq("channel", "general")
        .order("created_at", {
            ascending: true
        })
        .limit(100);

    if (error) {
        console.error("Could not load chat:", error);

        chatMessages.innerHTML = `
            <div class="chat-loading">
                Could not load messages.
            </div>
        `;

        return;
    }

    chatMessages.innerHTML = "";

    if (!data || data.length === 0) {
        chatMessages.innerHTML = `
            <div class="chat-empty">
                No messages yet.
            </div>
        `;

        return;
    }

    data.forEach(message => {
        addChatMessage(message);
    });

    scrollChatToBottom();
}


// =========================================
// DISPLAY MESSAGE
// =========================================

function addChatMessage(message) {
    if (!message || !message.id) return;

    // Prevent duplicate messages
    if (
        chatMessages.querySelector(
            `[data-message-id="${CSS.escape(String(message.id))}"]`
        )
    ) {
        return;
    }

    const messageElement = document.createElement("div");
    messageElement.className = "chat-message";
    messageElement.dataset.messageId = message.id;

    const username = document.createElement("div");
    username.className = "leaderboard-username";

    const playerUsername = message.username || "User";

    username.textContent = playerUsername;
    username.dataset.userId = message.user_id || "";
    username.dataset.username = playerUsername;
    username.classList.add("clickable-profile");

    const content = document.createElement("div");
    content.className = "chat-message-content";

    // textContent safely displays emojis and prevents HTML injection
    content.textContent = message.content || "";

    const time = document.createElement("div");
    time.className = "chat-message-time";

    time.textContent = new Date(
        message.created_at
    ).toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit"
    });

    messageElement.append(username, content, time);
    chatMessages.appendChild(messageElement);
}

// =========================================
// SEND MESSAGE
// =========================================

chatForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const content = chatInput.value.trim();

    if (!content) {
        return;
    }

    const user = await getCurrentUser();

    if (!user) {
        alert("Please log in to send messages!");
        return;
    }

    const username =
        user.user_metadata?.username ||
        user.user_metadata?.display_name ||
        user.email?.split("@")[0] ||
        "User";

    chatInput.disabled = true;

    const { error } = await supabaseClient
        .from("chat_messages")
        .insert({
            user_id: user.id,
            username: username,
            content: content,
            channel: "general"
        });

    if (error) {
        console.error("Could not send message:", error);
        alert("Could not send message.");
    } else {
        chatInput.value = "";
    }

    chatInput.disabled = false;
    chatInput.focus();
});


// =========================================
// REALTIME CHAT
// =========================================

const chatChannel = supabaseClient
    .channel("general-chat")

    .on(
        "postgres_changes",
        {
            event: "INSERT",
            schema: "public",
            table: "chat_messages",
            filter: "channel=eq.general"
        },
        function (payload) {
            if (!chatOverlay.classList.contains("open")) {
                return;
            }

            addChatMessage(payload.new);
            scrollChatToBottom();
        }
    )

    .on(
        "postgres_changes",
        {
            event: "DELETE",
            schema: "public",
            table: "chat_messages"
        },
        function (payload) {
            const deletedMessage = document.querySelector(
                `[data-message-id="${payload.old.id}"]`
            );

            if (deletedMessage) {
                deletedMessage.remove();
            }
        }
    )

    .subscribe();


// =========================================
// SCROLL CHAT
// =========================================

function scrollChatToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}
// =========================================
