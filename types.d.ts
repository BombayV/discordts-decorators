import {IntentsBitField, Collection} from "discord.js";

export type BotManagerOptions = {
  id: string,
  token: string,
  intents: IntentsBitField,
  name: string
}

export type Choice = {
  name: string,
  value: string
}

export type StringOption = {
  label: string,
  value: string,
  description?: string,
  default?: boolean,
  emoji?: string,
}

type CommandOptions = {
  type: number,
  name: string,
  description: string,
  required: boolean,
  choices?: Choice[] | null,
  min_length?: number,
  max_length?: number,
  min_value?: number,
  max_value?: number,
  channel_types?: number[],
  custom_id?: string,
  placeholder?: string,
  options?: StringOption[],
}

export interface CommandInjection {
  kind: "command" | "event",
  name: string,
  run: Function,
  description?: string,
  options?: CommandOptions[],
  type?: number,
  cooldown?: number,
  ephemeral?: boolean,
}

export interface BotCommand {
  name: string,
  description: string,
  options: CommandOptions[],
}

export interface BotEvent<T> {
  name: keyof ClientEvents,
  run: T
}

declare module "discord.js" {
  export interface Client {
    subcommmands: Collection<unknown, any>
    commands: Collection<unknown, any>,
    events: Collection<unknown, any>,
    cooldowns: Collection<unknown, any>,
  }
}