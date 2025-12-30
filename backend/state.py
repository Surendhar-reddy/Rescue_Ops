from typing import List, Dict, Any
from pydantic import BaseModel

class RoadSegment(BaseModel):
    road_id: str
    status: str
    latitude: float
    longitude: float
    confidence: float
    reason: str

class VisionOutput(BaseModel):
    roads: List[RoadSegment] = []
    confidence: float = 0.0

class NavigationOutput(BaseModel):
    routes: Dict[str, List[str]] = {}
    estimated_time: str = ""

class CommsOutput(BaseModel):
    alerts: List[str] = []
    channels: List[str] = []

class ExplanationOutput(BaseModel):
    summary: str = ""
    detailed_report: str = ""

class GlobalState(BaseModel):
    user_input: Dict[str, Any]
    media: Dict[str, Any]
    vision_output: VisionOutput | None = None
    navigation_output: NavigationOutput | None = None
    comms_output: CommsOutput | None = None
    explanation_output: ExplanationOutput | None = None
