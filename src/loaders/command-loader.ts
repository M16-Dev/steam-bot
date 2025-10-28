import { Collection } from "discord.js";
import { walk } from "@std/fs/walk";
import type { Command } from "../types/command.ts";
import { logger } from "../utils/logger.ts";

export async function loadCommands(): Promise<Collection<string, Command>> {
    const commands = new Collection<string, Command>();

    for await (const entry of walk("src/commands", { exts: [".ts"], skip: [/\.test\.ts$/] })) {
        try {
            const command = await import(`file://${Deno.cwd()}/${entry.path}`);
            if (!command.default) {
                logger.warn(`Command file ${entry.path} has no default export`);
                continue;
            }

            const cmd = command.default as Command;
            if (!cmd.data || !cmd.execute) {
                logger.warn(`Command file ${entry.path} is missing data or execute function`);
                continue;
            }

            commands.set(cmd.data.name, cmd);
            logger.info(`Loaded command: ${cmd.data.name}`);
        } catch (error) {
            logger.error(`Failed to load command from ${entry.path}`, error);
        }
    }

    logger.success(`Loaded ${commands.size} commands`);
    return commands;
}
