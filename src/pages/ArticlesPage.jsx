import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, User, Tag, Clock, ArrowRight, Plus, LogIn } from 'lucide-react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import AddArticle from '../components/AddArticle';

const ArticlesPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [articles, setArticles] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setIsLoading(true);
        const articlesRef = collection(db, 'articles');
        const q = query(articlesRef, orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        
        const fetchedArticles = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          // Convert Firestore timestamp to readable date
          date: doc.data().createdAt?.toDate().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }) || 'Recently'
        }));
        
        setArticles(fetchedArticles);
      } catch (err) {
        console.error('Error fetching articles:', err);
        // If no articles exist yet, show empty state
        setArticles([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticles();
  }, []);

  const categories = [
    { id: 'all', name: 'All Articles' },
    { id: 'wellness', name: 'Wellness' },
    { id: 'health', name: 'Health' },
    { id: 'career', name: 'Career' },
    { id: 'relationships', name: 'Relationships' }
  ];

  const filteredArticles = selectedCategory === 'all' 
    ? articles 
    : articles.filter(article => article.category.toLowerCase() === selectedCategory);

  const handleArticleAdded = () => {
    // Refetch articles when a new one is added
    const fetchArticles = async () => {
      try {
        const articlesRef = collection(db, 'articles');
        const q = query(articlesRef, orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        
        const fetchedArticles = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().createdAt?.toDate().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }) || 'Recently'
        }));
        
        setArticles(fetchedArticles);
      } catch (err) {
        console.error('Error refetching articles:', err);
      }
    };
    
    fetchArticles();
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Wellness': 'bg-green-100 text-green-800',
      'Health': 'bg-blue-100 text-blue-800',
      'Career': 'bg-purple-100 text-purple-800',
      'Relationships': 'bg-pink-100 text-pink-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-16 px-4 sm:px-8 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        </div>
      </div>
    );
  }

  const handlePostArticle = () => {
    if (currentUser) {
      setShowAddForm(true);
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 px-4 sm:px-8 lg:px-16">
        <div className="max-w-7xl mx-auto pt-8">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-8">
              <div className="flex-1 mb-6 lg:mb-0">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                  Mental Wellness Insights
                </h1>
                <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
                  Expert-curated articles to help you navigate your mental wellness journey with evidence-based insights and practical guidance.
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handlePostArticle}
                className={`flex items-center space-x-2 px-6 py-3 rounded-2xl font-semibold transition-all duration-300 shadow-lg ${
                  currentUser 
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white' 
                    : 'bg-white/70 backdrop-blur-sm border border-white/50 text-blue-600 hover:bg-white/80'
                }`}
              >
                {currentUser ? <Plus className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
                <span>{currentUser ? 'Post Article' : 'Login to Post'}</span>
              </motion.button>
            </div>
          </motion.div>

          {/* Category Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-wrap justify-center gap-4 mb-12"
          >
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-3 rounded-2xl font-semibold transition-all duration-300 backdrop-blur-sm ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-105'
                    : 'bg-white/70 border border-white/50 text-gray-700 hover:bg-white/80 hover:scale-105 shadow-md'
                }`}
              >
                {category.name}
              </button>
            ))}
          </motion.div>

          {/* Articles Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            <AnimatePresence>
              {filteredArticles.map((article, index) => (
                <motion.article
                  key={article.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -12, scale: 1.02, transition: { duration: 0.3 } }}
                  className="bg-white/70 backdrop-blur-sm border border-white/50 rounded-3xl shadow-lg hover:shadow-xl hover:bg-white/80 transition-all duration-300 overflow-hidden group cursor-pointer"
                  onClick={() => navigate(`/articles/${article.slug || article.id}`)}
                >
                  {/* Article Image */}
                  <div className="relative overflow-hidden">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>

                  {/* Article Content */}
                  <div className="p-6">
                    {/* Category Tag */}
                    <div className="flex items-center justify-between mb-3">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(article.category)}`}>
                        <Tag className="w-3 h-3 mr-1" />
                        {article.category}
                      </span>
                      <div className="flex items-center text-gray-500 text-sm">
                        <Clock className="w-4 h-4 mr-1" />
                        {article.readTime}
                      </div>
                    </div>

                    {/* Title */}
                    <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-indigo-600 transition-colors duration-300">
                      {article.title}
                    </h2>

                    {/* Excerpt */}
                    <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">
                      {article.excerpt}
                    </p>

                    {/* Article Meta */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-700">{article.author}</span>
                        </div>
                      </div>
                      <div className="flex items-center text-gray-500 text-sm">
                        <Calendar className="w-4 h-4 mr-1" />
                        {article.date}
                      </div>
                    </div>

                    {/* Read More Button */}
                    <div className="mt-4 flex items-center justify-end">
                      <div 
                        className="flex items-center text-blue-600 font-semibold text-sm group-hover:text-blue-700 transition-colors duration-300 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/articles/${article.slug || article.id}`);
                        }}
                      >
                        <span>Read More</span>
                        <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-300" />
                      </div>
                    </div>
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* Empty State */}
          {filteredArticles.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="text-gray-400 mb-4">
                <Tag className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No articles found</h3>
              <p className="text-gray-500">Try selecting a different category or check back later for new content.</p>
            </motion.div>
          )}
        </div>

        {/* Add Article Modal */}
        <AddArticle
          isOpen={showAddForm}
          onClose={() => setShowAddForm(false)}
          onArticleAdded={handleArticleAdded}
        />
      </div>
  );
};

export default ArticlesPage;