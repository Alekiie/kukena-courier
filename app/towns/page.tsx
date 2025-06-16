"use client";

import { useState, useEffect } from "react";
import { FiPlus, FiEdit2, FiTrash2, FiMapPin, FiPhone, FiHome, FiDollarSign } from "react-icons/fi";
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
  DialogClose,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useTowns, Town } from "../context/TownsContext";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; 

interface TownDialogProps {
  initialTownData: Town | null;
  onSave: (town: { id?: number; name: string; phone: string; address: string }) => Promise<void>;
  onClose: () => void;
}

const TownDialog = ({
  initialTownData,
  onSave,
  onClose,
}: TownDialogProps) => {
  const [town, setTown] = useState(initialTownData || { name: "", phone: "", address: "" });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setTown(initialTownData || { name: "", phone: "", address: "" });
    setError(null);
  }, [initialTownData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await onSave(town);
      onClose();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isEditing = initialTownData && initialTownData.id;

  return (
    <DialogContent className="sm:max-w-md rounded-xl border border-gray-200 shadow-xl">
      <DialogHeader>
        <DialogTitle className="text-gray-800 flex items-center gap-2">
          <FiMapPin className="text-indigo-600" />
          {isEditing ? "Edit Town Branch" : "Create New Town Branch"}
        </DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-gray-700">Town Name</Label>
          <Input
            id="name"
            required
            value={town.name}
            onChange={(e) => setTown({ ...town, name: e.target.value })}
            disabled={isSubmitting}
            className="border-gray-300"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-gray-700">Contact Number</Label>
          <Input
            id="phone"
            type="tel"
            required
            value={town.phone}
            onChange={(e) => setTown({ ...town, phone: e.target.value })}
            placeholder="Format: +254712345678"
            disabled={isSubmitting}
            className="border-gray-300"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="address" className="text-gray-700">Full Address</Label>
          <Input
            id="address"
            required
            value={town.address}
            onChange={(e) => setTown({ ...town, address: e.target.value })}
            disabled={isSubmitting}
            className="border-gray-300"
          />
        </div>
        {error && <p className="text-red-500 text-sm py-2">{error}</p>}
        <div className="flex justify-end gap-3 pt-2">
          <DialogClose asChild>
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              className="border-gray-300"
            >
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                {isEditing ? "Saving..." : "Creating..."}
              </span>
            ) : isEditing ? "Save Changes" : "Create Branch"}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
};

// New component for pricing
const RoutePricingDialog = ({
  initialPricingData,
  onSave,
  onClose,
}: {
  initialPricingData: { origin_town_id: number, destination_town_id: number, price: number } | null;
  onSave: (pricing: { origin_town_id: number, destination_town_id: number, price: number }) => Promise<void>;
  onClose: () => void;
}) => {
  const { towns } = useTowns();
  const [pricing, setPricing] = useState(initialPricingData || { origin_town_id: 0, destination_town_id: 0, price: 0 });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setPricing(initialPricingData || { origin_town_id: 0, destination_town_id: 0, price: 0 });
    setError(null);
  }, [initialPricingData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await onSave(pricing);
      onClose();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DialogContent className="sm:max-w-md rounded-xl border border-gray-200 shadow-xl">
      <DialogHeader>
        <DialogTitle className="text-gray-800 flex items-center gap-2">
          <FiDollarSign className="text-indigo-600" />
          Set Route Pricing
        </DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="origin" className="text-gray-700">Origin Town</Label>
          <Select
            id="origin"
            required
            value={pricing.origin_town_id.toString()}
            onValueChange={(value) => setPricing({ ...pricing, origin_town_id: Number(value) })}
            disabled={isSubmitting}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Origin Town" />
            </SelectTrigger>
            <SelectContent>
              {towns.map((town) => (
                <SelectItem key={town.id} value={town.id.toString()}>
                  {town.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="destination" className="text-gray-700">Destination Town</Label>
          <Select
            id="destination"
            required
            value={pricing.destination_town_id.toString()}
            onValueChange={(value) => setPricing({ ...pricing, destination_town_id: Number(value) })}
            disabled={isSubmitting}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Destination Town" />
            </SelectTrigger>
            <SelectContent>
              {towns.map((town) => (
                <SelectItem key={town.id} value={town.id.toString()}>
                  {town.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="price" className="text-gray-700">Price</Label>
          <Input
            id="price"
            type="number"
            required
            value={pricing.price}
            onChange={(e) => setPricing({ ...pricing, price: Number(e.target.value) })}
            disabled={isSubmitting}
            className="border-gray-300"
          />
        </div>
        {error && <p className="text-red-500 text-sm py-2">{error}</p>}
        <div className="flex justify-end gap-3 pt-2">
          <DialogClose asChild>
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              className="border-gray-300"
            >
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                {isSubmitting ? "Saving..." : "Set Pricing"}
              </span>
            ) : "Set Pricing"}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
};

export default function TownsPage() {
  const { towns, createTown, updateTown, loading, fetchTowns, setRoutePricing } = useTowns();
  const [dialogState, setDialogState] = useState<"add" | "routePricing" | Town | null>(null);

  const handleApiError = (error: any, action: string) => {
    console.error(`Error ${action} town:`, error);
    alert(`Could not ${action} town: ${error.message || "Unknown error"}`);
  };

  const handleOpenAddDialog = () => setDialogState("add");
  const handleOpenEditDialog = (town: Town) => setDialogState(town);
  const handleOpenRoutePricingDialog = () => setDialogState("routePricing");

  const handleCloseDialog = () => setDialogState(null);

  const handleSaveTown = async (townData: { id?: number; name: string; phone: string; address: string }) => {
    try {
      if (dialogState === "add") {
        await createTown(townData);
      } else if (dialogState && typeof dialogState === 'object') {
        await updateTown({ ...townData, id: dialogState.id });
      }
    } catch (error) {
      handleApiError(error, dialogState === "add" ? "creating" : "updating");
      throw error;
    }
  };

  const handleSavePricing = async (pricing: { origin_town_id: number; destination_town_id: number; price: number }) => {
  try {
    const token = localStorage.getItem("access_token");
    if (!token) throw new Error("Authentication token is missing.");

    // API URL to save the route pricing
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/pricing`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(pricing),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to set pricing.");
    }

    // Success handling (you can handle success message and refresh logic here)
    alert("Pricing set successfully!");
  } catch (error) {
    console.error("Error setting pricing:", error);
    alert(`Error: ${error.message}`);
  }
};


  const isDialogOpen = dialogState !== null;
  const initialTownDataForDialog = dialogState && typeof dialogState === 'object' ? dialogState : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <FiMapPin className="text-indigo-600" />
              Town Branches
            </h1>
            <p className="text-gray-600 mt-1">
              Manage all town branches where parcels are sent and received
            </p>
          </div>

          <Button
            onClick={handleOpenAddDialog}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700"
          >
            <FiPlus className="w-4 h-4" />
            Add New Branch
          </Button>
        </div>

        <Button
          onClick={handleOpenRoutePricingDialog}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 mb-8"
        >
          <FiDollarSign className="w-4 h-4" />
          Set Route Pricing
        </Button>

        {/* Single Dialog for both Add and Edit */}
        <Dialog open={isDialogOpen} onOpenChange={open => !open && handleCloseDialog()}>
          {isDialogOpen && (
            dialogState === "routePricing" ? (
              <RoutePricingDialog
                initialPricingData={null}
                onSave={handleSavePricing}
                onClose={handleCloseDialog}
              />
            ) : (
              <TownDialog
                initialTownData={initialTownDataForDialog}
                onSave={handleSaveTown}
                onClose={handleCloseDialog}
              />
            )
          )}
        </Dialog>

        {/* Towns Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <Table>
            <TableHeader className="bg-indigo-50">
              <TableRow>
                <TableHead className="font-semibold text-indigo-800 px-6 py-4">Town Name</TableHead>
                <TableHead className="font-semibold text-indigo-800 px-6 py-4">Contact Info</TableHead>
                <TableHead className="font-semibold text-indigo-800 px-6 py-4">Address</TableHead>
                <TableHead className="text-right font-semibold text-indigo-800 px-6 py-4">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <TableRow key={`skeleton-${index}`} className="border-b border-gray-100">
                    <TableCell className="px-6 py-4">
                      <Skeleton className="h-4 w-3/4" />
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <Skeleton className="h-4 w-1/2" />
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                    <TableCell className="px-6 py-4 text-right">
                      <Skeleton className="h-8 w-20 ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : towns.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-12 px-6">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="bg-gray-100 p-4 rounded-full">
                        <FiMapPin className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900">No town branches found</h3>
                      <p className="text-gray-500 max-w-md">
                        Add your first town branch to start managing parcel operations
                      </p>
                      <Button
                        onClick={handleOpenAddDialog}
                        className="mt-3 flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700"
                      >
                        <FiPlus className="w-4 h-4" />
                        Add New Branch
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                towns.map((town) => (
                  <TableRow key={town.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <TableCell className="font-medium px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-indigo-100 p-2 rounded-lg">
                          <FiMapPin className="text-indigo-600 w-5 h-5" />
                        </div>
                        <span className="font-medium text-gray-800">{town.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <FiPhone className="text-gray-500" />
                        {town.phone}
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="flex items-start gap-2">
                        <FiHome className="text-gray-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600">{town.address}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right px-6 py-4">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-indigo-600 border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 flex items-center gap-2"
                          onClick={() => handleOpenEditDialog(town)}
                        >
                          <FiEdit2 className="w-4 h-4" />
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
