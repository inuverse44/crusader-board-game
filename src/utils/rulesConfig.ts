export type RulesConfig = {
  enhancedLightMovement: boolean;
};

let config: RulesConfig = {
  enhancedLightMovement: false,
};

export function setRulesConfig(partial: Partial<RulesConfig>) {
  config = { ...config, ...partial };
}

export function getRulesConfig(): RulesConfig {
  return config;
}

