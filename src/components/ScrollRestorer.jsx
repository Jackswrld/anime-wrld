import { useEffect, useLayoutEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

// BrowserRouter (declarative mode) has no <ScrollRestoration>, and the browser's
// own restoration runs before our pages re-fetch their data, so Back used to land
// on a half-empty page at the wrong height. This remembers scrollY per history
// entry and, on Back/Forward, keeps re-applying it while the page grows, until the
// user scrolls or touches the page themselves.

const STORAGE_KEY = "anime-wrld-scroll";
const MAX_SAVED = 50;
const RESTORE_WINDOW_MS = 4000;

const readSaved = () => {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY)) ?? {};
  } catch {
    return {};
  }
};

const writeSaved = (positions) => {
  try {
    const keys = Object.keys(positions);
    if (keys.length > MAX_SAVED) {
      keys.slice(0, keys.length - MAX_SAVED).forEach((key) => delete positions[key]);
    }
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(positions));
  } catch {
    // Storage can be unavailable (private mode); restoration just won't happen.
  }
};

// The first history entry of a fresh page load always has key "default", so on
// its own it would be shared by every page the user lands on. Add the URL to it.
const entryKey = (location) =>
  location.key === "default" ? `default:${location.pathname}${location.search}` : location.key;

const ScrollRestorer = () => {
  const location = useLocation();
  const navigationType = useNavigationType();
  const keyRef = useRef(entryKey(location));
  const restoringRef = useRef(false);
  const isFirstRenderRef = useRef(true);

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    let frame = 0;
    const save = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (restoringRef.current) {
          return;
        }
        const positions = readSaved();
        delete positions[keyRef.current];
        positions[keyRef.current] = Math.round(window.scrollY);
        writeSaved(positions);
      });
    };

    window.addEventListener("scroll", save, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", save);
    };
  }, []);

  useLayoutEffect(() => {
    keyRef.current = entryKey(location);

    // A fresh load (refresh or typed URL) starts at the top like any new page.
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      return undefined;
    }

    // Filter changes (Worlds genres, A–Z letter) replace the URL in place; keep the user where they are.
    if (navigationType === "REPLACE") {
      return undefined;
    }

    const target = navigationType === "POP" ? readSaved()[keyRef.current] : undefined;

    if (target == null) {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      return undefined;
    }

    restoringRef.current = true;
    const startedAt = Date.now();
    let stopped = false;

    const apply = () => {
      if (stopped) {
        return;
      }
      if (Date.now() - startedAt > RESTORE_WINDOW_MS) {
        stop();
        return;
      }
      if (Math.abs(window.scrollY - target) > 1) {
        window.scrollTo({ top: target, left: 0, behavior: "instant" });
      }
    };

    const observer = new ResizeObserver(apply);
    const timer = setTimeout(() => stop(), RESTORE_WINDOW_MS);
    const userEvents = ["wheel", "touchstart", "keydown", "mousedown"];

    function stop() {
      if (stopped) {
        return;
      }
      stopped = true;
      restoringRef.current = false;
      observer.disconnect();
      clearTimeout(timer);
      userEvents.forEach((name) => window.removeEventListener(name, stop));
    }

    userEvents.forEach((name) => window.addEventListener(name, stop, { passive: true }));
    observer.observe(document.body);
    apply();

    return stop;
  }, [location, navigationType]);

  return null;
};

export default ScrollRestorer;
