"use client";
import { useEffect, useState, useCallback } from "react";
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
import { useTowns } from "./context/TownsContext";
import { FiFilter, FiRefreshCw, FiAlertCircle, FiChevronDown } from "react-icons/fi";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function Home() {
  const { towns } = useTowns();
  const [manifest, setManifest] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedTownId, setSelectedTownId] = useState("all");
  const [parcelCountsByOrigin, setParcelCountsByOrigin] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showFilters, setShowFilters] = useState(true);
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Set default date range to last 7 days
  useEffect(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 7);

    setFromDate(start.toISOString().split('T')[0]);
    setToDate(end.toISOString().split('T')[0]);
  }, []);

  const fetchManifest = useCallback(async () => {
    if (!fromDate || !toDate) {
      setError("Please select both start and end dates");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
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
        throw new Error("Failed to fetch data");
      }

      const data = await response.json();
      setManifest(data);
      processManifestForChart(data);
      // Reset to first page when new data is fetched
      setCurrentPage(1);
    } catch (err) {
      setError(err.message || "An error occurred");
      setManifest([]);
      setParcelCountsByOrigin({});
    } finally {
      setIsLoading(false);
    }
  }, [baseUrl, fromDate, toDate, selectedTownId]);

  useEffect(() => {
    // Fetch data when component mounts with default dates
    if (fromDate && toDate) {
      fetchManifest();
    }
  }, [fetchManifest, fromDate, toDate]);

  const processManifestForChart = (data: any[]) => {
    const counts: { [key: string]: number } = {};
    data.forEach((parcel) => {
      const originTown =
        towns.find((t) => t.id === parcel.origin_town_id)?.name || "Unknown";
      counts[originTown] = (counts[originTown] || 0) + 1;
    });
    setParcelCountsByOrigin(counts);
  };

  // Get current items for pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = manifest.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(manifest.length / itemsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const chartData = {
    labels: Object.keys(parcelCountsByOrigin),
    datasets: [
      {
        label: "Parcels Sent",
        data: Object.values(parcelCountsByOrigin),
        backgroundColor: "rgba(79, 70, 229, 0.8)",
        borderRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: "Parcels by Origin Town",
        font: {
          size: 16
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0,0,0,0.05)"
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Track parcel shipments and analytics</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-800"
          >
            <FiFilter size={16} />
            {showFilters ? "Hide Filters" : "Show Filters"}
          </button>
          <button
            onClick={fetchManifest}
            disabled={isLoading}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors
              ${isLoading
                ? "bg-indigo-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700"} text-white`}
          >
            {isLoading ? (
              <>
                <FiRefreshCw className="animate-spin" size={18} />
                Loading...
              </>
            ) : (
              "Refresh Data"
            )}
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                className="w-full p-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                className="w-full p-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Office
              </label>
              <div className="relative">
                <select
                  className="w-full p-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition appearance-none pr-10"
                  value={selectedTownId}
                  onChange={(e) => setSelectedTownId(e.target.value)}
                >
                  <option value="all">All Offices</option>
                  {towns?.map((town) => (
                    <option key={town.id} value={town.id}>
                      {town.name}
                    </option>
                  ))}
                </select>
                <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="flex items-end">
              <button
                onClick={fetchManifest}
                disabled={isLoading}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors
                  ${isLoading
                    ? "bg-indigo-400 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700"} text-white`}
              >
                Generate Report
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg mb-8 flex items-start">
          <FiAlertCircle className="text-red-500 mt-0.5 mr-3 flex-shrink-0" size={20} />
          <div>
            <p className="text-red-700 font-medium">{error}</p>
            <p className="text-red-600 text-sm mt-1">Please check your filters and try again</p>
          </div>
        </div>
      )}

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Parcel Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Parcel Distribution</h2>
          </div>

          {Object.keys(parcelCountsByOrigin).length > 0 ? (
            <div className="h-80">
              <Bar data={chartData} options={chartOptions} />
            </div>
          ) : (
            <div className="h-80 flex flex-col items-center justify-center text-gray-400">
              <FiAlertCircle size={48} className="mb-3" />
              <p className="text-lg">No parcel data available</p>
              <p className="mt-1 text-center max-w-md">
                Adjust your filters or generate a report to see parcel distribution
              </p>
            </div>
          )}
        </div>

        {/* Summary Stats */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Overview</h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-indigo-50 rounded-lg p-5">
              <p className="text-sm font-medium text-indigo-600 mb-1">Total Parcels</p>
              <p className="text-3xl font-bold text-gray-900">
                {manifest.length}
              </p>
            </div>

            <div className="bg-green-50 rounded-lg p-5">
              <p className="text-sm font-medium text-green-600 mb-1">Unique Origins</p>
              <p className="text-3xl font-bold text-gray-900">
                {Object.keys(parcelCountsByOrigin).length}
              </p>
            </div>

            <div className="bg-amber-50 rounded-lg p-5">
              <p className="text-sm font-medium text-amber-600 mb-1">Avg. Weight</p>
              <p className="text-3xl font-bold text-gray-900">
                {manifest.length ?
                  (manifest.reduce((sum, p) => sum + parseFloat(p.weight), 0) / manifest.length).toFixed(2) + 'kg' :
                  '0kg'}
              </p>
            </div>

            <div className="bg-purple-50 rounded-lg p-5">
              <p className="text-sm font-medium text-purple-600 mb-1">Date Range</p>
              <p className="text-lg font-bold text-gray-900">
                {fromDate} to {toDate}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Parcel Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Recent Shipments</h2>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">
              Showing {Math.min(indexOfFirstItem + 1, manifest.length)} to {Math.min(indexOfLastItem, manifest.length)} of {manifest.length} records
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          {manifest.length > 0 ? (
            <>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tracking #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Origin
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Destination
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Weight
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentItems.map((parcel) => (
                    <tr key={parcel.tracking_number} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">
                        {parcel.tracking_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {towns?.find(t => t.id === parcel.origin_town_id)?.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {towns?.find(t => t.id === parcel.destination_town_id)?.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {parcel.weight} kg
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${parcel.status === 'Delivered'
                          ? 'bg-green-100 text-green-800'
                          : parcel.status === 'In Transit'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                          }`}>
                          {parcel.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(parcel.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination Controls */}
              <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4">
                <div className="text-sm text-gray-700">
                  Page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{totalPages}</span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${currentPage === 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                      }`}
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${currentPage === totalPages || totalPages === 0
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                      }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="py-16 text-center">
              <FiAlertCircle className="mx-auto text-gray-400" size={48} />
              <h3 className="mt-4 text-lg font-medium text-gray-900">No parcels found</h3>
              <p className="mt-2 text-gray-500 max-w-md mx-auto">
                Adjust your filters or date range to see shipment data
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default withAuth(Home);