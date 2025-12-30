from state import GlobalState, CommsOutput

def comms_agent(state: GlobalState) -> GlobalState:
    """
    Comms Agent: Generates alerts based on the disaster situation.
    """
    disaster_type = state.user_input.get("disaster_type", "Unknown")
    region = state.user_input.get("region", "Unknown")
    
    alerts = [
        f"URGENT: {disaster_type} warning in {region}. Evacuate immediately.",
        "Do not use blocked roads reported by Vision Agent.",
        "Emergency services are en route."
    ]
    
    comms_result = CommsOutput(
        alerts=alerts,
        channels=["SMS", "Radio", "App Notification"]
    )
    
    state.comms_output = comms_result
    return state