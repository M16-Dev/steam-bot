import type { Event } from "../types/event.ts";
import type { Bot } from "../bot.ts";
import { logger } from "../utils/logger.ts";

export default {
    name: "interactionCreate",

    async execute(interaction) {
        const client = interaction.client as Bot;

        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);

            if (!command) {
                logger.warn(`Unknown command: ${interaction.commandName}`);
                return;
            }

            try {
                await command.execute(interaction);
            } catch (error) {
                logger.error(`Error executing command ${interaction.commandName}`, error);

                const errorMessage = "There was an error while executing this command!";

                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({
                        content: errorMessage,
                        ephemeral: true,
                    });
                } else {
                    await interaction.reply({
                        content: errorMessage,
                        ephemeral: true,
                    });
                }
            }
        } else if (interaction.isModalSubmit() || interaction.isMessageComponent()) {
            const component = client.components.get(interaction.customId);

            if (!component) {
                logger.warn(`Unknown component: ${interaction.customId}`);
                return;
            }

            try {
                await component.execute(interaction);
            } catch (error) {
                logger.error(`Error executing component ${interaction.customId}`, error);
            }
        }
    },
} satisfies Event<"interactionCreate">;
