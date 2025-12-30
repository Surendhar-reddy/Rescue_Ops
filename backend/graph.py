from langgraph.graph import StateGraph, END
from state import GlobalState
from agents.vision_agent import vision_agent
from agents.navigation_agent import navigation_agent
from agents.comms_agent import comms_agent
from agents.explanation_agent import explanation_agent

def build_graph():
    graph = StateGraph(GlobalState)

    # Add agent nodes
    graph.add_node("vision", vision_agent)
    graph.add_node("navigation", navigation_agent)
    graph.add_node("explanation", explanation_agent)
    graph.add_node("comms", comms_agent)

    # Define flow
    graph.set_entry_point("vision")
    graph.add_edge("vision", "comms")
    graph.add_edge("comms", "navigation")
    graph.add_edge("navigation", "explanation")
    graph.add_edge("explanation", END)

    return graph.compile()
