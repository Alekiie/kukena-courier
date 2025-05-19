"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectItem,
  SelectContent,
} from "@/components/ui/select";
import { useTowns } from "../context/TownsContext";

type ParcelItem = {
  description: string;
  quantity: number;
  weight_per_unit: number;
};

type ParcelForm = {
  sender_name: string;
  sender_phone: string;
  recipient_name: string;
  recipient_phone: string;
  origin_town_id: string;
  destination_town_id: string;
  payment_method: string;
  items: ParcelItem[];
};

export default function SendParcel() {
  const { towns } = useTowns();
  const [formData, setFormData] = useState<ParcelForm>({
    sender_name: "",
    sender_phone: "",
    recipient_name: "",
    recipient_phone: "",
    origin_town_id: "",
    destination_town_id: "",
    payment_method: "",
    items: [],
  });
  const [currentItem, setCurrentItem] = useState<Partial<ParcelItem>>({});
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  const phoneRegex = /^\+?[1-9]\d{1,14}$/; // E.164 format validation

  const handleAddItem = () => {
    if (!currentItem.description || !currentItem.quantity || !currentItem.weight_per_unit) {
      setError("Please fill all item fields");
      return;
    }
    if (currentItem.quantity <= 0 || currentItem.weight_per_unit <= 0) {
      setError("Quantity and weight must be greater than 0");
      return;
    }

    setFormData(prev => ({
      ...prev,
      items: [...prev.items, currentItem as ParcelItem]
    }));
    setCurrentItem({});
    setError("");
  };

  const handleRemoveItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError("");
      setSuccessMessage("");

      // Validate phone numbers
      if (!phoneRegex.test(formData.sender_phone)) {
        throw new Error("Invalid sender phone number format");
      }
      if (!phoneRegex.test(formData.recipient_phone)) {
        throw new Error("Invalid recipient phone number format");
      }

      // Calculate total weight
      const totalWeight = formData.items.reduce(
        (sum, item) => sum + (item.quantity * item.weight_per_unit),
        0
      );

      const payload = {
        sender_name: formData.sender_name,
        sender_phone: formData.sender_phone,
        recipient_name: formData.recipient_name,
        recipient_phone: formData.recipient_phone,
        origin_town_id: Number(formData.origin_town_id),
        destination_town_id: Number(formData.destination_town_id),
        weight: totalWeight,
        payment_method: formData.payment_method,
        items: formData.items
      };

      const response = await fetch(`${baseUrl}/parcels`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create parcel");
      }

      const data = await response.json();
      setFormData({
        sender_name: "",
        sender_phone: "",
        recipient_name: "",
        recipient_phone: "",
        origin_town_id: "",
        destination_town_id: "",
        payment_method: "",
        items: [],
      });
      setSuccessMessage(`Parcel created! Tracking number: ${data.tracking_number}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValid = 
    formData.sender_name &&
    formData.sender_phone &&
    formData.recipient_name &&
    formData.recipient_phone &&
    formData.origin_town_id &&
    formData.destination_town_id &&
    formData.payment_method &&
    formData.items.length > 0;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-6">Send Parcel</h2>

      {/* Status Messages */}
      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">
          {successMessage}
        </div>
      )}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items Section */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Parcel Items</h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <Input
              placeholder="Description"
              value={currentItem.description || ""}
              onChange={e => setCurrentItem(prev => ({
                ...prev,
                description: e.target.value
              }))}
            />
            <Input
              placeholder="Quantity"
              type="number"
              min="1"
              value={currentItem.quantity || ""}
              onChange={e => setCurrentItem(prev => ({
                ...prev,
                quantity: Number(e.target.value)
              }))}
            />
            <Input
              placeholder="Unit Weight (kg)"
              type="number"
              step="0.1"
              min="0.1"
              value={currentItem.weight_per_unit || ""}
              onChange={e => setCurrentItem(prev => ({
                ...prev,
                weight_per_unit: Number(e.target.value)
              }))}
            />
            <Button onClick={handleAddItem}>Add Item</Button>
          </div>

          <div className="mt-6 border-t pt-4">
            <table className="w-full text-left text-sm">
              <thead className="border-b font-semibold">
                <tr>
                  <th>Description</th>
                  <th>Quantity</th>
                  <th>Unit Weight</th>
                  <th>Total Weight</th>
                  <th>Remove</th>
                </tr>
              </thead>
              <tbody>
                {formData.items.map((item, index) => (
                  <tr key={index} className="border-t">
                    <td>{item.description}</td>
                    <td>{item.quantity}</td>
                    <td>{item.weight_per_unit.toFixed(1)}kg</td>
                    <td>{(item.quantity * item.weight_per_unit).toFixed(1)}kg</td>
                    <td>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveItem(index)}
                      >
                        Remove
                      </Button>
                    </td>
                  </tr>
                ))}
                <tr className="border-t font-semibold">
                  <td colSpan={3}>Total Weight:</td>
                  <td>
                    {formData.items
                      .reduce((sum, item) => sum + (item.quantity * item.weight_per_unit), 0)
                      .toFixed(1)}kg
                  </td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Sender/Receiver Details */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Parcel Details</h3>

          <div className="space-y-4">
            <div>
              <Label>Sender Location</Label>
              <Select
                value={formData.origin_town_id}
                onValueChange={value => setFormData(prev => ({
                  ...prev,
                  origin_town_id: value
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Origin" />
                </SelectTrigger>
                <SelectContent>
                  {towns.map(town => (
                    <SelectItem key={town.id} value={String(town.id)}>
                      {town.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Sender Name</Label>
              <Input
                value={formData.sender_name}
                onChange={e => setFormData(prev => ({
                  ...prev,
                  sender_name: e.target.value
                }))}
              />
            </div>

            <div>
              <Label>Sender Phone</Label>
              <Input
                value={formData.sender_phone}
                onChange={e => setFormData(prev => ({
                  ...prev,
                  sender_phone: e.target.value
                }))}
                placeholder="+254700000000"
              />
            </div>

            <div>
              <Label>Receiver Location</Label>
              <Select
                value={formData.destination_town_id}
                onValueChange={value => setFormData(prev => ({
                  ...prev,
                  destination_town_id: value
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Destination" />
                </SelectTrigger>
                <SelectContent>
                  {towns.map(town => (
                    <SelectItem key={town.id} value={String(town.id)}>
                      {town.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Receiver Name</Label>
              <Input
                value={formData.recipient_name}
                onChange={e => setFormData(prev => ({
                  ...prev,
                  recipient_name: e.target.value
                }))}
              />
            </div>

            <div>
              <Label>Receiver Phone</Label>
              <Input
                value={formData.recipient_phone}
                onChange={e => setFormData(prev => ({
                  ...prev,
                  recipient_phone: e.target.value
                }))}
                placeholder="+254700000000"
              />
            </div>

            <div>
              <Label>Payment Method</Label>
              <Select
                value={formData.payment_method}
                onValueChange={value => setFormData(prev => ({
                  ...prev,
                  payment_method: value
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Payment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="mpesa">M-PESA</SelectItem>
                  <SelectItem value="payment_on_delivery">Cash On Delivery</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              className="w-full mt-4"
              onClick={handleSubmit}
              disabled={!isValid || isSubmitting}
            >
              {isSubmitting ? "Processing..." : "Send Parcel"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}