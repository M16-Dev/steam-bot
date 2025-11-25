import { ButtonInteraction, ChatInputCommandInteraction, MessageFlags } from "discord.js";
import { create, getNumericDate } from "djwt";
import { createConnectionPersonalComponent, manageConnectionsComponent } from "../utils/components.ts";
import { config } from "../../config.ts";

const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(config.jwtSecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
);

export const createConnectionHandler = async (interaction: ButtonInteraction | ChatInputCommandInteraction): Promise<void> => {
    const token = await create(
        { alg: "HS256", typ: "JWT" },
        {
            discordId: interaction.user.id,
            guildId: interaction.guildId,
            exp: getNumericDate(10 * 60),
        },
        key,
    );

    await interaction.reply({
        components: [createConnectionPersonalComponent(token)],
        flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
    });
};

interface ConnectionRow {
    discord_id: string;
    steam_id: string;
    guild_id: string;
    created_at: string;
}
export const manageConnectionsHandler = async (interaction: ButtonInteraction | ChatInputCommandInteraction): Promise<void> => {
    const response = await fetch(`${config.apiUrl}/connections/${interaction.user.id}`, {
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${config.apiKey}`,
        },
    });
    if (!response.ok) {
        await interaction.reply({
            content: `Failed to fetch your connections. Please try again later.`,
            flags: MessageFlags.Ephemeral,
        });
        return;
    }
    const connections: ConnectionRow[] = (await response.json()).connections;

    await interaction.reply({
        components: [await manageConnectionsComponent(interaction, connections.map((con) => ({ guildId: con.guild_id, steamId: con.steam_id })))],
        flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
    });
};
