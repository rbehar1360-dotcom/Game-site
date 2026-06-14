const display = document.getElementById("display");

let isDegree = true;

function appendToDisplay(value) {
    display.value += value;
}

function appendOperator(op) {
    const last = display.value.slice(-1);
    if ("+-*/^".includes(last)) return;
    display.value += op;
}

function appendFunction(func) {
    display.value += func;
}

function appendConstant(c) {
    if (c === "pi") display.value += "π";
    if (c === "e") display.value += "e";
}

function clearDisplay() {
    display.value = "";
}

function deleteLast() {
    display.value = display.value.slice(0, -1);
}

function toggleMode() {
    isDegree = !isDegree;
    document.getElementById("mode").innerText = isDegree ? "DEG" : "RAD";
}

// 🔥 CORE PARSER
function prepareExpression(expr) {
    // 🔥 Auto-fix: sin45 → sin(45), cos60 → cos(60), etc.
    expr = expr.replace(/(sin|cos|tan|log|sqrt)(\d+(\.\d+)?)/g, "($1($2))");

    return expr
        .replace(/π/g, "Math.PI")
        .replace(/e/g, "Math.E")
        .replace(/sqrt\(/g, "Math.sqrt(")
        .replace(/log\(/g, "Math.log10(")
        .replace(/sin\(/g, isDegree ? "Math.sin(Math.PI/180*" : "Math.sin(")
        .replace(/cos\(/g, isDegree ? "Math.cos(Math.PI/180*" : "Math.cos(")
        .replace(/tan\(/g, isDegree ? "Math.tan(Math.PI/180*" : "Math.tan(")
        .replace(/\^/g, "**");
        
}

function calculate() {
    try {
        // Remove all commas from the input string before processing
        let rawInput = display.value.replace(/,/g, ""); 
        
        let expr = prepareExpression(rawInput);
        console.log(expr);
        
        let result = Function(`"use strict"; return (${expr})`)();

        if (!isFinite(result)) throw Error();

        display.value = formatNumber(result);
    } catch {
        display.value = "Error";
        setTimeout(clearDisplay, 1200);
    }
}
function formatNumber(num) {
    let rounded = Math.round(num * 1000) / 1000;
    return rounded.toLocaleString(undefined, {
        maximumFractionDigits: 6
    });
}

// ⌨️ keyboard upgrade
document.addEventListener("keydown", (e) => {
    const key = e.key;

    if (!isNaN(key) || key === ".") appendToDisplay(key);
    else if ("+-*/^()".includes(key)) appendToDisplay(key);
    else if (key === "Enter") {
        e.preventDefault();
        calculate();
    }
    else if (key === "Backspace") deleteLast();
    else if (key.toLowerCase() === "c") clearDisplay();
});