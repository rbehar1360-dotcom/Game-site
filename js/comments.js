(function () {
    const commentsScriptUrl = document.currentScript && document.currentScript.src;

    function getGameId() {
        if (window.gameId) {
            return window.gameId;
        }

        const filename = decodeURIComponent(window.location.pathname)
            .split("/")
            .pop()
            .replace(/\.html$/i, "");

        return filename.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    }

    const gameId = getGameId();

    if (gameId === "pi" || gameId === "AntArt") {
        return;
    }

    function addStylesheet() {
        if (document.querySelector('link[data-game-comments="styles"]')) {
            return;
        }

        const stylesheet = document.createElement("link");
        stylesheet.rel = "stylesheet";
        stylesheet.href = new URL("../css/comments.css", commentsScriptUrl).href;
        stylesheet.dataset.gameComments = "styles";
        document.head.appendChild(stylesheet);
    }

    function createCommentsSection() {
        let section = document.querySelector(".comments-section");

        if (section) {
            return section;
        }

        section = document.createElement("section");
        section.className = "comments-section";
        section.innerHTML = `
            <div class="comments-header">
                <h2>Comments</h2>
                <span id="commentCount">0</span>
            </div>
            <div id="commentLoginMessage" class="comment-login-message">
                Log in to leave a comment.
            </div>
            <div id="commentForm" class="comment-form">
                <textarea id="commentInput" maxlength="500" placeholder="Write a comment..."></textarea>
                <div class="comment-form-bottom">
                    <span id="commentCharacters">0 / 500</span>
                    <button id="postCommentButton" type="button">Post Comment</button>
                </div>
            </div>
            <div id="commentsList" class="comments-list">
                <div class="comments-loading">Loading comments...</div>
            </div>
        `;
        document.body.appendChild(section);
        return section;
    }

    function formatCommentDate(value) {
        const date = new Date(value);
        const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

        if (seconds < 60) return "Just now";
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
        return date.toLocaleDateString();
    }

    function initialize() {
        if (!document.body) {
            return;
        }

        addStylesheet();
        createCommentsSection();

        if (document.body.dataset.commentsInitialized === "true") {
            return;
        }
        document.body.dataset.commentsInitialized = "true";

        const commentsList = document.getElementById("commentsList");
        const commentInput = document.getElementById("commentInput");
        const commentForm = document.getElementById("commentForm");
        const loginMessage = document.getElementById("commentLoginMessage");
        const postButton = document.getElementById("postCommentButton");
        const characterCount = document.getElementById("commentCharacters");
        const commentCount = document.getElementById("commentCount");
        const supabase = window.supabaseClient;
        let commentsChannel = null;

        if (!supabase) {
            commentsList.innerHTML = '<div class="comments-empty">Comments are unavailable right now.</div>';
            return;
        }

        function renderComment(comment, user, prepend = false) {
            const item = document.createElement("div");
            item.className = "comment";
            item.dataset.commentId = comment.id;

            const top = document.createElement("div");
            top.className = "comment-top";

            const username = document.createElement("span");
            username.className = "comment-user";
            username.textContent = comment.username;

            const date = document.createElement("span");
            date.className = "comment-date";
            date.textContent = formatCommentDate(comment.created_at);

            top.append(username, date);

            const text = document.createElement("div");
            text.className = "comment-text";
            text.textContent = comment.comment;
            item.append(top, text);

            if (user && user.id === comment.user_id) {
                const deleteButton = document.createElement("button");
                deleteButton.className = "delete-comment";
                deleteButton.type = "button";
                deleteButton.textContent = "Delete";
                deleteButton.addEventListener("click", async function () {
                    deleteButton.disabled = true;
                    const { error } = await supabase
                        .from("game_comments")
                        .delete()
                        .eq("id", comment.id);

                    if (error) {
                        console.error("COMMENT DELETE ERROR:", error);
                        deleteButton.disabled = false;
                    }
                });
                item.appendChild(deleteButton);
            }

            if (prepend) {
                commentsList.prepend(item);
            } else {
                commentsList.appendChild(item);
            }
        }

        async function loadComments() {
            const { data, error } = await supabase
                .from("game_comments")
                .select("*")
                .eq("game_id", gameId)
                .order("created_at", { ascending: false });

            if (error) {
                console.error("COMMENT LOAD ERROR:", error);
                commentsList.innerHTML = '<div class="comments-empty">Unable to load comments.</div>';
                return;
            }

            const { data: { user } } = await supabase.auth.getUser();
            commentCount.textContent = String(data.length);
            commentsList.replaceChildren();

            if (data.length === 0) {
                commentsList.innerHTML = '<div class="comments-empty">No comments yet. Be the first to comment.</div>';
                return;
            }

            data.forEach(comment => renderComment(comment, user));
        }

        async function updateLoginState() {
            const { data: { user } } = await supabase.auth.getUser();
            commentForm.hidden = !user;
            loginMessage.hidden = Boolean(user);
        }

        postButton.addEventListener("click", async function () {
            const comment = commentInput.value.trim();
            if (!comment || comment.length > 500) return;

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                window.alert("You must be logged in to comment.");
                return;
            }

            postButton.disabled = true;
            const username = user.user_metadata?.username || user.email?.split("@")[0] || "User";
            const { error } = await supabase.from("game_comments").insert({
                game_id: gameId,
                user_id: user.id,
                username,
                comment
            });

            if (error) {
                console.error("COMMENT POST ERROR:", error);
                window.alert("Could not post comment.");
            } else {
                commentInput.value = "";
                characterCount.textContent = "0 / 500";
                await loadComments();
            }

            postButton.disabled = false;
        });

        commentInput.addEventListener("input", function () {
            characterCount.textContent = `${commentInput.value.length} / 500`;
        });

        supabase.auth.onAuthStateChange(function () {
            window.setTimeout(updateLoginState, 0);
        });
        updateLoginState();
        loadComments();

        commentsChannel = supabase
            .channel(`game-comments-${gameId}`)
            .on("postgres_changes", {
                event: "INSERT",
                schema: "public",
                table: "game_comments",
                filter: `game_id=eq.${gameId}`
            }, async payload => {
                if (commentsList.querySelector(`[data-comment-id="${payload.new.id}"]`)) return;

                const emptyMessage = commentsList.querySelector(".comments-empty");
                if (emptyMessage) commentsList.replaceChildren();

                const { data: { user } } = await supabase.auth.getUser();
                renderComment(payload.new, user, true);
                commentCount.textContent = String((Number(commentCount.textContent) || 0) + 1);
            })
            .on("postgres_changes", {
                event: "DELETE",
                schema: "public",
                table: "game_comments"
            }, payload => {
                const deleted = commentsList.querySelector(`[data-comment-id="${payload.old.id}"]`);
                if (!deleted) return;

                deleted.remove();
                commentCount.textContent = String(Math.max(0, Number(commentCount.textContent) - 1));
                if (!commentsList.children.length) {
                    commentsList.innerHTML = '<div class="comments-empty">No comments yet. Be the first to comment.</div>';
                }
            })
            .subscribe();

        window.addEventListener("beforeunload", function () {
            if (commentsChannel) supabase.removeChannel(commentsChannel);
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initialize, { once: true });
    } else {
        initialize();
    }
})();