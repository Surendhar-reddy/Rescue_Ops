import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { MissionControl } from '@/components/dashboard/MissionControl';
import { MissionResults } from '@/components/dashboard/MissionResults';
import { MissionResponse } from '@/services/api';
import { Bot } from 'lucide-react';

const AgentPlayground = () => {
    const [results, setResults] = useState<MissionResponse | null>(null);

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black p-6">
                <div className="max-w-7xl mx-auto space-y-8">
                    <div className="text-center space-y-4">
                        <div className="flex justify-center">
                            <div className="p-3 rounded-full bg-blue-500/10 border border-blue-500/20">
                                <Bot className="w-10 h-10 text-blue-400" />
                            </div>
                        </div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
                            Agent Playground
                        </h1>
                        <p className="text-gray-400 max-w-2xl mx-auto">
                            Test the autonomous multi-agent system. Upload disaster imagery and watch as the Vision, Navigation, and Communications agents collaborate to generate intelligence.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-1">
                            <MissionControl onMissionComplete={setResults} />
                        </div>
                        <div className="lg:col-span-2">
                            {results ? (
                                <MissionResults results={results} />
                            ) : (
                                <div className="h-full min-h-[400px] flex items-center justify-center border border-white/10 rounded-lg bg-black/20 backdrop-blur-sm">
                                    <div className="text-center text-gray-500">
                                        <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                        <p>Run a mission to see agent outputs here</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AgentPlayground;
