import React from 'react';
import { Activity } from 'lucide-react';

const Header = ({ userData, currentTime }) => (
  <header className="bg-white/70 backdrop-blur-xl border-b border-gray-200/40 sticky top-0 z-40 shadow-sm">
    <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent tracking-tight">Manova Wellness</h1>
            <p className="text-xs text-gray-400 -mt-0.5">AI Health Intelligence</p>
          </div>
        </div>
        <div className="hidden md:block w-px h-6 bg-gray-200"></div>
        <div className="hidden md:flex items-center space-x-3 text-sm">
          <span className="text-gray-700 font-medium">Dashboard</span>
          <span className="text-gray-300">Analytics</span>
        </div>
      </div>
      <div className="flex items-center space-x-3">
        <div className="hidden sm:flex items-center space-x-2 bg-white/60 px-3 py-1.5 rounded-full text-xs text-gray-600 shadow-sm">
          <span className="font-mono tracking-tight">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <div className="flex items-center space-x-2 bg-white/60 rounded-full pr-3 pl-1.5 py-1.5 shadow-sm">
          <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-bold">{userData.avatar}</span>
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-gray-900 leading-tight">{userData.name}</p>
            <p className="text-xs text-gray-500 -mt-0.5">{userData.role}</p>
          </div>
        </div>
      </div>
    </div>
  </header>
);

export default Header; 