"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";  // Updated for Next.js 13 (App Router)
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
import { MenuIcon, PersonStandingIcon, XIcon, SearchIcon } from "lucide-react";
import { jwtDecode, JwtPayload as DecodedJwtPayload } from "jwt-decode";

interface CustomJwtPayload extends DecodedJwtPayload {
  name?: string;
  sub?: string;
  role?: string;
  id?: number;
}

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [activeLink, setActiveLink] = useState<string>('');
  const pathname = usePathname();  // Using Next.js App Router hook to get current path

  useEffect(() => {
    // Update active link whenever the pathname changes
    setActiveLink(pathname);

    const token = localStorage.getItem("access_token");
    if (!token) return;

    try {
      const decodedToken: CustomJwtPayload = jwtDecode(token);
      setUserName(decodedToken.name || decodedToken.sub || "User");
    } catch (e) {
      console.error("Failed to decode token:", e);
    }
  }, [pathname]);  // The effect runs whenever the pathname changes

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 left-4 z-30 p-2 rounded-lg bg-indigo-600 text-white shadow-md md:hidden"
      >
        <MenuIcon className="w-6 h-6" />
      </button>

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transition-all duration-300 ease-in-out transform
                    bg-white shadow-xl flex flex-col border-r border-gray-200
                    ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:static`}
      >
        <div className="p-4 flex flex-col h-full">
          {/* Header */}
          <div className="border-b border-gray-200 pb-4 mb-4 flex justify-between items-center">
            <div>
              <div className="text-lg font-bold text-gray-900 truncate">
                {userName || "KETNO User"}
              </div>
              <div className="text-xs text-indigo-600 font-medium">KETNO COURIER</div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700 p-1 rounded hover:bg-gray-100 md:hidden"
            >
              <XIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Search */}
          <div className="mb-4 relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-3 py-2 text-sm bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 border border-gray-200"
            />
          </div>

          {/* Navigation */}
          <nav className="flex-grow overflow-y-auto space-y-1">
            <SidebarLink
              href="/"
              icon={<FaTachometerAlt className="w-4 h-4" />}
              label="Dashboard"
              isActive={activeLink === "/"}
              onClick={() => setIsOpen(false)}
            />
            <SidebarLink
              href="/send"
              icon={<FaPlus className="w-4 h-4" />}
              label="Send Parcel"
              isActive={activeLink === "/send"}
              onClick={() => setIsOpen(false)}
            />
            <SidebarLink
              href="/waybill"
              icon={<FaFileAlt className="w-4 h-4" />}
              label="Create Waybill"
              isActive={activeLink === "/waybill"}
              onClick={() => setIsOpen(false)}
            />
            <SidebarLink
              href="/parcels"
              icon={<FaBox className="w-4 h-4" />}
              label="All Parcels"
              isActive={activeLink === "/parcels"}
              onClick={() => setIsOpen(false)}
            />

            <div className="pt-4 pb-1 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Parcel Status
            </div>

            <SidebarLink
              href="/awaiting-transit"
              icon={<FaClock className="w-4 h-4" />}
              label="Awaiting Transit"
              isActive={activeLink === "/awaiting-transit"}
              onClick={() => setIsOpen(false)}
            />
            <SidebarLink
              href="/on-transit"
              icon={<FaTruck className="w-4 h-4" />}
              label="On Transit"
              isActive={activeLink === "/on-transit"}
              onClick={() => setIsOpen(false)}
            />
            <SidebarLink
              href="/awaiting-collection"
              icon={<FaClock className="w-4 h-4" />}
              label="Awaiting Collection"
              isActive={activeLink === "/awaiting-collection"}
              onClick={() => setIsOpen(false)}
            />
            <SidebarLink
              href="/collected"
              icon={<FaCheck className="w-4 h-4" />}
              label="Collected"
              isActive={activeLink === "/collected"}
              onClick={() => setIsOpen(false)}
            />

            <div className="pt-4 pb-1 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Management
            </div>

            <SidebarLink
              href="/trash"
              icon={<FaTrash className="w-4 h-4" />}
              label="Trash"
              isActive={activeLink === "/trash"}
              onClick={() => setIsOpen(false)}
            />
            <SidebarLink
              href="/towns"
              icon={<FaMapMarkedAlt className="w-4 h-4" />}
              label="Towns"
              isActive={activeLink === "/towns"}
              onClick={() => setIsOpen(false)}
            />
            <SidebarLink
              href="/employees"
              icon={<PersonStandingIcon className="w-4 h-4" />}
              label="Employees"
              isActive={activeLink === "/employees"}
              onClick={() => setIsOpen(false)}
            />
          </nav>

          {/* Footer */}
          <div className="pt-4 border-t border-gray-200 mt-auto">
            <div className="text-xs text-gray-500 px-4 pb-2">
              © {new Date().getFullYear()} KETNO COURIER
            </div>
          </div>
        </div>
      </aside>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}

function SidebarLink({
  href,
  icon,
  label,
  isActive,
  onClick,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg mx-2 transition-colors
        ${isActive
          ? "bg-indigo-50 text-indigo-700"
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"}`}
    >
      <span className={`${isActive ? "text-indigo-600" : "text-gray-400"}`}>
        {icon}
      </span>
      {label}
    </Link>
  );
}
