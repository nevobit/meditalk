export type EnvVarConfig<T = string> = {
    required?: boolean;
    default?: T;
    choices?: readonly T[];
    transform?: (val: string) => T;
  };
export type EnvSpec = Record<string, EnvVarConfig<unknown>>;
  export type InferEnv<T extends EnvSpec> = {
    [K in keyof T]: T[K] extends EnvVarConfig<infer R> ? R : string;
  };
  
  export function loadEnv<T extends EnvSpec>(
    spec: T,
    source: NodeJS.ProcessEnv = process.env
  ): InferEnv<T> {
    const result = {} as InferEnv<T>;
  
    for (const key in spec) {
      const cfg = spec[key];
      let val = source[key];
  
      if (!val || val.length === 0) {
        if (cfg?.default !== undefined) {
          val = String(cfg.default);
        } else if (cfg?.required) {
          throw new Error(`Missing required environment variable: ${key}`);
        }
      }
  
      if (val !== undefined) {
        if (cfg?.choices && !cfg.choices.includes(val)) {
          throw new Error(
            `Invalid value for ${key}: "${val}". Must be one of: ${cfg.choices.join(", ")}`
          );
        }
  
        const transformed =
          cfg?.transform !== undefined ? cfg.transform(val) : (val as unknown);
  
        (result as Record<string, unknown>)[key] = transformed;
      }
    }
  
    return result;
  }
  