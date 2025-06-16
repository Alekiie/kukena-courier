"use client";
import { useEffect, useState, useCallback, useMemo } from "react";
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
import { FiFilter, FiRefreshCw, FiAlertCircle, FiChevronDown, FiX, FiCalendar, FiChevronLeft, FiChevronRight } from "react-icons/fi";

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
  const [sortConfig, setSortConfig] = useState({ key: "created_at", direction: "desc" });
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

  // Auto-dismiss error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

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

  const handleSort = (key: string) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedManifest = useMemo(() => {
    const sortableItems = [...manifest];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [manifest, sortConfig]);

  // Get current items for pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedManifest.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedManifest.length / itemsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const chartData = {
    labels: Object.keys(parcelCountsByOrigin),
    datasets: [
      {
        label: "Parcels Sent",
        data: Object.values(parcelCountsByOrigin),
        backgroundColor: "rgba(79, 70, 229, 0.8)",
        borderRadius: 6,
        borderSkipped: false,
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
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 14
        },
        bodyFont: {
          size: 13
        },
        cornerRadius: 4
      },
      title: {
        display: true,
        text: "Parcels by Origin Town",
        font: {
          size: 16,
          weight: '600',
          family: "'Inter', sans-serif"
        },
        padding: {
          bottom: 20
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0,0,0,0.05)"
        },
        ticks: {
          stepSize: 1
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    },
    animation: {
      duration: 500
    }
  };

  const applyQuickDateRange = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    setFromDate(start.toISOString().split('T')[0]);
    setToDate(end.toISOString().split('T')[0]);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-2 lg:px-8 py-8 w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Track parcel shipments and analytics</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            <FiFilter size={16} />
            {showFilters ? "Hide Filters" : "Show Filters"}
          </button>
          <button
            onClick={fetchManifest}
            disabled={isLoading}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300
              ${isLoading
                ? "bg-indigo-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700 shadow-sm hover:shadow-md"} text-white`}
          >
            {isLoading ? (
              <>
                <FiRefreshCw className="animate-spin" size={18} />
                <span>Loading...</span>
              </>
            ) : (
              <>
                <FiRefreshCw size={18} />
                <span>Refresh Data</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100 transition-all duration-300">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <FiCalendar className="mr-2" size={16} />
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
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <FiCalendar className="mr-2" size={16} />
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

            <div className="flex flex-col justify-end">
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setSelectedTownId("all");
                    applyQuickDateRange(7);
                  }}
                  className="flex-1 py-2.5 text-sm rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  Reset
                </button>
                <button
                  onClick={fetchManifest}
                  disabled={isLoading}
                  className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-colors
                    ${isLoading
                      ? "bg-indigo-400 cursor-not-allowed"
                      : "bg-indigo-600 hover:bg-indigo-700"} text-white`}
                >
                  Apply
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                <button 
                  onClick={() => applyQuickDateRange(0)}
                  className="text-xs px-2.5 py-1 rounded border border-gray-200 hover:bg-gray-50"
                >
                  Today
                </button>
                <button 
                  onClick={() => applyQuickDateRange(7)}
                  className="text-xs px-2.5 py-1 rounded border border-gray-200 hover:bg-gray-50"
                >
                  Last 7 Days
                </button>
                <button 
                  onClick={() => applyQuickDateRange(30)}
                  className="text-xs px-2.5 py-1 rounded border border-gray-200 hover:bg-gray-50"
                >
                  Last 30 Days
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg mb-8 flex items-start animate-fadeIn">
          <FiAlertCircle className="text-red-500 mt-0.5 mr-3 flex-shrink-0" size={20} />
          <div className="flex-1">
            <p className="text-red-700 font-medium">{error}</p>
            <p className="text-red-600 text-sm mt-1">Please check your filters and try again</p>
          </div>
          <button onClick={() => setError("")} className="text-red-500 hover:text-red-700">
            <FiX size={20} />
          </button>
        </div>
      )}

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Parcel Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Parcel Distribution</h2>
          </div>

          {isLoading ? (
            <div className="h-80 flex items-center justify-center">
              <div className="animate-pulse w-full h-full rounded-lg bg-gray-100" />
            </div>
          ) : Object.keys(parcelCountsByOrigin).length > 0 ? (
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

          {isLoading ? (
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="bg-gray-50 rounded-lg p-5 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-indigo-50 rounded-lg p-5 transition-all hover:shadow-sm">
                <p className="text-sm font-medium text-indigo-600 mb-1">Total Parcels</p>
                <p className="text-3xl font-bold text-gray-900">
                  {manifest.length}
                </p>
              </div>

              <div className="bg-green-50 rounded-lg p-5 transition-all hover:shadow-sm">
                <p className="text-sm font-medium text-green-600 mb-1">Unique Origins</p>
                <p className="text-3xl font-bold text-gray-900">
                  {Object.keys(parcelCountsByOrigin).length}
                </p>
              </div>

              <div className="bg-amber-50 rounded-lg p-5 transition-all hover:shadow-sm">
                <p className="text-sm font-medium text-amber-600 mb-1">Avg. Weight</p>
                <p className="text-3xl font-bold text-gray-900">
                  {manifest.length ?
                    (manifest.reduce((sum, p) => sum + parseFloat(p.weight), 0) / manifest.length).toFixed(2) + 'kg' :
                    '0kg'}
                </p>
              </div>

              <div className="bg-purple-50 rounded-lg p-5 transition-all hover:shadow-sm">
                <p className="text-sm font-medium text-purple-600 mb-1">Date Range</p>
                <p className="text-lg font-bold text-gray-900">
                  {fromDate} to {toDate}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Parcel Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Shipments</h2>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-500">
              Showing {Math.min(indexOfFirstItem + 1, manifest.length)} to {Math.min(indexOfLastItem, manifest.length)} of {manifest.length} records
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-12 bg-gray-100 rounded-lg"></div>
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-14 bg-gray-100 rounded-lg"></div>
                ))}
              </div>
            </div>
          ) : manifest.length > 0 ? (
            <>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('tracking_number')}
                    >
                      <div className="flex items-center">
                        Tracking #
                        {sortConfig.key === 'tracking_number' && (
                          <span className="ml-1">
                            {sortConfig.direction === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Origin
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Destination
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('weight')}
                    >
                      <div className="flex items-center">
                        Weight
                        {sortConfig.key === 'weight' && (
                          <span className="ml-1">
                            {sortConfig.direction === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('created_at')}
                    >
                      <div className="flex items-center">
                        Date
                        {sortConfig.key === 'created_at' && (
                          <span className="ml-1">
                            {sortConfig.direction === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
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
              <div className="flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 px-6 py-4 gap-4">
                <div className="text-sm text-gray-700">
                  Page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{totalPages}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-md ${currentPage === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                      }`}
                  >
                    <FiChevronLeft size={16} />
                  </button>
                  
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
                      <button
                        key={pageNum}
                        onClick={() => paginate(pageNum)}
                        className={`w-10 h-10 rounded-md text-sm font-medium ${currentPage === pageNum
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                          }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className={`p-2 rounded-md ${currentPage === totalPages || totalPages === 0
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                      }`}
                  >
                    <FiChevronRight size={16} />
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