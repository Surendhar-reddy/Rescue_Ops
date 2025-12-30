import os
import shutil
import json
from typing import List, Optional
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv()

# Adjust imports based on running context
try:
    from graph import build_graph
    from state import GlobalState
except ImportError:
    from backend.graph import build_graph
    from backend.state import GlobalState

app = FastAPI(title="Guardian Ops Agent API")

# Configure CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify the frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "temp_uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

SUPABASE_URL = os.getenv("VITE_SUPABASE_URL")
SUPABASE_KEY = os.getenv("VITE_SUPABASE_PUBLISHABLE_KEY")

@app.get("/")
def read_root():
    return {"status": "Guardian Ops Agent Server Running"}

@app.post("/api/run-mission")
async def run_mission(
    authorization: str = Header(None),
    disaster_type: str = Form(...),
    region: str = Form(...),
    files: List[UploadFile] = File(default=[])
):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Authorization header")
    
    token = authorization.replace("Bearer ", "")
    
    # Create Supabase client with user token
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    
    # Set auth for PostgREST (RLS)
    supabase.postgrest.auth(token)
    
    # Get User ID
    user_response = supabase.auth.get_user(token)
    if not user_response or not user_response.user:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user_id = user_response.user.id

    try:
        saved_files = []
        for file in files:
            file_path = os.path.join(UPLOAD_DIR, file.filename)
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            saved_files.append(file.filename) 

        # 1. Create Mission
        mission_data = {
            "disaster_type": disaster_type.lower(), # Enum expects lowercase
            "region": region,
            "status": "processing",
            "created_by": user_id
        }
        
        mission_res = supabase.table("missions").insert(mission_data).execute()
        if not mission_res.data:
             raise HTTPException(status_code=500, detail="Failed to create mission")
        
        mission_id = mission_res.data[0]['id']

        # 2. Run Agents
        initial_state = GlobalState(
            user_input={
                "disaster_type": disaster_type,
                "region": region
            },
            media={
                "files": saved_files
            }
        )

        graph = build_graph()
        final_state = graph.invoke(initial_state)

        # 3. Insert Outputs
        vision_output = final_state.get("vision_output")
        navigation_output = final_state.get("navigation_output")
        explanation_output = final_state.get("explanation_output")
        comms_output = final_state.get("comms_output")

        try:
            if vision_output:
                for road in vision_output.roads:
                    supabase.table("vision_outputs").insert({
                        "mission_id": mission_id,
                        "road_id": road.road_id,
                        "status": road.status,
                        "lat": road.latitude,
                        "lon": road.longitude,
                        "confidence": road.confidence
                    }).execute()

            if navigation_output:
                supabase.table("navigation_outputs").insert({
                    "mission_id": mission_id,
                    "route_geojson": navigation_output.routes, # storing dict as jsonb
                    "eta_minutes": int(navigation_output.estimated_time.split()[0]) if navigation_output.estimated_time else 0,
                    "risk_level": "low"
                }).execute()

            if explanation_output:
                supabase.table("explanations").insert({
                    "mission_id": mission_id,
                    "summary_text": explanation_output.summary
                }).execute()

            if comms_output:
                supabase.table("comms_outputs").insert({
                    "mission_id": mission_id,
                    "location_cluster": "General Area",
                    "urgency": "medium",
                    "needs": comms_output.alerts,
                    "confidence": 0.8
                }).execute()

            # 4. Update Mission Status
            supabase.table("missions").update({"status": "completed"}).eq("id", mission_id).execute()

        except Exception as db_error:
            print(f"Failed to log to Supabase: {db_error}")
            # Try to mark as failed?
            pass

        return {
            "status": "success",
            "mission_id": mission_id,
            "vision": vision_output,
            "navigation": navigation_output,
            "explanation": explanation_output,
            "comms": comms_output
        }

    except Exception as e:
        print(f"Error running mission: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
