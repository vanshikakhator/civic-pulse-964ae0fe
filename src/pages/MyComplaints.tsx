import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PriorityBadge, StatusBadge } from "@/components/PriorityBadge";
import { LeafletMap } from "@/components/LeafletMap";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";

interface Complaint {
  id: string;
  title: string;
  description: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  category: string;
  priority: string;
  status: string;
  created_at: string;
}

export default function MyComplaints() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [selected, setSelected] = useState<Complaint | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("complaints")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => { if (data) setComplaints(data); });
  }, [user]);

  const mapMarkers = complaints
    .filter(c => c.latitude && c.longitude)
    .map(c => ({
      lat: c.latitude!,
      lng: c.longitude!,
      popup: `<strong>${c.title}</strong><br/>${c.status}`,
      priority: c.priority,
    }));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-display font-bold">My Complaints</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="shadow-card">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {complaints.map(c => (
                      <TableRow
                        key={c.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => setSelected(c)}
                      >
                        <TableCell className="font-medium">{c.title}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{c.category}</TableCell>
                        <TableCell><PriorityBadge priority={c.priority} /></TableCell>
                        <TableCell><StatusBadge status={c.status} /></TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(c.created_at), "MMM dd, yyyy")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {complaints.length === 0 && (
                  <p className="text-center text-muted-foreground py-8 text-sm">No complaints found.</p>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="font-display text-lg">Complaints Map</CardTitle>
              </CardHeader>
              <CardContent>
                <LeafletMap
                  markers={mapMarkers}
                  zoom={5}
                  className="h-[250px] w-full rounded-lg"
                />
              </CardContent>
            </Card>

            {selected && (
              <Card className="shadow-card animate-fade-in">
                <CardHeader>
                  <CardTitle className="font-display text-lg">{selected.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">{selected.description}</p>
                  <div className="flex gap-2">
                    <PriorityBadge priority={selected.priority} />
                    <StatusBadge status={selected.status} />
                  </div>
                  <p className="text-xs text-muted-foreground">📍 {selected.location}</p>
                  {selected.latitude && selected.longitude && (
                    <LeafletMap
                      center={[selected.latitude, selected.longitude]}
                      markers={[{
                        lat: selected.latitude,
                        lng: selected.longitude,
                        popup: selected.title,
                        priority: selected.priority,
                      }]}
                      zoom={13}
                      className="h-[200px] w-full rounded-lg"
                    />
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
