"use client";

import { useEffect, useState } from "react";
import {
  FaTachometerAlt,
  FaPlus,
  FaFileAlt,
  FaBox,
  FaClock,
  FaTruck,
  FaCheck,
  FaTrash,
  FaMapMarkedAlt,
} from "react-icons/fa";
import Link from "next/link";
import { PersonStandingIcon } from "lucide-react";
import { jwtDecode } from "jwt-decode";

export default function Sidebar() {
  interface JwtPayload {
    sub?: string; // "sub" contains the full name
    role?: string;
    id?: number;
    // any other fields from your token you may need
  }
  const [isOpen, setIsOpen] = useState(true);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      console.log("Invalid or missing token in localStorage");
      return;
    }
  
    try {
      const decoded: any = jwtDecode(token);
      console.log("User from token:", decoded);
      setUserName(decoded.sub); // or whatever you're using
    } catch (e) {
      console.error("Failed to decode token", e);
    }
  }, []);

  return (
    <aside
      className={`bg-gray-900 text-white min-h-screen w-64 transition-all duration-300 ${
        isOpen ? "block" : "hidden"
      } md:block`}
    >
      <div className="p-4 border-b border-gray-700">
        <div className="text-sm font-semibold">
          <div className="text-sm font-semibold">
            {userName ? userName : "LOADING..."}
          </div>
        </div>
        <div className="text-xs text-gray-400">KETNO COURIER</div>
      </div>

      <div className="p-2">
        <input
          type="text"
          placeholder="Search..."
          className="w-full p-2 text-sm bg-gray-800 rounded-md focus:outline-none"
        />
      </div>

      <nav className="mt-4">
        <SidebarLink href="/" icon={<FaTachometerAlt />} label="Dashboard" />
        <SidebarLink href="/send" icon={<FaPlus />} label="Send Parcel" />
        <SidebarLink
          href="/waybill"
          icon={<FaFileAlt />}
          label="Create Waybill"
        />
        <SidebarLink href="/parcels" icon={<FaBox />} label="All Parcels" />
        <SidebarLink
          href="/awaiting-transit"
          icon={<FaClock />}
          label="Awaiting Transit"
        />
        <SidebarLink href="/on-transit" icon={<FaTruck />} label="On Transit" />
        <SidebarLink
          href="/awaiting-collection"
          icon={<FaClock />}
          label="Awaiting Collection"
        />
        <SidebarLink href="/collected" icon={<FaCheck />} label="Collected" />
        <SidebarLink href="/trash" icon={<FaTrash />} label="Trash" />
        <SidebarLink href="/towns" icon={<FaMapMarkedAlt />} label="Towns" />
        <SidebarLink
          href="/employees"
          icon={<PersonStandingIcon />}
          label="Employees"
        />
      </nav>
    </aside>
  );
}

function SidebarLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-800 transition-colors"
    >
      <span className="text-lg">{icon}</span>
      {label}
    </Link>
  );
}
