/** Whether a file name is a local env file, where secrets belong (templates excluded). */
export const isEnvFile = (name: string): boolean =>
  /^\.env(\..+)?$/.test(name) && !/\.(example|sample|template|defaults)$/.test(name);
