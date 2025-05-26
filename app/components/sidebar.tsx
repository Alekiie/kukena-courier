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
import { MenuIcon, PersonStandingIcon } from "lucide-react";
import { jwtDecode, JwtPayload as DecodedJwtPayload } from "jwt-decode";

// Define your specific JWT payload interface for better type safety
interface CustomJwtPayload extends DecodedJwtPayload {
  name?: string;   // If your token has a 'name' claim for the full name
  sub?: string;    // Standard "subject" claim, often used for username or user ID
  role?: string;
  id?: number;
  // Add any other fields from your token that you might need
}

export default function Sidebar() {
  // isOpen state controls visibility on small screens due to `md:block` on aside
  const [isOpen, setIsOpen] = useState(true); // Default to open on small screens
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      console.warn("Access token not found in localStorage. Sidebar will not display user name.");
      return;
    }

    try {
      const decodedToken: CustomJwtPayload = jwtDecode(token);
      // Use a 'name' claim if available and more descriptive, otherwise fallback to 'sub'
      setUserName(decodedToken.name || decodedToken.sub || "User");
    } catch (e) {
      console.error("Failed to decode token:", e);
      // Potentially handle invalid token (e.g., sign out user)
    }
  }, []);

  return (
    <aside
      className={`bg-gray-900 text-white min-h-screen w-64 transition-all duration-300 
                  ${isOpen ? "block" : "hidden"} md:block`}
      // On small screens (<md breakpoint): visibility is controlled by isOpen.
      // On md screens and up: always 'block', so isOpen toggle won't hide the sidebar itself.
    >
      {/* Use a flex container for the entire sidebar content to manage height and scrolling */}
      <div className="p-4 flex flex-col h-full">
        {/* Header Section: User Info and Toggle Button */}
        <div className="border-b border-gray-700 pb-4 mb-4 flex justify-between items-center">
          {/* User and Company Info */}
          <div>
            <div className="text-lg font-semibold truncate" title={userName || ""}>
              {userName || "Loading..."}
            </div>
            <div className="text-xs text-gray-400">KETNO COURIER</div>
          </div>

          {/* Toggle Button: Only visible and active on small screens */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-white hover:text-gray-300 focus:outline-none p-1 rounded hover:bg-gray-700 md:hidden"
            // md:hidden makes this button disappear on medium screens and up,
            // because the sidebar itself is always visible (md:block)
            aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
          >
            <MenuIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Search Input */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search..."
            className="w-full p-2 text-sm bg-gray-800 rounded-md focus:outline-none placeholder-gray-500"
          />
        </div>

        {/* Navigation Links - allow this part to scroll if content overflows */}
        <nav className="flex-grow overflow-y-auto">
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
      </div>
    </aside>
  );
}

// SidebarLink component - added rounded-md for consistency
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
      className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-800 rounded-md transition-colors"
    >
      <span className="text-lg">{icon}</span>
      {label}
    </Link>
  );
}