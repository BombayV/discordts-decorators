import {REST, Routes, ActivityOptions, Client, Collection} from "discord.js";
import { Injections } from "../decorators/discord.decorator.js";
import {BotCommand, BotEvent, CommandInjection, BotManagerOptions} from "../../types.js";

type ActivityType = "online" | "idle" | "dnd" | "invisible";

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

  // Getters
  static getInstance(): BotManager {
    if (!BotManager.instance) {
      BotManager.instance = new BotManager();
    }

    return BotManager.instance;
  }

  // Setters
  public setPrivateData(data: BotManagerOptions) {
    if (BotManager.privateData === null) {
      BotManager.privateData = data;
    }

    return this;
  }

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

  // Creates a new instance of a class and adds
  // its commands and events to the client.
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
    // Build discord.js client
    this.buildEvents();
    this.buildCooldowns();
    this.buildCommands();

    return this;
  }

  // Builds the client with the intents and token
  // provided in the privateData object.
  // Should be called before login.
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

  // Logs the client into Discord.
  // Should be called after buildClient.
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

  // Refreshes the commands in the client.
  // Should only be needed when new commands are added.
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
}

export default BotManager;