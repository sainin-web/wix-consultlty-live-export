import React from "react";
import SocketProvider from "../Sokect-io/sokectProvider";
import VideoCallingPage from "../ConsultantDashboard/VideoCallingPage";

/**
 * Wrapper for video calling page that initializes socket on demand.
 * Socket only connects when user navigates to call.
 */
export default function VideoCallingWrapper() {
  return (
    <SocketProvider>
      <VideoCallingPage />
    </SocketProvider>
  );
}
