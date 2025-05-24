"use client";

import ParcelStatusPage from "../components/parcel-status-page";
import withAuth from "../components/withAuth";

export default withAuth(function Collected() {
  return <ParcelStatusPage status="collected" pageTitle="Collected Parcels" />;
});
