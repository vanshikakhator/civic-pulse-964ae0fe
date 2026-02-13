import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { LeafletMap } from "@/components/LeafletMap";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Navigate } from "react-router-dom";
import { FileText, AlertTriangle, CheckCircle, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

interface Complaint {
  id: string;
  title: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  category: string;
  priority: string;
  status: string;
  created_at: string;
}

const COLORS = ["#ef4444", "#f59e0b", "#22c55e", "#3b82f6", "#8b5cf6", "#ec4899"];

export default function AdminDashboard() {
  const { isAdmin, loading } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);

  useEffect(() => {
    supabase
      .from("complaints")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => { if (data) setComplaints(data); });
  }, []);

  if (!loading && !isAdmin) return <Navigate to="/dashboard" replace />;

  const total = complaints.length;
  const high = complaints.filter(c => c.priority === "High").length;
  const resolved = complaints.filter(c => c.status === "Resolved").length;
  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  // Category chart data
  const categoryCount: Record<string, number> = {};
  complaints.forEach(c => { categoryCount[c.category] = (categoryCount[c.category] || 0) + 1; });
  const categoryData = Object.entries(categoryCount).map(([name, count]) => ({ name, count }));

  // Priority pie data
  const priorityData = [
    { name: "High", value: complaints.filter(c => c.priority === "High").length },
    { name: "Medium", value: complaints.filter(c => c.priority === "Medium").length },
    { name: "Low", value: complaints.filter(c => c.priority === "Low").length },
  ].filter(d => d.value > 0);

  const mapMarkers = complaints
    .filter(c => c.latitude && c.longitude)
    .map(c => ({
      lat: c.latitude!,
      lng: c.longitude!,
      popup: `<strong>${c.title}</strong><br/>${c.category} • ${c.priority}`,
      priority: c.priority,
    }));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground">Overview of all civic complaints and analytics</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Complaints" value={total} icon={FileText} variant="default" />
          <StatCard title="High Priority" value={high} icon={AlertTriangle} variant="danger" />
          <StatCard title="Resolved" value={resolved} icon={CheckCircle} variant="accent" />
          <StatCard title="Resolution Rate" value={`${resolutionRate}%`} icon={TrendingUp} variant="accent" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="font-display text-lg">Complaints by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 20% 88%)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(174 60% 40%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="font-display text-lg">Priority Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={priorityData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label>
                    {priorityData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-display text-lg">All Complaints Map</CardTitle>
          </CardHeader>
          <CardContent>
            <LeafletMap markers={mapMarkers} zoom={5} className="h-[400px] w-full rounded-lg" />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
