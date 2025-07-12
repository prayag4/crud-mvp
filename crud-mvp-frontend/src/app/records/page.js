import { Suspense } from "react";
import RecordsClient from "./RecordsClient";

export const dynamic = "force-dynamic";

export default function RecordsPage() {
  return (
    <Suspense fallback={<div className="p-4">Loading records…</div>}>
      <RecordsClient />
    </Suspense>
  );
}
