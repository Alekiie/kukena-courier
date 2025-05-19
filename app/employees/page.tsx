"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { format } from "date-fns";

type Employee = {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: "Active" | "Inactive";
  role: string;
  lastLogin: Date;
};

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([
    {
      id: 1,
      name: "Jane Mwangi",
      email: "jane@kettno.com",
      phone: "+254700112233",
      role: "Dispatcher",
      status: "Active",
      lastLogin: new Date(),
    },
    {
      id: 2,
      name: "David Otieno",
      email: "david@kettno.com",
      phone: "+254712345678",
      role: "Driver",
      status: "Inactive",
      lastLogin: new Date(Date.now() - 86400000 * 2), // 2 days ago
    },
  ]);

  const [editDialog, setEditDialog] = useState<null | number>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
  });

  const openEditDialog = (emp: Employee) => {
    setForm({
      name: emp.name,
      email: emp.email,
      phone: emp.phone,
      role: emp.role,
    });
    setEditDialog(emp.id);
  };

  const saveChanges = () => {
    setEmployees((prev) =>
      prev.map((emp) =>
        emp.id === editDialog
          ? {
              ...emp,
              name: form.name,
              email: form.email,
              phone: form.phone,
              role: form.role,
            }
          : emp
      )
    );
    setEditDialog(null);
  };

  const toggleStatus = (id: number) => {
    setEmployees((prev) =>
      prev.map((emp) =>
        emp.id === id
          ? {
              ...emp,
              status: emp.status === "Active" ? "Inactive" : "Active",
            }
          : emp
      )
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-7xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Employee Management</CardTitle>
          </CardHeader>
          <CardContent className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Edit</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((emp) => (
                  <TableRow key={emp.id}>
                    <TableCell>{emp.name}</TableCell>
                    <TableCell>{emp.email}</TableCell>
                    <TableCell>{emp.phone}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          emp.status === "Active"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {emp.status}
                      </span>
                    </TableCell>
                    <TableCell>{emp.role}</TableCell>
                    <TableCell>
                      {format(new Date(emp.lastLogin), "PPPp")}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditDialog(emp)}
                      >
                        Edit
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant={emp.status === "Active" ? "destructive" : "default"}
                        onClick={() => toggleStatus(emp.id)}
                      >
                        {emp.status === "Active" ? "Deactivate" : "Activate"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editDialog} onOpenChange={() => setEditDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Employee</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                className="col-span-3"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                className="col-span-3"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Phone
              </Label>
              <Input
                id="phone"
                className="col-span-3"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Role
              </Label>
              <Input
                id="role"
                className="col-span-3"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={saveChanges}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
