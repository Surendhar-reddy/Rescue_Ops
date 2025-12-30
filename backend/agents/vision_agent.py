import os
import json
from typing import Dict, Any, List
from pydantic import ValidationError

# Adjust imports to work when running from backend or root
try:
    from backend.state import GlobalState, VisionOutput, RoadSegment
except ImportError:
    try:
        from state import GlobalState, VisionOutput, RoadSegment
    except ImportError:
        from ..state import GlobalState, VisionOutput, RoadSegment

try:
    import google.generativeai as generativeai
    GEMINI_AVAILABLE = True
except Exception:
    GEMINI_AVAILABLE = False

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")

def _mock_vision_analysis(media_list) -> Dict[str, Any]:
    # Deterministic mocked response for testing and CI when Gemini is absent
    roads = []
    
    for i, m in enumerate(media_list):
        # create deterministic pseudo-results based on filename hash
        rid = f"R{i+1}"
        status = ["blocked", "partial", "clear"][i % 3]
        lat = 37.0 + (i * 0.001)
        lon = -122.0 + (i * 0.001)
        confidence = 0.8 - (i * 0.05)
        reason = f"Mock detected {status} from image {m}"
        roads.append({
            "road_id": rid,
            "status": status,
            "latitude": lat,
            "longitude": lon,
            "confidence": round(confidence, 3),
            "reason": reason
        })
    # If no media, return at least one mock road
    if not roads:
        roads.append({
            "road_id": "R1",
            "status": "blocked",
            "latitude": 37.7749,
            "longitude": -122.4194,
            "confidence": 0.95,
            "reason": "Mock detected blocked road (no image provided)"
        })
        
    return {"roads": roads, "confidence": 0.8}

def vision_agent(state: GlobalState) -> Dict[str, Any]:
    """
    Vision Agent: Analyzes media to find blocked roads.
    """
    try:
        media_files = state.media.get("files", [])
        
        # For now, we rely on the mock because handling actual image bytes 
        # for the Gemini API requires more setup (loading from temp dir).
        # The mock now returns the rich structure we need.
        parsed = _mock_vision_analysis(media_files)
            
        # Validate parsed against Pydantic schema
        vision_out = VisionOutput(**parsed)
        
        return {"vision_output": vision_out}
        
    except Exception as e:
        print(f"Vision Agent Error: {e}")
        # Return empty/default on error to keep graph running
        return {"vision_output": VisionOutput(roads=[], confidence=0.0)}