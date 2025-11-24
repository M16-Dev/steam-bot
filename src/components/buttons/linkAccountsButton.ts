import { ButtonInteraction } from "discord.js";
import { linkAccountsReply } from "../../interactions/linkAccountsReply.ts";
import { Component } from "../../types/component.ts";

export default {
    customId: "link_accounts_button",
    async execute(interaction: ButtonInteraction): Promise<void> {
        await linkAccountsReply(interaction);
    },
} satisfies Component<ButtonInteraction>;
