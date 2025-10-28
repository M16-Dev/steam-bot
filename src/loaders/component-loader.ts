import { Collection } from "discord.js";
import { walk } from "@std/fs/walk";
import type { Component } from "../types/component.ts";
import { logger } from "../utils/logger.ts";

export async function loadComponents(): Promise<Collection<string, Component>> {
    const components = new Collection<string, Component>();

    for await (const entry of walk("src/components", { exts: [".ts"], skip: [/\.test\.ts$/] })) {
        try {
            const componentModule = await import(`file://${Deno.cwd()}/${entry.path}`);
            if (!componentModule.default) {
                logger.warn(`Component file ${entry.path} has no default export`);
                continue;
            }

            const component = componentModule.default as Component;
            if (!component.customId || !component.execute) {
                logger.warn(`Component file ${entry.path} is missing customId or execute function`);
                continue;
            }

            components.set(component.customId, component);
            logger.info(`Loaded component: ${component.customId}`);
        } catch (error) {
            logger.error(`Failed to load component from ${entry.path}`, error);
        }
    }

    logger.success(`Loaded ${components.size} components`);
    return components;
}
