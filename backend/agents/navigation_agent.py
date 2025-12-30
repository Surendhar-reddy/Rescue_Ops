from state import GlobalState, NavigationOutput
from utils.geo_helpers import calculate_route

def navigation_agent(state: GlobalState) -> GlobalState:
    """
    Navigation Agent: Calculates routes avoiding blocked roads identified by Vision Agent.
    """
    vision_output = state.vision_output
    comms_output = state.comms_output
    blocked_roads = vision_output.roads if vision_output else []
    alerts = comms_output.alerts if comms_output else []
    
    # Mock start and end points
    start_point = "Depot-A"
    end_point = "Shelter-Z"
    
    safe_route = calculate_route(start_point, end_point, blocked_roads)
    
    navigation_result = NavigationOutput(
        routes={"primary": safe_route},
        estimated_time="45 mins"
    )
    
    state.navigation_output = navigation_result
    return state
