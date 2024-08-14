import { REST, ActivityOptions, Client, Collection } from "discord.js";
import { Routes } from 'discord-api-types/v10';
import { Injections } from "../decorators/discord.decorator.js";
import { BotCommand, BotEvent, CommandInjection, BotManagerOptions, ActivityType } from "../../types.js";

const { getInjections } = Injections();

export class BotManager {
  private static instance: BotManager;
  private static client: Client;
  private static privateData: BotManagerOptions | null = null;
  private static REST: REST | null = null;
  private static commands = new Collection<string, BotCommand>();
  private static subcommands = new Collection<string, CommandInjection>();
  private static events = new Collection<string, BotEvent<EventListener>>();

  private constructor() {
    console.log('[BotManager] Instance created.');
  }

  private buildEvents() {
    BotManager.client.events = BotManager.events;
    for (const [eventName, val] of BotManager.events) {
      BotManager.client.on(eventName, val.run);
    }
    return this;
  }

  private buildCommands() {
    BotManager.client.commands = BotManager.subcommands;
    return this;
  }

  private buildCooldowns() {
    BotManager.client.cooldowns = new Collection<string, number>();
    return this;
  }

  // Builds the commands and events for the client.
  private async build() {
    this.buildEvents();
    this.buildCooldowns();
    this.buildCommands();

    return this;
  }

  /**
   * Builds the client with the intents and token
   * provided in the privateData object.
   * Should be called before login.
   * @returns BotManager
   */
  public async buildClient() {
    try {
      if (BotManager.privateData === null) {
        new Error('[BotManager] Private data is null.');
      }

      BotManager.client = new Client({
        intents: BotManager.privateData?.intents,
      });

      BotManager.REST = new REST().setToken(BotManager.privateData.token);
      await this.build();
    } catch (error) {
      console.log("[BotManager] buildClient error: ", error);
    }
    return this;
  }

  /**
   * Logs the client into Discord.
   * Should be called after buildClient.
   * @returns BotManager
   */
  public async login() {
    try {
      if (BotManager.client === null) {
        new Error('BotManager client is null.');
      }

      BotManager.client.login(BotManager.privateData.token).then(() => {
        console.log(`[BotManager] Logged in as ${BotManager.client.user.tag}`);
      }).catch((error) => {
        console.error(`[BotManager] Login error: ${error}`);
      });
    } catch (error) {
      console.error("[BotManager] login error: ", error);
    }
    return this;
  }

  /**
   * Refreshes the commands in the client.
   * Should only be needed when new commands are added.
   * @returns void
   */
  public async refreshCommands() {
    try {
      await BotManager.REST.put(Routes.applicationCommands(BotManager.privateData.id), {
        body: [...BotManager.commands.values()]
      });
      console.log('[BotManager] Commands refreshed.');
    } catch (error) {
      console.error("[BotManager] refreshCommands error: ", error);
    }
  }

  /**
   * Get the instance of the BotManager.
   * @returns BotManager
   */
  static getInstance(): BotManager {
    if (!BotManager.instance) {
      BotManager.instance = new BotManager();
    }

    return BotManager.instance;
  }

  /**
   * Set the presence of the bot.
   * @param status {ActivityType}
   * @param activity {ActivityOptions | null}
   */
  public setPresence(status: ActivityType, activity: ActivityOptions | null = null) {
    if (BotManager.client === null) {
      new Error('[BotManager] Client is null.');
    }

    BotManager.client.once('ready', () => {
      BotManager.client.user.setPresence({
        activities: [activity],
        status: status,
      });
    });
    return this;
  }

  /**
   * Create a new command or event
   * based on the class provided.
   * @param Class {any}
   * @returns BotManager
   */
  public create(Class: any) {
    const instance = new Class();
    const commands = [];
    for (const val of getInjections().get(Class)) {
      const { kind, name } = val;
      if (kind === 'event') {
        BotManager.events.set(name, val);
        val.run.bind(instance);
      }

      if (kind === 'command') {
        commands.push(val);
        BotManager.subcommands.set(name, val);
        val.run.bind(instance);
      }
    }

    if (commands.length === 0) {
      return this;
    }

    BotManager.commands.set(Class.__name, {
      name: Class.__name,
      description: Class.__description,
      options: commands,
    });

    return this;
  }

  /**
   * Set the private data for the bot.
   * @param data {
   *   token: string,
   *   id: string,
   *   intents: number,
   *   name: string
   * }
   * @returns BotManager
   */
  public setPrivateData(data: BotManagerOptions) {
    if (BotManager.privateData === null) {
      BotManager.privateData = data;
    }

    return this;
  }
}

export default BotManager;