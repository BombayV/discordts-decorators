import { Injections } from "../decorators/discord.decorator.js";
import {Collection, CommandInteraction, CommandInteractionOptionResolver } from "discord.js";

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