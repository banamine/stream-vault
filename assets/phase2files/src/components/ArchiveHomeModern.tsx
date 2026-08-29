/**
 * Archive Home Component - Modern UI
 * Card grids with poster layouts, dark-mode-first aesthetic,
 * streamlined bottom dock navigation, and media discovery focus.
 */

import React, { useState } from 'react';
import { ArchiveMediaRecord, ResumeRecord } from '../types';
import { Play, Clock, Film, Headphones, ChevronRight, Search, Home as HomeIcon, Compass, Settings } from 'lucide-react';

interface ArchiveHomeModernProps {
  records: ArchiveMediaRecord[];
  onSelectRecord: (record: ArchiveMediaRecord) => void;
  onSelectProgram: (programName: string) => void;
}

interface MediaCardProps {
  record: ArchiveMediaRecord;
  onSelect: (r: ArchiveMediaRecord) => void;
}

function MediaCard({ record, onSelect }: MediaCardProps) {
  const isAudio = record.mediaType === 'audio';
  const durationMin = record.duration ? Math.floor(record.duration / 60) : 0;

  // Generate a subtle gradient poster background based on program name
  const posterGradients: Record<string, string> = {
    'War Room': 'from-red-900 to-red-700',
    'The War Room': 'from-red-900 to-red-700',
    'Infowars': 'from-orange-900 to-orange-700',
    'News Hour': 'from-blue-900 to-blue-700',
    'Special Report': 'from-purple-900 to-purple-700',
  };

  const gradientClass = posterGradients[record.program] || 'from-slate-900 to-slate-700';

  return (
    <button
      onClick={() => onSelect(record)}
      className="group relative flex flex-col h-64 rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer"
    >
      {/* Poster Background */}
      <div className={`absolute inset-0 bg-gradient-to-b ${gradientClass} opacity-80`} />

      {/* Content Overlay */}
      <div className="relative flex flex-col h-full p-4 bg-gradient-to-t from-black via-transparent to-transparent flex items-end justify-end">
        {/* Program/Title Info */}
        <div className="w-full space-y-2 text-left">
          <p className="text-[11px] font-mono text-amber-400 uppercase tracking-wider">{record.program}</p>
          <h3 className="text-sm font-bold text-white line-clamp-2 leading-tight">{record.title}</h3>

          {/* Metadata Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-white/20">
            <div className="flex items-center gap-2 text-[10px] text-gray-300">
              <span className="font-mono">{record.date}</span>
              {durationMin > 0 && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {durationMin}m
                  </span>
                </>
              )}
            </div>
            {isAudio && <Headphones className="w-3.5 h-3.5 text-amber-400" />}
          </div>
        </div>
      </div>

      {/* Hover Play Button */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-colors duration-300">
        <Play className="w-12 h-12 text-white fill-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 drop-shadow-lg" />
      </div>
    </button>
  );
}

export function ArchiveHomeModern({
  records,
  onSelectRecord,
  onSelectProgram,
}: ArchiveHomeModernProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const validRecords = records.filter(r => r.status !== 'invalid');
  const latestDate = '2026-08-28';
  const latestRecords = validRecords.filter(r => r.date === latestDate);

  // Group by program for "By Series" section
  const allByProgram: Record<string, ArchiveMediaRecord[]> = {};
  for (const r of validRecords) {
    if (!allByProgram[r.program]) allByProgram[r.program] = [];
    allByProgram[r.program].push(r);
  }

  // Get latest resume record
  let latestResumeRecord: ResumeRecord | null = null;
  try {
    for (const r of validRecords) {
      const prefix = r.mediaType === 'audio' ? 'ajn_resume_audio_' : 'ajn_resume_video_';
      const saved = localStorage.getItem(`${prefix}${r.id}`);
      if (saved) {
        const parsed: ResumeRecord = JSON.parse(saved);
        if (!latestResumeRecord || parsed.updatedAt > latestResumeRecord.updatedAt) {
          latestResumeRecord = parsed;
        }
      }
    }
  } catch {}

  const resumeMediaRecord = latestResumeRecord ? validRecords.find(r => r.id === latestResumeRecord?.mediaId) : null;

  // Filter by search
  const filteredLatest = latestRecords.filter(r =>
    r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.program.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const videoRecords = filteredLatest.filter(r => r.mediaType === 'video');
  const audioRecords = filteredLatest.filter(r => r.mediaType === 'audio');

  return (
    <div className="flex flex-col h-full bg-[#0F1419] text-[#F0F1F3]">
      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto pb-20">
        {/* Hero/Resume Section */}
        {resumeMediaRecord && latestResumeRecord && (
          <div className="relative h-80 bg-gradient-to-br from-amber-900 via-slate-900 to-slate-950 overflow-hidden">
            {/* Background blur effect */}
            <div className="absolute inset-0 opacity-30 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdHRlcm4gaWQ9ImEiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+PHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTAgMGw2MCA2ME0wIDYwbDYwLTYwIiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iMC41IiBvcGFjaXR5PSIwLjEiLz48L3BhdHRlcm4+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNhKSIvPjwvc3ZnPg==')]" />

            <div className="relative h-full flex items-center justify-between px-8">
              <div className="space-y-6 max-w-2xl">
                <div className="space-y-2">
                  <p className="text-sm font-mono text-amber-300 uppercase tracking-widest">Resume Playback</p>
                  <h1 className="text-5xl font-black text-white drop-shadow-lg">{resumeMediaRecord.title}</h1>
                  <p className="text-gray-300 text-lg">{resumeMediaRecord.program} • {resumeMediaRecord.date}</p>
                </div>

                <div className="flex items-center gap-6">
                  <button
                    onClick={() => onSelectRecord(resumeMediaRecord)}
                    className="flex items-center gap-3 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-lg transition-all shadow-lg hover:shadow-xl cursor-pointer"
                  >
                    <Play className="w-5 h-5 fill-current" />
                    Continue ({Math.floor(latestResumeRecord.position / 60)}m elapsed)
                  </button>
                  <div className="text-white/80 text-sm font-mono">
                    {resumeMediaRecord.mediaType === 'audio' && (
                      <span className="flex items-center gap-2">
                        <Headphones className="w-4 h-4" /> Audio
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Decorative media icon */}
              <div className="hidden lg:block text-amber-600/30">
                {resumeMediaRecord.mediaType === 'video' ? (
                  <Film className="w-40 h-40" />
                ) : (
                  <Headphones className="w-40 h-40" />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="sticky top-0 z-20 bg-[#0F1419]/95 backdrop-blur border-b border-white/10 px-8 py-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search programs, dates, titles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg pl-12 pr-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="px-8 py-8 space-y-12">
          {/* Videos Section */}
          {videoRecords.length > 0 && (
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black flex items-center gap-3">
                    <Film className="w-6 h-6 text-amber-400" />
                    Videos
                  </h2>
                  <p className="text-sm text-gray-400 mt-1">Latest broadcasts and archived programs</p>
                </div>
                <button className="flex items-center gap-2 text-amber-400 hover:text-amber-300 text-sm font-semibold transition-colors cursor-pointer">
                  View All <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {videoRecords.map(record => (
                  <div key={record.id}>
                    <MediaCard record={record} onSelect={onSelectRecord} />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Audio Section */}
          {audioRecords.length > 0 && (
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black flex items-center gap-3">
                    <Headphones className="w-6 h-6 text-amber-400" />
                    Audio Programs
                  </h2>
                  <p className="text-sm text-gray-400 mt-1">Listen to archived broadcast audio</p>
                </div>
                <button className="flex items-center gap-2 text-amber-400 hover:text-amber-300 text-sm font-semibold transition-colors cursor-pointer">
                  View All <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {audioRecords.map(record => (
                  <div key={record.id}>
                    <MediaCard record={record} onSelect={onSelectRecord} />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* By Series Section */}
          {Object.entries(allByProgram).length > 0 && (
            <section className="space-y-6 pt-8 border-t border-white/10">
              <h2 className="text-2xl font-black">Browse by Series</h2>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {Object.entries(allByProgram).map(([progName, items]) => (
                  <button
                    key={progName}
                    onClick={() => onSelectProgram(progName)}
                    className="group relative flex flex-col p-4 rounded-lg bg-white/5 border border-white/10 hover:border-amber-500/50 hover:bg-white/10 transition-all cursor-pointer"
                  >
                    <p className="text-sm font-bold text-white truncate group-hover:text-amber-400 transition-colors">{progName}</p>
                    <p className="text-xs text-gray-400 mt-1">{items.length} episodes</p>
                    <ChevronRight className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all opacity-0 group-hover:opacity-100" />
                  </button>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      {/* Bottom Dock Navigation */}
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-[#0F1419]/95 backdrop-blur border-t border-white/10 flex items-center justify-center gap-8 px-8">
        <button className="flex flex-col items-center gap-2 text-amber-400 hover:text-amber-300 transition-colors cursor-pointer group">
          <div className="p-2 rounded-lg bg-white/10 group-hover:bg-amber-500/20 transition-colors">
            <HomeIcon className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold hidden sm:block">Home</span>
        </button>

        <button className="flex flex-col items-center gap-2 text-gray-400 hover:text-gray-300 transition-colors cursor-pointer group">
          <div className="p-2 rounded-lg group-hover:bg-white/10 transition-colors">
            <Compass className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold hidden sm:block">Explore</span>
        </button>

        <button className="flex flex-col items-center gap-2 text-gray-400 hover:text-gray-300 transition-colors cursor-pointer group">
          <div className="p-2 rounded-lg group-hover:bg-white/10 transition-colors">
            <Settings className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold hidden sm:block">Settings</span>
        </button>
      </div>
    </div>
  );
}
