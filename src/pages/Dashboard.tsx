import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import AppHeader from "@/components/AppHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { Briefcase, Phone, Trophy } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  Applied: "hsl(221, 83%, 53%)",
  Interviewing: "hsl(38, 92%, 50%)",
  Offer: "hsl(142, 71%, 45%)",
  Rejected: "hsl(0, 84%, 60%)",
};

const chartConfig = {
  count: { label: "Applications" },
  Applied: { label: "Applied", color: STATUS_COLORS.Applied },
  Interviewing: { label: "Interviewing", color: STATUS_COLORS.Interviewing },
  Offer: { label: "Offer", color: STATUS_COLORS.Offer },
  Rejected: { label: "Rejected", color: STATUS_COLORS.Rejected },
};

const Dashboard = () => {
  const { user } = useAuth();

  const { data: applications = [] } = useQuery({
    queryKey: ["applications", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("applications")
        .select("*")
        .eq("user_id", user!.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const total = applications.length;
  const interviews = applications.filter((a) => a.status === "Interviewing").length;
  const offers = applications.filter((a) => a.status === "Offer").length;

  const chartData = ["Applied", "Interviewing", "Offer", "Rejected"].map((status) => ({
    status,
    count: applications.filter((a) => a.status === status).length,
    fill: STATUS_COLORS[status],
  }));

  const metrics = [
    { label: "Total Applications", value: total, icon: Briefcase, color: "text-primary" },
    { label: "Interviews", value: interviews, icon: Phone, color: "text-amber-500" },
    { label: "Offers", value: offers, icon: Trophy, color: "text-emerald-500" },
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      <AppHeader />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

        <div className="grid gap-4 sm:grid-cols-3 mb-8">
          {metrics.map(({ label, value, icon: Icon, color }) => (
            <Card key={label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
                <Icon className={`h-5 w-5 ${color}`} />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Applications by Status</CardTitle>
          </CardHeader>
          <CardContent>
            {total === 0 ? (
              <p className="text-center text-muted-foreground py-12">No applications yet. Add your first one!</p>
            ) : (
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="status" />
                  <YAxis allowDecimals={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;
