import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const AuthModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="backdrop-blur-lg bg-white/80 dark:bg-gray-800/80 rounded-2xl p-8 max-w-md w-full shadow-xl border border-white/20 dark:border-gray-700/50"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">
            Welcome to Manova
          </h2>
          <div className="space-y-4">
            <Link
              to="/signup"
              className="block w-full py-3 px-4 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-center font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl"
              onClick={onClose}
            >
              Create Account
            </Link>
            <Link
              to="/login"
              className="block w-full py-3 px-4 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-center font-medium hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-300 backdrop-blur-sm"
              onClick={onClose}
            >
              Already a Member? Login
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AuthModal; 