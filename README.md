# discordts-decorators
A discordjs package that uses TC39 decorator pattern. This package is a wrapper for discord.js that allows you to use decorators to create commands and events.

## Examples

### Command
```ts
import { Injections } from "discordts-decorators";
import { CommandInteraction } from "discord.js";

const { Discord, Command, StringOption } = Injections();

@Discord
class Ping {
  @Command('Ping the bot')
  public static async run(interaction: CommandInteraction) {
    await interaction.reply('Pong!');
  }

  @Command('Ping the bot with a message')
  @StringOption('message', 'The message to send', true)
  public static async runWithMessage(interaction: CommandInteraction) {
    const message = interaction.options.getString('message');
    await interaction.reply(`Pong! ${message}`);
  }
}
```

### Event
```ts
import { Injections } from "discordts-decorators";
import { Collection, CommandInteraction, CommandInteractionOptionResolver } from "discord.js";

const { Discord, Event } = Injections();

@Discord
export class EventManager {
  @Event()
  public static async ready() {
    console.log('Bot Events are ready');
  }

  @Event()
  public static error(error: Error) {
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
        await interaction.deferReply({ ephemeral: command.ephemeral || false });
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
import { IntentsBitField } from "discord.js";
import { ActivityType } from "discord-api-types/v10";
import { BotManager } from "discordts-decorators";

const DiscordBot = BotManager.getInstance();

const intents = new IntentsBitField([
  'Guilds',
  'GuildMembers',
  'GuildMessages',
  'GuildMessageReactions',
  'GuildPresences',
  'DirectMessages',
  'DirectMessageReactions',
  'MessageContent'
]);

DiscordBot.setPrivateData({
  id: '', // Bot ID
  token: '', // Bot Token
  intents,
  name: 'Discord Bot'
})

await DiscordBot.buildClient();
await DiscordBot.login();

DiscordBot.setPresence('online', {
  name: 'Discord Bot',
  type: ActivityType.Playing
})

await DiscordBot.refreshCommands();
```

### Version
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