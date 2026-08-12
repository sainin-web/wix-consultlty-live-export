import React from "react";
import SocketProvider from "../Sokect-io/sokectProvider";
import UserChat from "../ClientDashbord/UserChat";

/**
 * Wrapper for chat page that initializes socket on demand.
 * Socket only connects when user navigates to chat.
 */
export default function ChatPageWrapper() {
  return (
    <SocketProvider>
      <UserChat />
    </SocketProvider>
  );
}
