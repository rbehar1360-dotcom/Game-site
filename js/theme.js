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
   DEFAULT THEME
========================================= */

const defaultTheme = "blue";

const savedTheme = localStorage.getItem("gameHubTheme");

const savedCustomColor =
  localStorage.getItem("gameHubCustomColor");


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


  root.style.setProperty(
    "--background-1",
    theme.background1
  );

  root.style.setProperty(
    "--background-2",
    theme.background2
  );

  root.style.setProperty(
    "--background-3",
    theme.background3
  );

  root.style.setProperty(
    "--card",
    theme.card
  );

  root.style.setProperty(
    "--header",
    theme.header
  );

  root.style.setProperty(
    "--accent",
    theme.accent
  );

  root.style.setProperty(
    "--accent-light",
    theme.accentLight
  );

  root.style.setProperty(
    "--text",
    theme.text
  );

  root.style.setProperty(
    "--title",
    theme.title
  );

  root.style.setProperty(
    "--shadow",
    theme.shadow
  );

  root.style.setProperty(
    "--glow",
    theme.glow
  );


  localStorage.setItem(
    "gameHubTheme",
    themeName
  );


  localStorage.removeItem(
    "gameHubCustomColor"
  );


  updateActiveTheme(themeName);
}


/* =========================================
   CUSTOM COLOR
========================================= */

function applyCustomColor(hex) {

  const root = document.documentElement;


  root.style.setProperty(
    "--accent",
    hex
  );


  root.style.setProperty(
    "--accent-light",
    lightenColor(hex, 45)
  );


  root.style.setProperty(
    "--background-3",
    hex
  );


  root.style.setProperty(
    "--shadow",
    hexToRgba(hex, 0.25)
  );


  root.style.setProperty(
    "--glow",
    hexToRgba(hex, 0.7)
  );


  localStorage.setItem(
    "gameHubCustomColor",
    hex
  );


  localStorage.removeItem(
    "gameHubTheme"
  );


  updateActiveTheme(null);
}


/* =========================================
   COLOR HELPERS
========================================= */

function hexToRgba(hex, alpha) {

  hex = hex.replace("#", "");

  const r = parseInt(
    hex.substring(0, 2),
    16
  );

  const g = parseInt(
    hex.substring(2, 4),
    16
  );

  const b = parseInt(
    hex.substring(4, 6),
    16
  );

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}


function lightenColor(hex, amount) {

  hex = hex.replace("#", "");

  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);


  r = Math.min(
    255,
    r + amount
  );

  g = Math.min(
    255,
    g + amount
  );

  b = Math.min(
    255,
    b + amount
  );


  return "#" +
    r.toString(16).padStart(2, "0") +
    g.toString(16).padStart(2, "0") +
    b.toString(16).padStart(2, "0");
}


/* =========================================
   ACTIVE THEME BUTTON
========================================= */

function updateActiveTheme(themeName) {

  document
    .querySelectorAll(".theme-option")
    .forEach(button => {

      button.classList.remove("active");

      if (
        button.dataset.theme === themeName
      ) {

        button.classList.add("active");

      }

    });

}


/* =========================================
   LOAD SAVED THEME
========================================= */

function loadSavedTheme() {

  if (savedCustomColor) {

    applyCustomColor(
      savedCustomColor
    );

    return;
  }


  if (
    savedTheme &&
    themes[savedTheme]
  ) {

    applyTheme(savedTheme);

    return;
  }


  applyTheme(defaultTheme);
}


/* =========================================
   SETTINGS UI
========================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    const settingsButton =
      document.getElementById(
        "settingsButton"
      );

    const settingsOverlay =
      document.getElementById(
        "settingsOverlay"
      );

    const closeSettings =
      document.getElementById(
        "closeSettings"
      );

    const resetTheme =
      document.getElementById(
        "resetTheme"
      );

    const customColor =
      document.getElementById(
        "customColor"
      );

    const customColorText =
      document.getElementById(
        "customColorText"
      );


    /* Open settings */

    if (settingsButton) {

      settingsButton.addEventListener(
        "click",
        () => {

          settingsOverlay.classList.add(
            "open"
          );

        }
      );

    }


    /* Close settings */

    if (closeSettings) {

      closeSettings.addEventListener(
        "click",
        () => {

          settingsOverlay.classList.remove(
            "open"
          );

        }
      );

    }


    /* Click outside window */

    if (settingsOverlay) {

      settingsOverlay.addEventListener(
        "click",
        event => {

          if (
            event.target ===
            settingsOverlay
          ) {

            settingsOverlay.classList.remove(
              "open"
            );

          }

        }
      );

    }


    /* Preset themes */

    document
      .querySelectorAll(".theme-option")
      .forEach(button => {

        button.addEventListener(
          "click",
          () => {

            const themeName =
              button.dataset.theme;

            applyTheme(themeName);

          }
        );

      });


    /* Custom color */

    if (customColor) {

      customColor.addEventListener(
        "input",
        () => {

          const color =
            customColor.value;

          customColorText.textContent =
            color;

          applyCustomColor(color);

        }
      );

    }


    /* Reset */

    if (resetTheme) {

      resetTheme.addEventListener(
        "click",
        () => {

          applyTheme(defaultTheme);

          customColor.value =
            "#00e5ff";

          customColorText.textContent =
            "#00e5ff";

        }
      );

    }


    /* Highlight current theme */

    updateActiveTheme(
      localStorage.getItem(
        "gameHubTheme"
      )
    );

  }
);


/* =========================================
   APPLY IMMEDIATELY
========================================= */

loadSavedTheme();