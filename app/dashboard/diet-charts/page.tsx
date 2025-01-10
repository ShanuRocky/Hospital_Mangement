"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Textarea } from "@/components/ui/textarea";
import { getPatients, getDietCharts, createDietChart, createDelivery } from "@/lib/api";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

type DietChart = {
  assigned_pantry: {
     _id: string,
     full_name: string
  };
  _id: string;
  patient_id: {
    name: string;
    room_number: string;
    bed_number: string;
  };
  date: string;
  meal_type: string;
  ingredients: string[];
  instructions: string;
};

type Patient = {
  _id: string;
  name: string;
  room_number: string;
};

type User = {
  _id: string;
  full_name: string;
  role: string;
};

export default function DietChartsPage() {
  const [dietCharts, setDietCharts] = useState<DietChart[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [pantryStaff, setPantryStaff] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { toast } = useToast();
  const user = localStorage.getItem('user')
  if(!user) return <div>Loading...</div>;
  const user_detail = JSON.parse(user);
  const url = process.env.NEXT_PUBLIC_API_URL;

  const [formData, setFormData] = useState({
    patient_id: "",
    date: new Date().toISOString().split("T")[0],
    meal_type: "morning",
    ingredients: "",
    instructions: "",
    assigned_pantry: "",
  });

  useEffect(() => {
    if (localStorage.getItem('role') === "delivery") {
      router.push("/dashboard");
    } else {
      fetchDietCharts();
      fetchPatients();
      fetchPantryStaff();
    }
  }, []);

  async function fetchPantryStaff() {
    try {
      const response = await fetch(`${url}/api/users?role=pantry_staff`);
      const data = await response.json();
      console.log(data)
      setPantryStaff(data);
    } catch (error) {
      console.error('Error fetching pantry staff:', error);
    }
  }

  async function fetchDietCharts() {
    try {
      const data = await getDietCharts();
      setDietCharts(data);
    } catch (error: any) {
      setError(error.response?.data?.error || "Failed to fetch diet charts");
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchPatients() {
    try {
      const data = await getPatients();
      setPatients(data);
    } catch (error: any) {
      setError(error.response?.data?.error || "Failed to fetch patients");
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const dietChartData = {
        ...formData,
        ingredients: formData.ingredients.split(",").map((i) => i.trim()),
      };

      const dietChart = await createDietChart(dietChartData);
      
      // Create delivery with assigned pantry staff
      await createDelivery(dietChart._id, formData.assigned_pantry);
      
      toast({
        title: "Success",
        description: "Diet chart created and assigned successfully",
      });

      await fetchDietCharts();
      setIsDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to save diet chart",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      patient_id: "",
      date: new Date().toISOString().split("T")[0],
      meal_type: "morning",
      ingredients: "",
      instructions: "",
      assigned_pantry: "",
    });
  };

  if (isLoading || !user_detail) {
    return <div>Loading...</div>;
  }


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Diet Charts</h1>
        {user_detail?.role === "manager" && <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Diet Chart
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Diet Chart</DialogTitle>
            </DialogHeader>
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Existing form fields */}
                <div className="space-y-2">
                  <Label htmlFor="patient">Patient</Label>
                  <Select
                    value={formData.patient_id}
                    onValueChange={(value) =>
                      setFormData({ ...formData, patient_id: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a patient" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map((patient) => (
                        <SelectItem key={patient._id} value={patient._id}>
                          {patient.name} - Room {patient.room_number}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* New field for pantry staff assignment */}
                <div className="space-y-2">
                  <Label htmlFor="assigned_pantry">Assign to Pantry Staff</Label>
                  <Select
                    value={formData.assigned_pantry}
                    onValueChange={(value) =>
                      setFormData({ ...formData, assigned_pantry: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select pantry staff" />
                    </SelectTrigger>
                    <SelectContent>
                      {pantryStaff.map((staff) => (
                        <SelectItem key={staff._id} value={staff._id}>
                          {staff.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Rest of the existing form fields */}
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="meal_type">Meal Type</Label>
                  <Select
                    value={formData.meal_type}
                    onValueChange={(value) =>
                      setFormData({ ...formData, meal_type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">Morning</SelectItem>
                      <SelectItem value="evening">Evening</SelectItem>
                      <SelectItem value="night">Night</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ingredients">Ingredients (comma-separated)</Label>
                  <Input
                    id="ingredients"
                    value={formData.ingredients}
                    onChange={(e) =>
                      setFormData({ ...formData, ingredients: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instructions">Special Instructions</Label>
                  <Textarea
                    id="instructions"
                    value={formData.instructions}
                    onChange={(e) =>
                      setFormData({ ...formData, instructions: e.target.value })
                    }
                    placeholder="Enter any special instructions or dietary restrictions"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Diet Chart"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>}
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Patient</TableHead>
              <TableHead>Meal Type</TableHead>
              <TableHead>Ingredients</TableHead>
              <TableHead>Instructions</TableHead>
              <TableHead>Assigned To</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dietCharts.map((chart) => (
              <TableRow key={chart._id}>
                <TableCell>
                  {new Date(chart.date).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {chart.patient_id.name} - Room {chart.patient_id.room_number}
                </TableCell>
                <TableCell className="capitalize">
                  {chart.meal_type}
                </TableCell>
                <TableCell>
                  {chart.ingredients?.join(", ") || "No ingredients listed"}
                </TableCell>
                <TableCell>{chart.instructions || "No special instructions"}</TableCell>
                <TableCell>{chart.assigned_pantry?.full_name || "Unassigned"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}