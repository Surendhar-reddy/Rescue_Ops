import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertTriangle, Map, MessageSquare, FileText, CheckCircle } from "lucide-react";
import { MissionResponse } from "@/services/api";

interface MissionResultsProps {
    results: MissionResponse | null;
}

export const MissionResults: React.FC<MissionResultsProps> = ({ results }) => {
    if (!results) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl mx-auto mt-6">
            {/* Vision Output */}
            <Card className="bg-black/40 backdrop-blur-md border-white/10 text-white">
                <CardHeader className="flex flex-row items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    <CardTitle className="text-lg">Vision Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[200px]">
                        {results.vision ? (
                            <div className="space-y-2 text-sm">
                                <div>
                                    <span className="font-semibold text-red-400">Blocked Roads:</span>
                                    <ul className="list-disc pl-5 text-gray-300">
                                        {results.vision.roads.filter(r => r.status === 'blocked').length > 0 ? (
                                            results.vision.roads.filter(r => r.status === 'blocked').map((road, i) => (
                                                <li key={i}>
                                                    {road.road_id} <span className="text-xs text-gray-500">({(road.confidence * 100).toFixed(0)}%)</span>
                                                </li>
                                            ))
                                        ) : (
                                            <li>None detected</li>
                                        )}
                                    </ul>
                                </div>
                                <div>
                                    <span className="font-semibold text-green-400">Clear Roads:</span>
                                    <ul className="list-disc pl-5 text-gray-300">
                                        {results.vision.roads.filter(r => r.status === 'clear').length > 0 ? (
                                            results.vision.roads.filter(r => r.status === 'clear').map((road, i) => (
                                                <li key={i}>{road.road_id}</li>
                                            ))
                                        ) : (
                                            <li>None detected</li>
                                        )}
                                    </ul>
                                </div>
                                <div className="text-xs text-gray-500 mt-2">
                                    Confidence: {(results.vision.confidence * 100).toFixed(1)}%
                                </div>
                            </div>
                        ) : (
                            <p className="text-gray-500">No vision data available.</p>
                        )}
                    </ScrollArea>
                </CardContent>
            </Card>

            {/* Navigation Output */}
            <Card className="bg-black/40 backdrop-blur-md border-white/10 text-white">
                <CardHeader className="flex flex-row items-center gap-2">
                    <Map className="h-5 w-5 text-blue-500" />
                    <CardTitle className="text-lg">Navigation Routes</CardTitle>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[200px]">
                        {results.navigation ? (
                            <div className="space-y-2 text-sm">
                                <p className="font-semibold text-blue-300">Estimated Time: {results.navigation.estimated_time}</p>
                                {Object.entries(results.navigation.routes).map(([name, path]) => (
                                    <div key={name} className="mt-2">
                                        <span className="font-semibold capitalize">{name} Route:</span>
                                        <p className="text-gray-300 text-xs mt-1">{path.join(" → ")}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500">No navigation data available.</p>
                        )}
                    </ScrollArea>
                </CardContent>
            </Card>

            {/* Explanation Output */}
            <Card className="bg-black/40 backdrop-blur-md border-white/10 text-white">
                <CardHeader className="flex flex-row items-center gap-2">
                    <FileText className="h-5 w-5 text-purple-500" />
                    <CardTitle className="text-lg">Mission Summary</CardTitle>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[200px]">
                        {results.explanation ? (
                            <div className="space-y-2 text-sm">
                                <p className="text-gray-200">{results.explanation.summary}</p>
                                {results.explanation.detailed_report && (
                                    <div className="mt-2 pt-2 border-t border-white/10">
                                        <p className="text-xs text-gray-400">Detailed Report:</p>
                                        <p className="text-gray-300 text-xs">{results.explanation.detailed_report}</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className="text-gray-500">No explanation available.</p>
                        )}
                    </ScrollArea>
                </CardContent>
            </Card>

            {/* Comms Output */}
            <Card className="bg-black/40 backdrop-blur-md border-white/10 text-white">
                <CardHeader className="flex flex-row items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-green-500" />
                    <CardTitle className="text-lg">Communications</CardTitle>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[200px]">
                        {results.comms ? (
                            <div className="space-y-2 text-sm">
                                <div>
                                    <span className="font-semibold text-red-400">Alerts Sent:</span>
                                    <ul className="list-disc pl-5 text-gray-300">
                                        {results.comms.alerts.length > 0 ? (
                                            results.comms.alerts.map((alert, i) => <li key={i}>{alert}</li>)
                                        ) : (
                                            <li>No alerts sent</li>
                                        )}
                                    </ul>
                                </div>
                                <div className="mt-2">
                                    <span className="font-semibold text-blue-400">Active Channels:</span>
                                    <div className="flex gap-2 mt-1 flex-wrap">
                                        {results.comms.channels.map((channel, i) => (
                                            <span key={i} className="px-2 py-1 bg-blue-500/20 rounded text-xs text-blue-300 border border-blue-500/30">
                                                {channel}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <p className="text-gray-500">No communications data available.</p>
                        )}
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    );
};
