import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle,
  Heart,
  Share2,
  Send,
  User,
  Shield,
  Star,
  Bookmark,
  TrendingUp,
  ThumbsUp,
  Flag,
  AlertCircle,
} from 'lucide-react';

const CommunityPage = () => {
  const [newPost, setNewPost] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isBookmarked, setIsBookmarked] = useState({});
  const [showPostForm, setShowPostForm] = useState(false);
  const [posts, setPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState({});
  const [likedComments, setLikedComments] = useState({});
  const [newComment, setNewComment] = useState({});
  const [showCommentForm, setShowCommentForm] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Simulated API call to fetch posts
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setIsLoading(true);
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // This would be replaced with actual API call
        const fetchedPosts = [
          {
            id: 1,
            author: 'Sarah M.',
            avatar: '👩',
            role: 'Member',
            content: 'I\'ve been feeling anxious about my upcoming presentation. Any tips for managing presentation anxiety?',
            likes: 45,
            comments: [
              {
                id: 1,
                author: 'Dr. Chen',
                role: 'Therapist',
                content: 'Try practicing deep breathing exercises before your presentation. Also, remember that some anxiety is normal and can actually enhance your performance.',
                timestamp: '1h ago',
                likes: 12,
              },
              {
                id: 2,
                author: 'Michael R.',
                role: 'Member',
                content: 'I find that practicing in front of a mirror helps me build confidence. Also, recording yourself and watching it back can be very helpful!',
                timestamp: '45m ago',
                likes: 8,
              }
            ],
            timeAgo: '2h',
            category: 'questions',
            tags: ['Anxiety', 'Public Speaking', 'Self-Help']
          },
          {
            id: 2,
            author: 'James K.',
            avatar: '👨',
            role: 'Member',
            content: 'Sharing my experience with meditation: Started with just 2 minutes a day and gradually increased. The difference in my stress levels is remarkable!',
            likes: 23,
            comments: [
              {
                id: 3,
                author: 'Dr. Thompson',
                role: 'Therapist',
                content: 'That\'s wonderful progress! Consistency is key with meditation. Would you like to share what specific techniques you found most helpful?',
                timestamp: '2h ago',
                likes: 15,
              }
            ],
            timeAgo: '4h',
            category: 'experiences',
            tags: ['Meditation', 'Stress Relief', 'Personal Growth']
          },
          {
            id: 3,
            author: 'Dr. Thompson',
            avatar: '👩‍⚕️',
            role: 'Therapist',
            content: 'Quick tip: When feeling overwhelmed, try the 5-4-3-2-1 grounding technique. Name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, and 1 you can taste.',
            likes: 67,
            comments: [],
            timeAgo: '6h',
            category: 'advice',
            tags: ['Grounding', 'Anxiety Management', 'Self-Care']
          },
        ];
        
        setPosts(fetchedPosts);
        setError(null);
      } catch (err) {
        setError('Failed to load posts. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const categories = [
    { id: 'all', name: 'All Discussions' },
    { id: 'questions', name: 'Questions' },
    { id: 'experiences', name: 'Experiences' },
    { id: 'advice', name: 'Advice' },
  ];

  const handlePost = async (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    try {
      // This would be replaced with actual API call
      const newPostObj = {
        id: Date.now(),
        author: 'You',
        avatar: '👤',
        role: 'Member',
        content: newPost,
        likes: 0,
        comments: [],
        timeAgo: 'Just now',
        category: 'questions',
        tags: ['New Post']
      };

      setPosts(prev => [newPostObj, ...prev]);
      setNewPost('');
      setShowPostForm(false);
    } catch (err) {
      setError('Failed to create post. Please try again.');
    }
  };

  const handleComment = async (postId) => {
    if (!newComment[postId]?.trim()) return;

    try {
      // This would be replaced with actual API call
      const comment = {
        id: Date.now(),
        author: 'You',
        role: 'Member',
        content: newComment[postId],
        timestamp: 'Just now',
        likes: 0
      };

      setPosts(prev => prev.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            comments: [...post.comments, comment]
          };
        }
        return post;
      }));

      setNewComment(prev => ({ ...prev, [postId]: '' }));
      setShowCommentForm(null);
    } catch (err) {
      setError('Failed to add comment. Please try again.');
    }
  };

  const toggleLike = (postId) => {
    setLikedPosts(prev => {
      const newState = { ...prev, [postId]: !prev[postId] };
      setPosts(currentPosts => 
        currentPosts.map(post => 
          post.id === postId 
            ? { ...post, likes: post.likes + (newState[postId] ? 1 : -1) }
            : post
        )
      );
      return newState;
    });
  };

  const toggleCommentLike = (postId, commentId) => {
    setLikedComments(prev => {
      const newState = { ...prev, [`${postId}-${commentId}`]: !prev[`${postId}-${commentId}`] };
      setPosts(currentPosts => 
        currentPosts.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              comments: post.comments.map(comment =>
                comment.id === commentId
                  ? { ...comment, likes: comment.likes + (newState[`${postId}-${commentId}`] ? 1 : -1) }
                  : comment
              )
            };
          }
          return post;
        })
      );
      return newState;
    });
  };

  const toggleBookmark = (postId) => {
    setIsBookmarked(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  const filteredPosts = selectedCategory === 'all'
    ? posts
    : posts.filter((post) => post.category === selectedCategory);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
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
        <div className="max-w-2xl mx-auto">
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
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg"
        >
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Community</h1>
            <div className="flex items-center space-x-2 text-blue-600">
              <Shield className="w-5 h-5" />
              <span className="text-sm font-medium">Safe Space</span>
            </div>
          </div>

          {/* Categories */}
          <div className="flex space-x-4 mb-8 overflow-x-auto pb-2">
            {categories.map((category) => (
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

          {/* New Post Form */}
          <AnimatePresence>
            {showPostForm ? (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handlePost}
                className="mb-8"
              >
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <textarea
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    placeholder="Share your thoughts or ask a question..."
                    className="w-full h-24 p-2 border-0 focus:ring-0 resize-none"
                  />
                  <div className="flex justify-between items-center mt-2">
                    <div className="flex space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        className="p-2 text-gray-500 hover:text-blue-600"
                      >
                        <TrendingUp className="w-5 h-5" />
                      </motion.button>
                    </div>
                    <div className="flex space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        onClick={() => setShowPostForm(false)}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800"
                      >
                        Cancel
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="submit"
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                      >
                        Post
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.form>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowPostForm(true)}
                className="w-full mb-8 p-4 bg-white rounded-xl shadow-sm text-left text-gray-500 hover:text-gray-700 transition-colors"
              >
                Share your thoughts or ask a question...
              </motion.button>
            )}
          </AnimatePresence>

          {/* Posts Feed */}
          <div className="space-y-6">
            {filteredPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl p-4 shadow-sm"
              >
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xl">
                    {post.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {post.author}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">
                            {post.role}
                          </span>
                          {post.role === 'Therapist' && (
                            <div className="flex items-center space-x-1">
                              <Star className="w-3 h-3 text-yellow-400" />
                              <span className="text-xs text-gray-500">
                                Verified
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => toggleBookmark(post.id)}
                          className="text-gray-400 hover:text-blue-600"
                        >
                          <Bookmark
                            className={`w-4 h-4 ${
                              isBookmarked[post.id] ? 'fill-blue-600 text-blue-600' : ''
                            }`}
                          />
                        </motion.button>
                        <span className="text-sm text-gray-500">
                          {post.timeAgo}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-700 mt-2">{post.content}</p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {post.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-blue-50 text-blue-600 rounded-full text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Comments */}
                    {post.comments.length > 0 && (
                      <div className="mt-4 space-y-3">
                        {post.comments.map((comment, idx) => (
                          <motion.div
                            key={`comment-${post.id}-${comment.id}`}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-gray-50 rounded-lg p-3"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center space-x-2">
                                <span className="font-medium text-gray-900">
                                  {comment.author}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {comment.role}
                                </span>
                                {comment.role === 'Therapist' && (
                                  <Star className="w-3 h-3 text-yellow-400" />
                                )}
                              </div>
                              <span className="text-xs text-gray-400">
                                {comment.timestamp}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">
                              {comment.content}
                            </p>
                            <div className="flex items-center space-x-4 mt-2">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => toggleCommentLike(post.id, comment.id)}
                                className={`flex items-center space-x-1 ${
                                  likedComments[`${post.id}-${comment.id}`]
                                    ? 'text-blue-600'
                                    : 'text-gray-500 hover:text-blue-600'
                                }`}
                              >
                                <ThumbsUp className="w-4 h-4" />
                                <span className="text-xs">{comment.likes}</span>
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="text-gray-500 hover:text-blue-600"
                              >
                                <Flag className="w-4 h-4" />
                              </motion.button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}

                    {/* Comment Form */}
                    {showCommentForm === post.id ? (
                      <div className="mt-4">
                        <textarea
                          value={newComment[post.id] || ''}
                          onChange={(e) => setNewComment(prev => ({ ...prev, [post.id]: e.target.value }))}
                          placeholder="Write a comment..."
                          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <div className="flex justify-end space-x-2 mt-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowCommentForm(null)}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800"
                          >
                            Cancel
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleComment(post.id)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Comment
                          </motion.button>
                        </div>
                      </div>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowCommentForm(post.id)}
                        className="mt-4 text-sm text-blue-600 hover:text-blue-700"
                      >
                        Add a comment...
                      </motion.button>
                    )}

                    <div className="flex items-center space-x-4 mt-3">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => toggleLike(post.id)}
                        className={`flex items-center space-x-1 ${
                          likedPosts[post.id]
                            ? 'text-blue-600'
                            : 'text-gray-500 hover:text-blue-600'
                        }`}
                      >
                        <Heart className="w-4 h-4" />
                        <span className="text-sm">{post.likes}</span>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setShowCommentForm(post.id)}
                        className="flex items-center space-x-1 text-gray-500 hover:text-blue-600"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span className="text-sm">{post.comments.length}</span>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                          navigator.clipboard.writeText(window.location.href);
                          // Show a toast notification here
                        }}
                        className="text-gray-500 hover:text-blue-600"
                      >
                        <Share2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CommunityPage; 