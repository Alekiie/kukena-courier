"use client";

import ParcelStatusPage from "../components/parcel-status-page";
import withAuth from "../components/withAuth";

export default withAuth(function OnTransit() {
  return <ParcelStatusPage status="delivered" pageTitle="Shipped parcels" />;
});
