import type { Command } from "../types/command.ts";
import {
    type ChatInputCommandInteraction,
    MessageComponentInteraction,
    MessageFlags,
    PermissionFlagsBits,
    RoleSelectMenuInteraction,
    SlashCommandBuilder,
} from "discord.js";
import RateLimiter from "../utils/rateLimiter.ts";
import Client from "../services/backendClient.ts";
import { getLocalizations, t } from "../utils/i18n.ts";
import { configComponent, tokensComponent } from "../ui/config.ts";

const fetchTokens = async (guildId: string) => {
    const res = await Client.v1.guilds[":guildId"].tokens.$get({ param: { guildId: guildId as string }, query: {} });
    return (await res.json()).data;
};

const handleManageTokensInterface = async (interaction: MessageComponentInteraction) => {
    const tokens = await fetchTokens(interaction.guildId as string);

    const response = await interaction.reply({
        components: [tokensComponent(tokens, interaction.locale)],
        flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
        withResponse: true,
    });

    if (!response.resource?.message) {
        await interaction.followUp({
            content: t("common.error", interaction.locale),
            flags: MessageFlags.Ephemeral,
        });
        return;
    }

    response.resource.message.createMessageComponentCollector({
        filter: async (i) => !(await RateLimiter.handleRateLimit(i)),
    }).on("collect", async (componentInteraction: MessageComponentInteraction) => {
        const [action, tokenId] = componentInteraction.customId.split(";");
        switch (action) {
            case "$delete_token": {
                const res = await Client.v1.guilds[":guildId"].tokens[":id"].$delete({ param: { guildId: interaction.guildId!, id: tokenId } });
                if (!res.ok) {
                    await componentInteraction.reply({
                        content: t("config.tokensPanel.delete.error", interaction.locale),
                        flags: MessageFlags.Ephemeral,
                    });
                    return;
                }
                const updatedTokens = await fetchTokens(interaction.guildId as string);
                await componentInteraction.update({ components: [tokensComponent(updatedTokens, interaction.locale)] });
                break;
            }
            case "$create_token": {
                const res = await Client.v1.guilds[":guildId"].tokens.$post({
                    json: { discordUserId: interaction.user.id },
                    param: { guildId: interaction.guildId as string },
                });
                if (!res.ok) {
                    await componentInteraction.reply({
                        content: t("config.tokensPanel.create.error", interaction.locale),
                        flags: MessageFlags.Ephemeral,
                    });
                    return;
                }
                const token = (await res.json()).token;
                const updatedTokens = await fetchTokens(interaction.guildId as string);
                await componentInteraction.update({ components: [tokensComponent(updatedTokens, interaction.locale)] });
                await componentInteraction.followUp({
                    content: t("config.tokensPanel.create.success", interaction.locale, { token }),
                    flags: MessageFlags.Ephemeral,
                });
                break;
            }
        }
    });
};

export default {
    data: new SlashCommandBuilder()
        .setName("config")
        .setDescription(t("commands.config.description", "en"))
        .setNameLocalizations(getLocalizations("commands.config.name"))
        .setDescriptionLocalizations(getLocalizations("commands.config.description"))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction: ChatInputCommandInteraction) {
        const res = await Client.v1.guilds[":guildId"].settings.$get({ param: { guildId: interaction.guildId as string } });
        if (!res.ok) {
            await interaction.reply({
                content: t("common.error", interaction.locale),
                flags: MessageFlags.Ephemeral,
            });
            return;
        }
        const verifiedRole = (await res.json()).verifiedRoleId || undefined;

        const response = await interaction.reply({
            components: [configComponent(verifiedRole, interaction.locale)],
            flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
            withResponse: true,
        });

        if (!response.resource?.message) {
            await interaction.followUp({
                content: t("common.error", interaction.locale),
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        response.resource.message.createMessageComponentCollector({
            filter: async (i) => !(await RateLimiter.handleRateLimit(i)),
        }).on("collect", async (componentInteraction: MessageComponentInteraction) => {
            switch (componentInteraction.customId) {
                case "$config_verified_role": {
                    const roleSelectInteraction = componentInteraction as RoleSelectMenuInteraction;
                    const selectedRoleId = roleSelectInteraction.values[0];

                    if (selectedRoleId) {
                        const guildRole = roleSelectInteraction.guild?.roles.cache.get(selectedRoleId);
                        const botMember = await roleSelectInteraction.guild?.members.fetchMe();

                        if (guildRole && botMember && guildRole.comparePositionTo(botMember.roles.highest) >= 0) {
                            await roleSelectInteraction.reply({
                                content: t("config.verifiedRole.roleHierarchyError", interaction.locale),
                                flags: MessageFlags.Ephemeral,
                            });
                            return;
                        }
                    }

                    const res = await Client.v1.guilds[":guildId"].settings.$patch({
                        json: { verifiedRoleId: selectedRoleId || null },
                        param: { guildId: interaction.guildId as string },
                    });
                    if (!res.ok) {
                        await componentInteraction.reply({
                            content: t("common.error", interaction.locale),
                            flags: MessageFlags.Ephemeral,
                        });
                        return;
                    }
                    await componentInteraction.deferUpdate();
                    break;
                }
                case "$manage_tokens": {
                    await handleManageTokensInterface(componentInteraction);
                    break;
                }
            }
        });
    },
} satisfies Command<ChatInputCommandInteraction>;
