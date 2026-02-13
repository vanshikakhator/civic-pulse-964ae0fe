import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Navigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  LineChart, Line, Area, AreaChart,
} from "recharts";
import { format, subDays, eachDayOfInterval, startOfDay } from "date-fns";

interface Complaint {
  id: string;
  category: string;
  priority: string;
  status: string;
  location: string;
  created_at: string;
}

const PIE_COLORS = ["#ef4444", "#f59e0b", "#22c55e"];
const STATUS_COLORS = ["#f59e0b", "#3b82f6", "#22c55e"];
const BAR_COLOR = "hsl(174, 60%, 40%)";

export default function Analytics() {
  const { isAdmin, loading } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);

  useEffect(() => {
    supabase.from("complaints").select("*").then(({ data }) => {
      if (data) setComplaints(data);
    });
  }, []);

  if (!loading && !isAdmin) return <Navigate to="/dashboard" replace />;

  // Category bar chart
  const catCount: Record<string, number> = {};
  complaints.forEach(c => { catCount[c.category] = (catCount[c.category] || 0) + 1; });
  const categoryData = Object.entries(catCount).map(([name, count]) => ({ name, count }));

  // Priority pie
  const priorityData = [
    { name: "High", value: complaints.filter(c => c.priority === "High").length },
    { name: "Medium", value: complaints.filter(c => c.priority === "Medium").length },
    { name: "Low", value: complaints.filter(c => c.priority === "Low").length },
  ].filter(d => d.value > 0);

  // Status pie
  const statusData = [
    { name: "Pending", value: complaints.filter(c => c.status === "Pending").length },
    { name: "In Progress", value: complaints.filter(c => c.status === "In Progress").length },
    { name: "Resolved", value: complaints.filter(c => c.status === "Resolved").length },
  ].filter(d => d.value > 0);

  // Timeline (last 30 days)
  const last30 = eachDayOfInterval({ start: subDays(new Date(), 29), end: new Date() });
  const timelineData = last30.map(day => {
    const dayStr = format(day, "yyyy-MM-dd");
    const count = complaints.filter(c => format(new Date(c.created_at), "yyyy-MM-dd") === dayStr).length;
    return { date: format(day, "MMM dd"), count };
  });

  // Location bar chart
  const locCount: Record<string, number> = {};
  complaints.forEach(c => { locCount[c.location] = (locCount[c.location] || 0) + 1; });
  const locationData = Object.entries(locCount)
    .map(([name, count]) => ({ name: name.substring(0, 20), count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold">Analytics</h1>
          <p className="text-sm text-muted-foreground">Comprehensive civic complaint analytics and insights</p>
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
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill={BAR_COLOR} radius={[4, 4, 0, 0]} />
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
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="shadow-card lg:col-span-2">
            <CardHeader>
              <CardTitle className="font-display text-lg">Complaints Over Time (Last 30 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 20% 88%)" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="count" stroke="hsl(174, 60%, 40%)" fill="hsl(174, 60%, 40%)" fillOpacity={0.15} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="font-display text-lg">Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label>
                    {statusData.map((_, i) => (
                      <Cell key={i} fill={STATUS_COLORS[i % STATUS_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="font-display text-lg">Top Complaint Areas</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={locationData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 20% 88%)" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={100} />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(215, 60%, 18%)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
