"use client";

import { useState, useEffect, FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button"; // Assuming you have a Button component
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"; // Assuming shadcn/ui dialog components
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // Assuming shadcn/ui select components
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // For messages
import { useTowns } from "../context/TownsContext";

type Parcel = {
  tracking_number: string;
  sender_name: string;
  recipient_name: string;
  origin_town_id: number;
  destination_town_id: number;
  weight: number;
  status: string;
  payment_method: string;
  created_at: string;
  sender_phone: string;
  recipient_phone: string;
};

// Based on your Flask model's Enum
const VALID_PARCEL_STATUSES = [
  "registered",
  "in_transit",
  "delivered",
] as const;
type ParcelStatus = (typeof VALID_PARCEL_STATUSES)[number];

export default function ParcelsPage() {
  const { towns } = useTowns();
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [selectedParcel, setSelectedParcel] = useState<Parcel | null>(null);
  const [newStatus, setNewStatus] = useState<ParcelStatus>("registered");
  const [isSubmittingStatus, setIsSubmittingStatus] = useState(false);

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    const fetchParcels = async () => {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          throw new Error("Authentication token not found. Please log in.");
        }
        const response = await fetch(`${baseUrl}/parcels`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch parcels");
        }

        const data: Parcel[] = await response.json();
        setParcels(data);
      } catch (err: any) {
        setError(err.message);
        setParcels([]);
      } finally {
        setLoading(false);
      }
    };

    if (baseUrl) {
      fetchParcels();
    } else {
      setError("API base URL is not configured.");
      setLoading(false);
    }
  }, [baseUrl]);

  const handleOpenStatusDialog = (parcel: Parcel) => {
    setSelectedParcel(parcel);
    setNewStatus(parcel.status as ParcelStatus); // Initialize with current status
    setIsStatusDialogOpen(true);
    setError(null);
    setSuccessMessage(null);
  };

  const handleStatusUpdate = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedParcel || !newStatus) return;

    setIsSubmittingStatus(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("Authentication token not found. Please log in.");
      }
      const response = await fetch(
        `${baseUrl}/parcels/${selectedParcel.tracking_number}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(
          responseData.message || "Failed to update parcel status"
        );
      }

      setParcels((prevParcels) =>
        prevParcels.map((p) =>
          p.tracking_number === selectedParcel.tracking_number
            ? { ...p, status: newStatus }
            : p
        )
      );
      setSuccessMessage(
        responseData.message || "Parcel status updated successfully!"
      );
      setIsStatusDialogOpen(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmittingStatus(false);
    }
  };

  const filteredParcels = parcels.filter((parcel) => {
    const parcelDate = parcel.created_at
      ? new Date(parcel.created_at).toISOString().split("T")[0]
      : "";
    const afterStart = !startDate || (parcelDate && parcelDate >= startDate);
    const beforeEnd = !endDate || (parcelDate && parcelDate <= endDate);

    const searchLower = search.toLowerCase();
    const matchesSearch =
      parcel.tracking_number.toLowerCase().includes(searchLower) ||
      parcel.sender_name.toLowerCase().includes(searchLower) ||
      parcel.recipient_name.toLowerCase().includes(searchLower) ||
      String(parcel.origin_town_id).includes(searchLower) ||
      String(parcel.destination_town_id).includes(searchLower) ||
      parcel.status.toLowerCase().includes(searchLower);

    return matchesSearch && afterStart && beforeEnd;
  });

  if (!baseUrl) {
    return (
      <div className="min-h-screen bg-gray-50 py-10 px-4 text-center">
        <Alert variant="destructive">
          <AlertTitle>Configuration Error</AlertTitle>
          <AlertDescription>
            API base URL (NEXT_PUBLIC_API_BASE_URL) is not configured. Please
            check your environment variables.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-10 px-4 text-center">
        Loading parcels...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {" "}
        {/* Increased max-width for wider table */}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {successMessage && (
          <Alert
            variant="default"
            className="mb-4 bg-green-100 border-green-300 text-green-700"
          >
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        )}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-col gap-4">
            <CardTitle className="text-xl">
              Sent Parcels ({filteredParcels.length})
            </CardTitle>
            <div className="w-full space-y-2">
              <Input
                placeholder="Search by Tracking ID, Sender, Receiver, Town ID, Status..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <div className="flex flex-col md:flex-row gap-2">
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full"
                  placeholder="Start date"
                />
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full"
                  placeholder="End date"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tracking ID</TableHead>
                  <TableHead>Sender</TableHead>
                  <TableHead>Receiver</TableHead>
                  <TableHead>Origin </TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Weight</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead> {/* New Actions column */}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredParcels.length > 0 ? (
                  filteredParcels.map((parcel) => (
                    <TableRow key={parcel.tracking_number}>
                      <TableCell className="font-medium">
                        {parcel.tracking_number}
                      </TableCell>
                      <TableCell>
                        {parcel.sender_name} ({parcel.sender_phone})
                      </TableCell>
                      <TableCell>
                        {parcel.recipient_name} ({parcel.recipient_phone})
                      </TableCell>
                      <TableCell>{towns &&
                        towns.find((t) => t.id === parcel.origin_town_id)?.name}</TableCell>
                      <TableCell> {towns &&
                        towns.find((t) => t.id === parcel.destination_town_id)
                          ?.name}</TableCell>
                      <TableCell>
                        {parcel.created_at
                          ? new Date(parcel.created_at).toLocaleDateString()
                          : "N/A"}
                      </TableCell>
                      <TableCell>{parcel.weight} kg</TableCell>
                      <TableCell>{parcel.payment_method}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            parcel.status === "delivered"
                              ? "bg-green-200 text-green-800"
                              : parcel.status === "in_transit"
                              ? "bg-blue-200 text-blue-800"
                              : "bg-yellow-200 text-yellow-800"
                          }`}
                        >
                          {parcel.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenStatusDialog(parcel)}
                        >
                          Update Status
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={10}
                      className="text-center text-gray-500 h-24"
                    >
                      No parcels found matching your criteria.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Status Update Dialog */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Update Parcel Status</DialogTitle>
          </DialogHeader>
          {selectedParcel && (
            <form onSubmit={handleStatusUpdate}>
              <div className="grid gap-4 py-4">
                <p>
                  Tracking ID: <strong>{selectedParcel.tracking_number}</strong>
                </p>
                <p>
                  Current Status: <strong>{selectedParcel.status}</strong>
                </p>
                <div>
                  <label
                    htmlFor="newStatus"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    New Status
                  </label>
                  <Select
                    value={newStatus}
                    onValueChange={(value: ParcelStatus) => setNewStatus(value)}
                  >
                    <SelectTrigger id="newStatus">
                      <SelectValue placeholder="Select new status" />
                    </SelectTrigger>
                    <SelectContent>
                      {VALID_PARCEL_STATUSES.map((statusOption) => (
                        <SelectItem key={statusOption} value={statusOption}>
                          {statusOption.charAt(0).toUpperCase() +
                            statusOption.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {error && ( // Display error within dialog if specific to submission
                  <Alert variant="destructive" className="mt-2">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isSubmittingStatus}
                  >
                    Cancel
                  </Button>
                </DialogClose>
                <Button
                  type="submit"
                  disabled={
                    isSubmittingStatus || newStatus === selectedParcel.status
                  }
                >
                  {isSubmittingStatus ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
