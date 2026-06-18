import React, { Suspense } from "react";

const TimesheetsPage = React.lazy(() =>
  import("../../modules/timesheets/pages/TimesheetsPage.tsx").then((m) => ({ default: m.TimesheetsPage }))
);

export default function Timesheet() {
  return (
    <Suspense fallback={<div style={{ padding: 20 }}>Loading timesheet…</div>}>
      <TimesheetsPage />
    </Suspense>
  );
}
