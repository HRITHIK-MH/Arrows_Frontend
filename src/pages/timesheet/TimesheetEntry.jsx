import React, { Suspense } from "react";

const TimesheetEntry = React.lazy(() =>
  import("../../modules/timesheets/pages/NewTimesheetPage.jsx").then(m => ({
    default: m.NewTimesheetPage
  }))
);

const LoadingFallback = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '18px', color: '#666', marginBottom: '10px' }}>Loading...</div>
      <div style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #3498db', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  </div>
);

export default function TimesheetEntryWrapper() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <TimesheetEntry />
    </Suspense>
  );
}
