import { Bot } from "../bot.ts";
import { config } from "../../config.ts";
import { db } from "./db.ts";
import { logger } from "../utils/logger.ts";

export function startApiServer(bot: Bot) {
    Deno.serve({ port: config.internalApiPort, onListen: () => {} }, async (req) => {
        const url = new URL(req.url);

        const authHeader = req.headers.get("Authorization")?.replace("Bearer ", "");
        if (authHeader !== config.internalApiKey) {
            return new Response("Unauthorized", { status: 401 });
        }

        if (req.method === "POST" && url.pathname === "/api/internal/user-verified") {
            try {
                const body = await req.json();
                const { guildId, discordId } = body;

                if (!guildId || !discordId) {
                    return new Response(JSON.stringify({ error: "Missing guildId or discordId" }), { status: 400 });
                }

                logger.info(`Internal API: Processing verification for User ${discordId} in Guild ${guildId}`);

                const roleId = await db.getVerifiedRole(guildId);
                if (!roleId) {
                    return new Response(JSON.stringify({ message: "No verified role configured" }), { status: 200 });
                }

                try {
                    const guild = await bot.guilds.fetch(guildId);
                    const member = await guild.members.fetch(discordId);
                    await member.roles.add(roleId);
                    logger.success(`Internal API: Added role ${roleId} to user ${discordId} in guild ${guildId}`);
                    return new Response(JSON.stringify({ success: true }), { status: 200 });
                    // deno-lint-ignore no-explicit-any
                } catch (err: any) {
                    logger.error(`Internal API: Failed to add role: `, err?.rawError ?? err);
                    return new Response(JSON.stringify({ error: "Failed to assign role" }), { status: 500 });
                }
            } catch (_) {
                return new Response(JSON.stringify({ error: "Invalid request" }), { status: 400 });
            }
        }

        return new Response("Not Found", { status: 404 });
    });

    logger.info(`Internal API server listening on port ${config.internalApiPort}`);
}
