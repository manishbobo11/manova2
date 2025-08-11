import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Leaf, Play, Pause, Volume2, VolumeX, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NatureSoundsPage = () => {
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSound, setCurrentSound] = useState(null);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);

  const natureSounds = [
    {
      id: 'rain',
      name: 'Rain',
      description: 'Gentle rain drops for relaxation',
      icon: '🌧️',
      color: 'bg-blue-50',
      textColor: 'text-blue-600',
      duration: '∞'
    },
    {
      id: 'forest',
      name: 'Forest',
      description: 'Birds and rustling leaves',
      icon: '🌲',
      color: 'bg-green-50',
      textColor: 'text-green-600',
      duration: '∞'
    },
    {
      id: 'ocean',
      name: 'Ocean Waves',
      description: 'Calming ocean waves',
      icon: '🌊',
      color: 'bg-cyan-50',
      textColor: 'text-cyan-600',
      duration: '∞'
    },
    {
      id: 'stream',
      name: 'Stream',
      description: 'Flowing water sounds',
      icon: '💧',
      color: 'bg-blue-50',
      textColor: 'text-blue-600',
      duration: '∞'
    },
    {
      id: 'fire',
      name: 'Crackling Fire',
      description: 'Warm fireplace sounds',
      icon: '🔥',
      color: 'bg-orange-50',
      textColor: 'text-orange-600',
      duration: '∞'
    },
    {
      id: 'thunder',
      name: 'Thunder',
      description: 'Distant thunder and rain',
      icon: '⚡',
      color: 'bg-purple-50',
      textColor: 'text-purple-600',
      duration: '∞'
    }
  ];

  const handlePlaySound = (sound) => {
    if (currentSound?.id === sound.id) {
      // Toggle current sound
      setIsPlaying(!isPlaying);
    } else {
      // Play new sound
      setCurrentSound(sound);
      setIsPlaying(true);
    }
  };

  const handleVolumeChange = (newVolume) => {
    setVolume(newVolume);
    if (newVolume === 0) {
      setIsMuted(true);
    } else {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate(-1)}
            className="mr-4 p-2 rounded-lg bg-white shadow-sm border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Nature Sounds</h1>
            <p className="text-slate-600 mt-1">Relax with calming natural ambience</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          {/* Introduction */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Leaf className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-semibold text-slate-900 mb-3">
              Choose Your Soundscape
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Immerse yourself in the soothing sounds of nature. These ambient sounds can help reduce stress, 
              improve focus, and create a peaceful environment for relaxation or sleep.
            </p>
          </div>

          {/* Currently Playing */}
          {currentSound && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-4xl">{currentSound.icon}</div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900">
                      Now Playing: {currentSound.name}
                    </h3>
                    <p className="text-slate-600">{currentSound.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center hover:bg-green-700 transition-colors"
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              
              {/* Volume Controls */}
              <div className="mt-4 flex items-center gap-3">
                <button
                  onClick={toggleMute}
                  className="p-2 text-slate-600 hover:text-slate-800 transition-colors"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <span className="text-sm text-slate-600 w-12 text-right">
                  {Math.round((isMuted ? 0 : volume) * 100)}%
                </span>
              </div>
            </motion.div>
          )}

          {/* Sound Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {natureSounds.map((sound, index) => (
              <motion.div
                key={sound.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`${sound.color} rounded-xl p-6 border border-slate-200 hover:shadow-md transition-all cursor-pointer`}
                onClick={() => handlePlaySound(sound)}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="text-3xl">{sound.icon}</div>
                  <div className={`w-8 h-8 rounded-full ${sound.textColor} bg-white flex items-center justify-center`}>
                    {currentSound?.id === sound.id && isPlaying ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {sound.name}
                </h3>
                <p className="text-slate-600 text-sm mb-3">
                  {sound.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    Duration: {sound.duration}
                  </span>
                  {currentSound?.id === sound.id && (
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Tips */}
          <div className="mt-12 p-6 bg-blue-50 rounded-xl">
            <h4 className="font-semibold text-blue-900 mb-3">💡 Nature Sounds Tips</h4>
            <ul className="text-blue-800 space-y-2 text-sm">
              <li>• Use these sounds for meditation, focus, or sleep</li>
              <li>• Adjust volume to a comfortable level</li>
              <li>• Combine with deep breathing exercises for enhanced relaxation</li>
              <li>• Try different sounds to find what works best for you</li>
              <li>• Use headphones for a more immersive experience</li>
            </ul>
          </div>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #059669;
          cursor: pointer;
        }
        .slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #059669;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
};

export default NatureSoundsPage;
