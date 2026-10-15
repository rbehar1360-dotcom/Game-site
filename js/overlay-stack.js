(function () {
    const overlayStack = [];
    const suspendedOverlays = new WeakSet();
    const overlayState = new WeakMap();

    function isSiteOverlay(element) {
        if (!(element instanceof HTMLElement)) {
            return false;
        }

        return element.id.endsWith("Overlay") ||
            element.id === "legalModal" ||
            Array.from(element.classList).some(className =>
                className.endsWith("-overlay") ||
                className === "legal-modal"
            );
    }

    function isOpen(element) {
        return element.classList.contains("open");
    }

    function saveOverlayState(element) {
        if (overlayState.has(element)) {
            return;
        }

        overlayState.set(element, {
            ariaHidden: element.getAttribute("aria-hidden"),
            inert: element.inert,
            zIndex: element.style.zIndex,
            placeholder: null
        });
    }

    function setOverlayActive(element, active, zIndex) {
        const state = overlayState.get(element);
        if (!state) {
            return;
        }

        element.inert = !active;
        element.setAttribute("aria-hidden", String(!active));
        element.style.zIndex = active
            ? String(zIndex)
            : state.zIndex;
    }

    function portalNestedOverlay(element, activeOverlay) {
        if (!activeOverlay || !activeOverlay.contains(element)) {
            return;
        }

        const state = overlayState.get(element);
        const placeholder = document.createComment("overlay-stack-placeholder");
        element.parentNode.insertBefore(placeholder, element);
        state.placeholder = placeholder;
        document.body.appendChild(element);
    }

    function restoreOverlayPosition(element) {
        const state = overlayState.get(element);
        if (!state || !state.placeholder) {
            return;
        }

        if (state.placeholder.parentNode) {
            state.placeholder.parentNode.insertBefore(
                element,
                state.placeholder
            );
            state.placeholder.remove();
        }

        state.placeholder = null;
    }

    function openOverlay(element) {
        if (overlayStack.includes(element)) {
            return;
        }

        const currentOverlay = overlayStack[overlayStack.length - 1];
        saveOverlayState(element);
        portalNestedOverlay(element, currentOverlay);

        if (currentOverlay) {
            suspendedOverlays.add(currentOverlay);
            currentOverlay.classList.remove("open");
            setOverlayActive(currentOverlay, false, 0);
        }

        overlayStack.push(element);
        setOverlayActive(element, true, 100000 + overlayStack.length);
    }

    function closeOverlay(element) {
        const index = overlayStack.lastIndexOf(element);
        if (index === -1) {
            return;
        }

        if (index !== overlayStack.length - 1) {
            overlayStack.splice(index, 1);
            restoreOverlayPosition(element);
            setOverlayActive(element, false, 0);
            overlayState.delete(element);
            return;
        }

        overlayStack.pop();
        restoreOverlayPosition(element);

        const state = overlayState.get(element);
        if (state) {
            element.inert = state.inert;
            if (state.ariaHidden === null) {
                element.removeAttribute("aria-hidden");
            } else {
                element.setAttribute("aria-hidden", state.ariaHidden);
            }
            element.style.zIndex = state.zIndex;
            overlayState.delete(element);
        }

        const previousOverlay = overlayStack[overlayStack.length - 1];
        if (previousOverlay) {
            suspendedOverlays.delete(previousOverlay);
            previousOverlay.classList.add("open");
            setOverlayActive(
                previousOverlay,
                true,
                100000 + overlayStack.length
            );
        }
    }

    const observer = new MutationObserver(records => {
        const changedOverlays = new Set();

        records.forEach(record => {
            const element = record.target;
            if (
                element instanceof HTMLElement &&
                isSiteOverlay(element) &&
                !suspendedOverlays.has(element)
            ) {
                changedOverlays.add(element);
            }
        });

        changedOverlays.forEach(element => {
            if (isOpen(element)) {
                openOverlay(element);
            } else {
                closeOverlay(element);
            }
        });
    });

    function start() {
        if (!document.body) {
            return;
        }

        observer.observe(document.body, {
            subtree: true,
            attributes: true,
            attributeFilter: ["class"]
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", start, { once: true });
    } else {
        start();
    }
})();
