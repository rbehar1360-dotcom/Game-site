function drawRaffle() {
    let num = Math.floor(Math.random() * 1000) + 1;
    document.getElementById("PlaceHolder").innerHTML = num;
    if (num == 67) {
        alert("Congratulations! The code is Ralph is Da Best!");
    }
}

document.addEventListener('keydown', function(event) {
    if (event.key === 'Enter' || event.key === 'Return' || event.key === 'NumpadEnter' || event.key === 'Space') {
        document.getElementById("SubmitButton").click();
    }
});
