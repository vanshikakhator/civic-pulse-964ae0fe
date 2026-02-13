import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Navigate } from "react-router-dom";
import { getRiskLevel } from "@/lib/classifyComplaint";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, AlertTriangle, Shield } from "lucide-react";
import { LeafletMap } from "@/components/LeafletMap";

interface Complaint {
  id: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  priority: string;
  category: string;
  title: string;
}

interface AreaData {
  location: string;
  total: number;
  high: number;
  risk: "High" | "Medium" | "Low";
  avgLat: number | null;
  avgLng: number | null;
}

const riskColors: Record<string, string> = {
  High: "bg-destructive/15 text-destructive border-destructive/30",
  Medium: "bg-priority-medium/15 text-priority-medium border-priority-medium/30",
  Low: "bg-priority-low/15 text-priority-low border-priority-low/30",
};

export default function Hotspots() {
  const { isAdmin, loading } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);

  useEffect(() => {
    supabase.from("complaints").select("*").then(({ data }) => {
      if (data) setComplaints(data);
    });
  }, []);

  if (!loading && !isAdmin) return <Navigate to="/dashboard" replace />;

  // Group by location
  const locationMap: Record<string, { total: number; high: number; lats: number[]; lngs: number[] }> = {};
  complaints.forEach(c => {
    const loc = c.location || "Unknown";
    if (!locationMap[loc]) locationMap[loc] = { total: 0, high: 0, lats: [], lngs: [] };
    locationMap[loc].total++;
    if (c.priority === "High") locationMap[loc].high++;
    if (c.latitude && c.longitude) {
      locationMap[loc].lats.push(c.latitude);
      locationMap[loc].lngs.push(c.longitude);
    }
  });

  const areas: AreaData[] = Object.entries(locationMap)
    .map(([location, data]) => ({
      location,
      total: data.total,
      high: data.high,
      risk: getRiskLevel(data.total, data.high),
      avgLat: data.lats.length ? data.lats.reduce((a, b) => a + b, 0) / data.lats.length : null,
      avgLng: data.lngs.length ? data.lngs.reduce((a, b) => a + b, 0) / data.lngs.length : null,
    }))
    .sort((a, b) => {
      const riskOrder = { High: 0, Medium: 1, Low: 2 };
      return riskOrder[a.risk] - riskOrder[b.risk];
    });

  const mapMarkers = areas
    .filter(a => a.avgLat && a.avgLng)
    .map(a => ({
      lat: a.avgLat!,
      lng: a.avgLng!,
      popup: `<strong>${a.location}</strong><br/>Risk: ${a.risk}<br/>Complaints: ${a.total}`,
      priority: a.risk === "High" ? "High" : a.risk === "Medium" ? "Medium" : "Low",
    }));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold flex items-center gap-2">
            <MapPin className="w-6 h-6 text-accent" /> Hotspot Areas
          </h1>
          <p className="text-sm text-muted-foreground">AI-detected high-risk areas based on complaint density and severity</p>
        </div>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-display text-lg">Risk Map</CardTitle>
          </CardHeader>
          <CardContent>
            <LeafletMap markers={mapMarkers} zoom={5} className="h-[400px] w-full rounded-lg" />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {areas.map(area => (
            <Card key={area.location} className="shadow-card animate-fade-in hover:shadow-elevated transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-medium text-sm">{area.location}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{area.total} complaints</p>
                  </div>
                  <Badge variant="outline" className={riskColors[area.risk]}>
                    {area.risk === "High" ? <AlertTriangle className="w-3 h-3 mr-1" /> : <Shield className="w-3 h-3 mr-1" />}
                    {area.risk} Risk
                  </Badge>
                </div>
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span>🔴 High: {area.high}</span>
                  <span>📊 Total: {area.total}</span>
                </div>
              </CardContent>
            </Card>
          ))}
          {areas.length === 0 && (
            <p className="col-span-full text-center text-muted-foreground py-8">No area data available yet.</p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
