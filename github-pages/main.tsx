import { createRoot } from "react-dom/client";
import Game from "../app/game/game";
import { tableOrigin } from "../app/game/pages-host";
import "../app/globals.css";

createRoot(document.getElementById("root")!).render(
  <Game apiOrigin={tableOrigin} />,
);
