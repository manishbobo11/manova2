import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import { Eye, EyeOff } from "lucide-react";

// CSS variables for exact Figma colors
const cssVars = `
  :root {
    --primary-blue: #007CFF;
    --primary-blue-hover: #0066CC;
    --border-gray: #C5C5C5;
    --text-gray: #777;
    --border-light: #D8D8D8;
  }
`;

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError("");
      setLoading(true);
      await login(email, password);
      navigate("/home");
    } catch (error) {
      setError("Failed to sign in. Please check your credentials.");
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider) => {
    if (provider === 'google') {
      try {
        setError("");
        setLoading(true);
        await signInWithGoogle();
        navigate("/home");
      } catch (error) {
        setError("Failed to sign in with Google. Please try again.");
        console.error("Google login error:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  // Add CSS variables on component mount
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = cssVars;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-white relative overflow-hidden">
      {/* Animated Background Particles */}
      <motion.div
        className="w-2 h-2 bg-blue-300 rounded-full absolute top-10 left-10 opacity-60"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <motion.div
        className="w-1 h-1 bg-purple-300 rounded-full absolute top-20 right-20 opacity-60"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
      />
      <motion.div
        className="w-1.5 h-1.5 bg-indigo-300 rounded-full absolute bottom-20 left-20 opacity-60"
        animate={{ y: [0, 12, 0] }}
        transition={{ duration: 3, repeat: Infinity, delay: 1 }}
      />
      <motion.div
        className="w-1 h-1 bg-blue-200 rounded-full absolute bottom-10 right-10 opacity-60"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 2.2, repeat: Infinity, delay: 1.5 }}
      />

      {/* Main Content */}
      <div className="flex-1 flex">
        <div className="w-full max-w-[1440px] mx-auto relative min-h-screen">
          <div className="flex items-center w-full h-full">
            {/* Left Side - Animated Logo Section */}
            <motion.div 
              className="hidden lg:block absolute left-[120px] top-[80px] w-[680px] h-[680px]"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="relative w-full h-full flex items-center justify-center">
                {/* Background gradient circle */}
                <motion.div
                  className="absolute inset-8 bg-gradient-to-br from-blue-100 via-purple-50 to-blue-50 rounded-full opacity-60"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 0.6 }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                />

                {/* Floating decorative dots */}
                <motion.div
                  className="absolute top-20 left-16 w-4 h-4 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full shadow-lg opacity-70"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 0.7 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                />
                <motion.div
                  className="absolute top-32 right-20 w-3 h-3 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full shadow-lg opacity-60"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 0.6 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                />
                <motion.div
                  className="absolute bottom-32 left-20 w-5 h-5 bg-gradient-to-r from-green-400 to-blue-500 rounded-full shadow-lg opacity-80"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 0.8 }}
                  transition={{ duration: 0.8, delay: 0.7 }}
                />
                <motion.div
                  className="absolute bottom-24 right-16 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full shadow-lg opacity-70"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 0.7 }}
                  transition={{ duration: 0.8, delay: 0.9 }}
                />

                {/* Main Manova Logo */}
                <motion.div
                  className="absolute inset-0 flex justify-center items-center"
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                >
                  <div className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_0_40px_rgba(173,216,230,0.4)] w-48 sm:w-64 md:w-80 flex items-center justify-center">
                    <img
                      src="/logo/manova-logo.png"
                      alt="Manova"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </motion.div>

                {/* Floating Feature Tags */}
                {[
                  { text: "Secure", color: "from-green-400 to-emerald-500", delay: 0.2 },
                  { text: "Trusted", color: "from-blue-400 to-blue-600", delay: 0.4 },
                  { text: "AI-Powered", color: "from-purple-400 to-purple-600", delay: 0.6 },
                  { text: "24/7 Support", color: "from-orange-400 to-orange-600", delay: 0.8 }
                ].map((tag, index) => (
                  <motion.div
                    key={tag.text}
                    className={`absolute px-5 py-3 rounded-full bg-gradient-to-r ${tag.color} text-white text-base font-semibold shadow-lg backdrop-blur-sm`}
                    style={{
                      top: `${20 + index * 15}%`,
                      left: index % 2 === 0 ? "10%" : "70%",
                    }}
                    initial={{
                      scale: 0,
                      opacity: 0,
                      y: 20,
                      x: index % 2 === 0 ? -20 : 20,
                    }}
                    animate={{
                      scale: 1,
                      opacity: 1,
                      y: 0,
                      x: 0,
                    }}
                    transition={{
                      duration: 0.8,
                      delay: tag.delay,
                      ease: "easeOut",
                    }}
                    whileHover={{
                      scale: 1.1,
                      y: -5,
                    }}
                  >
                    {tag.text}
                  </motion.div>
                ))}

                {/* Additional floating elements */}
                <motion.div
                  className="absolute top-1/4 right-1/4 w-2 h-2 bg-gradient-to-r from-pink-400 to-red-500 rounded-full opacity-60"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 0.6 }}
                  transition={{ duration: 0.6, delay: 1.1 }}
                />
                <motion.div
                  className="absolute bottom-1/3 left-1/3 w-3 h-3 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full opacity-70"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 0.7 }}
                  transition={{ duration: 0.6, delay: 1.3 }}
                />
              </div>
            </motion.div>

            {/* Right Side - Login Form */}
            <div className="lg:absolute lg:right-[149px] lg:top-[219px] lg:w-[439px] lg:h-[389px] w-full max-w-md mx-auto lg:mx-0 px-4 lg:px-0 py-8 lg:py-0">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full h-full"
              >
                {/* Animated Logo and Title */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="flex justify-center items-center mb-6"
                >
                  <h1 className="text-5xl italic font-script text-[#1e3a8a] text-center">
                    Manova
                  </h1>
                </motion.div>

                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 mb-6"
                  >
                    {error}
                  </motion.div>
                )}

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="space-y-[23px]">
                  {/* Email Field */}
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-[60px] px-4 py-4 border border-[#C5C5C5] rounded-[12px] bg-white focus:outline-none focus:ring-2 focus:ring-[#007CFF] focus:border-transparent text-[16px] font-inter text-[#777] placeholder-[#777]"
                      placeholder="Enter your email address"
                      required
                    />
                  </div>

                  {/* Password Field */}
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full h-[60px] px-4 py-4 border border-[#C5C5C5] rounded-[12px] bg-white focus:outline-none focus:ring-2 focus:ring-[#007CFF] focus:border-transparent text-[16px] font-inter text-[#777] placeholder-[#777] pr-12"
                      placeholder="Enter your Password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  {/* Login Button */}
                  <div className="mt-[48px]">
                    <motion.button
                      type="submit"
                      disabled={loading}
                      className="w-[208px] h-[50px] mx-auto block bg-[#007CFF] hover:bg-[#0066CC] text-white font-bold text-[16px] font-inter rounded-[24px] transition-colors duration-300 shadow-[0px_4px_10px_0px_rgba(0,0,0,0.25)] disabled:opacity-50 disabled:cursor-not-allowed"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {loading ? (
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Logging in...</span>
                        </div>
                      ) : (
                        "Log in"
                      )}
                    </motion.button>
                  </div>
                </form>

                {/* Divider */}
                <div className="relative mt-[47px] mb-[20px]">
                  <svg
                    className="w-full max-w-[424px] h-[2px] mx-auto"
                    viewBox="0 0 424 2"
                    fill="none"
                  >
                    <path
                      d="M0.603516 1.09998H106.278H159.116H185.534H198.744M423.303 1.09998H317.628H264.791H238.372H220.714"
                      stroke="#C5C5C5"
                    />
                  </svg>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <span className="bg-white px-2 text-[12px] text-[#777] font-inter font-medium">
                      OR
                    </span>
                  </div>
                </div>

                {/* Google Sign In Button */}
                <div className="flex justify-center mt-[20px]">
                  <motion.button
                    onClick={() => handleSocialLogin("google")}
                    className="flex items-center justify-center gap-3 w-full max-w-[280px] h-[50px] bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    <span className="text-gray-700 font-medium">Sign in with Google</span>
                  </motion.button>
                </div>

                {/* Sign Up Link */}
                <div className="text-center mt-8">
                  <p className="text-base text-gray-600">
                    Don't have an account?{" "}
                    <Link
                      to="/signup"
                      className="text-[#007CFF] hover:text-[#0066CC] font-semibold transition-colors"
                    >
                      Sign up
                    </Link>
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
