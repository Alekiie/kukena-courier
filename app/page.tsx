"use client";
import { useEffect, useState } from "react";
import withAuth from "./components/withAuth";

function Home() {
  const [towns, setTowns] = useState();
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    const fetchTowns = async () => {
      const response = await fetch(`${baseUrl}/towns`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      console.log("Response:", response);

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      setTowns(data);
    };

    fetchTowns().catch((error) => {
      console.error("Error fetching towns:", error);
    });
  }, []);

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
          />
        </div>

        <div>
          <label htmlFor="office" className="text-sm text-gray-600">
            Office:
          </label>
          <select
            id="office"
            className="ml-2 p-2 border border-gray-300 rounded"
          >
            <option>All Offices</option>
            {towns &&
              towns.map((town) => (
                <option key={town.id} value={town.id}>
                  {town.name}
                </option>
              ))}
          </select>
        </div>

        <button className="ml-auto bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
          Generate
        </button>
      </div>

      {/* Placeholder for chart */}
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-lg font-semibold mb-4">Return Manifest</h2>
        <div className="h-64 bg-gray-200 flex items-center justify-center text-gray-500">
          Chart Placeholder (Integrate with Chart.js or Recharts)
        </div>
      </div>
    </>
  );
}
export default withAuth(Home);
