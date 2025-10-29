import { ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { Command } from "../types/command.ts";
import { steamConnectEmbed } from "../utils/embeds.ts";
import config from "../../config.json" with { type: "json" };

export default {
    data: new SlashCommandBuilder()
        .setName("steamconnect")
        .setDescription("Creates a Steam connect button for your server")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption((option) =>
            option
                .setName("url")
                .setDescription("The Steam connect URL for your server")
                .setRequired(true)
        ),
    async execute(interaction) {
        const url = interaction.options.getString("url", true);
        const match = url.match(/^steam:\/\/connect\/(?<ip>(?:(?:(?!25?[6-9])[12]\d|[1-9])?\d\.?\b){4}):(?<port>[1-9]\d{0,4})\/?(?<password>.*)$/);
        if (!match) {
            return await interaction.reply({
                content: "The provided URL is not a valid Steam connect URL.\n" +
                    "Please ensure it follows the format: `steam://connect/IP:PORT/[optional_password]`",
                flags: MessageFlags.Ephemeral,
            });
        }

        await interaction.reply({
            embeds: [steamConnectEmbed()],
            components: [new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder()
                    .setLabel("Connect to Server")
                    .setStyle(ButtonStyle.Link)
                    .setURL(
                        `${config.steamConnectUrl}?ip=${match.groups?.ip}&port=${match.groups?.port}${
                            match.groups?.password ? `&password=${match.groups.password}` : ""
                        }`,
                    ),
            )],
        });
    },
} satisfies Command;
