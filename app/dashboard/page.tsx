"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Utensils,
  Truck,
  CheckCircle2,
  Clock,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getDeliveries } from "@/lib/api";

type DeliveryStats = {
  totalPatients: number;
  pendingDeliveries: number;
  completedDeliveries: number;
  preparingMeals: number;
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DeliveryStats>({
    totalPatients: 0,
    pendingDeliveries: 0,
    completedDeliveries: 0,
    preparingMeals: 0,
  });
  const [deliveryData, setDeliveryData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const user = localStorage.getItem('user');
  if(!user)  return <div>Loading...</div>;
  const userdata = JSON.parse(user);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const deliveries = await getDeliveries(userdata.role , userdata.id);
        console.log(deliveries, "hhh")
        
        // Calculate stats
        const stats = {
          totalPatients: new Set(deliveries.map((d: any) => d.diet_chart_id.patient_id)).size,
          pendingDeliveries: deliveries.filter((d: any) => d.delivery_status === 'pending').length,
          completedDeliveries: deliveries.filter((d: any) => d.delivery_status === 'delivered').length,
          preparingMeals: deliveries.filter((d: any) => d.preparation_status === 'preparing').length,
        };
        setStats(stats);

        // Process delivery data for chart
          const processedData = deliveries.reduce((acc: any[], curr: any) => {
          const date = new Date(curr.created_at).toLocaleDateString();
          const existing = acc.find((item: any) => item.date === date);
          
          if (existing) {
            existing.deliveries += 1;
          } else {
            acc.push({ date, deliveries: 1 });
          }
          
          return acc;
        }, []);

        setDeliveryData(processedData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const stats_cards = [
    {
      title: "Total Patients",
      value: stats.totalPatients,
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Pending Deliveries",
      value: stats.pendingDeliveries,
      icon: Clock,
      color: "text-yellow-600",
    },
    {
      title: "Completed Deliveries",
      value: stats.completedDeliveries,
      icon: CheckCircle2,
      color: "text-green-600",
    },
    {
      title: "Preparing Meals",
      value: stats.preparingMeals,
      icon: Utensils,
      color: "text-purple-600",
    },
  ];

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats_cards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Delivery Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={deliveryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="deliveries"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}