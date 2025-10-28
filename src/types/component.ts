import type { MessageComponentInteraction, ModalSubmitInteraction } from "discord.js";

export type ComponentInteraction = MessageComponentInteraction | ModalSubmitInteraction;

export interface Component {
    customId: string;
    execute: (interaction: ComponentInteraction) => Promise<void>;
}
