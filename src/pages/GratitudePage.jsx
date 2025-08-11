import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Plus, CheckCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const GratitudePage = () => {
  const navigate = useNavigate();
  const [gratitudeItems, setGratitudeItems] = useState([]);
  const [newItem, setNewItem] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddItem = () => {
    if (newItem.trim()) {
      setGratitudeItems([...gratitudeItems, { id: Date.now(), text: newItem.trim(), completed: false }]);
      setNewItem('');
      setIsAdding(false);
    }
  };

  const toggleItem = (id) => {
    setGratitudeItems(items =>
      items.map(item =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const removeItem = (id) => {
    setGratitudeItems(items => items.filter(item => item.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate(-1)}
            className="mr-4 p-2 rounded-lg bg-white shadow-sm border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Gratitude Practice</h1>
            <p className="text-slate-600 mt-1">Reflect on the positives in your life</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          {/* Introduction */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-pink-600" />
            </div>
            <h2 className="text-2xl font-semibold text-slate-900 mb-3">
              What are you grateful for today?
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Practicing gratitude can improve your mood, reduce stress, and help you focus on the positive aspects of your life. 
              Take a moment to reflect on what brings you joy and appreciation.
            </p>
          </div>

          {/* Add New Item */}
          <div className="mb-8">
            {!isAdding ? (
              <motion.button
                onClick={() => setIsAdding(true)}
                className="w-full p-4 border-2 border-dashed border-slate-300 rounded-xl text-slate-600 hover:border-pink-400 hover:text-pink-600 transition-colors flex items-center justify-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Plus className="w-5 h-5" />
                <span className="font-medium">Add something you're grateful for</span>
              </motion.button>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 border border-slate-200 rounded-xl bg-slate-50"
              >
                <textarea
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  placeholder="I'm grateful for..."
                  className="w-full p-3 border border-slate-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  rows={3}
                  autoFocus
                />
                <div className="flex gap-3 mt-3">
                  <button
                    onClick={handleAddItem}
                    className="px-4 py-2 bg-pink-600 text-white rounded-lg font-medium hover:bg-pink-700 transition-colors"
                  >
                    Add to List
                  </button>
                  <button
                    onClick={() => {
                      setIsAdding(false);
                      setNewItem('');
                    }}
                    className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Gratitude List */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Your Gratitude List ({gratitudeItems.length} items)
            </h3>
            
            {gratitudeItems.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <Heart className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p>Start by adding something you're grateful for above</p>
              </div>
            ) : (
              gratitudeItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 rounded-xl border transition-all ${
                    item.completed 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-white border-slate-200 hover:border-pink-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleItem(item.id)}
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                        item.completed
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'border-slate-300 hover:border-pink-400'
                      }`}
                    >
                      {item.completed && <CheckCircle className="w-4 h-4" />}
                    </button>
                    <span className={`flex-1 text-left ${
                      item.completed ? 'text-green-700 line-through' : 'text-slate-700'
                    }`}>
                      {item.text}
                    </span>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-slate-400 hover:text-red-500 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {/* Tips */}
          <div className="mt-12 p-6 bg-blue-50 rounded-xl">
            <h4 className="font-semibold text-blue-900 mb-3">💡 Gratitude Tips</h4>
            <ul className="text-blue-800 space-y-2 text-sm">
              <li>• Start with simple things like a good cup of coffee or a sunny day</li>
              <li>• Include people who have helped or supported you</li>
              <li>• Reflect on challenges that have made you stronger</li>
              <li>• Practice daily for best results</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GratitudePage;
