import { env } from "./config/env.js";
import { app } from "./app.js";
import { prisma } from "./config/prisma.js";
import { startKeepAlive } from "./utils/keepAlive.js";

const PORT = env.PORT || 4000;

async function main() {
  try {
    await prisma.$connect();
    console.log("✅ Database connected");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT} [${env.NODE_ENV}]`);

      // Prevent Render free tier cold starts
      if (process.env.RENDER_EXTERNAL_URL) {
        startKeepAlive(process.env.RENDER_EXTERNAL_URL);
      }
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

main();
