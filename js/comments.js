(function () {
    const script = document.currentScript;
    const cssUrl = new URL("../css/comments.css", script.src).href;

    if (!document.querySelector("[data-comments-css]")) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = cssUrl;
        link.dataset.commentsCss = "true";
        document.head.appendChild(link);
    }

    function getGameId() {
        if (window.gameId) return String(window.gameId);

        return decodeURIComponent(location.pathname)
            .split("/")
            .pop()
            .replace(/\.html$/i, "")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-");
    }

    function initialize() {
        if (document.body.dataset.communityComments === "true") return;
        document.body.dataset.communityComments = "true";

        const supabase = window.supabaseClient;
        const gameId = getGameId();

        if (!supabase) return;

        const section = document.createElement("section");
        section.className = "comments-section";

        section.innerHTML = `
            <div class="community-heading">
                <div>
                    <span class="community-eyebrow">COMMUNITY</span>
                    <h2>Game Discussion</h2>
                    <p>Share strategies, reactions, and moments from the game.</p>
                </div>
                <span class="community-count" id="commentCount">0 posts</span>
            </div>

            <div class="community-composer" id="commentForm">
                <div class="composer-avatar" id="composerAvatar">?</div>

                <div class="composer-main">
                    <textarea id="commentInput"
                        maxlength="1000"
                        placeholder="What's on your mind?"></textarea>

                    <div class="composer-preview" id="mediaPreview"></div>

                    <div class="composer-toolbar">
                        <div class="composer-tools">
                            <button type="button" id="emojiButton">😊 Emoji</button>
                            <button type="button" id="imageButton">▧ Image</button>
                            <button type="button" id="gifButton">GIF</button>

                            <input
                                type="file"
                                id="imageInput"
                                accept="image/png,image/jpeg,image/gif,image/webp"
                                hidden
                            >
                        </div>

                        <button
                            type="button"
                            class="post-comment-button"
                            id="postCommentButton"
                        >
                            Post
                        </button>
                    </div>

                    <div class="composer-extras" id="composerExtras" hidden></div>

                    <div class="composer-count" id="commentCharacters">
                        0 / 1000
                    </div>
                </div>
            </div>

            <div class="community-login" id="commentLoginMessage" hidden>
                Log in to join the discussion.
            </div>

            <div class="community-feed-heading">
                <h3>
                    Discussion
                    <span id="discussionCount">0</span>
                </h3>

                <select id="commentSort" aria-label="Sort comments">
                    <option value="newest">Newest</option>
                    <option value="oldest">Oldest</option>
                    <option value="top">Most reactions</option>
                </select>
            </div>

            <div class="comments-list" id="commentsList">
                <div class="comments-empty">
                    Loading discussion...
                </div>
            </div>
        `;

        document.body.appendChild(section);

        const $ = id => section.querySelector("#" + id);

        const list = $("commentsList");
        const input = $("commentInput");
        const postButton = $("postCommentButton");
        const imageInput = $("imageInput");
        const preview = $("mediaPreview");
        const extras = $("composerExtras");

        let currentUser = null;
        let comments = [];
        let reactions = [];
        let savedGifs = [];

        let selectedImage = null;
        let selectedGif = "";
        let replyTo = null;
        let channel = null;

        const emojiList = [
            "😀", "😂", "🥹", "😍", "😎", "😭", "💀", "🤯",
            "🔥", "❤️", "💯", "👍", "👎", "👏", "🎮", "👀",
            "🤣", "😈", "🤔", "🥳", "✨", "🙏", "💪", "🚀"
        ];

        const reactionList = [
            "👍",
            "❤️",
            "😂",
            "🔥",
            "😮",
            "😢"
        ];

        /*
         * Built-in GIFs.
         *
         * These are simply starter GIF URLs.
         * Users can also save their own GIF URLs to Supabase.
         */
        const builtInGifs = [
            {
                name: "Hype",
                url: "https://media.giphy.com/media/5GoVLqeAOo6PK/giphy.gif"
            },
            {
                name: "Laugh",
                url: "https://media.giphy.com/media/10JhviFuU2gWD6/giphy.gif"
            },
            {
                name: "What",
                url: "https://media.giphy.com/media/WRQBXSCnEFJIuxktnw/giphy.gif"
            },
            {
                name: "Nice",
                url: "https://media.giphy.com/media/g9582DNuQppxC/giphy.gif"
            },
            {
                name: "Wow",
                url: "https://media.giphy.com/media/26ufdipQqU2lhNA4g/giphy.gif"
            },
            {
                name: "Dead",
                url: "https://media.giphy.com/media/1z8dbpxiawjkyJ0rxg/giphy.gif"
            }
        ];

        function escapeUrl(url) {
            try {
                const parsed = new URL(url);

                if (
                    parsed.protocol !== "https:" &&
                    parsed.protocol !== "http:"
                ) {
                    return "";
                }

                return parsed.href;
            } catch {
                return "";
            }
        }

        function formatDate(value) {
            const date = new Date(value);
            const seconds = Math.floor(
                (Date.now() - date.getTime()) / 1000
            );

            if (seconds < 60) return "Just now";
            if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
            if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
            if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

            return date.toLocaleDateString();
        }

        function usernameFor(user) {
            return (
                user?.user_metadata?.username ||
                user?.user_metadata?.display_name ||
                user?.email?.split("@")[0] ||
                "Player"
            );
        }

        function avatarFor(username) {
            return (
                String(username || "?")
                    .trim()
                    .charAt(0)
                    .toUpperCase() || "?"
            );
        }

        function showMessage(message) {
            window.alert(message);
        }

        function closeExtras() {
            extras.hidden = true;
            extras.replaceChildren();
        }

        function setComposerMedia() {
            preview.replaceChildren();

            if (selectedImage) {
                const item = document.createElement("div");
                item.className = "media-preview-item";

                const image = document.createElement("img");
                image.src = URL.createObjectURL(selectedImage);
                image.alt = "Image preview";

                const remove = document.createElement("button");
                remove.type = "button";
                remove.textContent = "×";

                remove.onclick = () => {
                    selectedImage = null;
                    imageInput.value = "";
                    setComposerMedia();
                };

                item.append(image, remove);
                preview.appendChild(item);
            }

            if (selectedGif) {
                const item = document.createElement("div");
                item.className = "media-preview-item";

                const image = document.createElement("img");
                image.src = selectedGif;
                image.alt = "GIF preview";

                const remove = document.createElement("button");
                remove.type = "button";
                remove.textContent = "×";

                remove.onclick = () => {
                    selectedGif = "";
                    setComposerMedia();
                };

                item.append(image, remove);
                preview.appendChild(item);
            }
        }

        function createButton(text, className, callback) {
            const button = document.createElement("button");

            button.type = "button";
            button.textContent = text;
            button.className = className || "";

            button.addEventListener("click", callback);

            return button;
        }

        function showEmojiPicker() {
            closeExtras();

            extras.hidden = false;
            extras.className = "composer-extras emoji-grid";

            emojiList.forEach(emoji => {
                extras.appendChild(
                    createButton(
                        emoji,
                        "",
                        () => {
                            const start =
                                input.selectionStart ??
                                input.value.length;

                            const end =
                                input.selectionEnd ??
                                input.value.length;

                            input.setRangeText(
                                emoji,
                                start,
                                end,
                                "end"
                            );

                            input.dispatchEvent(
                                new Event("input")
                            );

                            input.focus();
                        }
                    )
                );
            });
        }

        async function loadSavedGifs() {
            if (!currentUser) {
                savedGifs = [];
                return;
            }

            const { data, error } = await supabase
                .from("user_gifs")
                .select("*")
                .eq("user_id", currentUser.id)
                .order("created_at", {
                    ascending: false
                });

            if (error) {
                console.error("SAVED GIF LOAD ERROR:", error);
                savedGifs = [];
                return;
            }

            savedGifs = data || [];
        }

        async function saveGif(url) {
            if (!currentUser) return;

            const cleanUrl = escapeUrl(url);

            if (!cleanUrl) {
                showMessage("That GIF URL isn't valid.");
                return;
            }

            const { error } = await supabase
                .from("user_gifs")
                .insert({
                    user_id: currentUser.id,
                    gif_url: cleanUrl
                });

            if (error && error.code !== "23505") {
                console.error("SAVE GIF ERROR:", error);
                showMessage("Could not save that GIF.");
                return;
            }

            await loadSavedGifs();
        }

        async function deleteSavedGif(id) {
            if (!currentUser) return;

            const { error } = await supabase
                .from("user_gifs")
                .delete()
                .eq("id", id)
                .eq("user_id", currentUser.id);

            if (error) {
                console.error("DELETE GIF ERROR:", error);
                showMessage("Could not remove GIF.");
                return;
            }

            await loadSavedGifs();
            showGifPicker();
        }

        function selectGif(url) {
            const cleanUrl = escapeUrl(url);

            if (!cleanUrl) {
                showMessage("That GIF could not be loaded.");
                return;
            }

            selectedGif = cleanUrl;
            selectedImage = null;
            imageInput.value = "";

            setComposerMedia();
            closeExtras();
        }

        function showGifPicker() {
            closeExtras();

            extras.hidden = false;
            extras.className = "composer-extras gif-browser";

            const tabs = document.createElement("div");
            tabs.className = "gif-browser-tabs";

            const grid = document.createElement("div");
            grid.className = "gif-grid";

            function renderBuiltIn() {
                grid.replaceChildren();

                builtInGifs.forEach(gif => {
                    const button = document.createElement("button");

                    button.type = "button";
                    button.className = "gif-card";

                    const image = document.createElement("img");
                    image.src = gif.url;
                    image.alt = gif.name;
                    image.loading = "lazy";

                    button.appendChild(image);

                    button.onclick = () => {
                        selectGif(gif.url);
                    };

                    grid.appendChild(button);
                });
            }

            function renderMine() {
                grid.replaceChildren();

                if (!savedGifs.length) {
                    const empty = document.createElement("div");
                    empty.className = "comments-empty";
                    empty.textContent =
                        "You haven't saved any GIFs yet.";

                    grid.appendChild(empty);
                    return;
                }

                savedGifs.forEach(gif => {
                    const wrapper = document.createElement("div");
                    wrapper.className = "gif-card";

                    const button = document.createElement("button");
                    button.type = "button";
                    button.className = "gif-card";

                    const image = document.createElement("img");
                    image.src = gif.gif_url;
                    image.alt = "Saved GIF";
                    image.loading = "lazy";

                    button.appendChild(image);

                    button.onclick = () => {
                        selectGif(gif.gif_url);
                    };

                    const remove = document.createElement("button");
                    remove.type = "button";
                    remove.className = "gif-remove";
                    remove.textContent = "×";
                    remove.title = "Remove GIF";

                    remove.onclick = event => {
                        event.stopPropagation();
                        deleteSavedGif(gif.id);
                    };

                    wrapper.appendChild(button);
                    wrapper.appendChild(remove);

                    grid.appendChild(wrapper);
                });
            }

            const builtInTab = createButton(
                "Built-in",
                "gif-browser-tab active",
                () => {
                    builtInTab.classList.add("active");
                    mineTab.classList.remove("active");
                    renderBuiltIn();
                }
            );

            const mineTab = createButton(
                "My GIFs",
                "gif-browser-tab",
                () => {
                    mineTab.classList.add("active");
                    builtInTab.classList.remove("active");
                    renderMine();
                }
            );

            tabs.appendChild(builtInTab);
            tabs.appendChild(mineTab);

            if (currentUser) {
                const addTab = createButton(
                    "Add URL",
                    "gif-browser-tab",
                    showGifUrlForm
                );

                tabs.appendChild(addTab);
            }

            extras.appendChild(tabs);
            extras.appendChild(grid);

            renderBuiltIn();
        }

        function showGifUrlForm() {
            closeExtras();

            extras.hidden = false;
            extras.className = "composer-extras gif-entry";

            const label = document.createElement("label");
            label.textContent =
                "Paste a direct GIF URL. It will be saved to My GIFs.";

            const urlInput = document.createElement("input");

            urlInput.type = "url";
            urlInput.placeholder =
                "https://example.com/funny.gif";

            const addButton = createButton(
                "Save & Use",
                "",
                async () => {
                    const url = escapeUrl(
                        urlInput.value.trim()
                    );

                    if (!url) {
                        showMessage(
                            "Enter a valid GIF URL."
                        );
                        return;
                    }

                    const originalText =
                        addButton.textContent;

                    addButton.disabled = true;
                    addButton.textContent = "Saving...";

                    await saveGif(url);

                    selectedGif = url;
                    selectedImage = null;
                    imageInput.value = "";

                    setComposerMedia();
                    closeExtras();

                    addButton.disabled = false;
                    addButton.textContent = originalText;
                }
            );

            extras.append(
                label,
                urlInput,
                addButton
            );
        }

        async function uploadImage(file) {
            if (!currentUser) {
                throw new Error(
                    "Log in to upload images."
                );
            }

            if (!file.type.startsWith("image/")) {
                throw new Error(
                    "Choose an image file."
                );
            }

            if (file.size > 5 * 1024 * 1024) {
                throw new Error(
                    "Images must be 5 MB or smaller."
                );
            }

            const extension = {
                "image/jpeg": "jpg",
                "image/png": "png",
                "image/gif": "gif",
                "image/webp": "webp"
            }[file.type];

            if (!extension) {
                throw new Error(
                    "That image format is not supported."
                );
            }

            const path =
                `${currentUser.id}/${crypto.randomUUID()}.${extension}`;

            const { error } = await supabase.storage
                .from("comment-media")
                .upload(path, file, {
                    contentType: file.type,
                    upsert: false
                });

            if (error) throw error;

            const { data } =
                supabase.storage
                    .from("comment-media")
                    .getPublicUrl(path);

            return data.publicUrl;
        }

        function reactionSummary(commentId) {
            const counts = new Map();

            reactions
                .filter(
                    reaction =>
                        String(reaction.comment_id) ===
                        String(commentId)
                )
                .forEach(reaction => {
                    counts.set(
                        reaction.reaction,
                        (counts.get(
                            reaction.reaction
                        ) || 0) + 1
                    );
                });

            return counts;
        }

        async function toggleReaction(commentId, emoji) {
            if (!currentUser) {
                showMessage("Log in to react.");
                return;
            }

            const existing = reactions.find(
                reaction =>
                    String(reaction.comment_id) ===
                        String(commentId) &&
                    reaction.user_id === currentUser.id &&
                    reaction.reaction === emoji
            );

            let result;

            if (existing) {
                result = await supabase
                    .from("game_comment_reactions")
                    .delete()
                    .eq("id", existing.id);
            } else {
                result = await supabase
                    .from("game_comment_reactions")
                    .insert({
                        comment_id: commentId,
                        user_id: currentUser.id,
                        reaction: emoji
                    });
            }

            if (result.error) {
                console.error(
                    "REACTION ERROR:",
                    result.error
                );
                showMessage(
                    "Could not update reaction."
                );
                return;
            }

            await loadReactions();
            renderComments();
        }

        function renderComment(comment, depth = 0) {
            const item =
                document.createElement("article");

            item.className =
                "community-comment";

            if (depth > 0) {
                item.classList.add(
                    "community-reply"
                );
            }

            item.dataset.commentId =
                comment.id;

            const header =
                document.createElement("div");

            header.className =
                "comment-author-row";

            const avatar =
                document.createElement("div");

            avatar.className =
                "comment-avatar";

            avatar.textContent =
                avatarFor(comment.username);

            const identity =
                document.createElement("div");

            identity.className =
                "comment-identity";

            const name =
                document.createElement("strong");

            name.textContent =
                comment.username || "Player";

            const date =
                document.createElement("span");

            date.className =
                "comment-date";

            date.textContent =
                formatDate(comment.created_at) +
                (comment.edited_at
                    ? " · edited"
                    : "");

            identity.append(name, date);
            header.append(avatar, identity);

            const body =
                document.createElement("div");

            body.className =
                "comment-body";

            if (comment.deleted_at) {
                body.classList.add(
                    "comment-deleted"
                );

                body.textContent =
                    "This comment was deleted.";
            } else {
                body.textContent =
                    comment.comment || "";
            }

            item.append(header, body);

            if (
                !comment.deleted_at &&
                comment.image_url
            ) {
                const url =
                    escapeUrl(
                        comment.image_url
                    );

                if (url) {
                    const image =
                        document.createElement(
                            "img"
                        );

                    image.className =
                        "comment-media";

                    image.src = url;
                    image.alt =
                        "Comment attachment";
                    image.loading = "lazy";

                    item.appendChild(image);
                }
            }

            if (
                !comment.deleted_at &&
                comment.gif_url
            ) {
                const url =
                    escapeUrl(
                        comment.gif_url
                    );

                if (url) {
                    const image =
                        document.createElement(
                            "img"
                        );

                    image.className =
                        "comment-media comment-gif";

                    image.src = url;
                    image.alt = "GIF";
                    image.loading = "lazy";

                    item.appendChild(image);
                }
            }

            if (!comment.deleted_at) {
                const actions =
                    document.createElement(
                        "div"
                    );

                actions.className =
                    "comment-actions";

                const summary =
                    reactionSummary(
                        comment.id
                    );

                reactionList.forEach(
                    emoji => {
                        const count =
                            summary.get(emoji) ||
                            0;

                        const mine =
                            reactions.some(
                                reaction =>
                                    String(
                                        reaction.comment_id
                                    ) ===
                                        String(
                                            comment.id
                                        ) &&
                                    reaction.user_id ===
                                        currentUser?.id &&
                                    reaction.reaction ===
                                        emoji
                            );

                        const button =
                            createButton(
                                `${emoji} ${count || ""}`.trim(),
                                "reaction-button" +
                                    (mine
                                        ? " reaction-active"
                                        : ""),
                                () =>
                                    toggleReaction(
                                        comment.id,
                                        emoji
                                    )
                            );

                        actions.appendChild(
                            button
                        );
                    }
                );

                actions.appendChild(
                    createButton(
                        "↩ Reply",
                        "comment-action",
                        () => {
                            replyTo = comment;

                            input.placeholder =
                                `Reply to ${comment.username || "Player"}...`;

                            input.focus();

                            postButton.textContent =
                                "Reply";
                        }
                    )
                );

                if (
                    currentUser &&
                    comment.user_id ===
                        currentUser.id
                ) {
                    actions.appendChild(
                        createButton(
                            "Delete",
                            "comment-action comment-delete",
                            async () => {
    if (!confirm("Delete this comment?")) {
        return;
    }

    const { data, error } = await supabase
        .from("game_comments")
        .update({
            deleted_at: new Date().toISOString(),
            comment: ""
        })
        .eq("id", comment.id)
        .eq("user_id", currentUser.id)
        .select();

    if (error) {
        console.error("DELETE ERROR:", error);
        showMessage("Could not delete comment.");
        return;
    }

    if (!data || data.length === 0) {
        console.error("DELETE ERROR: Update affected 0 rows.", {
            commentId: comment.id,
            currentUserId: currentUser.id
        });

        showMessage(
            "Comment could not be deleted. Check your Supabase RLS policy."
        );
        return;
    }

    await loadComments();
}
                        )
                    );
                }

                item.appendChild(actions);
            }

            return item;
        }

        function renderComments() {
            list.replaceChildren();

            const roots =
                comments.filter(
                    comment => !comment.parent_id
                );

            const children =
                comments.filter(
                    comment => comment.parent_id
                );

            const sort =
                $("commentSort").value;

            if (sort === "oldest") {
                roots.sort(
                    (a, b) =>
                        new Date(a.created_at) -
                        new Date(b.created_at)
                );
            } else {
                roots.sort(
                    (a, b) =>
                        new Date(b.created_at) -
                        new Date(a.created_at)
                );
            }

            function appendThread(
                comment,
                depth = 0
            ) {
                list.appendChild(
                    renderComment(
                        comment,
                        depth
                    )
                );

                if (depth >= 4) return;

                children
                    .filter(
                        child =>
                            String(
                                child.parent_id
                            ) ===
                            String(comment.id)
                    )
                    .sort(
                        (a, b) =>
                            new Date(
                                a.created_at
                            ) -
                            new Date(
                                b.created_at
                            )
                    )
                    .forEach(child =>
                        appendThread(
                            child,
                            depth + 1
                        )
                    );
            }

            roots.forEach(
                comment =>
                    appendThread(comment)
            );

            if (!roots.length) {
                const empty =
                    document.createElement(
                        "div"
                    );

                empty.className =
                    "comments-empty";

                empty.textContent =
                    "No posts yet. Start the discussion.";

                list.appendChild(empty);
            }

            $("commentCount").textContent =
                `${comments.length} posts`;

            $("discussionCount").textContent =
                comments.length;
        }

        async function loadReactions() {
            const { data, error } =
                await supabase
                    .from(
                        "game_comment_reactions"
                    )
                    .select("*");

            if (error) {
                console.error(
                    "REACTION LOAD ERROR:",
                    error
                );

                return;
            }

            reactions = data || [];
        }

        async function loadComments() {
            const { data, error } =
                await supabase
                    .from("game_comments")
                    .select("*")
                    .eq("game_id", gameId)
                    .order("created_at", {
                        ascending: false
                    });

            if (error) {
                console.error(
                    "COMMENT LOAD ERROR:",
                    error
                );

                list.textContent =
                    "Unable to load the discussion.";

                return;
            }

            comments = data || [];

            await loadReactions();

            renderComments();
        }

        async function updateLoginState() {
            const { data } =
                await supabase.auth.getUser();

            currentUser =
                data?.user || null;

            $("commentForm").hidden =
                !currentUser;

            $("commentLoginMessage").hidden =
                Boolean(currentUser);

            $("composerAvatar").textContent =
                avatarFor(
                    usernameFor(currentUser)
                );

            await loadSavedGifs();
        }

        async function submitComment() {
            if (!currentUser) {
                showMessage(
                    "Log in to comment."
                );

                return;
            }

            const text =
                input.value.trim();

            if (
                !text &&
                !selectedImage &&
                !selectedGif
            ) {
                showMessage(
                    "Write something or attach media first."
                );

                return;
            }

            postButton.disabled = true;
            postButton.textContent =
                "Posting...";

            try {
                let imageUrl = null;

                if (selectedImage) {
                    imageUrl =
                        await uploadImage(
                            selectedImage
                        );
                }

                const { error } =
                    await supabase
                        .from("game_comments")
                        .insert({
                            game_id: gameId,
                            user_id:
                                currentUser.id,
                            username:
                                usernameFor(
                                    currentUser
                                ),
                            comment: text,
                            parent_id:
                                replyTo
                                    ? replyTo.id
                                    : null,
                            image_url:
                                imageUrl,
                            gif_url:
                                selectedGif ||
                                null
                        });

                if (error) throw error;

                input.value = "";

                input.dispatchEvent(
                    new Event("input")
                );

                selectedImage = null;
                selectedGif = "";
                replyTo = null;

                imageInput.value = "";

                input.placeholder =
                    "What's on your mind?";

                postButton.textContent =
                    "Post";

                setComposerMedia();
                closeExtras();

                await loadComments();
            } catch (error) {
                console.error(
                    "COMMENT POST ERROR:",
                    error
                );

                showMessage(
                    error.message ||
                        "Could not post comment."
                );
            } finally {
                postButton.disabled = false;

                postButton.textContent =
                    replyTo
                        ? "Reply"
                        : "Post";
            }
        }

        $("emojiButton").onclick =
            showEmojiPicker;

        $("imageButton").onclick =
            () => imageInput.click();

        $("gifButton").onclick =
            showGifPicker;

        $("postCommentButton").onclick =
            submitComment;

        $("commentSort").onchange =
            renderComments;

        imageInput.addEventListener(
            "change",
            () => {
                const file =
                    imageInput.files?.[0];

                if (!file) return;

                selectedImage = file;
                selectedGif = "";

                setComposerMedia();
            }
        );

        input.addEventListener(
            "input",
            () => {
                $("commentCharacters").textContent =
                    `${input.value.length} / 1000`;
            }
        );

        supabase.auth.onAuthStateChange(
            () => {
                setTimeout(
                    updateLoginState,
                    0
                );
            }
        );

        updateLoginState();
        loadComments();

        channel =
            supabase
                .channel(
                    `community-comments-${gameId}`
                )
                .on(
                    "postgres_changes",
                    {
                        event: "*",
                        schema: "public",
                        table: "game_comments",
                        filter:
                            `game_id=eq.${gameId}`
                    },
                    loadComments
                )
                .on(
                    "postgres_changes",
                    {
                        event: "*",
                        schema: "public",
                        table:
                            "game_comment_reactions"
                    },
                    loadComments
                )
                .subscribe();

        window.addEventListener(
            "beforeunload",
            () => {
                if (channel) {
                    supabase.removeChannel(
                        channel
                    );
                }
            }
        );
    }

    if (
        document.readyState ===
        "loading"
    ) {
        document.addEventListener(
            "DOMContentLoaded",
            initialize,
            { once: true }
        );
    } else {
        initialize();
    }
})();