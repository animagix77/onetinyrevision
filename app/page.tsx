import Game from "./game/game";
import { getChatGPTUser } from "./chatgpt-auth";
export const dynamic = "force-dynamic";
export default async function Page() {
  const u = await getChatGPTUser();
  return <Game user={u ? u.fullName || u.email.split("@")[0] : null} />;
}
