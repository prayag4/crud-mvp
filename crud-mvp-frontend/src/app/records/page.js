import { Suspense } from "react";
import dynamic from "next/dynamic";

export const dynamic = "force-dynamic";      // prevents static export

const RecordsClient = dynamic(() => import("./RecordsClient"), { ssr: false });

export default function RecordsPage() {
  return (
    <Suspense fallback={<div className="p-4">Loading records…</div>}>
      <RecordsClient />
    </Suspense>
  );
}