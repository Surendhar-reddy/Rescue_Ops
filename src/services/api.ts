export interface MissionResponse {
    status: string;
    vision?: {
        roads: Array<{
            road_id: string;
            status: string;
            latitude: number;
            longitude: number;
            confidence: number;
            reason: string;
        }>;
        confidence: number;
    };
    navigation?: {
        routes: Record<string, string[]>;
        estimated_time: string;
    };
    explanation?: {
        summary: string;
        detailed_report: string;
    };
    comms?: {
        alerts: string[];
        channels: string[];
    };
}

export const runMission = async (
    disasterType: string,
    region: string,
    files: File[],
    token: string
): Promise<MissionResponse> => {
    const formData = new FormData();
    formData.append("disaster_type", disasterType);
    formData.append("region", region);

    files.forEach((file) => {
        formData.append("files", file);
    });

    try {
        const response = await fetch("/api/run-mission", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
            },
            body: formData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API Error: ${response.status} - ${errorText}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Failed to run mission:", error);
        throw error;
    }
};
