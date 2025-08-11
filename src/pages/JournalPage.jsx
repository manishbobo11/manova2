import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Save, ArrowLeft, Calendar, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const JournalPage = () => {
  const navigate = useNavigate();
  const [journalEntry, setJournalEntry] = useState('');
  const [prompts] = useState([
    "How are you feeling today?",
    "What's on your mind?",
    "What made you smile today?",
    "What's challenging you right now?",
    "What are you looking forward to?",
    "What would you like to let go of?",
    "What are you grateful for?",
    "What's something you learned about yourself?"
  ]);
  const [selectedPrompt, setSelectedPrompt] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    if (journalEntry.trim()) {
      // In a real app, this would save to a database
      console.log('Saving journal entry:', journalEntry);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    }
  };

  const insertPrompt = (prompt) => {
    setJournalEntry(prev => prev + (prev ? '\n\n' : '') + prompt + '\n');
    setSelectedPrompt('');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="mr-4 p-2 rounded-lg bg-white shadow-sm border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Journal Entry</h1>
              <p className="text-slate-600 mt-1">Express your thoughts and feelings</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{new Date().toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          {/* Introduction */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-orange-600" />
            </div>
            <h2 className="text-2xl font-semibold text-slate-900 mb-3">
              Write Your Thoughts
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Journaling is a powerful tool for self-reflection and emotional processing. 
              Write freely about your thoughts, feelings, and experiences.
            </p>
          </div>

          {/* Writing Prompts */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-3">Writing Prompts</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {prompts.map((prompt, index) => (
                <motion.button
                  key={index}
                  onClick={() => insertPrompt(prompt)}
                  className="p-3 text-left text-sm bg-slate-50 hover:bg-orange-50 border border-slate-200 hover:border-orange-200 rounded-lg transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {prompt}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Journal Entry */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <label className="text-lg font-semibold text-slate-900">
                Your Entry
              </label>
              <div className="text-sm text-slate-500">
                {journalEntry.length} characters
              </div>
            </div>
            <textarea
              value={journalEntry}
              onChange={(e) => setJournalEntry(e.target.value)}
              placeholder="Start writing your thoughts here..."
              className="w-full h-64 p-4 border border-slate-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-slate-700 leading-relaxed"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <motion.button
              onClick={handleSave}
              disabled={!journalEntry.trim()}
              className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Save className="w-4 h-4" />
              {isSaved ? 'Saved!' : 'Save Entry'}
            </motion.button>
            
            <button
              onClick={() => setJournalEntry('')}
              className="px-6 py-3 bg-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-300 transition-colors"
            >
              Clear
            </button>
          </div>

          {/* Tips */}
          <div className="mt-8 p-6 bg-blue-50 rounded-xl">
            <h4 className="font-semibold text-blue-900 mb-3">💡 Journaling Tips</h4>
            <ul className="text-blue-800 space-y-2 text-sm">
              <li>• Write without judgment - there's no right or wrong way to journal</li>
              <li>• Be honest with yourself about your feelings</li>
              <li>• Don't worry about grammar or spelling</li>
              <li>• Try to write regularly, even if just a few sentences</li>
              <li>• Reflect on your entries to notice patterns and growth</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JournalPage;
