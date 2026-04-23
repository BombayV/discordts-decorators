import { v4 } from 'uuid'
import type {Choice, CommandInjection} from "../types.js";
import {logger} from "../utils.js";

const INJECTIONS = new WeakMap();

const checkCommandExists = (commandInjections: CommandInjection[], key: string) => {
  return commandInjections.find((injection) => injection.name === key);
}

export const Injections = () => {
  const commandInjections: CommandInjection[] = [];

  function getOrCreateCommand(key: string, descriptor: PropertyDescriptor) {
    let command = checkCommandExists(commandInjections, key);
    if (!command) {
      command = {
        kind: 'command',
        name: key,
        description: '',
        options: [],
        run: descriptor.value,
        type: 1
      };
      commandInjections.push(command);
    }
    if (!command.options) {
      command.options = [];
    }
    return command as CommandInjection & { options: any[] };
  }

  // Adds class for usage in Discord.
  // Required for all commands and events
  function Discord(Class: any) {
    INJECTIONS.set(Class, commandInjections);
    Class.__classname = Class.name as string;
    Class.__id = v4() as string;
    Class.__name = Class.name.toLowerCase();
    Class.__description = `Commands for ${Class.__name}`

    if (commandInjections.some((injection) => injection.kind === 'command')) {
      if (!Class.integration_types || Class.integration_types.length === 0) {
        logger(`Class ${Class.__name} is missing integration_types variable. Defaulting to BOTH`, 'red')
        Class.__integration_types = [0, 1];
      } else {
        Class.__integration_types = Class.integration_types;
        if (Class.integration_types.length > 2) {
          logger(`Class ${Class.__name} has more than 2 integration_types. Defaulting to BOTH`, 'red')
          Class.__integration_types = [0, 1];
        }
      }

      if (!Class.context || Class.context.length === 0) {
        logger(`Class ${Class.__name} is missing context variable. Defaulting to GUILD`, 'red')
        Class.__context = [0];
      } else {
        Class.__context = Class.context;
        if (Class.context.length > 3) {
          logger(`Class ${Class.__name} has more than 3 context types. Defaulting to GUILD`, 'red')
          Class.__context = [0];
        }
      }
      logger(`Class ${Class.__name} injected with ${commandInjections.length} commands`, 'blue')
    } else {
      logger(`Class ${Class.__name} injected with ${commandInjections.length} events`, 'blue')
    }

    return Class;
  }

  // Adds command for usage in Discord
  function Command(description: string, cooldown: number = 0, ephemeral: boolean = false) {
    return function (target: any, key: string, descriptor: PropertyDescriptor) {
      const command = checkCommandExists(commandInjections, key)
      if (!command) {
        commandInjections.push({
          kind: 'command',
          name: key,
          description,
          options: [],
          run: descriptor.value,
          type: 1,
          cooldown,
          ephemeral
        })
        logger(`Command ${key} with 0 options injected in class ${target.constructor.name}`, 'yellow')
      } else {
        command.description = description;
        command.cooldown = cooldown;
        command.ephemeral = ephemeral;
        if (command.options && command.options.length > 1) {
          command.options.sort((a, b) => {
            if (a.required) return -1;
            if (b.required) return 1;
            return 0;
          });
        }

        logger(`Command ${key} with ${command.options?.length ?? 0} options injected in class ${target.constructor.name}`, 'yellow')
      }

      return descriptor;
    }
  }

  function Autocomplete(name: string, description: string, required: boolean = false) {
    return function (_: any, key: string, descriptor: PropertyDescriptor) {
      const command = getOrCreateCommand(key, descriptor);
      command.autocomplete = descriptor.value;
      command.options.push({
        name,
        description,
        required,
        autocomplete: true,
        type: 3
      })

      logger(`Autocomplete ${name} injected in class ${_.constructor.name}`, 'green')
      return descriptor;
    }
  }

  function StringOption(name: string, description: string, required: boolean = false, metadata?: {
    choices?: Choice[] | null,
    min_length?: number,
    max_length?: number
  }) {
    return function (_: any, key: string, descriptor: PropertyDescriptor) {
      const command = getOrCreateCommand(key, descriptor);
      command.options.push({
        name,
        description,
        required,
        choices: metadata?.choices,
        min_length: metadata?.min_length,
        max_length: metadata?.max_length,
        type: 3,
      })
      return descriptor;
    }
  }

  function IntegerOption(name: string, description: string, required: boolean = false, metadata?: {
    choices?: Choice[] | null,
    min_value?: number,
    max_value?: number
  }) {
    return function (_: any, key: string, descriptor: PropertyDescriptor) {
      const command = getOrCreateCommand(key, descriptor);
      command.options.push({
        name,
        description,
        required,
        choices: metadata?.choices,
        min_value: metadata?.min_value,
        max_value: metadata?.max_value,
        type: 4
      })
      return descriptor;
    }
  }

  function BooleanOption(name: string, description: string, required: boolean = false) {
    return function (_: any, key: string, descriptor: PropertyDescriptor) {
      const command = getOrCreateCommand(key, descriptor);
      command.options.push({
        name,
        description,
        required,
        type: 5
      })
      return descriptor;
    }
  }

  function UserOption(name: string, description: string, required: boolean = false) {
    return function (_: any, key: string, descriptor: PropertyDescriptor) {
      const command = getOrCreateCommand(key, descriptor);
      command.options.push({
        name,
        description,
        required,
        type: 6
      })
      return descriptor;
    }
  }

  function ChannelOption(name: string, description: string, required: boolean = false, channel_types?: number[]) {
    return function (_: any, key: string, descriptor: PropertyDescriptor) {
      const command = getOrCreateCommand(key, descriptor);
      command.options.push({
        name,
        description,
        required,
        channel_types,
        type: 7
      })
      return descriptor;
    }
  }

  function RoleOption(name: string, description: string, required: boolean = false) {
    return function (_: any, key: string, descriptor: PropertyDescriptor) {
      const command = getOrCreateCommand(key, descriptor);
      command.options.push({
        name,
        description,
        required,
        type: 8
      })
      return descriptor;
    }
  }

  function MentionableOption(name: string, description: string, required: boolean = false) {
    return function (_: any, key: string, descriptor: PropertyDescriptor) {
      const command = getOrCreateCommand(key, descriptor);
      command.options.push({
        name,
        description,
        required,
        type: 9
      })
      return descriptor;
    }
  }

  function NumberOption(name: string, description: string, required: boolean = false, metadata?: {
    choices?: Choice[] | null,
    min_value?: number,
    max_value?: number
  }) {
    return function (_: any, key: string, descriptor: PropertyDescriptor) {
      const command = getOrCreateCommand(key, descriptor);
      command.options.push({
        name,
        description,
        required,
        choices: metadata?.choices,
        min_value: metadata?.min_value,
        max_value: metadata?.max_value,
        type: 10
      })
      return descriptor;
    }
  }

  function AttachmentOption(name: string, description: string, required: boolean = false) {
    return function (_: any, key: string, descriptor: PropertyDescriptor) {
      const command = getOrCreateCommand(key, descriptor);
      command.options.push({
        name,
        description,
        required,
        type: 11
      })
      return descriptor;
    }
  }


  function UserCommand() {
    return function (target: any, key: string, descriptor: PropertyDescriptor) {
      const command = getOrCreateCommand(key, descriptor);
      command.type = 2; // USER command
      command.description = ''; // Required to be empty for non-chat input
      logger(`UserCommand ${key} injected in class ${target.constructor.name}`, 'yellow');
      return descriptor;
    }
  }

  function MessageCommand() {
    return function (target: any, key: string, descriptor: PropertyDescriptor) {
      const command = getOrCreateCommand(key, descriptor);
      command.type = 3; // MESSAGE command
      command.description = ''; // Required to be empty for non-chat input
      logger(`MessageCommand ${key} injected in class ${target.constructor.name}`, 'yellow');
      return descriptor;
    }
  }

  function NSFW() {
    return function (_: any, key: string, descriptor: PropertyDescriptor) {
      const command = getOrCreateCommand(key, descriptor);
      command.nsfw = true;
      return descriptor;
    }
  }

  function DefaultMemberPermissions(permissions: string) {
    return function (_: any, key: string, descriptor: PropertyDescriptor) {
      const command = getOrCreateCommand(key, descriptor);
      command.default_member_permissions = permissions;
      return descriptor;
    }
  }

  function Event() {
    return function (target: any, key: string, descriptor: PropertyDescriptor) {
      commandInjections.push({
        kind: 'event',
        name: key,
        run: descriptor.value,
      })

      logger(`Event ${key} injected in class ${target.constructor.name}`, 'green')
      return descriptor;
    }
  }

  function getInjections() {
    return INJECTIONS;
  }

  return {
    Discord,
    Command,
    Autocomplete,
    StringOption,
    IntegerOption,
    BooleanOption,
    UserOption,
    ChannelOption,
    RoleOption,
    MentionableOption,
    NumberOption,
    AttachmentOption,
    UserCommand,
    MessageCommand,
    NSFW,
    DefaultMemberPermissions,
    Event,
    getInjections,
  }
}