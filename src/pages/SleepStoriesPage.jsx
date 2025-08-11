import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Moon, Play, Pause, Clock, ArrowLeft, Volume2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SleepStoriesPage = () => {
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStory, setCurrentStory] = useState(null);
  const [volume, setVolume] = useState(0.6);

  const sleepStories = [
    {
      id: 'forest-walk',
      title: 'A Walk Through the Forest',
      description: 'A gentle journey through a peaceful forest at twilight',
      duration: '15 min',
      category: 'Nature',
      icon: '🌲',
      color: 'bg-green-50',
      textColor: 'text-green-600',
      narrator: 'Sarah'
    },
    {
      id: 'ocean-waves',
      title: 'Ocean Waves at Sunset',
      description: 'Drift away with the rhythmic sounds of the ocean',
      duration: '20 min',
      category: 'Ocean',
      icon: '🌊',
      color: 'bg-blue-50',
      textColor: 'text-blue-600',
      narrator: 'Michael'
    },
    {
      id: 'mountain-cabin',
      title: 'Cozy Mountain Cabin',
      description: 'A warm, peaceful night in a mountain retreat',
      duration: '18 min',
      category: 'Comfort',
      icon: '🏔️',
      color: 'bg-orange-50',
      textColor: 'text-orange-600',
      narrator: 'Emma'
    },
    {
      id: 'garden-serenity',
      title: 'Garden of Serenity',
      description: 'A tranquil walk through a blooming garden',
      duration: '12 min',
      category: 'Nature',
      icon: '🌸',
      color: 'bg-pink-50',
      textColor: 'text-pink-600',
      narrator: 'David'
    },
    {
      id: 'starry-night',
      title: 'Starry Night Journey',
      description: 'Float among the stars in a peaceful night sky',
      duration: '25 min',
      category: 'Space',
      icon: '⭐',
      color: 'bg-purple-50',
      textColor: 'text-purple-600',
      narrator: 'Lisa'
    },
    {
      id: 'rainy-day',
      title: 'Rainy Day Comfort',
      description: 'The soothing sound of rain on a quiet afternoon',
      duration: '16 min',
      category: 'Weather',
      icon: '🌧️',
      color: 'bg-cyan-50',
      textColor: 'text-cyan-600',
      narrator: 'James'
    }
  ];

  const handlePlayStory = (story) => {
    if (currentStory?.id === story.id) {
      // Toggle current story
      setIsPlaying(!isPlaying);
    } else {
      // Play new story
      setCurrentStory(story);
      setIsPlaying(true);
    }
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
            <h1 className="text-3xl font-bold text-slate-900">Sleep Stories</h1>
            <p className="text-slate-600 mt-1">Drift off peacefully with soothing bedtime stories</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          {/* Introduction */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Moon className="w-8 h-8 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-semibold text-slate-900 mb-3">
              Relax and Drift Off
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Our carefully crafted sleep stories combine gentle narration with calming soundscapes 
              to help you relax, unwind, and fall asleep naturally.
            </p>
          </div>

          {/* Currently Playing */}
          {currentStory && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-4xl">{currentStory.icon}</div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900">
                      Now Playing: {currentStory.title}
                    </h3>
                    <p className="text-slate-600">{currentStory.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {currentStory.duration}
                      </span>
                      <span>Narrated by {currentStory.narrator}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center hover:bg-indigo-700 transition-colors"
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="mt-4">
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '35%' }}></div>
                </div>
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>5:15</span>
                  <span>{currentStory.duration}</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Stories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sleepStories.map((story, index) => (
              <motion.div
                key={story.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`${story.color} rounded-xl p-6 border border-slate-200 hover:shadow-md transition-all cursor-pointer`}
                onClick={() => handlePlayStory(story)}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="text-3xl">{story.icon}</div>
                  <div className={`w-8 h-8 rounded-full ${story.textColor} bg-white flex items-center justify-center`}>
                    {currentStory?.id === story.id && isPlaying ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {story.title}
                </h3>
                <p className="text-slate-600 text-sm mb-3">
                  {story.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Clock className="w-3 h-3" />
                    <span>{story.duration}</span>
                  </div>
                  <span className="text-xs bg-white px-2 py-1 rounded-full text-slate-600">
                    {story.category}
                  </span>
                </div>
                {currentStory?.id === story.id && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-slate-600">
                    <Volume2 className="w-3 h-3" />
                    <span>Now playing</span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Tips */}
          <div className="mt-12 p-6 bg-blue-50 rounded-xl">
            <h4 className="font-semibold text-blue-900 mb-3">💡 Sleep Story Tips</h4>
            <ul className="text-blue-800 space-y-2 text-sm">
              <li>• Listen in a quiet, comfortable environment</li>
              <li>• Set a timer if you prefer to fall asleep naturally</li>
              <li>• Use headphones for an immersive experience</li>
              <li>• Try different stories to find what works best for you</li>
              <li>• Combine with deep breathing for enhanced relaxation</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SleepStoriesPage;
