from state import GlobalState, ExplanationOutput

def explanation_agent(state: GlobalState) -> GlobalState:
    """
    Explanation Agent: Summarizes the mission status and agent findings.
    """
    vision = state.vision_output
    nav = state.navigation_output
    comms = state.comms_output
    
    blocked_count = len(vision.roads) if vision else 0
    est_time = nav.estimated_time if nav else "Unknown"
    
    summary = (
        f"Mission Report: Identified {blocked_count} blocked roads. "
        f"Safe route calculated with ETA {est_time}. "
        "Alerts have been generated for the affected region."
    )
    
    explanation_result = ExplanationOutput(
        summary=summary,
        detailed_report="Detailed report content would go here..."
    )
    
    state.explanation_output = explanation_result
    return state
