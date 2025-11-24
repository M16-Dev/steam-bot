import type { SteamPlayer } from "../types/steam.ts";
import type { APIButtonComponentWithURL, APIContainerComponent, APISectionComponent, APITextDisplayComponent } from "discord.js";
import SteamID from "steamid";
import { config } from "../../config.ts";

export const steamProfileComponent = (player: SteamPlayer) => {
    const steamId = new SteamID(player.steamid);

    return {
        type: 17,
        components: [
            {
                type: 9,
                components: [
                    {
                        type: 10,
                        content: `# [${player.personaname}](${player.profileurl})\n**Last online:** <t:${player.lastlogoff}:R>`,
                    } satisfies APITextDisplayComponent,
                ],
                accessory: {
                    type: 11,
                    media: { url: player.avatar },
                },
            },
            { type: 14, spacing: 2 },
            {
                type: 10,
                content: `### SteamID64\n\`\`\`${player.steamid}\`\`\``,
            },
            { type: 14 },
            {
                type: 10,
                content: `### SteamID32\n\`\`\`${steamId.steam2()}\`\`\``,
            },
            { type: 14 },
            {
                type: 10,
                content: `### SteamID3\n\`\`\`${steamId.steam3()}\`\`\``,
            },
        ],
    } satisfies APIContainerComponent;
};

export const steamConnectComponent = (code: string, text?: string) => {
    return {
        type: 17,
        components: [
            {
                type: 9,
                components: [
                    {
                        type: 10,
                        content: text?.replace("\\n", "\n") ?? "### Connect to the server!",
                    } satisfies APITextDisplayComponent,
                ],
                accessory: {
                    type: 2,
                    style: 5,
                    url: `${config.apiUrl}/connect/${code}`,
                    label: "Connect",
                } satisfies APIButtonComponentWithURL,
            } satisfies APISectionComponent,
        ],
    } satisfies APIContainerComponent;
};

export const linkAccountsComponent = (token: string) => {
    return {
        type: 17,
        components: [
            {
                type: 9,
                components: [
                    {
                        type: 10,
                        content: "# Link your accounts!",
                    } satisfies APITextDisplayComponent,
                ],
                accessory: {
                    type: 2,
                    style: 5,
                    url: `${config.apiUrl}/auth/steam?token=${encodeURIComponent(token)}`,
                    label: "Link Accounts",
                } satisfies APIButtonComponentWithURL,
            } satisfies APISectionComponent,
            {
                type: 10,
                content: `>>> You will be redirected to Steam login page to give us your public steam ID.
Link is valid for 10 minutes.
Don't share this link! It contains your private token!`,
            } satisfies APITextDisplayComponent,
        ],
    } satisfies APIContainerComponent;
};
