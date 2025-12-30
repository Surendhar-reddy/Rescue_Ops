import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

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

interface MissionMapProps {
  centerLat?: number;
  centerLon?: number;
  roads: RoadData[];
  clusters: ClusterData[];
  route?: RouteData | null;
}

const getStatusColor = (status: 'blocked' | 'partial' | 'clear') => {
  switch (status) {
    case 'blocked': return '#ef4444';
    case 'partial': return '#eab308';
    case 'clear': return '#22c55e';
    default: return '#6b7280';
  }
};

const getUrgencyColor = (urgency: 'low' | 'medium' | 'high' | 'critical') => {
  switch (urgency) {
    case 'critical': return '#ef4444';
    case 'high': return '#f97316';
    case 'medium': return '#eab308';
    case 'low': return '#22c55e';
    default: return '#6b7280';
  }
};

const getUrgencyRadius = (urgency: 'low' | 'medium' | 'high' | 'critical', people: number) => {
  const base = Math.min(Math.max(people / 5, 10), 40);
  const multiplier = urgency === 'critical' ? 1.5 : urgency === 'high' ? 1.3 : urgency === 'medium' ? 1.1 : 1;
  return base * multiplier;
};

const MissionMap = ({ centerLat, centerLon, roads, clusters, route }: MissionMapProps) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const defaultCenter: [number, number] = [centerLat || 17.385, centerLon || 78.486];

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    mapRef.current = L.map(mapContainerRef.current, {
      center: defaultCenter,
      zoom: 12,
    });

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(mapRef.current);

    markersLayerRef.current = L.layerGroup().addTo(mapRef.current);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update markers and layers when data changes
  useEffect(() => {
    if (!mapRef.current || !markersLayerRef.current) return;

    // Clear existing markers
    markersLayerRef.current.clearLayers();

    const points: L.LatLngExpression[] = [];

    // Add authority/HQ marker
    if (centerLat && centerLon) {
      const hqMarker = L.marker([centerLat, centerLon])
        .bindPopup(`
          <div class="text-sm">
            <strong>Relief HQ</strong><br/>
            Coordinates: ${centerLat.toFixed(4)}, ${centerLon.toFixed(4)}
          </div>
        `);
      markersLayerRef.current.addLayer(hqMarker);
      points.push([centerLat, centerLon]);
    }

    // Add road status markers
    roads.forEach(road => {
      const color = getStatusColor(road.status);
      const circle = L.circleMarker([road.lat, road.lon], {
        radius: 8,
        color: color,
        fillColor: color,
        fillOpacity: 0.8,
        weight: 2,
      }).bindPopup(`
        <div class="text-sm">
          <strong>Road: ${road.road_id}</strong><br/>
          <span style="background: ${color}; color: white; padding: 2px 8px; border-radius: 4px; font-size: 11px;">
            ${road.status.toUpperCase()}
          </span><br/>
          <span style="color: #666;">Confidence: ${(road.confidence * 100).toFixed(0)}%</span>
        </div>
      `);
      markersLayerRef.current!.addLayer(circle);
      points.push([road.lat, road.lon]);
    });

    // Add cluster markers
    clusters.forEach(cluster => {
      if (!cluster.lat || !cluster.lon) return;

      const color = getUrgencyColor(cluster.urgency);
      const radius = getUrgencyRadius(cluster.urgency, cluster.people_estimated || 0);

      const circle = L.circleMarker([cluster.lat, cluster.lon], {
        radius: radius,
        color: color,
        fillColor: color,
        fillOpacity: 0.4,
        weight: 2,
      }).bindPopup(`
        <div class="text-sm">
          <strong>${cluster.location_cluster}</strong><br/>
          <span style="background: ${color}; color: white; padding: 2px 8px; border-radius: 4px; font-size: 11px;">
            ${cluster.urgency.toUpperCase()} URGENCY
          </span><br/>
          <span>~${cluster.people_estimated || 0} people</span><br/>
          <span style="color: #666;">Needs: ${cluster.needs?.join(', ') || 'Unknown'}</span>
        </div>
      `);
      markersLayerRef.current!.addLayer(circle);
      points.push([cluster.lat, cluster.lon]);
    });

    // Add route polyline
    if (route?.route_geojson?.coordinates && route.route_geojson.coordinates.length > 0) {
      const routeCoordinates: [number, number][] = route.route_geojson.coordinates.map(
        (coord: [number, number]) => [coord[1], coord[0]] // GeoJSON is [lon, lat], Leaflet needs [lat, lon]
      );

      const routeColor = route.risk_level === 'high' ? '#ef4444' : route.risk_level === 'medium' ? '#eab308' : '#22c55e';

      const polyline = L.polyline(routeCoordinates, {
        color: routeColor,
        weight: 4,
        opacity: 0.8,
        dashArray: '10, 10',
      });
      markersLayerRef.current.addLayer(polyline);
    }

    // Fit bounds if we have points
    if (points.length > 0) {
      const bounds = L.latLngBounds(points);
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [roads, clusters, route, centerLat, centerLon]);

  return (
    <div className="w-full h-full relative">
      <div
        ref={mapContainerRef}
        className="w-full h-full rounded-lg"
        style={{ background: '#e5e7eb' }}
      />

      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 bg-card/95 backdrop-blur border border-border rounded-lg p-3 z-[1000]">
        <p className="text-xs font-semibold text-foreground mb-2">LEGEND</p>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-road-clear" />
            <span className="text-xs text-muted-foreground">Clear Road</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-road-partial" />
            <span className="text-xs text-muted-foreground">Partial Damage</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-road-blocked" />
            <span className="text-xs text-muted-foreground">Blocked</span>
          </div>
          <div className="h-px bg-border my-1" />
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-urgency-critical/40 border border-urgency-critical" />
            <span className="text-xs text-muted-foreground">Critical Cluster</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MissionMap;