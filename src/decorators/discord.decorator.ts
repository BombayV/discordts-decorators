import { v4 } from 'uuid'
import {Choice, CommandInjection} from "../../types";

const INJECTIONS = new WeakMap();

const checkCommandExists = (commandInjections: CommandInjection[], key: string) => {
  return commandInjections.find((injection) => injection.name === key);
}

export const Injections = () => {
  const commandInjections: CommandInjection[] = [];

  // Adds class for usage in Discord.
  // Required for all commands and events
  function Discord(Class: any) {
    INJECTIONS.set(Class, commandInjections);
    Class.__classname = Class.name as string;
    Class.__id = v4() as string;
    Class.__name = Class.name.toLowerCase();
    Class.__description = `Commands for ${Class.__name}`
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
        // `Command ${key} with 0 options injected in class ${target.constructor.name}`
      } else {
        const commandIndex = commandInjections.findIndex((injection) => injection.name === key);
        const foundCommand = commandInjections[commandIndex];
        foundCommand.description = description;
        foundCommand.cooldown = cooldown;
        foundCommand.ephemeral = ephemeral;
        if (foundCommand.options && foundCommand.options.length > 1) {
          foundCommand.options.sort((a, b) => {
            if (a.required) return -1;
            if (b.required) return 1;
            return 0;
          });
        }
      }

      return descriptor;
    }
  }

  function StringOption(name: string, description: string, required: boolean = false, choices?: Choice[] | null, min_length?: number, max_length?: number) {
    return function (_: any, key: string, descriptor: PropertyDescriptor) {
      const command = checkCommandExists(commandInjections, key)
      if (!command) {
        commandInjections.push({
          kind: 'command',
          name: key,
          description: '',
          options: [],
          run: descriptor.value,
          type: 1,
        })
      }

      const commandIndex = commandInjections.findIndex((injection) => injection.name === key);
      commandInjections[commandIndex].options.push({
        name,
        description,
        required,
        choices,
        min_length,
        max_length,
        type: 3,
      })
      return descriptor;
    }
  }

  function IntegerOption(name: string, description: string, required: boolean = false, choices?: Choice[] | null, min_value?: number, max_value?: number) {
    return function (_: any, key: string, descriptor: PropertyDescriptor) {
      const command = checkCommandExists(commandInjections, key)
      if (!command) {
        commandInjections.push({
          kind: 'command',
          name: key,
          description: '',
          options: [],
          run: descriptor.value,
          type: 1
        })
      }

      const commandIndex = commandInjections.findIndex((injection) => injection.name === key);
      commandInjections[commandIndex].options.push({
        name,
        description,
        required,
        choices,
        min_value,
        max_value,
        type: 4
      })
      return descriptor;
    }
  }

  function BooleanOption(name: string, description: string, required: boolean = false) {
    return function (_: any, key: string, descriptor: PropertyDescriptor) {
      const command = checkCommandExists(commandInjections, key)
      if (!command) {
        commandInjections.push({
          kind: 'command',
          name: key,
          description: '',
          options: [],
          run: descriptor.value,
          type: 1
        })
      }

      const commandIndex = commandInjections.findIndex((injection) => injection.name === key);
      commandInjections[commandIndex].options.push({
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
      const command = checkCommandExists(commandInjections, key)
      if (!command) {
        commandInjections.push({
          kind: 'command',
          name: key,
          description: '',
          options: [],
          run: descriptor.value,
          type: 1
        })
      }

      const commandIndex = commandInjections.findIndex((injection) => injection.name === key);
      commandInjections[commandIndex].options.push({
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
      const command = checkCommandExists(commandInjections, key)
      if (!command) {
        commandInjections.push({
          kind: 'command',
          name: key,
          description: '',
          options: [],
          run: descriptor.value,
          type: 1
        })
      }

      const commandIndex = commandInjections.findIndex((injection) => injection.name === key);
      commandInjections[commandIndex].options.push({
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
      const command = checkCommandExists(commandInjections, key)
      if (!command) {
        commandInjections.push({
          kind: 'command',
          name: key,
          description: '',
          options: [],
          run: descriptor.value,
          type: 1
        })
      }

      const commandIndex = commandInjections.findIndex((injection) => injection.name === key);
      commandInjections[commandIndex].options.push({
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
      const command = checkCommandExists(commandInjections, key)
      if (!command) {
        commandInjections.push({
          kind: 'command',
          name: key,
          description: '',
          options: [],
          run: descriptor.value,
          type: 1
        })
      }

      const commandIndex = commandInjections.findIndex((injection) => injection.name === key);
      commandInjections[commandIndex].options.push({
        name,
        description,
        required,
        type: 9
      })
      return descriptor;
    }
  }

  function NumberOption(name: string, description: string, required: boolean = false, choices?: Choice[] | null, min_value?: number, max_value?: number) {
    return function (_: any, key: string, descriptor: PropertyDescriptor) {
      const command = checkCommandExists(commandInjections, key)
      if (!command) {
        commandInjections.push({
          kind: 'command',
          name: key,
          description: '',
          options: [],
          run: descriptor.value,
          type: 1
        })
      }

      const commandIndex = commandInjections.findIndex((injection) => injection.name === key);
      commandInjections[commandIndex].options.push({
        name,
        description,
        required,
        choices,
        min_value,
        max_value,
        type: 10
      })
      return descriptor;
    }
  }

  function AttachmentOption(name: string, description: string, required: boolean = false) {
    return function (_: any, key: string, descriptor: PropertyDescriptor) {
      const command = checkCommandExists(commandInjections, key)
      if (!command) {
        commandInjections.push({
          kind: 'command',
          name: key,
          description: '',
          options: [],
          run: descriptor.value,
          type: 1
        })
      }

      const commandIndex = commandInjections.findIndex((injection) => injection.name === key);
      commandInjections[commandIndex].options.push({
        name,
        description,
        required,
        type: 11
      })
      return descriptor;
    }
  }

  function Event() {
    return function (_: any, key: string, descriptor: PropertyDescriptor) {
      commandInjections.push({
        kind: 'event',
        name: key,
        run: descriptor.value,
      })

      return descriptor;
    }
  }

  function getInjections() {
    return INJECTIONS;
  }

  return {
    Discord,
    Command,
    StringOption,
    IntegerOption,
    BooleanOption,
    UserOption,
    ChannelOption,
    RoleOption,
    MentionableOption,
    NumberOption,
    AttachmentOption,
    Event,
    getInjections,
  }
}