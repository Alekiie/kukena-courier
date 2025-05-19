"use client";

import { useState, useEffect } from "react";
import { PlusCircle, Pencil, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useTowns } from "../context/TownsContext";



export default function TownsPage() {
  const { towns, createTown,loading } = useTowns();
  console.log("Towns:", towns);

  const [newTown, setNewTown] = useState({ name: "", phone: "", address: "" });
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await createTown(newTown);
      setNewTown({ name: "", phone: "", address: "" });
      setDialogOpen(false);
    } catch (err: any) {
      setError(err.message);
      console.error("Error creating town:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">All Towns</h1>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <PlusCircle className="w-5 h-5" />
                Add New Town
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-gray-800">
                  Create New Town
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-gray-700">
                    Town Name
                  </Label>
                  <Input
                    id="name"
                    required
                    value={newTown.name}
                    onChange={(e) =>
                      setNewTown({ ...newTown, name: e.target.value })
                    }
                    placeholder="Enter town name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-gray-700">
                    Contact Number
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    required
                    value={newTown.phone}
                    onChange={(e) =>
                      setNewTown({ ...newTown, phone: e.target.value })
                    }
                    placeholder="Format: +254 712 345 678"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address" className="text-gray-700">
                    Full Address
                  </Label>
                  <Input
                    id="address"
                    required
                    value={newTown.address}
                    onChange={(e) =>
                      setNewTown({ ...newTown, address: e.target.value })
                    }
                    placeholder="Enter full address"
                  />
                </div>
                <div className="flex justify-end gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Create Town</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="w-[200px]">Town Name</TableHead>
                <TableHead>Contact Number</TableHead>
                <TableHead>Address</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Skeleton className="h-4 w-[120px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[140px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[200px]" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-4 w-[80px] ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : towns.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="h-24 text-center text-gray-500"
                  >
                    No towns found.
                  </TableCell>
                </TableRow>
              ) : (
                towns.map((town) => (
                  <TableRow key={town.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">{town.name}</TableCell>
                    <TableCell>{town.phone}</TableCell>
                    <TableCell>{town.address}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-600 cursor-pointer"
                        >
                          <Pencil className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
