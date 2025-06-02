"use client";

import { useState, useEffect } from "react";
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
import { format, isValid } from "date-fns";
import { FiUser, FiMail, FiPhone, FiEdit2, FiToggleLeft, FiToggleRight, FiPlus, FiUserCheck, FiUserX, FiClock, FiMapPin, FiX } from "react-icons/fi";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useTowns } from "../context/TownsContext";

type Employee = {
  id: number;
  username: string;
  email: string;
  role: string;
  phone: string;
  town_id: number;
  town_name?: string;
  status: "active" | "inactive";
  created_at: string;
};

export default function EmployeesPage() {
  const token = localStorage.getItem("access_token");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editDialog, setEditDialog] = useState<null | number>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Form states
  const [editForm, setEditForm] = useState({
    username: "",
    email: "",
    phone: "",
    role: "",
    town_id: "",
  });

  const [createForm, setCreateForm] = useState({
    username: "",
    email: "",
    phone: "",
    role: "clerk",
    town_id: "",
  });

  const { towns, loading: townsLoading } = useTowns();
  const townsArray = Array.isArray(towns) ? towns : [];
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${baseUrl}/officials`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Failed to fetch employees');
        }

        const data = await res.json();
        setEmployees(data.officials || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Open edit dialog
  const openEditDialog = (emp: Employee) => {
    setEditForm({
      username: emp.username,
      email: emp.email,
      phone: emp.phone || "",
      role: emp.role,
      town_id: String(emp.town_id),
    });
    setEditDialog(emp.id);
  };

  // Open create dialog
  const openCreateDialog = () => {
    setCreateForm({
      username: "",
      email: "",
      phone: "",
      role: "clerk",
      town_id: towns.length > 0 ? String(towns[0].id) : "",
    });
    setCreateDialogOpen(true);
  };

  // Save edited employee
  const saveChanges = async () => {
    if (editDialog === null) return;

    try {
      const response = await fetch(`${baseUrl}/officials/${editDialog}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...editForm,
          town_id: Number(editForm.town_id)
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update employee');
      }

      const data = await response.json();

      // Update local state
      setEmployees(prev => prev.map(emp =>
        emp.id === editDialog ? {
          ...emp,
          ...data.official,
          phone: data.official.phone || ""
        } : emp
      ));

      toast.success("Employee updated successfully");
      setEditDialog(null);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // Create new employee
  const createEmployee = async () => {
    try {
      // Validate required fields
      if (!createForm.username || !createForm.email || !createForm.role || !createForm.town_id) {
        throw new Error("Please fill in all required fields");
      }

      const response = await fetch(`${baseUrl}/officials`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...createForm,
          town_id: Number(createForm.town_id)
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create employee');
      }

      const data = await response.json();

      // Add created_at timestamp for new employee
      const newEmployee = {
        ...data.official,
        phone: data.official.phone || "",
        created_at: new Date().toISOString() // Temporary timestamp until backend adds it
      };

      setEmployees(prev => [...prev, newEmployee]);

      toast.success("Employee created successfully");
      setCreateDialogOpen(false);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // Toggle employee status
  const toggleStatus = async (id: number) => {
    try {
      const response = await fetch(`${baseUrl}/officials/${id}/status`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to toggle status');
      }

      const data = await response.json();

      // Update local state
      setEmployees(prev => prev.map(emp =>
        emp.id === id ? { ...emp, status: data.official.status } : emp
      ));

      toast.success(`Status updated to ${data.official.status}`);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // Safe date formatting function
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return isValid(date) ? format(date, "MMM d, yyyy") : "N/A";
    } catch {
      return "N/A";
    }
  };

  if (loading || townsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <p>Loading employees...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <p className="text-red-500">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              className="mt-4"
            >
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

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
            onClick={openCreateDialog}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo- cursor-pointer"
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
                {employees.filter(e => e.status === "active").length}
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
                {employees.filter(e => e.status === "inactive").length}
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
                  <TableHead className="font-semibold text-indigo-800 px-6 py-4">Town</TableHead>
                  <TableHead className="font-semibold text-indigo-800 px-6 py-4">Status</TableHead>
                  <TableHead className="font-semibold text-indigo-800 px-6 py-4">Role</TableHead>
                  <TableHead className="font-semibold text-indigo-800 px-6 py-4">Created At</TableHead>
                  <TableHead className="font-semibold text-indigo-800 px-6 py-4 text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <FiUser className="text-gray-400 w-12 h-12" />
                        <h3 className="text-lg font-medium text-gray-900">No employees found</h3>
                        <p className="text-gray-500">
                          Try adding your first employee
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  employees.map((emp) => (
                    <TableRow key={emp.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="bg-indigo-100 p-2 rounded-lg">
                            <FiUser className="text-indigo-600 w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{emp.username}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <FiPhone className="text-gray-500" />
                            <span className="text-gray-600">{emp.phone || "N/A"}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FiMail className="text-gray-500" />
                            <span className="text-gray-600">{emp.email}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <FiMapPin className="text-gray-500" />
                          <span>
                            {townsArray.find(t => t.id === emp.town_id)?.name || `Town ${emp.town_id}`}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <Badge
                          variant={emp.status === "active" ? "success" : "destructive"}
                          className="flex items-center gap-1"
                        >
                          {emp.status === "active" ? <FiToggleRight /> : <FiToggleLeft />}
                          {emp.status.charAt(0).toUpperCase() + emp.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm inline-block capitalize">
                          {emp.role}
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center gap-2 text-gray-600">
                          <FiClock className="text-gray-500" />
                          {formatDate(emp.created_at)}
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-indigo-600 border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
                            onClick={() => openEditDialog(emp)}
                          >
                            <FiEdit2 className="w-4 h-4" />
                            Edit
                          </Button>
                          <Button
                            variant={emp.status === "active" ? "destructive" : "success"}
                            size="sm"
                            className="flex items-center gap-1 cursor-pointer"
                            onClick={() => toggleStatus(emp.id)}
                          >
                            {emp.status === "active" ? <FiToggleLeft className="w-4 h-4" /> : <FiToggleRight className="w-4 h-4" />}
                            {emp.status === "active" ? "Deactivate" : "Activate"}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
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
                <Label htmlFor="username" className="text-gray-700">Username</Label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-3 text-gray-400" />
                  <Input
                    id="username"
                    className="pl-10 border-gray-300"
                    value={editForm.username}
                    onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
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
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
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
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    placeholder="Enter phone number"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role" className="text-gray-700">Role</Label>
                <Select
                  value={editForm.role}
                  onValueChange={value => setEditForm({ ...editForm, role: value })}
                >
                  <SelectTrigger className="w-full border-gray-300">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="clerk">Clerk</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="town_id" className="text-gray-700">Town</Label>
                <Select
                  value={editForm.town_id}
                  onValueChange={value => setEditForm({ ...editForm, town_id: value })}
                >
                  <SelectTrigger className="w-full border-gray-300">
                    <SelectValue placeholder="Select town" />
                  </SelectTrigger>
                  <SelectContent>
                    {townsArray.map(town => (
                      <SelectItem key={town.id} value={String(town.id)}>
                        {town.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="border-t border-gray-200 pt-4">
              <Button
                variant="outline"
                className="border-gray-300 cursor-pointer"
                onClick={() => setEditDialog(null)}
              >
                Cancel
              </Button>
              <Button
                className="bg-indigo-600 hover:bg-indigo-700 cursor-pointer"
                onClick={saveChanges}
              >
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create Employee Dialog */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent className="sm:max-w-md rounded-xl border border-gray-200 shadow-xl">
            <DialogHeader>
              <DialogTitle className="text-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FiUser className="text-indigo-600" />
                  Create New Employee
                </div>
                <button
                  onClick={() => setCreateDialogOpen(false)}
                  className="p-1 rounded-full hover:bg-gray-100"
                >
                </button>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="new-username" className="text-gray-700">
                  Username <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-3 text-gray-400" />
                  <Input
                    id="new-username"
                    className="pl-10 border-gray-300"
                    value={createForm.username}
                    onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
                    placeholder="Enter username"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-email" className="text-gray-700">
                  Email <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-3 text-gray-400" />
                  <Input
                    id="new-email"
                    type="email"
                    className="pl-10 border-gray-300"
                    value={createForm.email}
                    onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                    placeholder="Enter email address"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-phone" className="text-gray-700">Phone Number</Label>
                <div className="relative">
                  <FiPhone className="absolute left-3 top-3 text-gray-400" />
                  <Input
                    id="new-phone"
                    className="pl-10 border-gray-300"
                    value={createForm.phone}
                    onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                    placeholder="Enter phone number"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-role" className="text-gray-700">
                  Role <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={createForm.role}
                  onValueChange={value => setCreateForm({ ...createForm, role: value })}
                >
                  <SelectTrigger className="w-full border-gray-300">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="clerk">Clerk</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-town_id" className="text-gray-700">
                  Town <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={createForm.town_id}
                  onValueChange={value => setCreateForm({ ...createForm, town_id: value })}
                >
                  <SelectTrigger className="w-full border-gray-300">
                    <SelectValue placeholder="Select town" />
                  </SelectTrigger>
                  <SelectContent>
                    {townsArray.map(town => (
                      <SelectItem key={town.id} value={String(town.id)}>
                        {town.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="border-t border-gray-200 pt-4">
              <Button
                variant="outline"
                className="border-gray-300 cursor-pointer"
                onClick={() => setCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="bg-indigo-600 hover:bg-indigo-700 cursor-pointer"
                onClick={createEmployee}
              >
                Create Employee
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}