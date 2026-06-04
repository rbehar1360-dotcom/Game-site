// Load saved clicks or default to 10000
let Clicksleft = localStorage.getItem("Clicksleft");

if (Clicksleft === null) {
    Clicksleft = 10000;
} else {
    Clicksleft = parseInt(Clicksleft);
}

// **Update display immediately after getting value**
document.getElementById("clicksLeft").textContent = "Clicks Left: " + Clicksleft;
function pressButton() {
    document.getElementById("RemoveMe").style.display = "none";
    if (Clicksleft <= 0) return;

    Clicksleft--;
    
    // Save the new value
    localStorage.setItem("Clicksleft", Clicksleft);

    // Update display right away
    document.getElementById("clicksLeft").textContent = "Clicks Left: " + Clicksleft;

    if (Clicksleft <= 0) {
        alert("Congratulations! The code is Xq7r9");
    }
}