def calculate_route(start, end, blocked_roads):
    """
    Mock implementation of route calculation.
    Returns a list of waypoints representing a safe route.
    """
    # Simple mock logic: just return a direct path if no blocks, 
    # or a detour if there are blocks (though for now we just return a static list)
    return [start, "Waypoint-1", "Waypoint-2", end]
