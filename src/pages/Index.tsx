import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import {
  Plus,
  MapPin,
  Clock,
  ChevronRight,
  Activity,
  AlertTriangle,
  FileImage,
  Loader2,
  Bot
} from 'lucide-react';

interface Mission {
  id: string;
  status: 'pending' | 'processing' | 'completed';
  disaster_type: string;
  region: string;
  created_at: string;
  uploads_count?: number;
}

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMissions = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('missions')
          .select('*')
          .eq('created_by', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setMissions(data || []);
      } catch (error) {
        console.error('Error fetching missions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMissions();
  }, [user]);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-success/20 text-success border-success/30';
      case 'processing': return 'bg-warning/20 text-warning border-warning/30';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getDisasterIcon = (type: string) => {
    const icons: Record<string, string> = {
      flood: '🌊',
      earthquake: '🌍',
      cyclone: '🌀',
      fire: '🔥',
      landslide: '⛰️',
      tsunami: '🌊',
      other: '⚠️',
    };
    return icons[type] || '⚠️';
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <DashboardLayout>
      <div className="h-full overflow-auto">
        <div className="max-w-6xl mx-auto p-4 lg:p-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Rescue Ops</h1>
              <p className="text-muted-foreground mt-1">
                Manage and monitor disaster response operations
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => navigate('/agents')}
                variant="outline"
                className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
              >
                <Bot className="h-4 w-4 mr-2" />
                Agent Playground
              </Button>
              <Button
                onClick={() => navigate('/mission/create')}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Mission
              </Button>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="ops-panel p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Activity className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{missions.length}</p>
                  <p className="text-xs text-muted-foreground">Total Missions</p>
                </div>
              </div>
            </div>

            <div className="ops-panel p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {missions.filter(m => m.status === 'processing').length}
                  </p>
                  <p className="text-xs text-muted-foreground">In Progress</p>
                </div>
              </div>
            </div>

            <div className="ops-panel p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <FileImage className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {missions.filter(m => m.status === 'completed').length}
                  </p>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </div>
              </div>
            </div>
          </div>

          {/* Missions List */}
          <div className="ops-panel">
            <div className="ops-panel-header">
              <h2 className="font-semibold text-foreground">MISSIONS</h2>
              <span className="text-xs font-mono text-muted-foreground">
                {missions.length} TOTAL
              </span>
            </div>

            <div className="divide-y divide-border">
              {loading ? (
                <div className="p-8 text-center">
                  <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Loading missions...</p>
                </div>
              ) : missions.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    <MapPin className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">No missions yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Create your first mission to start disaster response operations.
                  </p>
                  <Button
                    onClick={() => navigate('/mission/create')}
                    className="bg-primary text-primary-foreground"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Mission
                  </Button>
                </div>
              ) : (
                missions.map(mission => (
                  <div
                    key={mission.id}
                    onClick={() => navigate(`/mission/${mission.id}/dashboard`)}
                    className="p-4 hover:bg-muted/50 cursor-pointer transition-colors flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-2xl">
                        {getDisasterIcon(mission.disaster_type)}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-foreground">{mission.region}</h3>
                          <Badge className={getStatusBadgeClass(mission.status)}>
                            {mission.status.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                          <span className="capitalize">{mission.disaster_type}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDate(mission.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
