import type { Client } from "discord.js";
import { walk } from "@std/fs/walk";
import type { Event } from "../types/event.ts";
import { logger } from "../utils/logger.ts";

export async function loadEvents(client: Client): Promise<void> {
    let eventCount = 0;

    for await (const entry of walk("src/events", { exts: [".ts"], skip: [/\.test\.ts$/] })) {
        try {
            const eventModule = await import(`file://${Deno.cwd()}/${entry.path}`);
            if (!eventModule.default) {
                logger.warn(`Event file ${entry.path} has no default export`);
                continue;
            }

            const event = eventModule.default as Event;
            if (!event.name || !event.execute) {
                logger.warn(`Event file ${entry.path} is missing name or execute function`);
                continue;
            }

            if (event.once) client.once(event.name, (...args) => event.execute(...args));
            else client.on(event.name, (...args) => event.execute(...args));

            logger.info(`Loaded event: ${event.name}`);
            eventCount++;
        } catch (error) {
            logger.error(`Failed to load event from ${entry.path}`, error);
        }
    }

    logger.success(`Loaded ${eventCount} events`);
}
