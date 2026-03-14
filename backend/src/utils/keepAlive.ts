/**
 * Pings the server every 14 minutes to prevent Render
 * free tier from spinning down due to inactivity.
 * Only runs in production.
 */
export function startKeepAlive(serverUrl: string) {
  if (process.env.NODE_ENV !== "production") return;

  const INTERVAL = 14 * 60 * 1000; // 14 minutes

  setInterval(async () => {
    try {
      const res = await fetch(`${serverUrl}/health-check`);
      console.log(`[keep-alive] ping ${res.status}`);
    } catch (err) {
      console.warn("[keep-alive] ping failed:", err);
    }
  }, INTERVAL);

  console.log("✅ Keep-alive started");
}