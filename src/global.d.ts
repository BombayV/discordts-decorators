declare global {
  namespace NodeJS {
    interface Global {
      Config: {
        debug: boolean;
      }
    }
  }
}

export default {};