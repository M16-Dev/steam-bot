import { Command } from "../types/command.ts";
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { linkAccountsReply } from "../interactions/linkAccountsReply.ts";

export default {
    data: new SlashCommandBuilder()
        .setName("linkaccounts")
        .setDescription("Link your Discord account with your Steam account"),
    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        await linkAccountsReply(interaction);
    },
} satisfies Command<ChatInputCommandInteraction>;
