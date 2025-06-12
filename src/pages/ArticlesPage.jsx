import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Clock, Heart, Share2, User, Star, Bookmark, MessageSquare, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';

const ArticlesPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [likedArticles, setLikedArticles] = useState({});
  const [showShareToast, setShowShareToast] = useState(false);
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setIsLoading(true);
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // This would be replaced with actual API call
        const fetchedArticles = [
          {
            id: 1,
            title: 'Understanding and Managing Anxiety in Daily Life',
            category: 'anxiety',
            readTime: '5 min',
            likes: 234,
            author: 'Dr. Sarah Chen',
            authorRole: 'Clinical Psychologist',
            rating: 4.9,
            image: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
            excerpt: 'Practical strategies for managing anxiety in your daily routine, backed by clinical research.',
            content: 'Learn effective techniques to manage anxiety, including mindfulness practices, cognitive behavioral strategies, and lifestyle modifications that can help you maintain mental well-being.',
            tags: ['Anxiety Management', 'Mental Health', 'Self-Care'],
            comments: 12,
            date: '2024-03-15',
            views: 1234,
            authorImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80'
          },
          {
            id: 2,
            title: 'The Science of Better Sleep',
            category: 'stress',
            readTime: '7 min',
            likes: 189,
            author: 'Dr. Michael Rodriguez',
            authorRole: 'Sleep Specialist',
            rating: 4.8,
            image: 'https://images.unsplash.com/photo-1511295742362-92c96b1cf484?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
            excerpt: 'Evidence-based techniques to improve your sleep quality and overall well-being.',
            content: 'Discover the latest research on sleep hygiene, circadian rhythms, and practical tips for achieving better sleep quality and duration.',
            tags: ['Sleep Health', 'Wellness', 'Research'],
            comments: 8,
            date: '2024-03-14',
            views: 987,
            authorImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80'
          },
          {
            id: 3,
            title: 'Building Healthy Relationships',
            category: 'relationships',
            readTime: '6 min',
            likes: 156,
            author: 'Dr. Emily Thompson',
            authorRole: 'Relationship Counselor',
            rating: 4.7,
            image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
            excerpt: 'Expert advice on nurturing meaningful connections and maintaining healthy boundaries.',
            content: 'Explore the key components of healthy relationships, including communication, trust, and emotional intelligence.',
            tags: ['Relationships', 'Communication', 'Mental Health'],
            comments: 15,
            date: '2024-03-13',
            views: 876,
            authorImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80'
          }
        ];
        
        setArticles(fetchedArticles);
        setError(null);
      } catch (err) {
        setError('Failed to load articles. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticles();
  }, []);

  const categories = [
    { id: 'all', name: 'All' },
    { id: 'anxiety', name: 'Anxiety' },
    { id: 'depression', name: 'Depression' },
    { id: 'stress', name: 'Stress Management' },
    { id: 'relationships', name: 'Relationships' }
  ];

  const filteredArticles = selectedCategory === 'all' 
    ? articles 
    : articles.filter(article => article.category === selectedCategory);

  const toggleBookmark = (articleId) => {
    setIsBookmarked(prev => ({
      ...prev,
      [articleId]: !prev[articleId]
    }));
  };

  const toggleLike = (articleId) => {
    setLikedArticles(prev => {
      const newState = { ...prev, [articleId]: !prev[articleId] };
      setArticles(currentArticles => 
        currentArticles.map(article => 
          article.id === articleId 
            ? { ...article, likes: article.likes + (newState[articleId] ? 1 : -1) }
            : article
        )
      );
      return newState;
    });
  };

  const handleShare = async (articleId) => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 3000);
    } catch (err) {
      setError('Failed to copy link. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-gray-700">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg"
        >
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Expert Insights</h1>
            <div className="flex items-center space-x-2 text-blue-600">
              <BookOpen className="w-5 h-5" />
              <span className="text-sm font-medium">By Manova Therapists</span>
            </div>
          </div>

          {/* Categories */}
          <div className="flex space-x-4 mb-8 overflow-x-auto pb-2">
            {categories.map(category => (
              <motion.button
                key={category.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {category.name}
              </motion.button>
            ))}
          </div>

          {/* Share Toast */}
          <AnimatePresence>
            {showShareToast && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="fixed top-4 right-4 bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg flex items-center space-x-2"
              >
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <p className="text-green-600">Link copied to clipboard!</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Articles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((article, index) => (
              <motion.article
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all"
              >
                <div className="relative">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-48 object-cover"
                  />
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => toggleBookmark(article.id)}
                    className="absolute top-4 right-4 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors"
                  >
                    <Bookmark
                      className={`w-5 h-5 ${
                        isBookmarked[article.id] ? 'text-blue-600 fill-blue-600' : 'text-gray-600'
                      }`}
                    />
                  </motion.button>
                </div>
                <div className="p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <img
                      src={article.authorImage}
                      alt={article.author}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900">{article.author}</span>
                        <span className="text-xs text-gray-500">{article.authorRole}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="w-3 h-3 text-yellow-400" />
                        <span className="text-xs text-gray-500">{article.rating}</span>
                      </div>
                    </div>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{article.title}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{article.excerpt}</p>
                  
                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {article.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-blue-50 text-blue-600 rounded-full text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-500">{article.readTime}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <TrendingUp className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-500">{article.views} views</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => toggleLike(article.id)}
                        className={`flex items-center space-x-1 ${
                          likedArticles[article.id]
                            ? 'text-blue-600'
                            : 'text-gray-500 hover:text-blue-600'
                        }`}
                      >
                        <Heart className="w-4 h-4" />
                        <span>{article.likes}</span>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="flex items-center space-x-1 text-gray-500 hover:text-blue-600"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>{article.comments}</span>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleShare(article.id)}
                        className="text-gray-500 hover:text-blue-600"
                      >
                        <Share2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ArticlesPage; 