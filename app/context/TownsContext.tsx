"use client";

import {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
  ReactNode,
} from "react";

export interface Town {
  id: number;
  name: string;
  address: string;
  phone: string;
}

export interface RoutePricing {
  origin_town_id: number;
  destination_town_id: number;
  price: number;
}

interface TownContextType {
  towns: Town[];
  loading: boolean;
  fetchTowns: () => Promise<void>;
  createTown: (town: Omit<Town, "id">) => Promise<void>;
  updateTown: (town: Town) => Promise<void>;
  routePricing: RoutePricing[];
  setRoutePricing: (pricing: RoutePricing) => void;
}

const TownContext = createContext<TownContextType | undefined>(undefined);

export const TownProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [towns, setTowns] = useState<Town[]>([]);
  const [routePricing, setRoutePricing] = useState<RoutePricing[]>([]); // State for route pricing
  const [loading, setLoading] = useState(true);
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  const fetchTowns = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${baseUrl}/towns`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      if (!response.ok) {
        console.error("Error fetching towns, status:", response.status);
        throw new Error("Error fetching towns");
      }

      const data = await response.json();
      setTowns(data as Town[]);
    } catch (error) {
      console.error("Error fetching towns:", error);
    } finally {
      setLoading(false);
    }
  }, [baseUrl]);

  const createTown = useCallback(
    async (newTownData: Omit<Town, "id">) => {
      try {
        const response = await fetch(`${baseUrl}/towns`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
          body: JSON.stringify(newTownData),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: "Failed to create town" }));
          throw new Error(errorData.message || "Failed to create town");
        }

        const createdTown = await response.json();
        setTowns((prevTowns) => [...prevTowns, createdTown]);
      } catch (error) {
        console.error("Error creating town:", error);
        throw error;
      }
    },
    [baseUrl]
  );

  const updateTown = useCallback(
    async (townToUpdate: Town) => {
      try {
        const response = await fetch(`${baseUrl}/towns/${townToUpdate.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
          body: JSON.stringify(townToUpdate),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: "Failed to update town" }));
          throw new Error(errorData.message || "Failed to update town");
        }

        const updatedTown = await response.json();
        setTowns((prevTowns) =>
          prevTowns.map((t) => (t.id === updatedTown.id ? updatedTown : t))
        );
      } catch (error) {
        console.error("Error updating town:", error);
        throw error;
      }
    },
    [baseUrl]
  );

  // Adding the logic for setting route pricing
  const setRoutePricingFn = (pricing: RoutePricing) => {
    setRoutePricing((prevPricing) => [...prevPricing, pricing]);
  };

  useEffect(() => {
    if (baseUrl) {
        fetchTowns();
    } else {
        console.warn("API base URL is not defined. Towns will not be fetched.");
        setLoading(false);
    }
  }, [fetchTowns, baseUrl]);

  return (
    <TownContext.Provider
      value={{
        towns,
        loading,
        fetchTowns,
        createTown,
        updateTown,
        routePricing,
        setRoutePricing: setRoutePricingFn,
      }}
    >
      {children}
    </TownContext.Provider>
  );
};

export const useTowns = () => {
  const context = useContext(TownContext);
  if (context === undefined) {
    throw new Error("useTowns must be used within a TownProvider");
  }
  return context;
};
