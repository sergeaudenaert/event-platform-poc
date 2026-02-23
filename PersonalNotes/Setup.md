Here's how to get going with Antigravity for this project:

**Step 1 — Download & install** Go to **antigravity.google/download**, pick your OS (Windows, Mac, or Linux), run the installer. It's free during public preview. Sign in with your Google account when prompted.

**Step 2 — Create a workspace** Launch Antigravity → it will prompt you to open a folder. Create a new empty folder (e.g. `event-platform-poc`) and open it. This becomes your project workspace.

**Step 3 — Connect GitHub (important for your repo)** In the Editor view, click the `...` menu top-left → **MCP Servers** → search for **GitHub** and install it. You'll need a GitHub Personal Access Token (PAT) from github.com/settings/tokens — give it repo + workflow permissions. This lets the agent push code directly to your private repo at serge_audenaert@yahoo.com.

**Step 4 — Add Firebase MCP (for cloud deployment)** Still in MCP Servers → install **Firebase** as well. This lets the agent manage your Google Cloud/Firebase project directly.

**Step 5 — Start the agent task** Switch to the **Agent Manager** view → click **New Task** → paste in the prompt from Section 9 of your spec document. The agent will go through planning → coding → verification automatically. You can leave it running and come back.

**A few practical tips:**

- Use **"Plan" mode first** (not "Fast") so the agent shows you its implementation plan before writing code — you can redirect it before it goes too far
- When it asks for approvals (file writes, terminal commands, browser actions) you'll need to be around to click through them on the first run
- If an agent gets stuck or terminates, just click **Retry** in Agent Manager — it happens, especially on larger tasks
- The agent generates **Artifacts** (task lists, plans, screenshots) as it works — these are your checkpoints to verify it's on track

**After the agent finishes:** Check that the repo has been created and pushed, then follow the deployment steps in `/docs/deploy-gcp.md` and `/docs/deploy-azure.md` that the agent should have generated based on your spec.

---
**If token cannot be saved in antigravity**

That error is simply Docker Desktop not being running on your Mac. The GitHub MCP server needs Docker to spin up its container. Fix is quick:

**1 — Start Docker Desktop** Open Docker Desktop from your Applications folder (or Spotlight: `Cmd+Space` → type "Docker"). Wait for the whale icon in your menu bar to stop animating — it takes 20–30 seconds to fully start.

**2 — Retry in Antigravity** Once Docker is running, go back to the MCP Servers screen in Antigravity and click the GitHub MCP entry again → it should connect cleanly now.

**To avoid this in future** — set Docker Desktop to start automatically: Docker Desktop → Settings (gear icon) → General → tick **"Start Docker Desktop when you sign in to your computer"**.

---

One thing worth knowing: not all MCP servers in Antigravity require Docker. The **Firebase MCP** runs via `npx` (Node.js) so it works without Docker. The **GitHub MCP** specifically uses a Docker container, which is why you hit this particular error.

If Docker Desktop isn't installed at all yet, download it from **docker.com/products/docker-desktop** — the free personal plan is fine for this POC.

---
