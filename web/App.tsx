import React, { useState } from 'react';
import GuestSelector from './components/GuestSelector';
import { getGuestData, runOrchestrationPipeline } from '../agent/orchestrator';

export default function App() {
  const [selectedGuestId, setSelectedGuestId] = useState<string | null>(null);

  const handleSelectGuest = (guestId: string) => {
    setSelectedGuestId(guestId);
    
    // Find the guest profile and pass to orchestration pipeline
    const guestData = getGuestData(guestId);
    if (guestData) {
      runOrchestrationPipeline(guestData);
    } else {
      console.error(`Guest with ID ${guestId} not found.`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans p-8">
      <header className="max-w-4xl mx-auto mb-12 text-center">
        <h1 className="text-4xl font-serif font-light mb-2">GuestFlow</h1>
        <p className="text-gray-500 tracking-wide uppercase text-sm">Agentic Arrival Orchestration</p>
      </header>

      <main>
        <GuestSelector selectedGuestId={selectedGuestId} onSelect={handleSelectGuest} />
        
        {/* Placeholder for future artifacts rendering */}
        {selectedGuestId && (
          <div className="max-w-4xl mx-auto mt-12 p-6 border border-gray-200 rounded-xl bg-white shadow-sm text-center">
            <h3 className="text-lg font-medium font-serif mb-2">Orchestration Triggered</h3>
            <p className="text-gray-500">Check the developer console to view the pipeline execution stub.</p>
          </div>
        )}
      </main>
    </div>
  );
}
