# discordts-decorators
A discordjs package that uses TC39 decorator pattern. This package is a wrapper for discord.js that allows you to use decorators to create commands and events.

## Examples

### Command
```ts
import { Injections } from "discordts-decorators";
import { CommandInteraction } from "discord.js";

const { Discord, Command } = Injections();

@Discord
export class Fun {
  // Read the documention for more information
  // on how to use integration_types and context
  // https://discord.com/developers/docs/interactions/application-commands#interaction-contexts
  public static integration_types = [0, 1];
  public static context = [0, 1, 2];

  @Command('Ping the bot')
  public static async ping(interaction: CommandInteraction) {
    const { createdTimestamp } = interaction;
    const reply = await interaction.editReply('Pinging...');
    const messagePing = reply.createdTimestamp - createdTimestamp;
    const websocketPing = interaction.client.ws.ping;

    await interaction.editReply(`Pong!\n**Message Ping:** ${messagePing}ms\n**Websocket Ping:** ${websocketPing}ms`);
  }
}
```

### Event
```ts
import { Injections } from "discordts-decorators";
import {
  Collection,
  CommandInteraction,
  CommandInteractionOptionResolver,
  InteractionDeferReplyOptions
} from "discord.js";

const { Discord, Event } = Injections();

@Discord
export class EventManager {
  @Event()
  public static async ready() {
    console.log('Client is ready!');
  }

  @Event()
  public static async error(error: Error) {
    console.error(error);
  }

  @Event()
  public static async interactionCreate(interaction: CommandInteraction) {
    const {client } = interaction;
    const subcommmand = (interaction.options as CommandInteractionOptionResolver).getSubcommand();

    const command = client.commands.get(subcommmand);
    if (!command) return;

    // Cooldowns handling
    const cooldowns = client.cooldowns;
    if (!cooldowns.has(command.name)) {
      cooldowns.set(command.name, new Collection<string, string>());
    }

    const now = new Date().getTime();
    const timestamps = cooldowns.get(command.name);
    const cooldownAmount = command.cooldown * 1000;
    if (timestamps.has(interaction.user.id)) {
      const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;
      if (now < expirationTime) {
        const timeLeft = Math.round((expirationTime - now) / 1000);
        return interaction.reply({
          content: `Please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`,
          ephemeral: true,
        });
      }
    }

    timestamps.set(interaction.user.id, now);
    setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);
    // End of cooldowns handling

    // Command execution
    if (interaction.isCommand()) {
      try {
        await interaction.deferReply({ ephemeral: command.ephemeral || false } as InteractionDeferReplyOptions);
        setTimeout(() => {
          if (!interaction.replied) {
            interaction.editReply('This interaction has expired.');
            return;
          }
        }, 10000);
        await command.run(interaction);
      } catch (error) {
        console.error(error);
        await interaction.editReply('There was an error while executing this command!');
      }
    }
  }
}

export default EventManager;
```

### Bot Initialization
```ts
import {IntentsBitField} from "discord.js";
import { BotManager } from "discordts-decorators";
import EventManager from "./events/EventManager.js";
import Commands from "./commands/index.js";

const intents = new IntentsBitField([
  'Guilds',
  'GuildMembers',
  'GuildMessages',
  'GuildMessageReactions',
  'GuildModeration',
  'GuildPresences',
  'GuildInvites',
  'DirectMessages',
  'DirectMessageReactions',
  'MessageContent',
]);

const DiscordBot = BotManager.getInstance();

DiscordBot.setPrivateData({
  id: 'bot id',
  token: 'bot token',
  intents,
  name: 'VeryCoolName',
}).create(EventManager);

for (const command of Commands) {
  DiscordBot.create(command);
}

await DiscordBot.buildClient();
await DiscordBot.login();
DiscordBot.setPresence('idle', {
  name: 'with discordts-decorators',
});
```

### Version
1.2.6
```
- Fixed log for commands and events
```

1.2.5
```
- Added ability to `removeGuildCommands` using BotManager
```

1.2.42
```
- Revert log for commands and events
```

1.2.4
```
- Debug mode on global.Config.debug (default false)
- Added debug log for commands and events
```

1.2.3
```
- Moved context and integration to command instead of subcommand
- Added context/integration to variables
```

1.2.2
```
- Fixed context and integration with discord.js
- Fixed log for events/commands classes
```

1.2.0
```
- Added support for installable user applications
- Added context to commands
```

1.1.12
```
- Added guild refresh commands
```

1.1.11
```
- Release new build
```

1.1.1
```
- Set metadata on options to be optional
```

1.1.0
```
- Added better logging for commands and events
- Added better error handling for commands and events
- Moved choices, max_length, and min_length to metadata.choices, metadata.max_length, and metadata.min_length
- Update typings for new discord.js version
```

1.0.0
```
- Initial release
```