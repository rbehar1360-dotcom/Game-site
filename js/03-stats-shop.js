// MY STATS
// =========================================

const statsButton =
    document.getElementById("statsButton");

const statsOverlay =
    document.getElementById("statsOverlay");

const closeStats =
    document.getElementById("closeStats");


// =========================================
// OPEN STATS
// =========================================

statsButton.addEventListener("click", async function() {

    statsOverlay.classList.add("open");

    accountMenu.classList.remove("open");

    await loadStats();

});


// =========================================
// CLOSE STATS
// =========================================

closeStats.addEventListener("click", function() {

    statsOverlay.classList.remove("open");

});


// =========================================
// CLICK OUTSIDE STATS
// =========================================

statsOverlay.addEventListener("click", function(event) {

    if (event.target === statsOverlay) {

        statsOverlay.classList.remove("open");

    }

});


// =========================================
// FORMAT PLAYTIME
// =========================================

function formatPlaytime(seconds) {

    seconds = Number(seconds) || 0;

    const hours =
        Math.floor(seconds / 3600);

    const minutes =
        Math.floor((seconds % 3600) / 60);

    const secs =
        seconds % 60;


    if (hours > 0) {

        return `${hours}h ${minutes}m`;

    }


    if (minutes > 0) {

        return `${minutes}m ${secs}s`;

    }


    return `${secs}s`;

}


// =========================================
// LOAD STATS
// =========================================

async function loadStats() {

    const user =
        await getCurrentUser();


    if (!user) {

        alert(
            "Please log in to view your stats! 📊"
        );

        statsOverlay.classList.remove("open");

        return;

    }


    const { data, error } =
        await supabaseClient

            .from("game_playtime")

            .select(
                "game_id, playtime_seconds, last_played"
            )

            .eq(
                "user_id",
                user.id
            )

            .order(
                "playtime_seconds",
                {
                    ascending: false
                }
            );


    if (error) {

        console.error(
            "Could not load stats:",
            error
        );

        return;

    }


    const games =
        data || [];


    // =========================================
    // TOTAL PLAYTIME
    // =========================================

    const totalSeconds =
        games.reduce(
            (total, game) =>
                total +
                Number(game.playtime_seconds || 0),
            0
        );


    document.getElementById(
        "totalPlaytime"
    ).textContent =
        formatPlaytime(totalSeconds);


    // =========================================
    // GAMES PLAYED
    // =========================================

    document.getElementById(
        "gamesPlayed"
    ).textContent =
        games.length;


    // =========================================
    // MOST PLAYED
    // =========================================

    const mostPlayed =
        games.length > 0
            ? games[0]
            : null;


    if (mostPlayed) {

        const wrapper =
            document.querySelector(
                `.game-wrapper[data-game-id="${mostPlayed.game_id}"]`
            );


        const title =
            wrapper
                ?.querySelector(".title")
                ?.textContent
                ?.trim()
            || mostPlayed.game_id;


        document.getElementById(
            "mostPlayed"
        ).textContent = title;

    }

    else {

        document.getElementById(
            "mostPlayed"
        ).textContent =
            "None yet";

    }


    // =========================================
    // GAME BREAKDOWN
    // =========================================

    const playtimeList =
        document.getElementById(
            "playtimeList"
        );


    if (games.length === 0) {

        playtimeList.innerHTML =
            "<p>No playtime recorded yet! 🎮</p>";

        return;

    }


    playtimeList.innerHTML = "";


    games.forEach(game => {

        const wrapper =
            document.querySelector(
                `.game-wrapper[data-game-id="${game.game_id}"]`
            );


        const title =
            wrapper
                ?.querySelector(".title")
                ?.textContent
                ?.trim()
            || game.game_id;


        const row =
            document.createElement("div");


        row.className =
            "playtime-game";


        row.innerHTML = `

            <span class="playtime-game-name">
                ${title}
            </span>

            <span class="playtime-game-time">
                ${formatPlaytime(game.playtime_seconds)}
            </span>

        `;


        playtimeList.appendChild(row);

    });

}

// =========================================
// COIN SYSTEM
// =========================================

const coinBalance =
    document.getElementById("coinBalance");

const shopCoinBalance =
    document.getElementById("shopCoinBalance");


// =========================================
// LOAD COINS
// =========================================

async function loadCoinBalance() {

    const user =
        await getCurrentUser();


    if (!user) {

        if (coinBalance) {
            coinBalance.textContent = "0";
        }

        if (shopCoinBalance) {
            shopCoinBalance.textContent = "0";
        }

        return;

    }


    const { data, error } =
        await supabaseClient

            .from("user_coins")

            .select("coins")

            .eq("user_id", user.id)

            .maybeSingle();


    if (error) {

        console.error(
            "Could not load coins:",
            error
        );

        return;

    }


    const coins =
        data?.coins || 0;


    if (coinBalance) {
        coinBalance.textContent = coins;
    }

    if (shopCoinBalance) {
        shopCoinBalance.textContent = coins;
    }

}


// =========================================
// SHOP
// =========================================

const shopButton =
    document.getElementById("shopButton");

const shopOverlay =
    document.getElementById("shopOverlay");

const closeShop =
    document.getElementById("closeShop");

const shopItems =
    document.getElementById("shopItems");


shopButton.addEventListener(
    "click",
    async function () {

        const user =
            await getCurrentUser();


        if (!user) {

            alert(
                "Please log in to use the shop! 🛒"
            );

            return;

        }


        accountMenu.classList.remove("open");

        shopOverlay.classList.add("open");

        await loadCoinBalance();

        await loadShop();

    }
);


// =========================================
// CLOSE SHOP
// =========================================

closeShop.addEventListener(
    "click",
    function () {

        shopOverlay.classList.remove("open");

    }
);


shopOverlay.addEventListener(
    "click",
    function (event) {

        if (
            event.target === shopOverlay
        ) {

            shopOverlay.classList.remove("open");

        }

    }
);


// =========================================
// LOAD SHOP
// =========================================

async function loadShop() {

    shopItems.innerHTML =
        "<p>Loading shop...</p>";


    const { data, error } =
        await supabaseClient

            .from("shop_items")

            .select("*")

            .eq("active", true)

            .order("price", {
                ascending: true
            });


    if (error) {

        console.error(
            "Could not load shop:",
            error
        );

        shopItems.innerHTML =
            "<p>Could not load shop.</p>";

        return;

    }


    if (!data || data.length === 0) {

        shopItems.innerHTML =
            "<p>The shop is empty.</p>";

        return;

    }


    shopItems.innerHTML = "";


    data.forEach(item => {

        const card =
            document.createElement("div");


        card.className =
            "shop-item";


        card.innerHTML = `

            <div>

                <div class="shop-item-icon">
                    🛍️
                </div>

                <div class="shop-item-name">
                    ${item.name}
                </div>

                <div class="shop-item-description">
                    ${item.description}
                </div>

                <div class="shop-item-price">
                    🪙 ${item.price}
                </div>

            </div>

            <button
                class="shop-buy-button"
                data-item-id="${item.id}"
            >
                Buy
            </button>

        `;


        const buyButton =
            card.querySelector(
                ".shop-buy-button"
            );


        buyButton.addEventListener(
            "click",
            function () {

                buyShopItem(
                    item.id,
                    item.name
                );

            }
        );


        shopItems.appendChild(card);

    });

}

const openSupportModal = document.getElementById("openSupportModal");
const closeSupportModal = document.getElementById("closeSupportModal");
const supportOverlay = document.getElementById("supportOverlay");

const amountOptions = document.querySelectorAll(".amount-option");
const customSupportAmount = document.getElementById("customSupportAmount");
const selectedSupportAmount = document.getElementById("selectedSupportAmount");
const paypalPlaceholder = document.getElementById("paypalPlaceholder");

let currentSupportAmount = 5;

function updateSupportAmount(amount) {
    currentSupportAmount = Number(amount);

    selectedSupportAmount.textContent =
        `$${currentSupportAmount.toFixed(2)}`;
}

openSupportModal.addEventListener("click", () => {
    supportOverlay.classList.add("active");
    document.body.style.overflow = "hidden";
});

function closeSupportWindow() {
    supportOverlay.classList.remove("active");
    document.body.style.overflow = "";
}

closeSupportModal.addEventListener("click", closeSupportWindow);

supportOverlay.addEventListener("click", (event) => {
    if (event.target === supportOverlay) {
        closeSupportWindow();
    }
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        closeSupportWindow();
    }
});

amountOptions.forEach((button) => {
    button.addEventListener("click", () => {
        amountOptions.forEach((option) => {
            option.classList.remove("selected");
        });

        button.classList.add("selected");

        customSupportAmount.value = "";

        updateSupportAmount(button.dataset.amount);
    });
});

customSupportAmount.addEventListener("input", () => {
    const amount = Number(customSupportAmount.value);

    amountOptions.forEach((option) => {
        option.classList.remove("selected");
    });

    if (amount >= 1 && amount <= 500) {
        updateSupportAmount(amount);
    } else {
        selectedSupportAmount.textContent = "$0.00";
    }
});

paypalPlaceholder.addEventListener("click", () => {
    if (
        !currentSupportAmount ||
        currentSupportAmount < 1 ||
        currentSupportAmount > 500
    ) {
        alert("Please enter a valid amount between $1 and $500.");
        return;
    }

    alert(
        `PayPal integration is not active yet.\n\n` +
        `Selected donation: $${currentSupportAmount.toFixed(2)}\n\n` +
        `A parent-managed PayPal account can be connected here later.`
    );
});
// =========================================
// BUY ITEM
// =========================================

async function buyShopItem(
    itemId,
    itemName
) {

    const user =
        await getCurrentUser();


    if (!user) {

        alert(
            "Please log in first! 👤"
        );

        return;

    }


    const confirmed =
        confirm(
            `Buy "${itemName}"?`
        );


    if (!confirmed) {
        return;
    }


    const { error } =
        await supabaseClient.rpc(
            "purchase_shop_item",
            {
                p_item_id: itemId
            }
        );


    if (error) {

        console.error(
            "Purchase failed:",
            error
        );

        alert(
            error.message
        );

        return;

    }


    alert(
        `You bought ${itemName}! 🛒`
    );


    await loadCoinBalance();

    await loadShop();

}

// =========================================
