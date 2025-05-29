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
import { FiPlus, FiTrash2, FiTruck, FiUser, FiPhone, FiMapPin, FiDollarSign } from "react-icons/fi";

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

  const phoneRegex = /^(?:\+254|07|011)\d{6,}$/;

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
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      <div className="flex items-center gap-3 mb-6">
        <FiTruck className="text-indigo-600 w-8 h-8" />
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Send Parcel</h2>
      </div>

      {/* Status Messages */}
      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-green-800">Parcel Created Successfully!</h3>
              <p className="mt-1 text-green-700">{successMessage}</p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-red-800">Error Creating Parcel</h3>
              <p className="mt-1 text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items Section */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="flex items-center gap-2 text-lg font-semibold mb-6">
            <FiTruck className="text-indigo-600" />
            Parcel Contents
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
              <Label className="text-sm text-gray-600 mb-1 block">Description</Label>
              <Input
                placeholder="Item name"
                value={currentItem.description || ""}
                onChange={e => setCurrentItem(prev => ({
                  ...prev,
                  description: e.target.value
                }))}
              />
            </div>
            <div>
              <Label className="text-sm text-gray-600 mb-1 block">Quantity</Label>
              <Input
                placeholder="Qty"
                type="number"
                min="1"
                value={currentItem.quantity || ""}
                onChange={e => setCurrentItem(prev => ({
                  ...prev,
                  quantity: Number(e.target.value)
                }))}
              />
            </div>
            <div>
              <Label className="text-sm text-gray-600 mb-1 block">Unit Weight (kg)</Label>
              <Input
                placeholder="Weight"
                type="number"
                step="0.1"
                min="0.1"
                value={currentItem.weight_per_unit || ""}
                onChange={e => setCurrentItem(prev => ({
                  ...prev,
                  weight_per_unit: Number(e.target.value)
                }))}
              />
            </div>
            <div className="flex items-end">
              <Button
                className="w-full flex items-center gap-2"
                onClick={handleAddItem}
              >
                <FiPlus /> Add Item
              </Button>
            </div>
          </div>

          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Items in Parcel</h4>

            {formData.items.length > 0 ? (
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <th className="p-3 text-left">Item</th>
                      <th className="p-3 text-center">Qty</th>
                      <th className="p-3 text-center">Unit Wt</th>
                      <th className="p-3 text-center">Total Wt</th>
                      <th className="p-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {formData.items.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="p-3 text-sm">{item.description}</td>
                        <td className="p-3 text-sm text-center">{item.quantity}</td>
                        <td className="p-3 text-sm text-center">{item.weight_per_unit.toFixed(1)}kg</td>
                        <td className="p-3 text-sm text-center font-medium">
                          {(item.quantity * item.weight_per_unit).toFixed(1)}kg
                        </td>
                        <td className="p-3 text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-800"
                            onClick={() => handleRemoveItem(index)}
                          >
                            <FiTrash2 />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50 border-t border-gray-200">
                    <tr>
                      <td className="p-3 text-sm font-medium" colSpan={3}>Total Weight:</td>
                      <td className="p-3 text-sm font-medium text-center">
                        {formData.items
                          .reduce((sum, item) => sum + (item.quantity * item.weight_per_unit), 0)
                          .toFixed(1)}kg
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <FiTruck className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                <h3 className="text-sm font-medium text-gray-900">No items added</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Add items to your parcel to continue
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Sender/Receiver Details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="flex items-center gap-2 text-lg font-semibold mb-6">
            <FiUser className="text-indigo-600" />
            Sender & Receiver
          </h3>

          <div className="space-y-5">
            {/* Sender Section */}
            <div className="border-b border-gray-200 pb-5">
              <h4 className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-4">
                <FiUser className="text-indigo-500" />
                Sender Information
              </h4>

              <div className="space-y-4">
                <div>
                  <Label className="text-sm text-gray-600 mb-1 block">Sender Location</Label>
                  <Select
                    value={formData.origin_town_id}
                    onValueChange={value => setFormData(prev => ({
                      ...prev,
                      origin_town_id: value
                    }))}
                  >
                    <SelectTrigger className="w-full">
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
                  <Label className="text-sm text-gray-600 mb-1 block">Sender Name</Label>
                  <Input
                    value={formData.sender_name}
                    onChange={e => setFormData(prev => ({
                      ...prev,
                      sender_name: e.target.value
                    }))}
                    placeholder="Full name"
                  />
                </div>

                <div>
                  <Label className="text-sm text-gray-600 mb-1 block">Sender Phone</Label>
                  <Input
                    value={formData.sender_phone}
                    onChange={e => setFormData(prev => ({
                      ...prev,
                      sender_phone: e.target.value
                    }))}
                    placeholder="+254700000000"
                  />
                </div>
              </div>
            </div>

            {/* Receiver Section */}
            <div className="border-b border-gray-200 pb-5">
              <h4 className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-4">
                <FiUser className="text-indigo-500" />
                Receiver Information
              </h4>

              <div className="space-y-4">
                <div>
                  <Label className="text-sm text-gray-600 mb-1 block">Receiver Location</Label>
                  <Select
                    value={formData.destination_town_id}
                    onValueChange={value => setFormData(prev => ({
                      ...prev,
                      destination_town_id: value
                    }))}
                  >
                    <SelectTrigger className="w-full">
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
                  <Label className="text-sm text-gray-600 mb-1 block">Receiver Name</Label>
                  <Input
                    value={formData.recipient_name}
                    onChange={e => setFormData(prev => ({
                      ...prev,
                      recipient_name: e.target.value
                    }))}
                    placeholder="Full name"
                  />
                </div>

                <div>
                  <Label className="text-sm text-gray-600 mb-1 block">Receiver Phone</Label>
                  <Input
                    value={formData.recipient_phone}
                    onChange={e => setFormData(prev => ({
                      ...prev,
                      recipient_phone: e.target.value
                    }))}
                    placeholder="+254700000000"
                  />
                </div>
              </div>
            </div>

            {/* Payment Section */}
            <div>
              <h4 className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-4">
                <FiDollarSign className="text-indigo-500" />
                Payment Information
              </h4>

              <div className="space-y-4">
                <div>
                  <Label className="text-sm text-gray-600 mb-1 block">Payment Method</Label>
                  <Select
                    value={formData.payment_method}
                    onValueChange={value => setFormData(prev => ({
                      ...prev,
                      payment_method: value
                    }))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Payment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="mpesa">M-PESA</SelectItem>
                      <SelectItem value="payment_on_delivery">Cash On Delivery</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Button
              className="w-full mt-6 py-6 text-base"
              onClick={handleSubmit}
              disabled={!isValid || isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                "Send Parcel"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}