import { Outlet } from "react-router-dom";
import WixInstanceGuard from "./WixInstanceGuard";
import ProtectStoreFront from "./ProtectStoreFront";

/**
 * Wix storefront shell: instance guard + app-enabled check.
 * Does NOT include navigation header (Wix owns website navigation).
 * Uses Outlet so nested consultant-dashboard routes render correctly.
 */
export default function StorefrontShell({
  children,
  className = "iframe-page-shell",
}) {
  return (
    <WixInstanceGuard>
      <ProtectStoreFront>
        <div className={className}>
          {children || <Outlet />}
        </div>
      </ProtectStoreFront>
    </WixInstanceGuard>
  );
}
