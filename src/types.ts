import {IntentsBitField, Collection, ClientEvents} from "discord.js";

export enum ContextChannelType {
  GUILD = 0,
  BOT_DM = 1,
  PRIVATE_CHANNEL = 2,
}

export type ContextType = ContextChannelType.GUILD | ContextChannelType.BOT_DM | ContextChannelType.PRIVATE_CHANNEL;
export type BotState = "online" | "idle" | "dnd" | "invisible";
export type IntegrationType = 0 | 1;
export type Choice = {
  name: string,
  value: string
}
export type BotManagerOptions = {
  id: string,
  token: string,
  intents: IntentsBitField,
  name: string
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
  autocomplete?: boolean,
  channel_types?: number[],
  custom_id?: string,
  placeholder?: string,
  options?: StringOption[],
}

export interface CommandInjection {
  kind: "command" | "event",
  name: string,
  run: Function,
  autocomplete?: Function,
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
  integration_types: IntegrationType[],
  contexts: ContextType[],
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