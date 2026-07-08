import { BaseGuildTextChannel, ChatInputCommandInteraction, MessageFlags } from "discord.js";
import { manageGameServersComponent, steamConnectComponent } from "../ui/steamConnect.ts";
import client from "../services/backendClient.ts";
import { t } from "../utils/i18n.ts";

export const createSteamConnectHandler = async (interaction: ChatInputCommandInteraction): Promise<void> => {
    const ip = interaction.options.getString("ip", true);
    const port = interaction.options.getInteger("port", true);
    const password = interaction.options.getString("password", false);
    const text = interaction.options.getString("text", false) ?? undefined;
    const res = await client.v1.guilds[":guildId"].codes.$post({
        param: { guildId: interaction.guildId! },
        json: { ip, port, password: password },
    });
    const data = await res.json();

    if ((res.status as number) === 400) {
        await interaction.reply({
            content: t("steamConnect.invalidInput", interaction.locale),
            flags: MessageFlags.Ephemeral,
        });
        return;
    }

    if (res.status === 402) {
        await interaction.reply({
            content: (data as { error: string }).error,
            flags: MessageFlags.Ephemeral,
        });
        return;
    }

    if (!res.ok) {
        await interaction.reply({
            content: t("steamConnect.error.create", interaction.locale),
            flags: MessageFlags.Ephemeral,
        });
        return;
    }

    if (!(interaction.channel instanceof BaseGuildTextChannel)) return;

    await interaction.channel.send({
        components: [steamConnectComponent((data as { code: string }).code, interaction.guildLocale ?? interaction.locale, text)],
        flags: MessageFlags.IsComponentsV2,
    });
    await interaction.reply({
        content: t("steamConnect.create.success", interaction.locale),
        flags: MessageFlags.Ephemeral,
    });
};

export const manageSteamConnectHandler = async (interaction: ChatInputCommandInteraction): Promise<void> => {
    const response = await client.v1.guilds[":guildId"].codes.$get({
        param: { guildId: interaction.guildId! },
        query: {},
    });

    if (!response.ok) {
        await interaction.reply({
            content: t("steamConnect.error.fetch", interaction.locale),
            flags: MessageFlags.Ephemeral,
        });
        return;
    }

    const { data: codes } = await response.json();

    await interaction.reply({
        components: [await manageGameServersComponent(interaction, codes)],
        flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
    });
};
