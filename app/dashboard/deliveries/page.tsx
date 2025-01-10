"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getDeliveries, updateDeliveryStatus, updatePreparationStatus } from "@/lib/api";
import { CheckCircle, Clock, Truck } from "lucide-react";
import socket, { initializeSocket } from "@/lib/socket";
import { useToast } from "@/hooks/use-toast";

type MealDelivery = {
  _id: string;
  diet_chart_id: {
    patient_id: {
      name: string;
      room_number: string;
      bed_number: string;
    };
    meal_type: string;
  };
  preparation_status: 'pending' | 'preparing' | 'ready';
  delivery_status: 'pending' | 'in_progress' | 'delivered';
  delivered_at: string | null;
  assigned_to_pantry: {
    _id: string;
    full_name: string;
  };
  assigned_to_delivery?: {
    _id: string;
    full_name: string;
  };
};

type User = {
  full_name: string;
  _id: string;
  role: string;
};

export default function DeliveriesPage() {
  const [deliveries, setDeliveries] = useState<MealDelivery[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [deliveryStaff, setDeliveryStaff] = useState<User[]>([]);
  const { toast } = useToast();
  const user_details = localStorage.getItem("user")
  if(!user_details)  return <div>Loading...</div>;
  const userdata = JSON.parse(user_details);
  const url = process.env.URL || 'http://localhost:5000';

  if(!userdata) return <div>Loading...</div>;

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const userData = JSON.parse(userStr);
      setUser(userData);
      initializeSocket(userdata.id);
    }
    fetchDeliveries();
    if (localStorage.getItem("role") === "pantry_staff") {
      fetchDeliveryStaff();
    }

    // Socket event listeners
    socket.on('new_preparation_task', ({ delivery }) => {
      setDeliveries(prev => [delivery, ...prev]);
      toast({
        title: "New Task",
        description: "You have been assigned a new preparation task",
      });
    });

    socket.on('new_delivery_task', ({ delivery }) => {
      setDeliveries(prev => [delivery, ...prev]);
      toast({
        title: "New Delivery",
        description: "You have been assigned a new delivery task",
      });
    });

    socket.on('preparation_status_updated', ({ delivery_id, status }) => {
      setDeliveries(prev => prev.map(d => 
        d._id === delivery_id ? { ...d, preparation_status: status } : d
      ));
    });

    socket.on('delivery_status_updated', ({ delivery_id, status }) => {
      setDeliveries(prev => prev.map(d => 
        d._id === delivery_id ? { ...d, delivery_status: status } : d
      ));
    });

    return () => {
      socket.off('new_preparation_task');
      socket.off('new_delivery_task');
      socket.off('preparation_status_updated');
      socket.off('delivery_status_updated');
    };
  }, []);

  async function fetchDeliveryStaff() {
    try {
      const response = await fetch(`${url}/api/users?role=delivery`);
      const data = await response.json();
      setDeliveryStaff(data);
    } catch (error) {
      console.error('Error fetching delivery staff:', error);
    }
  }

  async function fetchDeliveries() {
    try {
      console.log(userdata)
      const data = await getDeliveries(userdata.role , userdata?.id);
      setDeliveries(data);
    } catch (error: any) {
      setError(error.response?.data?.error || "Failed to fetch deliveries");
    } finally {
      setIsLoading(false);
    }
  }

  const updateStatus = async (_id: string, status: string, type: 'preparation' | 'delivery') => {
    try {
      if (type === 'preparation') {
        await updatePreparationStatus(_id, status);
      } else {
        await updateDeliveryStatus(_id, status);
      }
      await fetchDeliveries();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to update status",
        variant: "destructive"
      });
    }
  };

  const assignDeliveryStaff = async (deliveryId: string, staffId: string) => {
    try {
      await fetch(`${url}/api/deliveries/${deliveryId}/assign_delivery`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ assigned_to_delivery: staffId }),
      });
      await fetchDeliveries();
      toast({
        title: "Success",
        description: "Delivery staff assigned successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to assign delivery staff",
        variant: "destructive"
      });
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "preparing":
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "ready":
      case "delivered":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Deliveries</h1>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient</TableHead>
              <TableHead>Room</TableHead>
              <TableHead>Meal Type</TableHead>
              <TableHead>Preparation Status</TableHead>
              <TableHead>Delivery Status</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deliveries.map((delivery) => (
              <TableRow key={delivery._id}>
                <TableCell>{delivery.diet_chart_id.patient_id.name}</TableCell>
                <TableCell>
                  Room {delivery.diet_chart_id.patient_id.room_number}, Bed{" "}
                  {delivery.diet_chart_id.patient_id.bed_number}
                </TableCell>
                <TableCell className="capitalize">
                  {delivery.diet_chart_id.meal_type}
                </TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${getStatusBadgeColor(
                      delivery.preparation_status
                    )}`}
                  >
                    {delivery.preparation_status}
                  </span>
                </TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${getStatusBadgeColor(
                      delivery.delivery_status
                    )}`}
                  >
                    {delivery.delivery_status}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div>Pantry: {delivery.assigned_to_pantry?.full_name}</div>
                    {delivery.assigned_to_delivery && (
                      <div>Delivery: {delivery.assigned_to_delivery?.full_name}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {user?.role === "pantry_staff" && 
                  //  delivery.assigned_to_pantry._id.toString === user._id.toString && 
                   delivery.preparation_status !== 'ready' && (
                    <Select
                      value={delivery.preparation_status}
                      onValueChange={(value) =>
                        updateStatus(delivery._id, value, 'preparation')
                      }
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="preparing">Preparing</SelectItem>
                        <SelectItem value="ready">Ready</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                  {user?.role === "pantry_staff" && 
                   delivery.preparation_status === 'ready' && 
                   !delivery.assigned_to_delivery && (
                    <Select
                      onValueChange={(value) => assignDeliveryStaff(delivery._id, value)}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Assign delivery" />
                      </SelectTrigger>
                      <SelectContent>
                        {deliveryStaff.map((staff) => (
                          <SelectItem key={staff._id} value={staff._id}>
                            {staff.full_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  {user?.role === "delivery" && delivery?.delivery_status !== 'delivered' 
                  //  delivery.assigned_to_delivery?._id.toString === user._id.toString
                    && (
                    <Select
                      value={delivery?.delivery_status}
                      onValueChange={(value) =>
                        updateStatus(delivery?._id, value, 'delivery')
                      }
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}