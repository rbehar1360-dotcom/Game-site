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