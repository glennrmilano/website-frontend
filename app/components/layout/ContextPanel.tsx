'use client';

import { useState } from 'react';

export type ContextTab = 'national' | 'facility' | 'scenario';

interface ContextPanelProps {
  isOpen?: boolean;
  onClose?: () => void;
  activeTab?: ContextTab;
  onTabChange?: (tab: ContextTab) => void;
}

interface ContextData {
  label: string;
  value: string;
}

export function ContextPanel({
  isOpen = true,
  onClose,
  activeTab = 'national',
  onTabChange,
}: ContextPanelProps) {
  const [tab, setTab] = useState<ContextTab>(activeTab);

  const handleTabChange = (newTab: ContextTab) => {
    setTab(newTab);
    onTabChange?.(newTab);
  };

  const contextData: Record<ContextTab, ContextData[]> = {
    national: [
      { label: 'Country', value: 'Rwanda' },
      { label: 'Population', value: '13.7M' },
      { label: 'Healthcare Facilities', value: '2,847' },
      { label: 'Data Period', value: 'Jan 2024 - Nov 2024' },
      { label: 'Forecast Horizon', value: '12 months' },
      { label: 'Model Type', value: 'ARIMA + ML Ensemble' },
    ],
    facility: [
      { label: 'Facility Name', value: 'Central Hospital' },
      { label: 'District', value: 'Kigali' },
      { label: 'Facility Type', value: 'Teaching Hospital' },
      { label: 'Beds', value: '500' },
      { label: 'Monthly Volume', value: '15,240 patients' },
      { label: 'Supply Categories', value: '127' },
    ],
    scenario: [
      { label: 'Scenario Type', value: 'Baseline' },
      { label: 'Growth Rate', value: '5.2% annual' },
      { label: 'Seasonality', value: 'Enabled' },
      { label: 'External Factors', value: 'COVID-like events' },
      { label: 'Confidence Interval', value: '95%' },
      { label: 'Last Updated', value: 'Today at 2:30 PM' },
    ],
  };

  const tabs: Array<{ id: ContextTab; label: string }> = [
    { id: 'national', label: 'National' },
    { id: 'facility', label: 'Facility' },
    { id: 'scenario', label: 'Scenario' },
  ];

  return (
    <div
      className={`${
        isOpen ? 'w-80' : 'w-0'
      } bg-slate-800 border-l border-slate-700 transition-all duration-300 overflow-hidden flex flex-col h-screen`}
    >
      {/* Header */}
      <div className="border-b border-slate-700 p-4 flex items-center justify-between">
        <h2 className="font-semibold text-white">Context</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-700 rounded transition-colors text-slate-400 hover:text-white"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-700 bg-slate-700/20">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => handleTabChange(t.id)}
            className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
              tab === t.id
                ? 'text-blue-400 border-b-2 border-blue-500 bg-slate-700/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {contextData[tab].map((item, idx) => (
          <div key={idx} className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 uppercase">
              {item.label}
            </label>
            <div className="text-sm text-white bg-slate-700/30 rounded px-3 py-2">
              {item.value}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Info */}
      <div className="border-t border-slate-700 p-4 text-xs text-slate-500">
        <p className="mb-2">
          Context data helps the AI understand your specific situation for better forecasts.
        </p>
        <button className="text-blue-400 hover:text-blue-300 font-medium">
          Edit Context →
        </button>
      </div>
    </div>
  );
}
