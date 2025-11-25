import { Command } from "../types/command.ts";
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { createConnectionHandler, manageConnectionsHandler } from "../interactionHandlers/connectionsHandler.ts";

export default {
    data: new SlashCommandBuilder()
        .setName("connections")
        .setDescription("Manage your linked accounts")
        .addSubcommand((subcommand) =>
            subcommand
                .setName("create")
                .setDescription("Link your Discord account with your Steam account")
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("manage")
                .setDescription("Manage your linked accounts")
        ),
    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        switch (interaction.options.getSubcommand()) {
            case "create":
                await createConnectionHandler(interaction);
                return;
            case "manage":
                await manageConnectionsHandler(interaction);
                return;
            default:
                return;
        }
    },
} satisfies Command<ChatInputCommandInteraction>;
