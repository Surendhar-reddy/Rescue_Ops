export interface AgentConfig {
    name: string;
    description: string;
    capabilities: string[];
}

export interface AgentResponse {
    success: boolean;
    data?: any;
    error?: string;
}

export interface IAgent {
    id: string;
    config: AgentConfig;
    execute(task: string, context?: any): Promise<AgentResponse>;
}
