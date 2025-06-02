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
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
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
import { FiFilter, FiRefreshCw, FiInfo, FiSend, FiCalendar, FiSearch, FiPackage, FiTruck, FiUser, FiMapPin, FiDollarSign, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { useTowns } from "../context/TownsContext";
import { Badge } from "@/components/ui/badge";

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

// Status color mapping
const statusColors = {
  registered: "bg-yellow-100 text-yellow-800 border-yellow-200",
  in_transit: "bg-blue-100 text-blue-800 border-blue-200",
  delivered: "bg-green-100 text-green-800 border-green-200",
  collected: "bg-purple-100 text-purple-800 border-purple-200"
};

const FiCheck = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
  </svg>
);
// Status icons
const statusIcons = {
  registered: <FiPackage className="w-4 h-4" />,
  in_transit: <FiTruck className="w-4 h-4" />,
  delivered: <FiCheck className="w-4 h-4" />,
  collected: <FiUser className="w-4 h-4" />
};


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
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedParcel, setSelectedParcel] = useState<Parcel | null>(null);
  const [newStatus, setNewStatus] = useState<ParcelStatus>("registered");
  const [isSubmittingStatus, setIsSubmittingStatus] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

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

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, startDate, endDate, selectedStatuses]);

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

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentParcels = filteredParcels.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredParcels.length / itemsPerPage);

  const handleOpenDetailsDialog = (parcel: Parcel) => {
    setSelectedParcel(parcel);
    setNewStatus(parcel.status as ParcelStatus);
    setIsDetailsDialogOpen(true);
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
      setIsDetailsDialogOpen(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmittingStatus(false);
    }
  };

  const handleSendMessage = async () => {
    if (!selectedParcel) return;

    setIsSendingMessage(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const token = localStorage.getItem("access_token");
      if (!token) throw new Error("Authentication token not found");

      const response = await fetch(
        `${baseUrl}/parcels/${selectedParcel.tracking_number}/send-message`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            recipient_phone: selectedParcel.recipient_phone,
            message_type: "delivery_confirmation",
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to send message");
      }

      setSuccessMessage("Delivery message sent successfully!");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSendingMessage(false);
    }
  };

  const refreshData = () => {
    if (baseUrl) {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);
      setCurrentPage(1);
      const token = localStorage.getItem("access_token");
      fetch(`${baseUrl}/parcels`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(response => {
          if (!response.ok) throw new Error("Failed to fetch parcels");
          return response.json();
        })
        .then(data => setParcels(data))
        .catch(err => setError(err.message))
        .finally(() => setLoading(false));
    }
  };

  const clearFilters = () => {
    setSearch("");
    setStartDate("");
    setEndDate("");
    setSelectedStatuses([]);
    setCurrentPage(1);
  };

  if (!baseUrl) return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-10 px-4 text-center">
      <Alert variant="destructive" className="max-w-2xl mx-auto">
        <AlertTitle>Configuration Error</AlertTitle>
        <AlertDescription>API base URL not configured</AlertDescription>
      </Alert>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <FiTruck className="text-indigo-600 w-6 h-6" />
              <span className="bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">
                Cargo Traffic Dashboard
              </span>
            </h1>
            <p className="text-gray-600 mt-1">
              Monitor and manage parcel shipments in real-time
            </p>
          </div>
          <Button
            onClick={refreshData}
            disabled={loading}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700"
          >
            <FiRefreshCw className={`${loading ? "animate-spin" : ""}`} />
            Refresh Data
          </Button>
        </div>

        {/* Stats*/}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border border-indigo-100 bg-indigo-50 shadow-sm">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-indigo-600 font-medium">Total Parcels</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{parcels.length}</p>
              </div>
              <div className="bg-indigo-100 p-3 rounded-full">
                <FiPackage className="text-indigo-600 w-6 h-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-blue-100 bg-blue-50 shadow-sm">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">In Transit</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {parcels.filter(p => p.status === "in_transit").length}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <FiTruck className="text-blue-600 w-6 h-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-green-100 bg-green-50 shadow-sm">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Delivered</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {parcels.filter(p => p.status === "delivered").length}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <FiCheck className="text-green-600 w-6 h-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-purple-100 bg-purple-50 shadow-sm">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">Collected</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {parcels.filter(p => p.status === "collected").length}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <FiUser className="text-purple-600 w-6 h-6" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Status Messages */}
        {error && (
          <Alert variant="destructive" className="border-red-300">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {successMessage && (
          <Alert className="bg-green-50 border-green-300 text-green-800">
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        )}

        {/* Filters Card (Wasn't sure it'd work.) */}
        <Card className="border border-gray-200 bg-white shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
                <FiFilter className="text-indigo-600" />
                Filter Parcels
              </CardTitle>
              <div className="flex items-center gap-3">
                <div className="text-sm text-gray-500">
                  Showing <span className="font-medium text-indigo-600">{filteredParcels.length}</span> of{" "}
                  <span className="font-medium">{parcels.length}</span> parcels
                </div>
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="text-gray-600 hover:text-indigo-600"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <Label className="text-sm text-gray-600 mb-1 block">Search Parcels</Label>
                <div className="relative">
                  <FiSearch className="absolute left-3 top-3.5 text-gray-400" />
                  <input
                    placeholder="Tracking, sender, receiver..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-10 p-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition"
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm text-gray-600 mb-1 block">From Date</Label>
                <div className="relative">
                  <input
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="w-full p-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition"
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm text-gray-600 mb-1 block">To Date</Label>
                <div className="relative">

                  <input
                    type="date"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    className="w-full p-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition"
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm text-gray-600 mb-1 block">Status Filter</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full pl-10 p-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition"
                    >
                      <FiFilter className="mr-2" />
                      {selectedStatuses.length > 0
                        ? `${selectedStatuses.length} selected`
                        : "All statuses"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-60 p-4 border border-gray-200">
                    <div className="space-y-3">
                      {VALID_PARCEL_STATUSES.map(status => (
                        <div key={status} className="flex items-center space-x-2">
                          <Checkbox
                            id={status}
                            checked={selectedStatuses.includes(status)}
                            onCheckedChange={checked =>
                              handleStatusFilterChange(status, !!checked)
                            }
                          />
                          <Label htmlFor={status} className="capitalize text-sm flex items-center gap-2">
                            <span className={`w-3 h-3 rounded-full ${statusColors[status].split(' ')[0]}`}></span>
                            {status.replace('_', ' ')}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Parcels Table cd */}
        <Card className="border border-gray-200 bg-white shadow-sm overflow-hidden">
          <CardContent className="p-0">
            <Table className="border-collapse">
              <TableHeader className="bg-indigo-50">
                <TableRow>
                  <TableHead className="font-semibold text-indigo-800">Tracking ID</TableHead>
                  <TableHead className="font-semibold text-indigo-800">Sender</TableHead>
                  <TableHead className="font-semibold text-indigo-800">Receiver</TableHead>
                  <TableHead className="font-semibold text-indigo-800">Route</TableHead>
                  <TableHead className="font-semibold text-indigo-800">Date</TableHead>
                  <TableHead className="font-semibold text-indigo-800">Weight</TableHead>
                  <TableHead className="font-semibold text-indigo-800">Status</TableHead>
                  <TableHead className="font-semibold text-right text-indigo-800">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <FiRefreshCw className="animate-spin text-indigo-600 w-8 h-8" />
                        <p className="text-gray-600">Loading cargo data...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredParcels.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <FiPackage className="text-gray-400 w-12 h-12" />
                        <h3 className="text-lg font-medium text-gray-900">No shipments found</h3>
                        <p className="text-gray-500">
                          Try adjusting your search or filter criteria
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  currentParcels.map(parcel => (
                    <TableRow
                      key={parcel.tracking_number}
                      className="hover:bg-indigo-50 border-b border-gray-100"
                    >
                      <TableCell className="font-medium text-blue-600">
                        {parcel.tracking_number}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{parcel.sender_name}</div>
                        <div className="text-sm text-gray-500">{parcel.sender_phone}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{parcel.recipient_name}</div>
                        <div className="text-sm text-gray-500">{parcel.recipient_phone}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <span className="text-gray-600">
                            {towns.find(t => t.id === parcel.origin_town_id)?.name || "N/A"}
                          </span>
                          <span className="text-gray-400">→</span>
                          <span className="font-medium">
                            {towns.find(t => t.id === parcel.destination_town_id)?.name || "N/A"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(parcel.created_at).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(parcel.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{parcel.weight} kg</div>
                      </TableCell>
                      <TableCell>
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${statusColors[parcel.status as ParcelStatus]}`}>
                          {statusIcons[parcel.status as ParcelStatus]}
                          {parcel.status.replace('_', ' ')}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenDetailsDialog(parcel)}
                          className="flex items-center gap-1 border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                        >
                          <FiInfo className="w-4 h-4" />
                          Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter className="bg-indigo-50 px-6 py-3 border-t border-indigo-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-indigo-800">
              Showing <span className="font-medium">
                {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredParcels.length)}
              </span> of{" "}
              <span className="font-medium">{filteredParcels.length}</span> shipments
              {filteredParcels.length !== parcels.length && (
                <span> (filtered from {parcels.length})</span>
              )}
            </div>
            
            {/* Pagination cntrls */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="border-indigo-200 text-indigo-600 hover:bg-indigo-50 flex items-center gap-1"
              >
                <FiChevronLeft className="w-4 h-4" />
                Previous
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "solid" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      className={`min-w-[2rem] h-8 p-0 ${
                        currentPage === pageNum 
                          ? 'bg-indigo-600 text-white border-indigo-600' 
                          : 'border-indigo-200 text-indigo-600 hover:bg-indigo-50'
                      }`}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                
                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <span className="px-2 text-indigo-600">...</span>
                )}
                
                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(totalPages)}
                    className="min-w-[2rem] h-8 p-0 border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                  >
                    {totalPages}
                  </Button>
                )}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="border-indigo-200 text-indigo-600 hover:bg-indigo-50 flex items-center gap-1"
              >
                Next
                <FiChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </CardFooter>
        </Card>

     {/* Shipemnt dg */}
        <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
          <DialogContent className="sm:max-w-2xl rounded-xl border border-gray-200">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-gray-800">
                <FiPackage className="text-indigo-600" />
                <span>Shipment Details</span>
              </DialogTitle>
            </DialogHeader>
            {selectedParcel && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                <div className="space-y-4">
                  <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-indigo-100 p-2 rounded-full">
                        <FiPackage className="text-indigo-600 w-5 h-5" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800">Shipment Information</h3>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs text-gray-500 uppercase tracking-wider">Tracking Number</Label>
                        <p className="font-medium text-indigo-600">{selectedParcel.tracking_number}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs text-gray-500 uppercase tracking-wider">Date Sent</Label>
                          <p>{new Date(selectedParcel.created_at).toLocaleDateString()}</p>
                        </div>

                        <div>
                          <Label className="text-xs text-gray-500 uppercase tracking-wider">Weight</Label>
                          <p>{selectedParcel.weight} kg</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs text-gray-500 uppercase tracking-wider">Payment Method</Label>
                          <p className="capitalize font-medium">{selectedParcel.payment_method.replace(/_/g, ' ')}</p>
                        </div>

                        <div>
                          <Label className="text-xs text-gray-500 uppercase tracking-wider">Current Status</Label>
                          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${statusColors[selectedParcel.status as ParcelStatus]}`}>
                            {statusIcons[selectedParcel.status as ParcelStatus]}
                            {selectedParcel.status.replace('_', ' ')}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-gray-100 p-2 rounded-full">
                        <FiMapPin className="text-gray-600 w-5 h-5" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800">Route Information</h3>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm text-gray-600 mb-1">Origin</Label>
                        <p className="font-medium">
                          {towns.find(t => t.id === selectedParcel.origin_town_id)?.name || "N/A"}
                        </p>
                      </div>

                      <div>
                        <Label className="text-sm text-gray-600 mb-1">Destination</Label>
                        <p className="font-medium">
                          {towns.find(t => t.id === selectedParcel.destination_town_id)?.name || "N/A"}
                        </p>
                      </div>

                      <div className="flex items-center justify-center my-2">
                        <div className="h-0.5 bg-gray-200 w-full relative">
                          <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-300 rounded-full w-6 h-6 flex items-center justify-center">
                            <FiTruck className="text-gray-600 w-4 h-4" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <FiUser className="text-blue-600 w-5 h-5" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800">Sender Information</h3>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs text-gray-500 uppercase tracking-wider">Name</Label>
                        <p className="font-medium">{selectedParcel.sender_name}</p>
                      </div>

                      <div>
                        <Label className="text-xs text-gray-500 uppercase tracking-wider">Phone</Label>
                        <p className="text-blue-600">{selectedParcel.sender_phone}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-green-100 p-2 rounded-full">
                        <FiUser className="text-green-600 w-5 h-5" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800">Receiver Information</h3>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs text-gray-500 uppercase tracking-wider">Name</Label>
                        <p className="font-medium">{selectedParcel.recipient_name}</p>
                      </div>

                      <div>
                        <Label className="text-xs text-gray-500 uppercase tracking-wider">Phone</Label>
                        <p className="text-green-600">{selectedParcel.recipient_phone}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-indigo-100 p-2 rounded-full">
                        <FiRefreshCw className="text-indigo-600 w-5 h-5" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800">Update Status</h3>
                    </div>

                    <form onSubmit={handleStatusUpdate} className="space-y-4">
                      <div className="flex flex-col md:flex-row md:items-center gap-4">
                        <div className="flex-1">
                          <Label className="text-sm text-gray-600 mb-1 block">New Status</Label>
                          <Select
                            value={newStatus}
                            onValueChange={value => setNewStatus(value as ParcelStatus)}
                            disabled={isSubmittingStatus}
                          >
                            <SelectTrigger className="w-full border-gray-300">
                              <SelectValue placeholder="Select new status" />
                            </SelectTrigger>
                            <SelectContent>
                              {VALID_PARCEL_STATUSES.map(status => (
                                <SelectItem key={status} value={status}>
                                  <div className="flex items-center gap-2">
                                    <span className={`w-2 h-2 rounded-full ${statusColors[status].split(' ')[0]}`}></span>
                                    {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <Button
                          type="submit"
                          disabled={isSubmittingStatus || newStatus === selectedParcel.status}
                          className="md:mt-0 w-full md:w-auto bg-indigo-600 hover:bg-indigo-700"
                        >
                          {isSubmittingStatus ? "Updating..." : "Update Status"}
                        </Button>
                      </div>
                    </form>

                    {selectedParcel.status === "delivered" && (
                      <Button
                        onClick={handleSendMessage}
                        disabled={isSendingMessage}
                        className="mt-4 w-full bg-green-600 hover:bg-green-700 flex items-center gap-2"
                      >
                        <FiSend className="w-4 h-4" />
                        {isSendingMessage ? "Sending..." : "Notify Receiver"}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline" className="border-gray-300">Close</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}