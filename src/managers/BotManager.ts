import {REST, Client, Collection, ActivityOptions} from "discord.js";
import { Routes } from 'discord-api-types/v10';
import { Injections } from "../decorators/discord.decorator.js";
import { BotCommand, BotEvent, CommandInjection, BotManagerOptions, BotState } from "../types.js";
import {logger} from "../utils";

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
    logger('[BotManager] Instance created.', 'green');
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
      logger(`[BotManager] "buildClient" error: ${error}`, 'red');
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
        logger(`[BotManager] Logged in as ${BotManager.client.user.tag}`, 'green');
      }).catch((error) => {
        logger(`[BotManager] Error logging in: ${error}`, 'red');
      });
    } catch (error) {
      logger(`[BotManager] "login" error: ${error}`, 'red');
    }
    return this;
  }

  /**
   * Refreshes the commands in the client.
   * Should only be needed when new commands are added.
   * @returns Promise<void>
   */
  public async refreshCommands() {
    try {
      await BotManager.REST.put(Routes.applicationCommands(BotManager.privateData.id), {
        body: [...BotManager.commands.values()]
      });
      logger('[BotManager] Commands refreshed.', 'green');
    } catch (error) {
      logger('[BotManager] Error "refreshCommands" commands.', 'red');
    }
  }

  /**
   * Refreshes the commands in the client for a specific guild.
   * @param guildId {string}
   * @returns Promise<void>
   */
  public async refreshGuildCommands(guildId: string) {
    try {
      await BotManager.REST.put(Routes.applicationGuildCommands(BotManager.privateData.id, guildId), {
        body: [...BotManager.commands.values()]
      });
      logger('[BotManager] Guild commands refreshed.', 'green');
    } catch (error) {
      logger('[BotManager] Error "refreshGuildCommands" commands.', 'red');
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
   * @param status {BotState}
   * @param activity {ActivityOptions | null}
   */
  public setPresence(status: BotState, activity: ActivityOptions | null = null) {
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
      integration_types: Class.__integration_types,
      contexts: Class.__context,
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