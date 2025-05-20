"use client";
import { useEffect, useState } from "react";
import withAuth from "./components/withAuth";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);
import { useTowns } from "./context/TownsContext";

function Home() {
  const {towns} = useTowns();
  const [manifest, setManifest] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedTownId, setSelectedTownId] = useState("all");
  const [parcelCountsByOrigin, setParcelCountsByOrigin] = useState({});
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  const fetchManifest = async () => {
    if (!fromDate || !toDate) {
      alert("Please select both start and end dates.");
      return;
    }

    const params = new URLSearchParams({
      from_date: fromDate,
      to_date: toDate,
      town_id: selectedTownId,
    });

    const response = await fetch(
      `${baseUrl}/parcels/manifest?${params.toString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      }
    );

    if (!response.ok) {
      console.error("Error fetching manifest:", response.status);
      setManifest([]);
      setParcelCountsByOrigin({});
      return;
    }

    const data = await response.json();
    setManifest(data);
    processManifestForChart(data);
  };

  const processManifestForChart = (data: any[]) => {
    const counts: { [key: string]: number } = {};
    data.forEach((parcel) => {
      const originTown =
        towns.find((t) => t.id === parcel.origin_town_id)?.name || "Unknown";
      counts[originTown] = (counts[originTown] || 0) + 1;
    });
    setParcelCountsByOrigin(counts);
  };

  const chartData = {
    labels: Object.keys(parcelCountsByOrigin),
    datasets: [
      {
        label: "Parcels Sent",
        data: Object.values(parcelCountsByOrigin),
        backgroundColor: "rgba(54, 162, 235, 0.6)",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: "Number of Parcels by Origin Town",
      },
    },
  };

  return (
    <>
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-sm text-gray-600">Control panel</p>
        </div>
      </header>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 bg-white p-4 shadow rounded mb-6">
        <div>
          <label htmlFor="from" className="text-sm text-gray-600">
            From:
          </label>
          <input
            type="date"
            id="from"
            className="ml-2 p-2 border border-gray-300 rounded"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="to" className="text-sm text-gray-600">
            To:
          </label>
          <input
            type="date"
            id="to"
            className="ml-2 p-2 border border-gray-300 rounded"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="office" className="text-sm text-gray-600">
            Office:
          </label>
          <select
            id="office"
            className="ml-2 p-2 border border-gray-300 rounded"
            value={selectedTownId}
            onChange={(e) => setSelectedTownId(e.target.value)}
          >
            <option value="all">All Offices</option>
            {towns &&
              towns.map((town) => (
                <option key={town.id} value={town.id}>
                  {town.name}
                </option>
              ))}
          </select>
        </div>

        <button
          className="ml-auto bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          onClick={fetchManifest}
        >
          Generate
        </button>
      </div>

      {/* Parcel Count Chart */}
      <div className="bg-white p-6 rounded shadow mb-6">
        <h2 className="text-lg font-semibold mb-4">Parcels Sent by Origin</h2>
        <div className="h-64">
          {Object.keys(parcelCountsByOrigin).length > 0 ? (
            <Bar data={chartData} options={chartOptions} />
          ) : (
            <p className="text-gray-500">No parcel data to display chart.</p>
          )}
        </div>
      </div>

      {/* Return Manifest Table */}
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-lg font-semibold mb-4">Recent Parcels</h2>
        {manifest.length > 0 ? (
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
                    Receiver
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Origin
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Destination
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Weight (kg)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created At
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {manifest.map((parcel) => (
                  <tr key={parcel.tracking_number}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {parcel.tracking_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {parcel.sender_name} ({parcel.sender_phone})
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {parcel.recipient_name} ({parcel.recipient_phone})
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {towns &&
                        towns.find((t) => t.id === parcel.origin_town_id)?.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {towns &&
                        towns.find((t) => t.id === parcel.destination_town_id)
                          ?.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {parcel.weight}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {parcel.status}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(parcel.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">
            No parcels found for the selected criteria.
          </p>
        )}
      </div>
    </>
  );
}
export default withAuth(Home);
