import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Upload } from "lucide-react";
import { runMission, MissionResponse } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface MissionControlProps {
    onMissionComplete: (results: MissionResponse) => void;
}

export const MissionControl: React.FC<MissionControlProps> = ({ onMissionComplete }) => {
    const [disasterType, setDisasterType] = useState("Flood");
    const [region, setRegion] = useState("Hyderabad");
    const [files, setFiles] = useState<File[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const { session } = useAuth();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFiles(Array.from(e.target.files));
        }
    };

    const handleRunMission = async () => {
        if (!session?.access_token) {
            toast({
                title: "Authentication Error",
                description: "You must be logged in to run a mission.",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);
        try {
            toast({
                title: "Mission Started",
                description: "Agents are analyzing the data...",
            });

            const results = await runMission(disasterType, region, files, session.access_token);

            toast({
                title: "Mission Complete",
                description: "Analysis finished successfully.",
            });

            onMissionComplete(results);
        } catch (error) {
            toast({
                title: "Mission Failed",
                description: error instanceof Error ? error.message : "Unknown error",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-md mx-auto bg-black/40 backdrop-blur-md border-white/10 text-white">
            <CardHeader>
                <CardTitle className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    Mission Control
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="disasterType">Disaster Type</Label>
                    <Input
                        id="disasterType"
                        value={disasterType}
                        onChange={(e) => setDisasterType(e.target.value)}
                        className="bg-white/5 border-white/10 text-white"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="region">Region</Label>
                    <Input
                        id="region"
                        value={region}
                        onChange={(e) => setRegion(e.target.value)}
                        className="bg-white/5 border-white/10 text-white"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="files">Upload Media</Label>
                    <div className="flex items-center gap-2">
                        <Input
                            id="files"
                            type="file"
                            multiple
                            onChange={handleFileChange}
                            className="bg-white/5 border-white/10 text-white file:bg-blue-600 file:text-white file:border-0 file:rounded-md file:px-2 file:py-1 file:mr-2 file:hover:bg-blue-700"
                        />
                    </div>
                    {files.length > 0 && (
                        <p className="text-xs text-gray-400">{files.length} files selected</p>
                    )}
                </div>

                <Button
                    onClick={handleRunMission}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold shadow-lg shadow-blue-500/20"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Running Agents...
                        </>
                    ) : (
                        "Run Mission"
                    )}
                </Button>
            </CardContent>
        </Card>
    );
};
