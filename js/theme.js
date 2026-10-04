/* =========================================
   GAME HUB THEME SYSTEM
========================================= */

const themes = {
  blue: {
    background1: "#081a24",
    background2: "#0f2e44",
    background3: "#00bcd4",
    card: "rgba(15, 40, 55, 0.9)",
    header: "rgba(10, 25, 35, 0.9)",
    accent: "#00e5ff",
    accentLight: "#a7eaff",
    text: "#ffffff",
    title: "#dffcff",
    shadow: "rgba(0, 200, 255, 0.25)",
    glow: "rgba(0, 255, 255, 0.7)"
  },

  purple: {
    background1: "#10051c",
    background2: "#261044",
    background3: "#8b35d6",
    card: "rgba(40, 20, 65, 0.9)",
    header: "rgba(20, 10, 35, 0.9)",
    accent: "#b84dff",
    accentLight: "#e1a8ff",
    text: "#ffffff",
    title: "#f0d9ff",
    shadow: "rgba(180, 77, 255, 0.25)",
    glow: "rgba(200, 80, 255, 0.7)"
  },

  red: {
    background1: "#1c060b",
    background2: "#44101a",
    background3: "#d63252",
    card: "rgba(60, 20, 30, 0.9)",
    header: "rgba(35, 10, 18, 0.9)",
    accent: "#ff4d6d",
    accentLight: "#ffabbc",
    text: "#ffffff",
    title: "#ffe0e6",
    shadow: "rgba(255, 77, 109, 0.25)",
    glow: "rgba(255, 77, 109, 0.7)"
  },

  green: {
    background1: "#03150c",
    background2: "#0b3a20",
    background3: "#00a854",
    card: "rgba(10, 50, 30, 0.9)",
    header: "rgba(5, 30, 18, 0.9)",
    accent: "#00ff88",
    accentLight: "#9affca",
    text: "#ffffff",
    title: "#d8ffe9",
    shadow: "rgba(0, 255, 136, 0.25)",
    glow: "rgba(0, 255, 136, 0.7)"
  },

  orange: {
    background1: "#1c0d03",
    background2: "#4a2608",
    background3: "#e66b00",
    card: "rgba(60, 35, 10, 0.9)",
    header: "rgba(35, 18, 5, 0.9)",
    accent: "#ff9d00",
    accentLight: "#ffd080",
    text: "#ffffff",
    title: "#fff0d0",
    shadow: "rgba(255, 157, 0, 0.25)",
    glow: "rgba(255, 157, 0, 0.7)"
  },

  pink: {
    background1: "#1c0617",
    background2: "#44102f",
    background3: "#d62d9b",
    card: "rgba(60, 15, 45, 0.9)",
    header: "rgba(35, 8, 25, 0.9)",
    accent: "#ff4dcc",
    accentLight: "#ffabe8",
    text: "#ffffff",
    title: "#ffe0f6",
    shadow: "rgba(255, 77, 204, 0.25)",
    glow: "rgba(255, 77, 204, 0.7)"
  }
};


/* =========================================
   STORAGE
========================================= */

const defaultTheme = "blue";

const savedTheme = localStorage.getItem("gameHubTheme");
const savedCustomColor = localStorage.getItem("gameHubCustomColor");


/* =========================================
   APPLY THEME
========================================= */

function applyTheme(themeName) {
  const theme = themes[themeName];

  if (!theme) {
    applyTheme(defaultTheme);
    return;
  }

  const root = document.documentElement;

  root.style.setProperty("--background-1", theme.background1);
  root.style.setProperty("--background-2", theme.background2);
  root.style.setProperty("--background-3", theme.background3);
  root.style.setProperty("--card", theme.card);
  root.style.setProperty("--header", theme.header);
  root.style.setProperty("--accent", theme.accent);
  root.style.setProperty("--accent-light", theme.accentLight);
  root.style.setProperty("--text", theme.text);
  root.style.setProperty("--title", theme.title);
  root.style.setProperty("--shadow", theme.shadow);
  root.style.setProperty("--glow", theme.glow);

  localStorage.setItem("gameHubTheme", themeName);
  localStorage.removeItem("gameHubCustomColor");

  updateActiveTheme(themeName);
}


/* =========================================
   CUSTOM COLOR
========================================= */

function applyCustomColor(hex) {
  const root = document.documentElement;

  const currentThemeKey =
    localStorage.getItem("gameHubTheme") || defaultTheme;

  const currentTheme =
    themes[currentThemeKey] || themes[defaultTheme];

  root.style.setProperty("--background-1", currentTheme.background1);
  root.style.setProperty("--background-2", currentTheme.background2);
  root.style.setProperty("--card", currentTheme.card);
  root.style.setProperty("--header", currentTheme.header);
  root.style.setProperty("--text", currentTheme.text);

  root.style.setProperty("--background-3", hex);
  root.style.setProperty("--accent", hex);
  root.style.setProperty(
    "--accent-light",
    lightenColor(hex, 40)
  );

  root.style.setProperty(
    "--title",
    lightenColor(hex, 80)
  );

  root.style.setProperty(
    "--shadow",
    hexToRgba(hex, 0.25)
  );

  root.style.setProperty(
    "--glow",
    hexToRgba(hex, 0.7)
  );

  localStorage.setItem("gameHubCustomColor", hex);

  updateActiveTheme(currentThemeKey);
}


/* =========================================
   COLOR HELPERS
========================================= */

function hexToRgba(hex, alpha) {
  hex = hex.replace("#", "");

  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}


function lightenColor(hex, amount) {
  hex = hex.replace("#", "");

  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);

  r = Math.min(255, r + amount);
  g = Math.min(255, g + amount);
  b = Math.min(255, b + amount);

  return "#" +
    r.toString(16).padStart(2, "0") +
    g.toString(16).padStart(2, "0") +
    b.toString(16).padStart(2, "0");
}


function darkenColor(hex, amount) {
  hex = hex.replace("#", "");

  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);

  r = Math.max(0, r - amount);
  g = Math.max(0, g - amount);
  b = Math.max(0, b - amount);

  return "#" +
    r.toString(16).padStart(2, "0") +
    g.toString(16).padStart(2, "0") +
    b.toString(16).padStart(2, "0");
}


/* =========================================
   ACTIVE THEME
========================================= */

function updateActiveTheme(themeName) {
  document.querySelectorAll(".theme-option").forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.theme === themeName
    );
  });
}


/* =========================================
   SETTINGS NAVIGATION
========================================= */

function setupSettingsNavigation() {
  const tabs = document.querySelectorAll(".settings-tab");
  const sections = document.querySelectorAll(".settings-page");

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      const target = tab.dataset.settings;

      tabs.forEach(item => {
        item.classList.remove("active");
      });

      sections.forEach(section => {
        section.classList.remove("active");
      });

      tab.classList.add("active");

      const targetSection =
        document.getElementById(`settings-${target}`);

      if (targetSection) {
        targetSection.classList.add("active");
      }
    });
  });
}


/* =========================================
   SETTINGS OVERLAY
========================================= */

function setupSettingsOverlay() {
  const settingsButton =
    document.getElementById("settingsButton");

  const settingsOverlay =
    document.getElementById("settingsOverlay");

  const closeSettings =
    document.getElementById("closeSettings");

  if (settingsButton && settingsOverlay) {
    settingsButton.addEventListener("click", () => {
      settingsOverlay.classList.add("open");
    });
  }

  if (closeSettings && settingsOverlay) {
    closeSettings.addEventListener("click", () => {
      settingsOverlay.classList.remove("open");
    });
  }

  if (settingsOverlay) {
    settingsOverlay.addEventListener("click", event => {
      if (event.target === settingsOverlay) {
        settingsOverlay.classList.remove("open");
      }
    });
  }
}


/* =========================================
   GAME PREFERENCES
========================================= */

function setupGamePreferences() {
  const preferences = [
    ["autoFullscreenPreference", "gameHubAutoFullscreen"],
    ["confirmLeavePreference", "gameHubConfirmLeave"]
  ];

  preferences.forEach(([inputId, storageKey]) => {
    const input = document.getElementById(inputId);
    if (!input) return;

    input.checked = localStorage.getItem(storageKey) === "true";
    input.addEventListener("change", () => {
      localStorage.setItem(storageKey, String(input.checked));
    });
  });
}

function setupGamePagePreferences() {
  const frame = document.getElementById("gameFrame") ||
    document.querySelector("iframe");

  if (!frame) return;

  if (localStorage.getItem("gameHubConfirmLeave") === "true") {
    window.addEventListener("beforeunload", event => {
      event.preventDefault();
      event.returnValue = "";
    });
  }

  if (localStorage.getItem("gameHubAutoFullscreen") !== "true") return;

  const container = document.querySelector(".game-container") ||
    document.getElementById("Calc") ||
    frame.parentElement ||
    document.querySelector(".game-wrapper");

  if (!container) return;

  if (!document.getElementById("gameHubFullscreenStyles")) {
    const style = document.createElement("style");
    style.id = "gameHubFullscreenStyles";
    style.textContent = `
      .local-game-fullscreen {
        position: fixed !important;
        z-index: 999999 !important;
        inset: 0 !important;
        box-sizing: border-box !important;
        width: 100vw !important;
        height: 100vh !important;
        max-width: none !important;
        max-height: none !important;
        margin: 0 !important;
        overflow: auto;
        background: #000;
      }
      .local-game-fullscreen iframe {
        width: 100% !important;
        height: 100% !important;
        max-width: 100%;
        max-height: 100%;
      }
      .local-game-fullscreen .fullscreen-exit {
        position: fixed;
        top: 12px;
        right: 12px;
        z-index: 1000000;
      }
    `;
    document.head.appendChild(style);
  }

  container.classList.add("local-game-fullscreen");
  document.body.style.overflow = "hidden";

  let exitButton = container.querySelector(".fullscreen-exit");
  if (!exitButton) {
    exitButton = document.createElement("button");
    exitButton.className = "fullscreen-exit";
    exitButton.type = "button";
    exitButton.textContent = "Exit Fullscreen";
    container.appendChild(exitButton);
  }

  const exitFullscreen = () => {
    container.classList.remove("local-game-fullscreen");
    document.body.style.overflow = "";
  };

  exitButton.addEventListener("click", exitFullscreen);
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") exitFullscreen();
  }, true);
}


/* =========================================
   THEME SETTINGS
========================================= */

function setupThemeSettings() {
  const customColor =
    document.getElementById("customColor");

  const customColorText =
    document.getElementById("customColorText");

  const resetTheme =
    document.getElementById("resetTheme");


  document.querySelectorAll(".theme-option").forEach(button => {
    button.addEventListener("click", () => {
      applyTheme(button.dataset.theme);
    });
  });


  if (customColor) {
    if (savedCustomColor) {
      customColor.value = savedCustomColor;

      if (customColorText) {
        customColorText.textContent = savedCustomColor;
      }
    }

    customColor.addEventListener("input", () => {
      const color = customColor.value;

      if (customColorText) {
        customColorText.textContent = color;
      }

      applyCustomColor(color);
    });
  }


  if (resetTheme) {
    resetTheme.addEventListener("click", () => {
      applyTheme(defaultTheme);

      if (customColor) {
        customColor.value = "#00e5ff";
      }

      if (customColorText) {
        customColorText.textContent = "#00e5ff";
      }
    });
  }


  updateActiveTheme(
    localStorage.getItem("gameHubTheme") || defaultTheme
  );
}


/* =========================================
   LOAD SAVED THEME
========================================= */

function loadSavedTheme() {
  if (savedCustomColor) {
    applyCustomColor(savedCustomColor);
    return;
  }

  if (savedTheme && themes[savedTheme]) {
    applyTheme(savedTheme);
    return;
  }

  applyTheme(defaultTheme);
}


/* =========================================
   INITIALIZE
========================================= */

document.addEventListener("DOMContentLoaded", () => {
  setupSettingsOverlay();
  setupSettingsNavigation();
  setupThemeSettings();
  setupGamePreferences();
  setupGamePagePreferences();
});

loadSavedTheme();