"use client";

import { useState, useEffect, FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Filter } from "lucide-react";
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

const VALID_PARCEL_STATUSES = [
  "registered",
  "in_transit",
  "delivered",
  "collected"
] as const;
type ParcelStatus = (typeof VALID_PARCEL_STATUSES)[number];

export default function ParcelsPage() {
  const { towns } = useTowns();
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<ParcelStatus[]>([]);
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
        if (!token) throw new Error("Authentication token not found");
        
        const response = await fetch(`${baseUrl}/parcels`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch parcels");
        }

        setParcels(await response.json());
      } catch (err: any) {
        setError(err.message);
        setParcels([]);
      } finally {
        setLoading(false);
      }
    };

    baseUrl ? fetchParcels() : setError("API URL not configured");
  }, [baseUrl]);

  const handleStatusFilterChange = (status: ParcelStatus, checked: boolean) => {
    setSelectedStatuses(prev =>
      checked ? [...prev, status] : prev.filter(s => s !== status)
    );
  };

  const filteredParcels = parcels.filter(parcel => {
    const matchesSearch = [
      parcel.tracking_number,
      parcel.sender_name,
      parcel.recipient_name,
      parcel.origin_town_id.toString(),
      parcel.destination_town_id.toString(),
      parcel.status
    ].some(value => value.toLowerCase().includes(search.toLowerCase()));

    const parcelDate = parcel.created_at?.split("T")[0] || "";
    const dateInRange = (!startDate || parcelDate >= startDate) &&
                       (!endDate || parcelDate <= endDate);

    const statusMatches = selectedStatuses.length === 0 || 
                         selectedStatuses.includes(parcel.status as ParcelStatus);

    return matchesSearch && dateInRange && statusMatches;
  });

  const handleOpenStatusDialog = (parcel: Parcel) => {
    setSelectedParcel(parcel);
    setNewStatus(parcel.status as ParcelStatus);
    setIsStatusDialogOpen(true);
    setError(null);
    setSuccessMessage(null);
  };

  const handleStatusUpdate = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedParcel || !newStatus) return;

    setIsSubmittingStatus(true);
    try {
      const token = localStorage.getItem("access_token");
      if (!token) throw new Error("Authentication token not found");
      
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

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Status update failed");
      }

      setParcels(prev => prev.map(p => 
        p.tracking_number === selectedParcel.tracking_number
          ? { ...p, status: newStatus }
          : p
      ));
      setSuccessMessage("Status updated successfully!");
      setIsStatusDialogOpen(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmittingStatus(false);
    }
  };

  if (!baseUrl) return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 text-center">
      <Alert variant="destructive">
        <AlertTitle>Configuration Error</AlertTitle>
        <AlertDescription>API base URL not configured</AlertDescription>
      </Alert>
    </div>
  );

  if (loading) return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 text-center">
      Loading parcels...
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {successMessage && (
          <Alert className="bg-green-100 border-green-300 text-green-700">
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        )}

        <Card className="shadow-sm">
          <CardHeader className="flex flex-col gap-4">
            <div className="flex items-center justify-between w-full">
              <CardTitle className="text-xl">
                Sent Parcels ({filteredParcels.length})
              </CardTitle>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="bg-blue-600">
                    <Filter className="w-4 h-4 mr-2 text-xl "  />
                    Filter
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-60">
                  <div className="space-y-4">
                    <Label className="block font-medium">Status Filter</Label>
                    {VALID_PARCEL_STATUSES.map(status => (
                      <div key={status} className="flex items-center space-x-2">
                        <Checkbox
                          id={status}
                          checked={selectedStatuses.includes(status)}
                          onCheckedChange={checked =>
                            handleStatusFilterChange(status, !!checked)
                          }
                        />
                        <Label htmlFor={status} className="capitalize">
                          {status.replace('_', ' ')}
                        </Label>
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <div className="w-full space-y-2">
              <Input
                placeholder="Search parcels..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <div className="flex flex-col md:flex-row gap-2">
                <Input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  placeholder="Start date"
                />
                <Input
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  placeholder="End date"
                />
              </div>
            </div>
          </CardHeader>

          <CardContent className="overflow-x-auto">
            <Table className="">
              <TableHeader className="bg-slate-400 font-bold rounded-md" >
                <TableRow className="">
                  <TableHead>Tracking ID</TableHead>
                  <TableHead>Sender</TableHead>
                  <TableHead>Receiver</TableHead>
                  <TableHead>Origin</TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Weight</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredParcels.map(parcel => (
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
                    <TableCell>
                      {towns.find(t => t.id === parcel.origin_town_id)?.name}
                    </TableCell>
                    <TableCell>
                      {towns.find(t => t.id === parcel.destination_town_id)?.name}
                    </TableCell>
                    <TableCell>
                      {new Date(parcel.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{parcel.weight} kg</TableCell>
                    <TableCell>{parcel.payment_method}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        parcel.status === "delivered" ? "bg-green-200 text-green-800" :
                        parcel.status === "in_transit" ? "bg-blue-200 text-blue-800" :
                        "bg-yellow-200 text-yellow-800"
                      }`}>
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
                ))}
                {filteredParcels.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center text-gray-500 h-24">
                      No parcels found matching your criteria
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Status Update Dialog */}
        <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Update Parcel Status</DialogTitle>
            </DialogHeader>
            {selectedParcel && (
              <form onSubmit={handleStatusUpdate}>
                <div className="grid gap-4 py-4">
                  <p>Tracking ID: <strong>{selectedParcel.tracking_number}</strong></p>
                  <p>Current Status: <strong>{selectedParcel.status}</strong></p>
                  <div className="space-y-2">
                    <Label htmlFor="newStatus">New Status</Label>
                    <Select
                      value={newStatus}
                      onValueChange={value => setNewStatus(value as ParcelStatus)}
                    >
                      <SelectTrigger id="newStatus">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {VALID_PARCEL_STATUSES.map(status => (
                          <SelectItem key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button
                    type="submit"
                    disabled={isSubmittingStatus || newStatus === selectedParcel.status}
                  >
                    {isSubmittingStatus ? "Saving..." : "Save Changes"}
                  </Button>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}