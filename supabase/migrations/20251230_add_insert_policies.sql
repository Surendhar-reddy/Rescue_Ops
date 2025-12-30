-- Add INSERT policies for agent output tables to allow the backend (acting as user) to save results

-- Vision Outputs
CREATE POLICY "Users can insert vision outputs for their missions"
  ON public.vision_outputs FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.missions 
    WHERE id = mission_id AND created_by = auth.uid()
  ));

-- Comms Outputs
CREATE POLICY "Users can insert comms outputs for their missions"
  ON public.comms_outputs FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.missions 
    WHERE id = mission_id AND created_by = auth.uid()
  ));

-- Navigation Outputs
CREATE POLICY "Users can insert navigation outputs for their missions"
  ON public.navigation_outputs FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.missions 
    WHERE id = mission_id AND created_by = auth.uid()
  ));

-- Explanations
CREATE POLICY "Users can insert explanations for their missions"
  ON public.explanations FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.missions 
    WHERE id = mission_id AND created_by = auth.uid()
  ));
