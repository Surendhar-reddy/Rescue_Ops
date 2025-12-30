import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Info,
  Navigation,
  Users,
  Brain,
  Clock,
  MapPin,
  AlertTriangle,
  Activity,
  Zap,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize
} from 'lucide-react';

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

interface RouteData {
  route_geojson: any;
  eta_minutes: number;
  risk_level: 'low' | 'medium' | 'high';
}

interface ClusterData {
  id: string;
  location_cluster: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  people_estimated: number;
  needs: string[];
  confidence: number;
}

interface ExplanationData {
  summary_text: string;
  generated_at: string;
}

interface SidePanelProps {
  mission: Mission;
  route: RouteData | null;
  clusters: ClusterData[];
  explanation: ExplanationData | null;
}

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'completed': return 'bg-success/20 text-success border-success/30';
    case 'processing': return 'bg-warning/20 text-warning border-warning/30';
    default: return 'bg-muted text-muted-foreground border-border';
  }
};

const getUrgencyBadgeClass = (urgency: string) => {
  switch (urgency) {
    case 'critical': return 'urgency-critical';
    case 'high': return 'urgency-high';
    case 'medium': return 'urgency-medium';
    case 'low': return 'urgency-low';
    default: return 'bg-muted text-muted-foreground';
  }
};

const getRiskBadgeClass = (risk: string) => {
  switch (risk) {
    case 'high': return 'bg-destructive/20 text-destructive border-destructive/30';
    case 'medium': return 'bg-warning/20 text-warning border-warning/30';
    case 'low': return 'bg-success/20 text-success border-success/30';
    default: return 'bg-muted text-muted-foreground border-border';
  }
};

const SidePanel = ({ mission, route, clusters, explanation }: SidePanelProps) => {
  const [zoom, setZoom] = useState(1);
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const totalPeople = clusters.reduce((sum, c) => sum + c.people_estimated, 0);
  const criticalClusters = clusters.filter(c => c.urgency === 'critical' || c.urgency === 'high').length;

  return (
    <div className="h-full flex flex-col bg-card border-l border-border">
      <Tabs defaultValue="info" className="flex-1 flex flex-col">
        <TabsList className="w-full justify-start rounded-none border-b border-border bg-transparent p-0">
          <TabsTrigger
            value="info"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            <Info className="h-4 w-4 mr-1" />
            Info
          </TabsTrigger>
          <TabsTrigger
            value="route"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            <Navigation className="h-4 w-4 mr-1" />
            Route
          </TabsTrigger>
          <TabsTrigger
            value="people"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            <Users className="h-4 w-4 mr-1" />
            People
          </TabsTrigger>
          <TabsTrigger
            value="ai"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            <Brain className="h-4 w-4 mr-1" />
            AI
          </TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1">
          {/* Mission Info Tab */}
          <TabsContent value="info" className="m-0 p-4 space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Mission Details</h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="data-label">Status</span>
                  <Badge className={getStatusBadgeClass(mission.status)}>
                    {mission.status.toUpperCase()}
                  </Badge>
                </div>

                <div className="space-y-1">
                  <span className="data-label">Disaster Type</span>
                  <p className="data-value capitalize">{mission.disaster_type}</p>
                </div>

                <div className="space-y-1">
                  <span className="data-label">Region</span>
                  <p className="data-value">{mission.region}</p>
                </div>

                {mission.authority_lat && mission.authority_lon && (
                  <div className="space-y-1">
                    <span className="data-label flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      HQ Coordinates
                    </span>
                    <p className="data-value font-mono text-xs">
                      {mission.authority_lat.toFixed(6)}, {mission.authority_lon.toFixed(6)}
                    </p>
                  </div>
                )}

                <div className="space-y-1">
                  <span className="data-label flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Created
                  </span>
                  <p className="data-value">{formatDate(mission.created_at)}</p>
                </div>

                {mission.notes && (
                  <div className="space-y-1">
                    <span className="data-label">Notes</span>
                    <p className="text-sm text-muted-foreground">{mission.notes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border">
              <div className="bg-muted rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-foreground">{totalPeople}</p>
                <p className="text-xs text-muted-foreground">Est. People</p>
              </div>
              <div className="bg-muted rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-critical">{criticalClusters}</p>
                <p className="text-xs text-muted-foreground">Critical Areas</p>
              </div>
            </div>
          </TabsContent>

          {/* Route Tab */}
          <TabsContent value="route" className="m-0 p-4 space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Route Summary</h3>

            {route ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="data-label">Risk Level</span>
                  <Badge className={getRiskBadgeClass(route.risk_level)}>
                    {route.risk_level.toUpperCase()} RISK
                  </Badge>
                </div>

                <div className="bg-muted rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{route.eta_minutes} min</p>
                      <p className="text-xs text-muted-foreground">Estimated Travel Time</p>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-muted/50 rounded-lg border border-border">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Activity className="h-3 w-3" />
                    Route calculated based on current road conditions
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 space-y-4">
                <Dialog>
                  <DialogTrigger asChild>
                    <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-border bg-muted/50 cursor-pointer group hover:ring-2 hover:ring-primary/50 transition-all">
                      <img
                        src="/route.png"
                        alt="Projected Route"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors">
                        <Maximize className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md" />
                      </div>
                    </div>
                  </DialogTrigger>
                  <DialogContent className="max-w-5xl w-[90vw] h-[85vh] flex flex-col p-0 gap-0 bg-background/95 backdrop-blur-xl border-border">
                    <div className="p-3 border-b border-border flex items-center justify-between bg-muted/30">
                      <h3 className="font-semibold flex items-center gap-2">
                        <Navigation className="h-4 w-4 text-primary" />
                        Route Visualization
                      </h3>
                      <div className="flex items-center gap-1">
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setZoom(z => Math.max(0.5, z - 0.25))}>
                          <ZoomOut className="h-4 w-4" />
                        </Button>
                        <span className="w-16 text-center text-sm font-mono tabular-nums">{Math.round(zoom * 100)}%</span>
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setZoom(z => Math.min(3, z + 0.25))}>
                          <ZoomIn className="h-4 w-4" />
                        </Button>
                        <div className="w-px h-4 bg-border mx-2" />
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setZoom(1)}>
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex-1 overflow-hidden relative bg-muted/10 flex items-center justify-center p-4">
                      <div className="overflow-auto w-full h-full flex items-center justify-center">
                        <img
                          src="/route.png"
                          alt="Projected Route"
                          style={{ transform: `scale(${zoom})`, transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)' }}
                          className="max-w-none origin-center shadow-2xl rounded-md"
                        />
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </TabsContent>

          {/* People Tab */}
          <TabsContent value="people" className="m-0 p-4 space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Population Clusters</h3>

            {clusters.length > 0 ? (
              <div className="space-y-3">
                {clusters
                  .sort((a, b) => {
                    const urgencyOrder = { critical: 0, high: 1, medium: 2, low: 3 };
                    return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
                  })
                  .map(cluster => (
                    <div
                      key={cluster.id}
                      className="p-3 bg-muted rounded-lg space-y-2"
                    >
                      <div className="flex items-start justify-between">
                        <span className="font-medium text-foreground">{cluster.location_cluster}</span>
                        <Badge className={`${getUrgencyBadgeClass(cluster.urgency)} text-xs`}>
                          {cluster.urgency.toUpperCase()}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-muted-foreground">
                          <Users className="h-3 w-3 inline mr-1" />
                          ~{cluster.people_estimated}
                        </span>
                        <span className="text-muted-foreground font-mono text-xs">
                          {(cluster.confidence * 100).toFixed(0)}% conf
                        </span>
                      </div>

                      {cluster.needs.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {cluster.needs.map((need, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 bg-background rounded text-xs text-muted-foreground"
                            >
                              {need}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-foreground">Population Density Clusters</h4>
                  <p className="text-xs text-muted-foreground">Simulated Population Density Clusters in Disaster Zone</p>
                </div>
                <div className="rounded-md border border-border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Cluster ID</TableHead>
                        <TableHead>Est. Persons</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>SOS Intensity</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">Cluster A</TableCell>
                        <TableCell>1200</TableCell>
                        <TableCell><Badge variant="destructive" className="text-[10px] px-1 py-0">Trapped</Badge></TableCell>
                        <TableCell>85%</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Cluster B</TableCell>
                        <TableCell>800</TableCell>
                        <TableCell><Badge variant="secondary" className="text-[10px] px-1 py-0">Evacuating</Badge></TableCell>
                        <TableCell>45%</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Cluster C</TableCell>
                        <TableCell>1500</TableCell>
                        <TableCell><Badge variant="destructive" className="text-[10px] px-1 py-0">Trapped</Badge></TableCell>
                        <TableCell>92%</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Cluster D</TableCell>
                        <TableCell>600</TableCell>
                        <TableCell><Badge variant="outline" className="text-[10px] px-1 py-0">Stable</Badge></TableCell>
                        <TableCell>30%</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
                <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                  <p className="text-xs text-muted-foreground flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    <span>
                      Simulation data. Real-time analysis pending.
                    </span>
                  </p>
                </div>
              </div>
            )}
          </TabsContent>

          {/* AI Explanation Tab */}
          <TabsContent value="ai" className="m-0 p-4 space-y-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              AI Explanation
            </h3>

            {explanation ? (
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                    {explanation.summary_text}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  Generated: {formatDate(explanation.generated_at)}
                </div>

                <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                  <p className="text-xs text-muted-foreground flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    <span>
                      This explanation is AI-generated based on available data.
                      Always verify critical decisions with on-ground assessment.
                    </span>
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                    Satellite imagery was analyzed to detect flood-affected zones by identifying water accumulation, road submergence, and surface disruption patterns. These insights were fused with road network data to exclude unsafe segments and compute the most efficient rescue routes based on accessibility and travel time.
                    <br /><br />
                    Population clusters were then prioritized using estimated density, distress signal intensity, and demographic vulnerability indicators, ensuring that high-risk and medically sensitive groups receive immediate attention. All recommendations are confidence-scored and transparently derived from visual and situational data.
                  </p>
                </div>
                <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                  <p className="text-xs text-muted-foreground flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    <span>
                      This is a preliminary analysis methodology. Real-time AI explanation is pending.
                    </span>
                  </p>
                </div>
              </div>
            )}
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
};

export default SidePanel;
