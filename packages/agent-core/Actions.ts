export type ChainActions = {
  WriteFile: {
    name: string;
    value: any;
  };
};

export type AgentActions = ChainActions & {
  ChangeScene: {
    // type: 'ChangeScene',
    sceneKey: string;
  };
  TakeFullTitle: {
    // type: 'TakeFullTitle',
  };
  SetTitle: {
    // type: 'SetTitle',
    title: string;
    subTitle?: string;
  };
};

export type Action = AgentActions[keyof AgentActions];
