"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Hospital, ChefHat, Truck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    
    if (token && user) {
      router.push("/dashboard");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Hospital Food Management System
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Efficiently manage patient meals and food delivery
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card>
            <CardHeader>
              <Hospital className="w-12 h-12 text-primary mb-4" />
              <CardTitle>Food Manager</CardTitle>
              <CardDescription>
                Manage patient details and diet charts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full" 
                onClick={() => router.push("/login?role=manager")}
              >
                Login as Manager
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <ChefHat className="w-12 h-12 text-primary mb-4" />
              <CardTitle>Pantry Staff</CardTitle>
              <CardDescription>
                Manage food preparation and delivery tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full" 
                onClick={() => router.push("/login?role=pantry_staff")}
              >
                Login as Pantry Staff
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Truck className="w-12 h-12 text-primary mb-4" />
              <CardTitle>Delivery Personnel</CardTitle>
              <CardDescription>
                Track and complete meal deliveries
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full" 
                onClick={() => router.push("/login?role=delivery")}
              >
                Login as Delivery Staff
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}