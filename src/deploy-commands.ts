import { REST, Routes } from "discord.js";
import { loadCommands } from "./loaders/command-loader.ts";
import { logger } from "./utils/logger.ts";

const token = Deno.env.get("TOKEN");
const clientId = Deno.env.get("CLIENT_ID");
const guildId = Deno.env.get("GUILD_ID");

if (!token || !clientId) {
    logger.error("Missing TOKEN or CLIENT_ID environment variable");
    Deno.exit(1);
}

logger.info("Loading commands...");
const commands = await loadCommands();
const commandsData = commands.map((command) => command.data.toJSON());
const rest = new REST().setToken(token);

try {
    console.log("Deploying commands...");
    if (guildId) {
        await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commandsData });
        console.log(`Deployed to guild ${guildId}`);
    } else {
        await rest.put(Routes.applicationCommands(clientId), { body: commandsData });
        console.log("Deployed globally");
    }
} catch (error) {
    logger.error("Failed to deploy commands", error);
    Deno.exit(1);
}
