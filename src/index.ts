import { Bot } from "./bot.ts";
import { logger } from "./utils/logger.ts";

const bot = new Bot();

try {
    await bot.start();
} catch (error) {
    logger.error("Failed to start bot", error);
    Deno.exit(1);
}
