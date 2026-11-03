import { useEffect, useState } from "react";
import "./dashboard.css";

const LOGIN_KEY = "neoClassicalDashboardLoggedInV2";
const PASSCODE_HASH = "1e74298911d059a018762fa1507d4f64b097d3893c21fe76d136e55a6442e87f";

async function hashPasscode(passcode) {
  if (!globalThis.crypto?.subtle) {
    throw new Error("Secure password hashing is unavailable. Open this site over HTTPS.");
  }
  const digest = await globalThis.crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(passcode),
  );
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

export default function Dashboard({ questionsEnabled, onQuestionsEnabledChange }) {
  const [mode, setMode] = useState("loading");
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const loggedIn = window.sessionStorage.getItem(LOGIN_KEY) === "true";
      setMode(loggedIn ? "authenticated" : "login");
    } catch (storageError) {
      setError(
        storageError instanceof Error
          ? storageError.message
          : "Could not access this browser’s storage.",
      );
      setMode("login");
    }
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      if ((await hashPasscode(passcode)) !== PASSCODE_HASH) {
        setError("That passcode is incorrect.");
        return;
      }

      window.sessionStorage.setItem(LOGIN_KEY, "true");
      setPasscode("");
      setMode("authenticated");
    } catch (storageError) {
      setError(
        storageError instanceof Error
          ? storageError.message
          : "Could not save or verify the passcode.",
      );
    }
  };

  const handleLogout = () => {
    try {
      window.sessionStorage.removeItem(LOGIN_KEY);
      setMode("login");
      setError("");
    } catch (storageError) {
      setError(
        storageError instanceof Error
          ? storageError.message
          : "Could not log out from this browser.",
      );
    }
  };

  const handleToggle = (event) => {
    const saveError = onQuestionsEnabledChange(event.target.checked);
    setError(saveError);
  };

  return (
    <main className="dashboard-page">
      <div className="dashboard-shell">
        <header className="dashboard-header">
          <a className="dashboard-brand" href="/">
            <span className="dashboard-brand-mark">N</span>
            <span>Neo-Classical</span>
          </a>
          {mode === "authenticated" && (
            <button className="dashboard-logout" onClick={handleLogout} type="button">
              Log out
            </button>
          )}
        </header>

        <section className="dashboard-card">
          {mode === "loading" ? (
            <p aria-live="polite">Loading dashboard…</p>
          ) : mode !== "authenticated" ? (
            <>
              <p className="dashboard-eyebrow">Local admin · Dashboard</p>
              <h1>Well-cum💦 Back</h1>
              <p className="dashboard-intro">
                Pehle passcode, phir management wali bakchodi.
                <br />
                Enter the passcode to manage the presentation in this browser.
              </p>
              <form className="dashboard-form" onSubmit={handleSubmit}>
                <label htmlFor="dashboard-passcode">Passcode</label>
                <input
                  autoComplete="current-password"
                  id="dashboard-passcode"
                  onChange={(event) => setPasscode(event.target.value)}
                  required
                  type="password"
                  value={passcode}
                />
                {error && <p className="dashboard-error" role="alert">{error}</p>}
                <button className="dashboard-primary" type="submit">Log in</button>
              </form>
              <p className="dashboard-notice">
             
              </p>
            </>
          ) : (
            <>
              <p className="dashboard-eyebrow">Presentation controls</p>
              <h1>Dashboard</h1>
              <p className="dashboard-intro">
                Control the “Questions are welcome” pill on the final slide.
              </p>
              <label className="dashboard-toggle">
                <span className="dashboard-toggle-copy">
                  <strong>Questions are welcome</strong>
                  <small>{questionsEnabled ? "Visible on the final slide" : "Hidden from the final slide"}</small>
                </span>
                <input
                  checked={questionsEnabled}
                  onChange={handleToggle}
                  type="checkbox"
                />
                <span aria-hidden="true" className="dashboard-switch" />
              </label>
              {error && <p className="dashboard-error" role="alert">{error}</p>}
              <p className="dashboard-notice">
                This setting is saved only in this browser. It will not change what
                other visitors see.
              </p>
              <a className="dashboard-link" href="/">
                View presentation
              </a>
            </>
          )}
        </section>
        <footer className="dashboard-footer">
          <span>Local browser settings</span>
          <a href="/">Back to presentation</a>
        </footer>
      </div>
    </main>
  );
}
