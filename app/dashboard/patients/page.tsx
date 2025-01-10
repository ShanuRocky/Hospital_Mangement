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
import { getPatients, createPatient, updatePatient, createDelivery } from "@/lib/api";
import { Plus, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";

type Patient = {
  _id: string;
  name: string;
  diseases: string[];
  allergies: string[];
  room_number: string;
  bed_number: string;
  floor_number: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  contact_number?: string;
  emergency_contact?: string;
  emergency_contact_number?: string;
};

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [error, setError] = useState("");
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    diseases: "",
    allergies: "",
    room_number: "",
    bed_number: "",
    floor_number: "",
    age: "",
    gender: "male",
    contact_number: "",
    emergency_contact: "",
    emergency_contact_number: "",
  });

  useEffect(() => {
    if(localStorage.getItem('role') !== "manager") router.push("/dashboard")
    else fetchPatients();
  }, []);

  async function fetchPatients() {
    try {
      const data = await getPatients();
      setPatients(data);
    } catch (error: any) {
      setError(error.response?.data?.error || "Failed to fetch patients");
    } finally {
      setIsLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const patientData = {
        ...formData,
        age: parseInt(formData.age),
        diseases: formData.diseases.split(",").map((d) => d.trim()),
        allergies: formData.allergies.split(",").map((a) => a.trim()),
      };

      if (selectedPatient) {
        await updatePatient(selectedPatient._id, patientData);
      } else {
        const data = await createPatient(patientData);
      }

      await fetchPatients();
      setIsDialogOpen(false);
      resetForm();
    } catch (error: any) {
    //   console.log(selectedPatient);
      setError(error.response?.data?.error || "Failed to save patient");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      diseases: "",
      allergies: "",
      room_number: "",
      bed_number: "",
      floor_number: "",
      age: "",
      gender: "male",
      contact_number: "",
      emergency_contact: "",
      emergency_contact_number: "",
    });
    setSelectedPatient(null);
  };

  const handleEdit = (patient: Patient) => {
    setSelectedPatient(patient);
    setFormData({
      name: patient.name,
      diseases: patient.diseases?.join(", ") || "",
      allergies: patient.allergies?.join(", ") || "",
      room_number: patient.room_number,
      bed_number: patient.bed_number,
      floor_number: patient.floor_number,
      age: patient.age.toString(),
      gender: patient.gender,
      contact_number: patient.contact_number || "",
      emergency_contact: patient.emergency_contact || "",
      emergency_contact_number: patient.emergency_contact_number || "",
    });
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Patients</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Patient
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedPatient ? "Edit Patient" : "Add New Patient"}
              </DialogTitle>
            </DialogHeader>
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
                {error} hello
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    value={formData.age}
                    onChange={(e) =>
                      setFormData({ ...formData, age: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) =>
                      setFormData({ ...formData, gender: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="diseases">Diseases (comma-separated)</Label>
                  <Input
                    id="diseases"
                    value={formData.diseases}
                    onChange={(e) =>
                      setFormData({ ...formData, diseases: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="allergies">Allergies (comma-separated)</Label>
                  <Input
                    id="allergies"
                    value={formData.allergies}
                    onChange={(e) =>
                      setFormData({ ...formData, allergies: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="room_number">Room Number</Label>
                  <Input
                    id="room_number"
                    value={formData.room_number}
                    onChange={(e) =>
                      setFormData({ ...formData, room_number: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bed_number">Bed Number</Label>
                  <Input
                    id="bed_number"
                    value={formData.bed_number}
                    onChange={(e) =>
                      setFormData({ ...formData, bed_number: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="floor_number">Floor Number</Label>
                  <Input
                    id="floor_number"
                    value={formData.floor_number}
                    onChange={(e) =>
                      setFormData({ ...formData, floor_number: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact_number">Contact Number</Label>
                  <Input
                    id="contact_number"
                    value={formData.contact_number}
                    onChange={(e) =>
                      setFormData({ ...formData, contact_number: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergency_contact">Emergency Contact</Label>
                  <Input
                    id="emergency_contact"
                    value={formData.emergency_contact}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        emergency_contact: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergency_contact_number">
                    Emergency Contact Number
                  </Label>
                  <Input
                    id="emergency_contact_number"
                    value={formData.emergency_contact_number}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        emergency_contact_number: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Patient"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Room</TableHead>
              <TableHead>Age</TableHead>
              <TableHead>Diseases</TableHead>
              <TableHead>Allergies</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {patients.map((patient) => (
              <TableRow key={patient._id}>
                <TableCell>{patient.name}</TableCell>
                <TableCell>
                  Room {patient.room_number}, Bed {patient.bed_number}, Floor{" "}
                  {patient.floor_number}
                </TableCell>
                <TableCell>{patient.age}</TableCell>
                <TableCell>
                  {patient.diseases?.join(", ") || "No diseases"}
                </TableCell>
                <TableCell>
                  {patient.allergies?.join(", ") || "No allergies"}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(patient)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}