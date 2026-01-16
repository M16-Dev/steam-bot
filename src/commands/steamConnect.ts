import { ChatInputCommandInteraction, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { Command } from "../types/command.ts";
import { createSteamConnectHandler, manageSteamConnectHandler } from "../interactionHandlers/steamConnectHandler.ts";

export default {
    data: new SlashCommandBuilder()
        .setName("steamconnect")
        .setDescription("Creates a Steam connect button for your server")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand((subcommand) =>
            subcommand
                .setName("create")
                .setDescription("Create a Steam connect button")
                .addStringOption((option) =>
                    option
                        .setName("ip")
                        .setDescription("The IP of your server")
                        .setRequired(true)
                )
                .addIntegerOption((option) =>
                    option
                        .setName("port")
                        .setDescription("The port number of the server")
                        .setRequired(true)
                )
                .addStringOption((option) =>
                    option
                        .setName("password")
                        .setDescription("The password for the server (if any)")
                        .setRequired(false)
                )
                .addStringOption((option) =>
                    option
                        .setName("text")
                        .setDescription("Custom label next to the button. Psst... you can use markdown here!")
                        .setRequired(false)
                )
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("manage")
                .setDescription("Manage your existing Steam connect codes ")
        ),
    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        switch (interaction.options.getSubcommand()) {
            case "create":
                await createSteamConnectHandler(interaction);
                break;
            case "manage":
                await manageSteamConnectHandler(interaction);
                break;
            default:
                return;
        }
    },
} satisfies Command<ChatInputCommandInteraction>;
