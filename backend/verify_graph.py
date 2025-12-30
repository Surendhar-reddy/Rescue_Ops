from graph import build_graph
from state import GlobalState
import traceback

def test_graph_flow():
    with open("verification_result.txt", "w") as f:
        try:
            f.write("Building graph...\n")
            app = build_graph()
            
            f.write("Initializing state...\n")
            initial_state = GlobalState(
                user_input={"disaster_type": "Flood", "region": "Downtown"},
                media={"files": ["test_image.jpg"]}
            )
            
            f.write("Running graph...\n")
            # Invoke the graph
            final_state = app.invoke(initial_state)
            
            f.write("Graph execution completed.\n")
            
            # Verify outputs exist
            f.write(f"Vision Output: {final_state['vision_output'] is not None}\n")
            f.write(f"Comms Output: {final_state['comms_output'] is not None}\n")
            f.write(f"Navigation Output: {final_state['navigation_output'] is not None}\n")
            f.write(f"Explanation Output: {final_state['explanation_output'] is not None}\n")
            
            if (final_state['vision_output'] and 
                final_state['comms_output'] and 
                final_state['navigation_output'] and 
                final_state['explanation_output']):
                f.write("SUCCESS: All agents produced output.\n")
            else:
                f.write("FAILURE: Some agents failed to produce output.\n")
                
        except Exception:
            f.write(traceback.format_exc())

if __name__ == "__main__":
    test_graph_flow()
