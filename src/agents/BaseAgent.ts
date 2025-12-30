import { IAgent, AgentConfig, AgentResponse } from './types';

export abstract class BaseAgent implements IAgent {
    id: string;
    config: AgentConfig;

    constructor(id: string, config: AgentConfig) {
        this.id = id;
        this.config = config;
    }

    abstract execute(task: string, context?: any): Promise<AgentResponse>;

    protected log(message: string) {
        console.log(`[Agent ${this.config.name}]: ${message}`);
    }
}
