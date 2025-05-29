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
import { FiUser, FiMail, FiPhone, FiEdit2, FiToggleLeft, FiToggleRight, FiPlus, FiUserCheck, FiUserX, FiClock } from "react-icons/fi";
import { Badge } from "@/components/ui/badge";

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
    {
      id: 3,
      name: "Sarah Kamau",
      email: "sarah@kettno.com",
      phone: "+254723456789",
      role: "Manager",
      status: "Active",
      lastLogin: new Date(Date.now() - 86400000 * 1), // 1 day ago
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

  const addNewEmployee = () => {
    const newEmployee: Employee = {
      id: employees.length + 1,
      name: "New Employee",
      email: `employee${employees.length + 1}@kettno.com`,
      phone: "+254700000000",
      role: "Staff",
      status: "Active",
      lastLogin: new Date(),
    };
    setEmployees([...employees, newEmployee]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <FiUser className="text-indigo-600" />
              Employee Management
            </h1>
            <p className="text-gray-600 mt-1">
              Manage your team members and their roles
            </p>
          </div>

          <Button
            onClick={addNewEmployee}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700"
          >
            <FiPlus className="w-4 h-4" />
            Add Employee
          </Button>
        </div>

        {/* Stats Card */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Employees</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{employees.length}</p>
            </div>
            <div className="bg-indigo-100 p-3 rounded-full">
              <FiUser className="text-indigo-600 w-5 h-5" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {employees.filter(e => e.status === "Active").length}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <FiUserCheck className="text-green-600 w-5 h-5" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Inactive</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {employees.filter(e => e.status === "Inactive").length}
              </p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <FiUserX className="text-red-600 w-5 h-5" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Roles</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {new Set(employees.map(e => e.role)).size}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <FiToggleRight className="text-blue-600 w-5 h-5" />
            </div>
          </div>
        </div>

        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-indigo-50">
                <TableRow>
                  <TableHead className="font-semibold text-indigo-800 px-6 py-4">Employee</TableHead>
                  <TableHead className="font-semibold text-indigo-800 px-6 py-4">Contact</TableHead>
                  <TableHead className="font-semibold text-indigo-800 px-6 py-4">Status</TableHead>
                  <TableHead className="font-semibold text-indigo-800 px-6 py-4">Role</TableHead>
                  <TableHead className="font-semibold text-indigo-800 px-6 py-4">Last Login</TableHead>
                  <TableHead className="font-semibold text-indigo-800 px-6 py-4 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((emp) => (
                  <TableRow key={emp.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-indigo-100 p-2 rounded-lg">
                          <FiUser className="text-indigo-600 w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{emp.name}</div>
                          <div className="text-sm text-gray-500">ID: {emp.id}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <FiMail className="text-gray-500" />
                          <span className="text-gray-600">{emp.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FiPhone className="text-gray-500" />
                          <span className="text-gray-600">{emp.phone}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <Badge
                        variant={emp.status === "Active" ? "success" : "destructive"}
                        className="flex items-center gap-1"
                      >
                        {emp.status === "Active" ? <FiToggleRight /> : <FiToggleLeft />}
                        {emp.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm inline-block">
                        {emp.role}
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <FiClock className="text-gray-500" />
                        {format(new Date(emp.lastLogin), "MMM d, yyyy h:mm a")}
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-indigo-600 border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 flex items-center gap-1"
                          onClick={() => openEditDialog(emp)}
                        >
                          <FiEdit2 className="w-4 h-4" />
                          Edit
                        </Button>
                        <Button
                          variant={emp.status === "Active" ? "destructive" : "success"}
                          size="sm"
                          className="flex items-center gap-1"
                          onClick={() => toggleStatus(emp.id)}
                        >
                          {emp.status === "Active" ? <FiToggleLeft className="w-4 h-4" /> : <FiToggleRight className="w-4 h-4" />}
                          {emp.status === "Active" ? "Deactivate" : "Activate"}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={!!editDialog} onOpenChange={() => setEditDialog(null)}>
          <DialogContent className="sm:max-w-md rounded-xl border border-gray-200 shadow-xl">
            <DialogHeader>
              <DialogTitle className="text-gray-800 flex items-center gap-2">
                <FiEdit2 className="text-indigo-600" />
                Edit Employee Details
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-700">Full Name</Label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-3 text-gray-400" />
                  <Input
                    id="name"
                    className="pl-10 border-gray-300"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700">Email Address</Label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-3 text-gray-400" />
                  <Input
                    id="email"
                    className="pl-10 border-gray-300"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-gray-700">Phone Number</Label>
                <div className="relative">
                  <FiPhone className="absolute left-3 top-3 text-gray-400" />
                  <Input
                    id="phone"
                    className="pl-10 border-gray-300"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role" className="text-gray-700">Role</Label>
                <Input
                  id="role"
                  className="border-gray-300"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter className="border-t border-gray-200 pt-4">
              <Button
                variant="outline"
                className="border-gray-300"
                onClick={() => setEditDialog(null)}
              >
                Cancel
              </Button>
              <Button
                className="bg-indigo-600 hover:bg-indigo-700"
                onClick={saveChanges}
              >
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}