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

export default function WaybillPage() {
  // Dummy waybill data
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
      type: "Normal",
      status: "Delivered",
    },
  ]);

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-5xl mx-auto space-y-10">
        {/* Form Card */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center text-primary">
              Create New Waybill
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="senderName">Sender Name</Label>
                  <Input id="senderName" placeholder="e.g. John Doe" />
                </div>
                <div>
                  <Label htmlFor="senderAddress">Sender Address</Label>
                  <Input id="senderAddress" placeholder="e.g. Nairobi CBD" />
                </div>
                <div>
                  <Label htmlFor="receiverName">Receiver Name</Label>
                  <Input id="receiverName" placeholder="e.g. Jane Doe" />
                </div>
                <div>
                  <Label htmlFor="receiverAddress">Receiver Address</Label>
                  <Input id="receiverAddress" placeholder="e.g. Eldoret Town" />
                </div>
                <div>
                  <Label htmlFor="parcelDescription">Parcel Description</Label>
                  <Input id="parcelDescription" placeholder="e.g. Documents, Laptop..." />
                </div>
                <div>
                  <Label htmlFor="parcelWeight">Weight (kg)</Label>
                  <Input id="parcelWeight" type="number" step="0.1" placeholder="e.g. 2.5" />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="deliveryType">Delivery Type</Label>
                  <Select>
                    <SelectTrigger id="deliveryType" className="w-full">
                      <SelectValue placeholder="Select delivery type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="express">Express</SelectItem>
                      <SelectItem value="overnight">Overnight</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="pt-4">
                <Button type="submit" className="w-full">
                  Generate Waybill
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Table of Available Waybills */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Available Waybills</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Sender</TableHead>
                  <TableHead>Receiver</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead>Weight</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {waybills.map((wb) => (
                  <TableRow key={wb.id}>
                    <TableCell>{wb.id}</TableCell>
                    <TableCell>{wb.sender}</TableCell>
                    <TableCell>{wb.receiver}</TableCell>
                    <TableCell>{wb.from}</TableCell>
                    <TableCell>{wb.to}</TableCell>
                    <TableCell>{wb.weight}</TableCell>
                    <TableCell>{wb.type}</TableCell>
                    <TableCell>{wb.status}</TableCell>
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
