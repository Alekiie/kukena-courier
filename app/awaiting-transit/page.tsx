
"use client"

import ParcelStatusPage from "../components/parcel-status-page";
import withAuth from "../components/withAuth";

export default withAuth(function AwaitingTransit() {
  return <ParcelStatusPage status="registered" pageTitle="Awaiting Transit" />;
});
