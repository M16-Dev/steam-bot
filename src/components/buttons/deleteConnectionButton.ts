import {
    APIButtonComponent,
    APIButtonComponentWithCustomId,
    APIContainerComponent,
    APISectionComponent,
    ButtonInteraction,
    ButtonStyle,
    GuildMemberRoleManager,
    MessageFlags,
} from "discord.js";
import { Component } from "../../types/component.ts";
import client from "../../services/backendClient.ts";
import { t } from "../../utils/i18n.ts";

export default {
    customId: "delete_connection_button",
    async execute(interaction: ButtonInteraction): Promise<void> {
        const [, guildId] = interaction.customId.split(";");

        const response = await client.v1.guilds[":guildId"].connections.discord[":discordId"].$delete({
            param: { guildId: interaction.guildId!, discordId: interaction.user.id },
        });

        if (!response.ok) {
            await interaction.reply({
                content: t("connections.delete.error", interaction.locale),
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        const res = await client.v1.guilds[":guildId"].settings.$get({ param: { guildId } });
        if (!res.ok) {
            await interaction.reply({
                content: t("common.error", interaction.locale),
                flags: MessageFlags.Ephemeral,
            });
            return;
        }
        const verifiedRoleId = (await res.json()).verifiedRoleId;
        if (verifiedRoleId && interaction.member?.roles instanceof GuildMemberRoleManager) {
            await interaction.member.roles.remove(verifiedRoleId).catch(() => {});
        }

        const container = interaction.message.components[0].toJSON() as APIContainerComponent;

        const section = container.components.find((comp) =>
            comp.type === 9 &&
            "custom_id" in comp.accessory &&
            comp.accessory.custom_id === interaction.customId
        ) as APISectionComponent | undefined;

        if (section) {
            (section.accessory as APIButtonComponent).disabled = true;
            (section.accessory as APIButtonComponent).style = ButtonStyle.Secondary;
            (section.accessory as APIButtonComponentWithCustomId).label = t("common.deleted", interaction.locale);
        }

        await interaction.update({
            components: [container],
        });
    },
} satisfies Component<ButtonInteraction>;
