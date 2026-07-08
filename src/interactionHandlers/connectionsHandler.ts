import { ButtonInteraction, ChatInputCommandInteraction, MessageFlags } from "discord.js";
import { create, getNumericDate } from "@wok/djwt";
import { createConnectionPersonalComponent, manageConnectionsComponent } from "../ui/connections.ts";
import { config } from "../../config.ts";
import client from "../services/backendClient.ts";
import { t } from "../utils/i18n.ts";

const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(config.jwtSecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
);

const tokenExpirationTime = 5;

export const createConnectionHandler = async (interaction: ButtonInteraction | ChatInputCommandInteraction): Promise<void> => {
    const response = await client.v1.users[":discordUserId"].connections.$get({
        param: { discordUserId: interaction.user.id },
        query: {},
    });

    if (!response.ok) {
        await interaction.reply({
            content: t("connections.fetch.error", interaction.locale),
            flags: MessageFlags.Ephemeral,
        });
        return;
    }

    const { data: connections } = await response.json();
    if (connections.length >= config.connectionsLimit) {
        await interaction.reply({
            content: t("connections.limitReached", interaction.locale, { limit: config.connectionsLimit }),
            flags: MessageFlags.Ephemeral,
        });
        return;
    }

    const token = await create(
        { alg: "HS256", typ: "JWT" },
        {
            discordId: interaction.user.id,
            guildId: interaction.guildId,
            exp: getNumericDate(tokenExpirationTime * 60),
            jti: crypto.randomUUID(),
        },
        key,
    );

    await interaction.reply({
        components: [createConnectionPersonalComponent(token, interaction.locale, tokenExpirationTime)],
        flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
    });
};

export const manageConnectionsHandler = async (interaction: ButtonInteraction | ChatInputCommandInteraction): Promise<void> => {
    const response = await client.v1.users[":discordUserId"].connections.$get({
        param: { discordUserId: interaction.user.id },
        query: {},
    });

    if (!response.ok) {
        await interaction.reply({
            content: t("connections.fetch.error", interaction.locale),
            flags: MessageFlags.Ephemeral,
        });
        return;
    }
    const { data: connections } = await response.json();

    await interaction.reply({
        components: [await manageConnectionsComponent(interaction, connections)],
        flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
    });
};
