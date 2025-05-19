"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";

type Parcel = {
  id: string;
  sender: string;
  receiver: string;
  from: string;
  to: string;
  weight: string;
  type: string;
  status: string;
  date: string; // Added date field
};

const dummyParcels: Parcel[] = [
  {
    id: "P001",
    sender: "Alice W.",
    receiver: "Bob K.",
    from: "Nairobi",
    to: "Kisumu",
    weight: "2kg",
    type: "Express",
    status: "Delivered",
    date: "2024-03-01",
  },
  {
    id: "P002",
    sender: "George O.",
    receiver: "Jane M.",
    from: "Mombasa",
    to: "Nakuru",
    weight: "4.5kg",
    type: "Normal",
    status: "In Transit",
    date: "2024-03-05",
  },
  {
    id: "P003",
    sender: "Mary N.",
    receiver: "Peter P.",
    from: "Thika",
    to: "Kitale",
    weight: "1.3kg",
    type: "Overnight",
    status: "Pending",
    date: "2024-03-10",
  },
];

export default function ParcelsPage() {
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const filteredParcels = dummyParcels.filter((parcel) => {
    const matchesSearch = [
      parcel.id,
      parcel.sender,
      parcel.receiver,
      parcel.from,
      parcel.to
    ].join(" ").toLowerCase().includes(search.toLowerCase());

    const parcelDate = parcel.date;
    const afterStart = !startDate || parcelDate >= startDate;
    const beforeEnd = !endDate || parcelDate <= endDate;

    return matchesSearch && afterStart && beforeEnd;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-col gap-4">
            <CardTitle className="text-xl">Sent Parcels</CardTitle>
            <div className="w-full space-y-2">
              <Input
                placeholder="Search by sender, receiver, ID, location..."
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
                  <TableHead>ID</TableHead>
                  <TableHead>Sender</TableHead>
                  <TableHead>Receiver</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Weight</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredParcels.length > 0 ? (
                  filteredParcels.map((parcel) => (
                    <TableRow key={parcel.id}>
                      <TableCell>{parcel.id}</TableCell>
                      <TableCell>{parcel.sender}</TableCell>
                      <TableCell>{parcel.receiver}</TableCell>
                      <TableCell>{parcel.from}</TableCell>
                      <TableCell>{parcel.to}</TableCell>
                      <TableCell>{new Date(parcel.date).toLocaleDateString()}</TableCell>
                      <TableCell>{parcel.weight}</TableCell>
                      <TableCell>{parcel.type}</TableCell>
                      <TableCell>{parcel.status}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-gray-500">
                      No parcels found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}