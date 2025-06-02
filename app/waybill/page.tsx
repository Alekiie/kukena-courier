"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FiPackage, FiUser, FiMapPin, FiTruck, FiFileText, FiPrinter, FiPlus } from "react-icons/fi";
import { Badge } from "@/components/ui/badge";

export default function WaybillPage() {
  const [waybills, setWaybills] = useState([
    {
      id: "WB001",
      sender: "John Doe",
      receiver: "Jane Doe",
      from: "Nairobi",
      to: "Kisumu",
      weight: "2.5kg",
      type: "Express",
      status: "In Transit",
    },
    {
      id: "WB002",
      sender: "Alice",
      receiver: "Bob",
      from: "Eldoret",
      to: "Mombasa",
      weight: "4.2kg",
      type: "Standard",
      status: "Delivered",
    },
    {
      id: "WB003",
      sender: "Tech Supplies Ltd",
      receiver: "Innovate Solutions",
      from: "Nakuru",
      to: "Thika",
      weight: "15.8kg",
      type: "Freight",
      status: "Processing",
    },
  ]);

  const [formData, setFormData] = useState({
    senderName: "",
    senderAddress: "",
    receiverName: "",
    receiverAddress: "",
    parcelDescription: "",
    parcelWeight: "",
    deliveryType: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Create new waybill
    const newWaybill = {
      id: `WB${String(waybills.length + 1).padStart(3, '0')}`,
      sender: formData.senderName,
      receiver: formData.receiverName,
      from: formData.senderAddress,
      to: formData.receiverAddress,
      weight: `${formData.parcelWeight}kg`,
      type: formData.deliveryType,
      status: "Processing"
    };

    setWaybills([...waybills, newWaybill]);

    // Reset form
    setFormData({
      senderName: "",
      senderAddress: "",
      receiverName: "",
      receiverAddress: "",
      parcelDescription: "",
      parcelWeight: "",
      deliveryType: ""
    });

    // Show success message (in a real app, you'd show a toast notification)
    alert("Waybill created successfully!");
  };

  const printWaybill = (id: string) => {
    alert(`Printing waybill ${id}...`);
    // In a real app, this would generate a PDF
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Delivered": return "bg-green-100 text-green-800";
      case "In Transit": return "bg-blue-100 text-blue-800";
      case "Processing": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-3">
            <FiFileText className="text-indigo-600" />
            Waybill Management
          </h1>
          <p className="text-gray-600 mt-2">
            Create and manage shipping waybills for parcel tracking
          </p>
        </div>

        {/* Form Card */}
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-100 p-2 rounded-lg">
                <FiPlus className="text-indigo-600 w-5 h-5" />
              </div>
              <CardTitle className="text-xl font-semibold text-gray-800">
                Create New Waybill
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Sender Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-800 flex items-center gap-2">
                    <FiUser className="text-indigo-600" />
                    Sender Information
                  </h3>

                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="senderName" className="text-gray-700">Full Name</Label>
                      <Input
                        id="senderName"
                        placeholder="e.g. John Doe"
                        value={formData.senderName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="senderAddress" className="text-gray-700">Address</Label>
                      <Input
                        id="senderAddress"
                        placeholder="e.g. Nairobi CBD"
                        value={formData.senderAddress}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Receiver Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-800 flex items-center gap-2">
                    <FiUser className="text-indigo-600" />
                    Receiver Information
                  </h3>

                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="receiverName" className="text-gray-700">Full Name</Label>
                      <Input
                        id="receiverName"
                        placeholder="e.g. Jane Doe"
                        value={formData.receiverName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="receiverAddress" className="text-gray-700">Address</Label>
                      <Input
                        id="receiverAddress"
                        placeholder="e.g. Eldoret Town"
                        value={formData.receiverAddress}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Parcel Section */}
                <div className="space-y-4 md:col-span-2">
                  <h3 className="text-lg font-medium text-gray-800 flex items-center gap-2">
                    <FiPackage className="text-indigo-600" />
                    Parcel Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="parcelDescription" className="text-gray-700">Description</Label>
                      <Input
                        id="parcelDescription"
                        placeholder="e.g. Documents, Laptop..."
                        value={formData.parcelDescription}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="parcelWeight" className="text-gray-700">Weight (kg)</Label>
                      <Input
                        id="parcelWeight"
                        type="number"
                        step="0.1"
                        placeholder="e.g. 2.5"
                        value={formData.parcelWeight}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Delivery Type */}
                <div className="md:col-span-2">
                  <h3 className="text-lg font-medium text-gray-800 flex items-center gap-2 mb-3">
                    <FiTruck className="text-indigo-600" />
                    Delivery Details
                  </h3>

                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="deliveryType" className="text-gray-700">Delivery Type</Label>
                      <Select
                        value={formData.deliveryType}
                        onValueChange={value => setFormData({ ...formData, deliveryType: value })}
                        required
                      >
                        <SelectTrigger id="deliveryType" className="w-full">
                          <SelectValue placeholder="Select delivery type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Standard">Standard (3-5 days)</SelectItem>
                          <SelectItem value="Express">Express (1-2 days)</SelectItem>
                          <SelectItem value="Overnight">Overnight</SelectItem>
                          <SelectItem value="Freight">Freight</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  className="w-full py-6 text-base bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center gap-2"
                >
                  <FiFileText className="w-5 h-5" />
                  Generate Waybill
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Table of Available Waybills */}
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-100 p-2 rounded-lg">
                <FiTruck className="text-indigo-600 w-5 h-5" />
              </div>
              <CardTitle className="text-xl font-semibold text-gray-800">
                Waybills ({waybills.length})
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-indigo-50">
                <TableRow>
                  <TableHead className="font-semibold text-indigo-800 px-6 py-4">ID</TableHead>
                  <TableHead className="font-semibold text-indigo-800 px-6 py-4">Sender</TableHead>
                  <TableHead className="font-semibold text-indigo-800 px-6 py-4">Receiver</TableHead>
                  <TableHead className="font-semibold text-indigo-800 px-6 py-4">Route</TableHead>
                  <TableHead className="font-semibold text-indigo-800 px-6 py-4">Weight</TableHead>
                  <TableHead className="font-semibold text-indigo-800 px-6 py-4">Type</TableHead>
                  <TableHead className="font-semibold text-indigo-800 px-6 py-4">Status</TableHead>
                  <TableHead className="font-semibold text-indigo-800 px-6 py-4 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {waybills.map((wb) => (
                  <TableRow key={wb.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <TableCell className="px-6 py-4 font-medium text-indigo-600">
                      {wb.id}
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="font-medium">{wb.sender}</div>
                      <div className="text-sm text-gray-500">{wb.from}</div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="font-medium">{wb.receiver}</div>
                      <div className="text-sm text-gray-500">{wb.to}</div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-1 text-sm">
                        <span className="text-gray-600">{wb.from}</span>
                        <span className="text-gray-400">→</span>
                        <span className="font-medium">{wb.to}</span>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 font-medium">
                      {wb.weight}
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <Badge variant="outline" className="border-gray-300">
                        {wb.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <Badge className={`${getStatusColor(wb.status)} px-3 py-1 rounded-full text-xs`}>
                        {wb.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-indigo-600 border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 flex items-center gap-1"
                        onClick={() => printWaybill(wb.id)}
                      >
                        <FiPrinter className="w-4 h-4" />
                        Print
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}