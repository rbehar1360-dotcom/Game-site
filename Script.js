function FilterGames() {
    const input = document.getElementById('searchInput');
    const filter = input.value.toLowerCase();
    const gameLinks = document.getElementsByClassName('game-link');

    for (let i = 0; i < gameLinks.length; i++) {
        const title = gameLinks[i].querySelector('.title').textContent.toLowerCase();

        if (title.includes(filter)) {
            gameLinks[i].style.display = "";
        } else {
            gameLinks[i].style.display = "none";
        }
    }
}
