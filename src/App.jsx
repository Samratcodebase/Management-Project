import { memo, useEffect, useMemo, useState } from "react";
import parse, { attributesToProps, domToReact } from "html-react-parser";
import Dashboard from "./Dashboard.jsx";
import "./styles.css";
import markup from "./markup.html?raw";

const QUESTIONS_ENABLED_KEY = "neoClassicalQuestionsEnabled";

/** A single presentation slide. Its source copy and inner markup stay untouched. */
const Slide = memo(function Slide(props) {
  return <section {...props}>{props.children}</section>;
});

function createParserOptions(questionsEnabled) {
  const options = {
    replace(node) {
      if (
        node.type === "tag" &&
        node.name === "span" &&
        node.attribs?.class?.split(/\s+/).includes("qa") &&
        !questionsEnabled
      ) {
        return <></>;
      }

      if (
        node.type === "tag" &&
        node.name === "section" &&
        node.attribs?.class?.split(/\s+/).includes("slide")
      ) {
        const props = attributesToProps(node.attribs);
        return (
          <Slide key={props.id} {...props}>
            {domToReact(node.children, options)}
          </Slide>
        );
      }
      return undefined;
    },
  };
  return options;
}

function Presentation({ questionsEnabled }) {
  const parserOptions = useMemo(
    () => createParserOptions(questionsEnabled),
    [questionsEnabled],
  );
  const presentation = useMemo(
    () => parse(markup, parserOptions),
    [parserOptions],
  );

  /**
   * React owns the slide tree and page lifecycle. The legacy animation engine
   * remains isolated because it choreographs the existing DOM directly.
   */
  useEffect(() => {
    let cancelled = false;
    let script;

    const frame = requestAnimationFrame(() => {
      if (cancelled) return;
      script = document.createElement("script");
      script.src = "/presentation-engine.js";
      script.async = true;
      script.dataset.presentationEngine = "true";
      document.body.appendChild(script);
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      window.__presentationDestroy?.();
      script?.remove();
    };
  }, []);

  return <main className="presentation-root">{presentation}</main>;
}

function NotFound() {
  return (
    <main className="dashboard-page">
      <section className="dashboard-card">
        <p className="dashboard-eyebrow">404 · Page not found</p>
        <h1>That page doesn’t exist.</h1>
        <a className="dashboard-link" href="/">
          Return to presentation
        </a>
      </section>
    </main>
  );
}

export default function App() {
  const [pathname, setPathname] = useState(window.location.pathname);
  const [questionsEnabled, setQuestionsEnabled] = useState(true);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [settingsError, setSettingsError] = useState("");

  useEffect(() => {
    const syncPath = () => setPathname(window.location.pathname);
    window.addEventListener("popstate", syncPath);
    return () => window.removeEventListener("popstate", syncPath);
  }, []);

  useEffect(() => {
    try {
      const savedValue = window.localStorage.getItem(QUESTIONS_ENABLED_KEY);
      if (savedValue !== null && savedValue !== "true" && savedValue !== "false") {
        throw new Error("The saved display setting is invalid.");
      }
      setQuestionsEnabled(savedValue !== "false");
    } catch (error) {
      setSettingsError(
        error instanceof Error ? error.message : "Could not read the saved setting.",
      );
    } finally {
      setSettingsLoaded(true);
    }

    const syncSetting = (event) => {
      if (event.key !== QUESTIONS_ENABLED_KEY) return;
      setQuestionsEnabled(event.newValue !== "false");
    };
    window.addEventListener("storage", syncSetting);
    return () => window.removeEventListener("storage", syncSetting);
  }, []);

  const updateQuestionsEnabled = (nextValue) => {
    try {
      window.localStorage.setItem(QUESTIONS_ENABLED_KEY, String(nextValue));
      setQuestionsEnabled(nextValue);
      setSettingsError("");
      return "";
    } catch (error) {
      return error instanceof Error
        ? error.message
        : "Could not save the display setting.";
    }
  };

  if (pathname === "/dashboard" || pathname === "/dashboard/") {
    return (
      <Dashboard
        questionsEnabled={questionsEnabled}
        onQuestionsEnabledChange={updateQuestionsEnabled}
      />
    );
  }

  if (pathname !== "/") return <NotFound />;

  if (!settingsLoaded) {
    return <main className="presentation-root" aria-busy="true" />;
  }

  if (settingsError) {
    return (
      <main className="dashboard-page">
        <section className="dashboard-card" role="alert">
          <h1>Could not load the presentation setting</h1>
          <p>{settingsError}</p>
        </section>
      </main>
    );
  }

  return <Presentation questionsEnabled={questionsEnabled} />;
}
