import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/layout/DashboardLayout';
import MissionMap from '@/components/dashboard/MissionMap';
import SidePanel from '@/components/dashboard/SidePanel';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface Mission {
  id: string;
  status: string;
  disaster_type: string;
  region: string;
  authority_lat: number | null;
  authority_lon: number | null;
  notes: string | null;
  created_at: string;
}

interface RoadData {
  id: string;
  road_id: string;
  status: 'blocked' | 'partial' | 'clear';
  lat: number;
  lon: number;
  confidence: number;
}

interface ClusterData {
  id: string;
  location_cluster: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  people_estimated: number;
  needs: string[];
  lat: number | null;
  lon: number | null;
  confidence: number;
}

interface RouteData {
  route_geojson: any;
  eta_minutes: number;
  risk_level: 'low' | 'medium' | 'high';
}

interface ExplanationData {
  summary_text: string;
  generated_at: string;
}

const MissionDashboard = () => {
  const { missionId } = useParams<{ missionId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [mission, setMission] = useState<Mission | null>(null);
  const [roads, setRoads] = useState<RoadData[]>([]);
  const [clusters, setClusters] = useState<ClusterData[]>([]);
  const [route, setRoute] = useState<RouteData | null>(null);
  const [explanation, setExplanation] = useState<ExplanationData | null>(null);
  const [sidePanelOpen, setSidePanelOpen] = useState(true);

  const fetchMissionData = async () => {
    if (!missionId) return;

    try {
      // Fetch mission
      const { data: missionData, error: missionError } = await supabase
        .from('missions')
        .select('*')
        .eq('id', missionId)
        .single();

      if (missionError) throw missionError;
      setMission(missionData);

      // Fetch vision outputs (roads)
      const { data: roadsData } = await supabase
        .from('vision_outputs')
        .select('*')
        .eq('mission_id', missionId);
      
      setRoads((roadsData || []) as RoadData[]);

      // Fetch comms outputs (clusters)
      const { data: clustersData } = await supabase
        .from('comms_outputs')
        .select('*')
        .eq('mission_id', missionId);
      
      setClusters((clustersData || []) as ClusterData[]);

      // Fetch navigation output
      const { data: routeData } = await supabase
        .from('navigation_outputs')
        .select('*')
        .eq('mission_id', missionId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      setRoute(routeData as RouteData | null);

      // Fetch explanation
      const { data: explanationData } = await supabase
        .from('explanations')
        .select('*')
        .eq('mission_id', missionId)
        .order('generated_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      setExplanation(explanationData as ExplanationData | null);

    } catch (error) {
      console.error('Error fetching mission:', error);
      toast.error('Failed to load mission data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMissionData();
  }, [missionId]);

  // Set up realtime subscriptions
  useEffect(() => {
    if (!missionId) return;

    const channel = supabase
      .channel(`mission-${missionId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'missions', filter: `id=eq.${missionId}` },
        (payload) => {
          if (payload.new) {
            setMission(payload.new as Mission);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'vision_outputs', filter: `mission_id=eq.${missionId}` },
        (payload) => {
          setRoads(prev => [...prev, payload.new as RoadData]);
          toast.info('New road data received');
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'comms_outputs', filter: `mission_id=eq.${missionId}` },
        (payload) => {
          setClusters(prev => [...prev, payload.new as ClusterData]);
          toast.info('New cluster data received');
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'navigation_outputs', filter: `mission_id=eq.${missionId}` },
        (payload) => {
          if (payload.new) {
            setRoute(payload.new as RouteData);
            toast.info('Route updated');
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'explanations', filter: `mission_id=eq.${missionId}` },
        (payload) => {
          if (payload.new) {
            setExplanation(payload.new as ExplanationData);
            toast.info('AI explanation updated');
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [missionId]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="h-full flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground font-mono text-sm">LOADING MISSION DATA...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!mission) {
    return (
      <DashboardLayout>
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg text-foreground mb-4">Mission not found</p>
            <Button onClick={() => navigate('/')}>Return to Missions</Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-success/20 text-success border-success/30';
      case 'processing': return 'bg-warning/20 text-warning border-warning/30 animate-pulse';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-3.5rem)] flex flex-col">
        {/* Dashboard Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-card border-b border-border">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="text-muted-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            
            <div className="h-6 w-px bg-border" />
            
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-semibold text-foreground">{mission.region}</h1>
                <Badge className={getStatusBadgeClass(mission.status)}>
                  {mission.status.toUpperCase()}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground font-mono capitalize">
                {mission.disaster_type} • ID: {mission.id.slice(0, 8)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchMissionData}
              className="text-muted-foreground"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSidePanelOpen(!sidePanelOpen)}
              className="lg:hidden"
            >
              {sidePanelOpen ? 'Hide Panel' : 'Show Panel'}
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Map Area */}
          <div className={`flex-1 ${sidePanelOpen ? 'lg:mr-0' : ''}`}>
            <MissionMap
              centerLat={mission.authority_lat ?? undefined}
              centerLon={mission.authority_lon ?? undefined}
              roads={roads}
              clusters={clusters}
              route={route}
            />
          </div>

          {/* Side Panel */}
          {sidePanelOpen && (
            <div className="w-full lg:w-96 h-full flex-shrink-0 animate-slide-in-right">
              <SidePanel
                mission={mission}
                route={route}
                clusters={clusters}
                explanation={explanation}
              />
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MissionDashboard;
