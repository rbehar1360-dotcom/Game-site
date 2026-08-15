function FilterGames() {
    const input = document.getElementById('searchInput');
    const filter = input.value.toLowerCase().trim();
    const gameLinks = document.getElementsByClassName('game-link');

    const fuzzyPattern = new RegExp(filter.split('').join('.*'), 'i');

    for (let i = 0; i < gameLinks.length; i++) {
        const title = gameLinks[i].querySelector('.title').textContent.toLowerCase();
        if (filter === "" || title.includes(filter) || fuzzyPattern.test(title)) {
            gameLinks[i].style.display = "";
        } else {
            gameLinks[i].style.display = "none";
        }
    }
}

// =========================================
// LOGIN WINDOW
// =========================================

const loginButton = document.getElementById("loginButton");

const loginOverlay = document.getElementById("loginOverlay");

const closeLogin = document.getElementById("closeLogin");




// Close login window

closeLogin.addEventListener("click", function() {

    loginOverlay.classList.remove("open");

});


// Close when clicking outside the window

loginOverlay.addEventListener("click", function(event) {

    if (event.target === loginOverlay) {

        loginOverlay.classList.remove("open");

    }

});

// =========================================
// LOGIN / SIGNUP MODE
// =========================================

const signupButton = document.getElementById("signupButton");

const usernameField = document.getElementById("usernameField");

const loginSubmit = document.getElementById("loginSubmit");

const accountPrompt = document.getElementById("accountPrompt");

let signupMode = false;


signupButton.addEventListener("click", function() {

    signupMode = !signupMode;


    if (signupMode) {

        // Switch to signup

        usernameField.style.display = "block";

        loginSubmit.textContent = "Create Account";

        accountPrompt.textContent = "Already have an account?";

        signupButton.textContent = "Login";

        document.querySelector(".login-header h2").textContent = "👤 Create Account";

    } 
    
    else {

        // Switch back to login

        usernameField.style.display = "none";

        loginSubmit.textContent = "Login";

        accountPrompt.textContent = "Don't have an account?";

        signupButton.textContent = "Sign up";

        document.querySelector(".login-header h2").textContent = "👤 Login";

    }

});

// =========================================
// SUPABASE AUTHENTICATION
// =========================================

const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", async function(event) {

    event.preventDefault();

    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    // =========================
    // SIGN UP
    // =========================

    if (signupMode) {

        const username = document.getElementById("loginUsername").value;

        if (!username) {
            alert("Please enter a username.");
            return;
        }

        const { data, error } = await supabaseClient.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    username: username
                }
            }
        });

        if (error) {

            alert(error.message);

            return;
        }

        alert("Account created! Check your email if confirmation is required.");

        console.log("Created user:", data);

        loginOverlay.classList.remove("open");

    }


    // =========================
    // LOGIN
    // =========================

    else {

        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) {

            alert(error.message);

            return;
        }

        console.log("Logged in:", data);

        alert("Login successful! 🎉");

        loginOverlay.classList.remove("open");

    }

});

// =========================================
// ACCOUNT STATE
// =========================================

const accountMenu = document.getElementById("accountMenu");

const accountUsername = document.getElementById("accountUsername");

const accountEmail = document.getElementById("accountEmail");

const logoutButton = document.getElementById("logoutButton");


// =========================================
// CHECK LOGIN STATE
// =========================================

async function updateAccountUI() {

    const { data } = await supabaseClient.auth.getUser();

    const user = data.user;


    if (user) {

        // User is logged in

        loginButton.textContent = "👤 Account";

        accountEmail.textContent = user.email;

        accountUsername.textContent =
            user.user_metadata?.username || "User";

    }

    else {

        // User is logged out

        loginButton.textContent = "👤 Login";

    }

}


// Check immediately

updateAccountUI();


// =========================================
// ACCOUNT MENU
// =========================================

loginButton.addEventListener("click", async function() {

    const { data } = await supabaseClient.auth.getUser();

    if (!data.user) {

        loginOverlay.classList.add("open");

        return;

    }

    accountMenu.classList.toggle("open");

});


// =========================================
// LOGOUT
// =========================================

logoutButton.addEventListener("click", async function() {

    const { error } = await supabaseClient.auth.signOut();

    if (error) {

        console.error(error);

        return;

    }

    accountMenu.classList.remove("open");

    loginButton.textContent = "👤 Login";

    alert("Logged out!");

});

// =========================================
// GAME LIKES
// =========================================

async function setupLikes() {

    const gameWrappers =
        document.querySelectorAll(".game-wrapper");


    for (const wrapper of gameWrappers) {

        const gameId =
            wrapper.dataset.gameId;

        const likeButton =
            wrapper.querySelector(".like-button");

        const likeCount =
            wrapper.querySelector(".like-count");


        // -----------------------------------------
        // GET TOTAL LIKES
        // -----------------------------------------

        const { count, error: countError } =
            await supabaseClient

                .from("likes")

                .select("*", {
                    count: "exact",
                    head: true
                })

                .eq("game_id", gameId);


        if (countError) {

            console.error(
                "Could not get likes:",
                countError
            );

            continue;
        }


        likeCount.textContent = count || 0;


        // -----------------------------------------
        // CHECK IF CURRENT USER LIKED
        // -----------------------------------------

        const { data: userData } =
            await supabaseClient.auth.getUser();

        const user = userData.user;


        if (user) {

            const { data: existingLike } =
                await supabaseClient

                    .from("likes")

                    .select("id")

                    .eq("user_id", user.id)

                    .eq("game_id", gameId)

                    .maybeSingle();


            if (existingLike) {

                likeButton.classList.add("liked");

            }

        }


        // -----------------------------------------
        // LIKE BUTTON CLICK
        // -----------------------------------------

        likeButton.addEventListener(
            "click",
            async function(event) {

                event.preventDefault();

                event.stopPropagation();


                // Check login

                const { data: userData } =
                    await supabaseClient.auth.getUser();

                const user = userData.user;


                if (!user) {

                    alert(
                        "Please log in to like games! ❤️"
                    );

                    return;
                }


                // Check existing like

                const { data: existingLike } =
                    await supabaseClient

                        .from("likes")

                        .select("id")

                        .eq("user_id", user.id)

                        .eq("game_id", gameId)

                        .maybeSingle();


                // -----------------------------------------
                // REMOVE LIKE
                // -----------------------------------------

                if (existingLike) {

                    const { error } =
                        await supabaseClient

                            .from("likes")

                            .delete()

                            .eq("id", existingLike.id);


                    if (error) {

                        console.error(error);

                        return;
                    }


                    likeButton.classList.remove(
                        "liked"
                    );


                    likeCount.textContent =
                        Math.max(
                            0,
                            Number(likeCount.textContent) - 1
                        );


                }

                // -----------------------------------------
                // ADD LIKE
                // -----------------------------------------

                else {

                    const { error } =
                        await supabaseClient

                            .from("likes")

                            .insert({

                                user_id: user.id,

                                game_id: gameId

                            });


                    if (error) {

                        console.error(error);

                        return;
                    }


                    likeButton.classList.add(
                        "liked"
                    );


                    likeCount.textContent =
                        Number(
                            likeCount.textContent
                        ) + 1;

                }

            }
        );

    }

}


setupLikes();
// =========================================
// GAME VIEW TRACKING
// =========================================

console.log("VIEW TRACKING SCRIPT LOADED");

document.querySelectorAll(".game-link").forEach(link => {

    link.addEventListener("click", async (event) => {

        const wrapper = link.closest(".game-wrapper");

        // Ignore non-game links
        if (!wrapper) return;

        const gameId = wrapper.dataset.gameId;

        if (!gameId) return;

        // Stop navigation temporarily
        event.preventDefault();

        console.log("Recording view for:", gameId);

        try {

            const { error } = await supabaseClient.rpc(
                "increment_game_view",
                {
                    game_id: gameId
                }
            );

            if (error) {

                console.error(
                    "Failed to record game view:",
                    error
                );

            } else {

                console.log(
                    "View recorded successfully:",
                    gameId
                );

            }

        } catch (error) {

            console.error(
                "View tracking error:",
                error
            );

        }

        // Continue to the game
        window.location.href = link.href;

    });

});