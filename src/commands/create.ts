import { ChatInputCommandInteraction, MessageFlags, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { Command } from "../types/command.ts";
import { linkAccountsPublicComponent } from "../utils/components.ts";

export default {
    data: new SlashCommandBuilder()
        .setName("create")
        .setDescription("Creates a new panel")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption((option) =>
            option
                .setName("type")
                .setDescription("The type of panel to create")
                .setRequired(true)
                .setChoices(
                    { name: "Link Account Panel", value: "link_account" },
                )
        ),
    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const type = interaction.options.getString("type", true);

        switch (type) {
            case "link_account":
                await interaction.reply({
                    components: [linkAccountsPublicComponent()],
                    flags: MessageFlags.IsComponentsV2,
                });
                break;
            default:
                await interaction.reply({ content: "Unknown panel type.", flags: MessageFlags.Ephemeral });
        }
    },
} satisfies Command<ChatInputCommandInteraction>;
