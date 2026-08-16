import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Radio,
  CloudRain,
  ShieldAlert,
  Newspaper,
  ExternalLink,
  RefreshCw,
  Search,
  MapPin,
  CheckCircle,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { apiClient } from '../services/api/ApiClient';
import { LiveCategory, LiveLocation, LiveResponse } from '../types';

interface LivePageProps {
  currentLanguage?: string;
  onNavigateToVerify: (claimText: string) => void;
}

const REGIONS = [
  { id: 'all', label: 'All Regions' },
  { id: 'Sindh', label: 'Sindh (Karachi, Hyderabad)' },
  { id: 'Punjab', label: 'Punjab (Lahore, Rawalpindi)' },
  { id: 'Khyber Pakhtunkhwa', label: 'Khyber Pakhtunkhwa (Peshawar, Swat)' },
  { id: 'Balochistan', label: 'Balochistan (Quetta, Gwadar)' },
  { id: 'Gilgit-Baltistan', label: 'Gilgit-Baltistan & Northern Areas' },
  { id: 'Azad Jammu & Kashmir', label: 'Azad Jammu & Kashmir' },
];

export const LivePage: React.FC<LivePageProps> = ({ onNavigateToVerify }) => {
  const [activeCategory, setActiveCategory] = useState<LiveCategory>('ALL');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [liveData, setLiveData] = useState<LiveResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const fetchLiveUpdates = async (force: boolean = false) => {
    if (force) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const location: LiveLocation = {
        country: 'Pakistan',
        region: selectedRegion === 'all' ? null : selectedRegion,
      };

      const res = await apiClient.getLiveUpdates(activeCategory, location, searchQuery, force);
      setLiveData(res);
    } catch (err) {
      console.error('Failed to fetch live updates:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLiveUpdates(false);
  }, [activeCategory, selectedRegion]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLiveUpdates(true);
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
            CRITICAL
          </span>
        );
      case 'WARNING':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            WARNING
          </span>
        );
      case 'ADVISORY':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
            ADVISORY
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-slate-800 text-slate-300 border border-slate-700">
            INFO
          </span>
        );
    }
  };

  const getSourceTypeBadge = (sourceType: string) => {
    switch (sourceType) {
      case 'OFFICIAL_ALERT':
        return <span className="text-xs font-medium text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40">🏛️ Official Alert</span>;
      case 'OFFICIAL_WEATHER':
        return <span className="text-xs font-medium text-sky-400 bg-sky-950/40 px-2 py-0.5 rounded border border-sky-800/40">🌦️ Meteorological Agency</span>;
      case 'OFFICIAL_DISASTER':
        return <span className="text-xs font-medium text-rose-400 bg-rose-950/40 px-2 py-0.5 rounded border border-rose-800/40">🌊 Flood & Seismic Data</span>;
      case 'NEWS_REPORT':
        return <span className="text-xs font-medium text-slate-300 bg-slate-800/60 px-2 py-0.5 rounded border border-slate-700">📰 News Report</span>;
      default:
        return <span className="text-xs font-medium text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">Public Information</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-20">
      {/* Top Header */}
      <div className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 p-0.5 shadow-lg shadow-rose-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Radio className="w-5 h-5 text-rose-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white">VeriVoice Live</h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  LIVE AWARENESS
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Current official emergency alerts, flood advisories, and meteorological bulletins
              </p>
            </div>
          </div>

          {/* Search & Refresh */}
          <div className="flex items-center gap-3">
            <form onSubmit={handleSearch} className="relative flex-1 md:w-64">
              <input
                type="text"
                placeholder="Search alerts or area..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-1.5 pl-9 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
              />
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            </form>

            <button
              onClick={() => fetchLiveUpdates(true)}
              disabled={isRefreshing || isLoading}
              className="p-2 rounded-xl bg-slate-900 border border-slate-700/80 text-slate-300 hover:text-white hover:border-slate-600 transition-all disabled:opacity-50"
              title="Refresh Live Data"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-teal-400' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Emergency Disclaimer Banner */}
        <div className="bg-amber-950/30 border border-amber-600/30 rounded-2xl p-4 flex items-start gap-3.5">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-200/90 leading-relaxed">
            <span className="font-semibold text-amber-300">Public Safety Notice: </span>
            VeriVoice surfaces current official information from disaster management bodies and meteorological agencies.
            For immediate safety, evacuation, or rescue decisions, always follow the direct instructions of local emergency authorities.
          </div>
        </div>

        {/* Controls: Category Tabs + Location Selector */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
            {[
              { id: 'ALL', label: 'All Updates', icon: Radio },
              { id: 'LIVE_ALERTS', label: 'Emergency Alerts', icon: ShieldAlert },
              { id: 'WEATHER', label: 'Weather', icon: CloudRain },
              { id: 'DISASTERS', label: 'Disasters & Floods', icon: AlertTriangle },
              { id: 'NEWS', label: 'Recent News', icon: Newspaper },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveCategory(tab.id as LiveCategory)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shrink-0 ${
                    isActive
                      ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                      : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Region Selector */}
          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
            <MapPin className="w-3.5 h-3.5 text-teal-400" />
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-teal-500 transition-all"
            >
              {REGIONS.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Live Summary Bar */}
        {liveData && (
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-teal-400" />
              <span>{liveData.summary}</span>
            </div>
            <div className="flex items-center gap-1 text-slate-500 shrink-0">
              <Clock className="w-3.5 h-3.5" />
              <span>Last retrieved: {new Date(liveData.retrievedAt).toLocaleTimeString()}</span>
            </div>
          </div>
        )}

        {/* Live Cards Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-6 animate-pulse space-y-3">
                <div className="h-4 bg-slate-800 rounded w-1/3" />
                <div className="h-5 bg-slate-800 rounded w-3/4" />
                <div className="h-12 bg-slate-800 rounded" />
              </div>
            ))}
          </div>
        ) : liveData?.items && liveData.items.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {liveData.items.map((item) => (
              <div
                key={item.id}
                className="bg-slate-900/70 border border-slate-800/80 hover:border-slate-700/80 rounded-2xl p-5 flex flex-col justify-between gap-4 transition-all hover:shadow-xl hover:shadow-slate-950/50 group"
              >
                <div className="space-y-3">
                  {/* Card Header: Severity + Source Type */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      {getSeverityBadge(item.severity)}
                      {getSourceTypeBadge(item.sourceType)}
                    </div>
                    <span className="text-[11px] text-teal-400/90 font-mono flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      {item.status}
                    </span>
                  </div>

                  {/* Title & Organization */}
                  <div>
                    <h2 className="text-base font-bold text-slate-100 group-hover:text-teal-300 transition-colors leading-snug">
                      {item.title}
                    </h2>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">
                      {item.sourceOrganization}
                    </p>
                  </div>

                  {/* Summary */}
                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                    {item.summary}
                  </p>
                </div>

                {/* Card Footer: Official Link & Verification Bridge */}
                <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between gap-2">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                  >
                    Official Source
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  <button
                    onClick={() => onNavigateToVerify(item.title)}
                    className="px-3 py-1 rounded-xl bg-slate-800/80 hover:bg-teal-500 hover:text-slate-950 text-xs font-semibold text-teal-300 border border-slate-700/60 hover:border-teal-400 transition-all flex items-center gap-1.5"
                    title="Cross-check this alert in VeriVoice Verification Engine"
                  >
                    Verify Alert
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-12 text-center space-y-3">
            <ShieldAlert className="w-10 h-10 text-slate-600 mx-auto" />
            <h2 className="text-base font-semibold text-slate-300">No active alerts found</h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              No current official alert was found in the sources checked for this region. That does not guarantee that no local emergency exists.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
