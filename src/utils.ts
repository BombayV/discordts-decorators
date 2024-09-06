type Colors = 'black' | 'red' | 'green' | 'yellow' | 'blue' | 'magenta' | 'cyan' | 'white' | 'default';

const COLORS: {
  [key in Colors]: string;
} = {
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  default: '\x1b[0m',
};

export const logger = (message: string, color: Colors = 'default') => {
  if (!COLORS[color]) {
    throw new Error(`Invalid color: ${color}`);
  }

  console.log(`${COLORS[color]}${message}${COLORS.default}`);
};