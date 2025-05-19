"use client";

import { createContext, useState, useEffect, useContext } from "react";
export interface Town {
  id: number;
  name: String;
  address: String;
  phone: String;
}
interface TownContextType {
  towns: Town[];
  loading: boolean;
  fetchTowns: () => Promise<void>;
  createTown: (town: Town) => Promise<void>;
}

const TownContext = createContext<TownContextType | undefined>(undefined);
export const TownProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [towns, setTowns] = useState<Town[]>([]);
  const [loading, setLoading] = useState(true);
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  const fetchTowns = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${baseUrl}/towns`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      if (!response.ok)
        throw new Error("There was an error fetching the towns");
      const data = await response.json();

      setTowns(data);
    } catch (error) {
      console.error("Error fetching towns:", error);
    }
  };
  const createTown = async (newTown: Omit<Town, "id">) => {
    const response = await fetch(`${baseUrl}/towns`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
      body: JSON.stringify(newTown),
    });

    if (!response.ok) throw new Error("Failed to create town");

    const created = await response.json();
    setTowns((prev) => [...prev, { ...newTown, id: created.id }]);
  };
  useEffect(() => {
    fetchTowns().catch(console.error);
  }, []);

  return (
    <TownContext.Provider value={{ towns, fetchTowns, createTown }}>
      {children}
    </TownContext.Provider>
  );
};

export const useTowns = () => {
  const context = useContext(TownContext);
  if (!context) throw new Error("useTowns must be used within a TownProvider");
  return context;
};
