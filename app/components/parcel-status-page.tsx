"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import withAuth from "../components/withAuth";
import { FiPackage, FiTruck, FiClock, FiCheckCircle, FiInfo } from "react-icons/fi";
import { Badge } from "@/components/ui/badge";

interface Parcel {
  tracking_number: string;
  sender_name: string;
  sender_phone: string;
  recipient_name: string;
  recipient_phone: string;
  origin_town_id: number;
  destination_town_id: number;
  weight: number;
  status: string;
  payment_method: string;
  created_at: string;
}

interface ParcelStatusPageProps {
  status: string;
  pageTitle: string;
}

const statusConfig = {
  registered: {
    icon: <FiPackage className="w-4 h-4" />,
    color: "bg-yellow-100 text-yellow-800 border-yellow-200"
  },
  in_transit: {
    icon: <FiTruck className="w-4 h-4" />,
    color: "bg-blue-100 text-blue-800 border-blue-200"
  },
  delivered: {
    icon: <FiCheckCircle className="w-4 h-4" />,
    color: "bg-green-100 text-green-800 border-green-200"
  },
  collected: {
    icon: <FiCheckCircle className="w-4 h-4" />,
    color: "bg-purple-100 text-purple-800 border-purple-200"
  }
};

const ParcelStatusPage = ({ status, pageTitle }: ParcelStatusPageProps) => {
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    const fetchParcels = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${baseUrl}/parcels/by-status?status=${status}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch parcels");

        const data = await response.json();
        setParcels(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load parcels");
      } finally {
        setLoading(false);
      }
    };

    fetchParcels();
  }, [status, baseUrl]);

  const StatusIcon = () => {
    switch (status) {
      case "registered": return <FiPackage className="w-6 h-6 text-yellow-600" />;
      case "in_transit": return <FiTruck className="w-6 h-6 text-blue-600" />;
      case "delivered": return <FiCheckCircle className="w-6 h-6 text-green-600" />;
      case "collected": return <FiCheckCircle className="w-6 h-6 text-purple-600" />;
      default: return <FiPackage className="w-6 h-6" />;
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-flex items-center justify-center mb-4">
          <div className="w-10 h-10 border-4 border-indigo-200 rounded-full border-t-indigo-600 animate-spin"></div>
        </div>
        <p className="text-gray-600">Loading {pageTitle.toLowerCase()}...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md text-center">
        <div className="mx-auto bg-red-100 w-12 h-12 rounded-full flex items-center justify-center mb-3">
          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <h3 className="text-lg font-medium text-red-800 mb-1">Error Loading Parcels</h3>
        <p className="text-red-700">{error}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <div className="bg-gray-100 p-2 rounded-lg">
                <StatusIcon />
              </div>
              {pageTitle}
            </h1>
            <p className="text-gray-600 mt-2">
              Parcels currently in the {status.replace('_', ' ')} stage
            </p>
          </div>
          <div className="text-sm bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg">
            Showing {parcels.length} parcels
          </div>
        </div>

        {/* Parcels Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tracking #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sender
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Recipient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Weight
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {parcels.length > 0 ? parcels.map((parcel) => (
                  <tr key={parcel.tracking_number} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-indigo-600">
                        {parcel.tracking_number}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{parcel.sender_name}</div>
                      <div className="text-sm text-gray-500">{parcel.sender_phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{parcel.recipient_name}</div>
                      <div className="text-sm text-gray-500">{parcel.recipient_phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{parcel.weight} kg</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(parcel.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        href={`/parcels/${parcel.tracking_number}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-sm hover:bg-indigo-100 transition-colors"
                      >
                        <FiInfo className="w-4 h-4" />
                        Details
                      </Link>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="bg-gray-100 p-4 rounded-full">
                          <FiPackage className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">No parcels found</h3>
                        <p className="text-gray-500 max-w-md">
                          There are currently no parcels in the {status.replace('_', ' ')} stage.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParcelStatusPage;