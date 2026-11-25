import { createRoot } from "react-dom/client";
import { useState } from "react";
import Game from "../app/game/game";
import {
  digestKey,
  randomKey,
  tableOrigin,
  validKey,
} from "../app/game/pages-host";
import "../app/globals.css";

const sessionKey = "com.judgedeanllc.onetinyrevision.pages-session";
const pendingKey = sessionKey + ".pending";
const exchangeUrl = new URL("/api/pages-session", tableOrigin);
async function signIn() {
  const verifier = randomKey(),
    state = randomKey();
  const url = new URL(exchangeUrl);
  url.searchParams.set("challenge", await digestKey(verifier));
  url.searchParams.set("state", state);
  sessionStorage.setItem(pendingKey, JSON.stringify({ verifier, state }));
  location.assign(url);
}
async function finishSignIn() {
  const params = new URLSearchParams(location.hash.slice(1));
  if (!params.has("code")) return;
  history.replaceState(null, "", location.pathname + location.search);
  const pending = JSON.parse(sessionStorage.getItem(pendingKey) || "null");
  sessionStorage.removeItem(pendingKey);
  if (
    !pending ||
    pending.state !== params.get("state") ||
    !validKey(pending.verifier)
  )
    throw Error("Sign in again from this tab to join the shared banquet.");
  const r = await fetch(exchangeUrl, {
    method: "POST",
    credentials: "omit",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      code: params.get("code"),
      verifier: pending.verifier,
    }),
  });
  if (!r.ok)
    throw Error(
      "That sign-in expired. Sign in again to join the shared banquet.",
    );
  const { token } = (await r.json()) as { token?: unknown };
  if (!validKey(token))
    throw Error("Sign-in could not be completed. Please try again.");
  sessionStorage.setItem(sessionKey, token);
}

function PagesGame({ notice }: { notice: string }) {
  const [token, setToken] = useState(() => sessionStorage.getItem(sessionKey)),
    [message, setMessage] = useState(notice);
  const request: typeof fetch = async (path, options) => {
    const headers = new Headers(options?.headers);
    if (token) headers.set("Authorization", "Bearer " + token);
    const r = await fetch(new URL(String(path), tableOrigin), {
      ...options,
      headers,
      credentials: "omit",
    });
    if (r.status === 401 && token) {
      sessionStorage.removeItem(sessionKey);
      setMessage("Your session expired. Sign in to return to your plate.");
      setToken(null);
    }
    return r;
  };
  return (
    <>
      {message && (
        <p className="error" role="alert">
          {message}
        </p>
      )}
      <Game
        key={token ?? "practice"}
        user={token ? "Chef" : null}
        request={request}
        signIn={() =>
          void signIn().catch(() =>
            setMessage(
              "This browser could not start sign-in. Allow session storage and try again.",
            ),
          )
        }
      />
    </>
  );
}

async function start() {
  let notice = "";
  try {
    await finishSignIn();
  } catch (e) {
    notice = e instanceof Error ? e.message : "Please sign in again.";
  }
  createRoot(document.getElementById("root")!).render(
    <PagesGame notice={notice} />,
  );
}
void start();
