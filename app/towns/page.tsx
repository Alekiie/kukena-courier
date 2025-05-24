// src/app/towns/page.tsx
"use client";

import { useState, useEffect, FormEvent } from "react";
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
  DialogClose,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useTowns, Town } from "../context/TownsContext";

// Props for the TownDialog component
interface TownDialogProps {
  // `null` for adding new, `Town` object for editing
  initialTownData: Town | null;
  onSave: (town: { id?: number; name: string; phone: string; address: string }) => Promise<void>;
  onClose: () => void; // Callback to close the dialog from parent
}

const TownDialog = ({
  initialTownData,
  onSave,
  onClose, // Receive onClose prop
}: TownDialogProps) => {
  // Use a default empty object for new towns, or the initialTownData for editing
  const [town, setTown] = useState(initialTownData || { name: "", phone: "", address: "" });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update local state if initialTownData prop changes (e.g., when editing a different town, or opening for add after edit)
  useEffect(() => {
    setTown(initialTownData || { name: "", phone: "", address: "" });
    setError(null); // Clear errors on dialog open/data change
  }, [initialTownData]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await onSave(town);
      onClose(); // Call the onClose function passed from the parent to close the dialog
      // No need to reset town state here if onClose unmounts/re-initializes the dialog
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isEditing = initialTownData && initialTownData.id;

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle className="text-gray-800">
          {isEditing ? "Edit Town" : "Create New Town"}
        </DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Town Name</Label>
          <Input
            id="name"
            required
            value={town.name}
            onChange={(e) => setTown({ ...town, name: e.target.value })}
            disabled={isSubmitting}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Contact Number</Label>
          <Input
            id="phone"
            type="tel"
            required
            value={town.phone}
            onChange={(e) => setTown({ ...town, phone: e.target.value })}
            placeholder="Format: +254712345678"
            disabled={isSubmitting}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="address">Full Address</Label>
          <Input
            id="address"
            required
            value={town.address}
            onChange={(e) => setTown({ ...town, address: e.target.value })}
            disabled={isSubmitting}
          />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <div className="flex justify-end gap-4">
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={isSubmitting}>
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (isEditing ? "Saving..." : "Creating...") : (isEditing ? "Save Changes" : "Create Town")}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
};

export default function TownsPage() {
  const { towns, createTown, updateTown, loading, fetchTowns } = useTowns();
  // State to control the single dialog: null (closed), "add" (for new), or a Town object (for editing)
  const [dialogState, setDialogState] = useState<"add" | Town | null>(null);

  const handleApiError = (error: any, action: string) => {
    console.error(`Error ${action} town:`, error);
    alert(`Could not ${action} town: ${error.message || "Unknown error"}`);
  };

  const handleOpenAddDialog = () => {
    setDialogState("add");
  };

  const handleOpenEditDialog = (town: Town) => {
    setDialogState(town);
  };

  const handleCloseDialog = () => {
    setDialogState(null);
  };

  const handleSaveTown = async (townData: { id?: number; name: string; phone: string; address: string }) => {
    try {
      if (dialogState === "add") {
        await createTown(townData);
      } else if (typeof dialogState === 'object' && dialogState !== null) {
        // Ensure ID is present for an update, using the one from the dialogState (the town being edited)
        await updateTown({ ...townData, id: dialogState.id });
      }
      // No need to call handleCloseDialog here, onSave's success will trigger it from TownDialog
    } catch (error) {
      handleApiError(error, dialogState === "add" ? "creating" : "updating");
      throw error; // Re-throw to allow TownDialog to show its error message
    }
  };

  // Determine if the dialog is open based on dialogState
  const isDialogOpen = dialogState !== null;

  // Determine initial data for TownDialog based on dialogState
  const initialTownDataForDialog = typeof dialogState === 'object' && dialogState !== null
    ? dialogState
    : null; // Null indicates "add" mode for TownDialog

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">All Towns</h1>
          {/* Add New Town Button */}
          <Button className="gap-2" onClick={handleOpenAddDialog}>
            <PlusCircle className="w-5 h-5" />
            Add New Town
          </Button>
        </div>

        {/* Single Dialog for both Add and Edit */}
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          if (!open) {
            handleCloseDialog(); // Close dialog if user clicks outside or presses escape
          }
        }}>
          {isDialogOpen && ( // Only render TownDialog content when the dialog is open
            <TownDialog
              initialTownData={initialTownDataForDialog}
              onSave={handleSaveTown}
              onClose={handleCloseDialog} // Pass the close handler
            />
          )}
        </Dialog>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="w-[200px] px-4 py-3">Town Name</TableHead>
                <TableHead className="px-4 py-3">Contact Number</TableHead>
                <TableHead className="px-4 py-3">Address</TableHead>
                <TableHead className="text-right px-4 py-3">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <TableRow key={`skeleton-${index}`}>
                    <TableCell className="px-4 py-3"><Skeleton className="h-5 w-3/4" /></TableCell>
                    <TableCell className="px-4 py-3"><Skeleton className="h-5 w-3/4" /></TableCell>
                    <TableCell className="px-4 py-3"><Skeleton className="h-5 w-full" /></TableCell>
                    <TableCell className="text-right px-4 py-3">
                      <Skeleton className="h-8 w-20 ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : towns.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-gray-500 px-4 py-3">
                    No towns found. Try adding a new one!
                  </TableCell>
                </TableRow>
              ) : (
                towns.map((town) => (
                  <TableRow key={town.id} className="hover:bg-gray-50 transition-colors">
                    <TableCell className="font-medium px-4 py-3">{town.name}</TableCell>
                    <TableCell className="px-4 py-3">{town.phone}</TableCell>
                    <TableCell className="px-4 py-3">{town.address}</TableCell>
                    <TableCell className="text-right px-4 py-3">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-600 hover:text-gray-900"
                          onClick={() => handleOpenEditDialog(town)}
                        >
                          <Pencil className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        {/* Placeholder for Delete Button */}
                        {/* <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-800" onClick={() => handleDeleteTown(town.id)}>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </Button> */}
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