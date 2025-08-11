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
  Plus,
  LogIn,
} from 'lucide-react';
import { collection, getDocs, addDoc, orderBy, query, serverTimestamp, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

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
  const [showAddForm, setShowAddForm] = useState(false);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Fetch posts from Firestore
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setIsLoading(true);
        const postsRef = collection(db, 'community_posts');
        const q = query(postsRef, orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        
        const fetchedPosts = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            timeAgo: data.createdAt?.toDate() ? getTimeAgo(data.createdAt.toDate()) : 'Recently',
            comments: data.comments || []
          };
        });
        
        setPosts(fetchedPosts);
        setError(null);
      } catch (err) {
        console.error('Error fetching posts:', err);
        setError('Failed to load posts. Please try again later.');
        setPosts([]); // Show empty state if no posts exist yet
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // Helper function to calculate time ago
  const getTimeAgo = (date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString();
  };

  const categories = [
    { id: 'all', name: 'All Discussions' },
    { id: 'questions', name: 'Questions' },
    { id: 'experiences', name: 'Experiences' },
    { id: 'advice', name: 'Advice' },
  ];

  const handlePost = async (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;
    if (!currentUser) {
      setError('You must be logged in to post.');
      return;
    }

    try {
      const postData = {
        author: currentUser.displayName || currentUser.email,
        authorId: currentUser.uid,
        avatar: '👤',
        role: 'Member',
        content: newPost,
        likes: 0,
        comments: [],
        category: 'questions',
        tags: ['Discussion'],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'community_posts'), postData);
      
      // Add the new post to local state with generated ID
      const newPostObj = {
        id: docRef.id,
        ...postData,
        timeAgo: 'Just now',
        createdAt: new Date() // For immediate display
      };

      setPosts(prev => [newPostObj, ...prev]);
      setNewPost('');
      setShowPostForm(false);
    } catch (err) {
      console.error('Error creating post:', err);
      setError('Failed to create post. Please try again.');
    }
  };

  const handleComment = async (postId) => {
    if (!newComment[postId]?.trim()) return;
    if (!currentUser) {
      setError('You must be logged in to comment.');
      return;
    }

    try {
      const comment = {
        id: Date.now().toString(),
        author: currentUser.displayName || currentUser.email,
        authorId: currentUser.uid,
        role: 'Member',
        content: newComment[postId],
        timestamp: 'Just now',
        likes: 0,
        createdAt: new Date()
      };

      // Update Firestore document
      const postRef = doc(db, 'community_posts', postId);
      await updateDoc(postRef, {
        comments: arrayUnion(comment),
        updatedAt: serverTimestamp()
      });

      // Update local state
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
      console.error('Error adding comment:', err);
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

  const handleShareThought = () => {
    if (currentUser) {
      setShowPostForm(true);
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 py-12">
      <div className="w-full px-4 sm:px-8 lg:px-16">
        <div className="max-w-[1440px] mx-auto w-full flex justify-center">
          <div className="w-full max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/70 backdrop-blur-sm border border-white/50 rounded-3xl p-8 shadow-xl"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8">
            <div className="mb-4 lg:mb-0">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Community</h1>
              <div className="flex items-center space-x-2 text-blue-600">
                <Shield className="w-5 h-5" />
                <span className="text-sm font-semibold">Safe Space for Everyone</span>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleShareThought}
              className={`flex items-center space-x-2 px-6 py-3 rounded-2xl font-semibold transition-all duration-300 shadow-lg ${
                currentUser 
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white' 
                  : 'bg-white/70 backdrop-blur-sm border border-white/50 text-blue-600 hover:bg-white/80'
              }`}
            >
              {currentUser ? <Plus className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
              <span>{currentUser ? 'Share Thought' : 'Login to Share'}</span>
            </motion.button>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {categories.map((category) => (
              <motion.button
                key={category.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-3 rounded-2xl font-semibold transition-all duration-300 backdrop-blur-sm ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                    : 'bg-white/60 border border-white/50 text-gray-700 hover:bg-white/80 hover:scale-105 shadow-md'
                }`}
              >
                {category.name}
              </motion.button>
            ))}
          </div>

          {/* New Post Form */}
          <AnimatePresence>
            {showPostForm && currentUser ? (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handlePost}
                className="mb-8"
              >
                <div className="bg-white/60 backdrop-blur-sm border border-white/50 rounded-2xl p-6 shadow-lg">
                  <textarea
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    placeholder="Share your thoughts or ask a question..."
                    className="w-full h-24 p-4 border-0 focus:ring-0 resize-none bg-transparent placeholder-gray-500 text-gray-800"
                  />
                  <div className="flex justify-between items-center mt-4">
                    <div className="flex space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-white/50"
                      >
                        <TrendingUp className="w-5 h-5" />
                      </motion.button>
                    </div>
                    <div className="flex space-x-3">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        onClick={() => setShowPostForm(false)}
                        className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium"
                      >
                        Cancel
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="submit"
                        className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-2 rounded-2xl font-semibold transition-all duration-300 shadow-md"
                      >
                        Share
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.form>
            ) : currentUser ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowPostForm(true)}
                className="w-full mb-8 p-6 bg-white/60 backdrop-blur-sm border border-white/50 rounded-2xl shadow-lg text-left text-gray-500 hover:text-gray-700 hover:bg-white/70 transition-all duration-300"
              >
                Share your thoughts or ask a question...
              </motion.button>
            ) : (
              <div className="w-full mb-8 p-6 bg-white/40 backdrop-blur-sm border border-white/50 rounded-2xl shadow-md text-center">
                <p className="text-gray-700 mb-2 font-semibold">Join our community discussions</p>
                <p className="text-gray-600">Please log in to share your thoughts or ask questions</p>
              </div>
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
                className="bg-white/60 backdrop-blur-sm border border-white/50 rounded-2xl p-6 shadow-lg hover:bg-white/70 transition-all duration-300"
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
                          className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs"
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
                            className="bg-white/40 backdrop-blur-sm border border-white/30 rounded-2xl p-4"
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
                          className="w-full p-4 bg-white/50 backdrop-blur-sm border border-white/40 rounded-2xl focus:ring-2 focus:ring-blue-400 focus:border-transparent resize-none"
                          rows="3"
                        />
                        <div className="flex justify-end space-x-3 mt-3">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowCommentForm(null)}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                          >
                            Cancel
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleComment(post.id)}
                            className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-2xl font-semibold transition-all duration-300 shadow-md"
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
      </div>
    </div>
  );
};

export default CommunityPage; 