import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, User, Tag, Clock, ArrowRight } from 'lucide-react';
// Navbar is now handled globally in App.jsx

const ArticlesPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setIsLoading(true);
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const fetchedArticles = [
          {
            id: 1,
            title: 'Understanding and Managing Anxiety in Daily Life',
            category: 'Wellness',
            author: 'Dr. Sarah Chen',
            date: 'March 15, 2024',
            readTime: '5 min read',
            excerpt: 'Practical strategies for managing anxiety in your daily routine, backed by clinical research and real-world applications.',
            image: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
          },
          {
            id: 2,
            title: 'The Science of Better Sleep: Evidence-Based Techniques',
            category: 'Health',
            author: 'Dr. Michael Rodriguez',
            date: 'March 14, 2024',
            readTime: '7 min read',
            excerpt: 'Discover the latest research on sleep hygiene, circadian rhythms, and practical tips for achieving better sleep quality.',
            image: 'https://images.unsplash.com/photo-1511295742362-92c96b1cf484?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
          },
          {
            id: 3,
            title: 'Building Healthy Relationships in the Modern World',
            category: 'Relationships',
            author: 'Dr. Emily Thompson',
            date: 'March 13, 2024',
            readTime: '6 min read',
            excerpt: 'Expert advice on nurturing meaningful connections and maintaining healthy boundaries in personal and professional relationships.',
            image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
          },
          {
            id: 4,
            title: 'Mindfulness at Work: Reducing Stress and Increasing Focus',
            category: 'Career',
            author: 'Dr. James Wilson',
            date: 'March 12, 2024',
            readTime: '8 min read',
            excerpt: 'Learn how to integrate mindfulness practices into your work routine to reduce stress and enhance productivity.',
            image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
          },
          {
            id: 5,
            title: 'Overcoming Perfectionism: A Path to Self-Compassion',
            category: 'Wellness',
            author: 'Dr. Lisa Park',
            date: 'March 11, 2024',
            readTime: '5 min read',
            excerpt: 'Understanding the roots of perfectionism and developing healthier ways to achieve your goals without burning out.',
            image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
          },
          {
            id: 6,
            title: 'Digital Wellness: Managing Technology for Mental Health',
            category: 'Health',
            author: 'Dr. Alex Kumar',
            date: 'March 10, 2024',
            readTime: '6 min read',
            excerpt: 'Practical strategies for creating a healthy relationship with technology and social media in our digital age.',
            image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
          }
        ];
        
        setArticles(fetchedArticles);
      } catch (err) {
        console.error('Error fetching articles:', err);
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
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 py-16 px-4 sm:px-8 lg:px-16">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-center h-96">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4 sm:px-8 lg:px-16">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Explore Mental Wellness Insights
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              Expert-curated articles to help you navigate your mental wellness journey with evidence-based insights and practical guidance.
            </p>
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
                className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                  selectedCategory === category.id
                    ? 'bg-indigo-600 text-white shadow-lg transform scale-105'
                    : 'bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-900 shadow-sm'
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
                  whileHover={{ y: -8, transition: { duration: 0.3 } }}
                  className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer"
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
                      <div className="flex items-center text-indigo-600 font-medium text-sm group-hover:text-indigo-700 transition-colors duration-300">
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
      </div>
  );
};

export default ArticlesPage;