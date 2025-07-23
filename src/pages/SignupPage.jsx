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

const SignupPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    dateOfBirth: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await signup(formData.email, formData.password);
      navigate("/home");
    } catch (err) {
      setError("Failed to create account. Email may already be in use.");
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSignup = (provider) => {
    // Handle social signup logic here
    console.log(`Sign up with ${provider}`);
  };

  // Add CSS variables on component mount
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = cssVars;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Header Navigation */}
      <header className="w-full h-[67px] border-b border-[#D8D8D8] bg-white">
        <div className="max-w-[1440px] mx-auto px-4 h-full flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center lg:ml-[120px] ml-4">
            <img
              src="https://api.builder.io/api/v1/image/assets/TEMP/5ebf8fe158a56247114d04d0e248d741c275f54a?width=70"
              alt="Manova Logo"
              className="w-[35px] h-[35px] mr-3"
            />
            <span className="text-[20px] font-semibold text-black font-inter leading-normal">
              Manova
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-[50px]">
            <Link
              to="/"
              className="text-[16px] font-bold text-[#007CFF] font-inter"
            >
              Home
            </Link>
            <Link
              to="/about"
              className="text-[16px] font-bold text-black hover:text-[#007CFF] transition-colors font-inter"
            >
              About
            </Link>
            <Link
              to="/how-it-works"
              className="text-[16px] font-bold text-black hover:text-[#007CFF] transition-colors font-inter"
            >
              How it work
            </Link>
            <Link
              to="/community"
              className="text-[16px] font-bold text-black hover:text-[#007CFF] transition-colors font-inter"
            >
              Community
            </Link>
            <Link
              to="/support"
              className="text-[16px] font-bold text-black hover:text-[#007CFF] transition-colors font-inter"
            >
              Support
            </Link>
          </nav>

          {/* Login Button */}
          <div className="flex items-center lg:mr-[120px] mr-4">
            <Link
              to="/login"
              className="inline-flex px-4 py-2 bg-[#007CFF] text-white text-[16px] font-bold rounded-[24px] hover:bg-[#0066CC] transition-colors font-inter w-[79px] h-[35px] items-center justify-center"
            >
              Log in
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex">
        <div className="w-full max-w-[1440px] mx-auto relative min-h-[calc(100vh-67px)]">
          <div className="flex items-center w-full h-full">
            {/* Left Side - Illustration */}
            <div className="hidden lg:block absolute left-[120px] top-[169px] w-[580px] h-[593px]">
              <img
                src="https://api.builder.io/api/v1/image/assets/TEMP/b4cecfeada70c76f5b03d994e22b3b53bd2bcc0b?width=1160"
                alt="Manova App Illustration"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Right Side - Signup Form */}
            <div className="lg:absolute lg:right-[152px] lg:top-[138px] lg:w-[439px] lg:h-[607px] w-full max-w-md mx-auto lg:mx-0 px-4 lg:px-0 py-8 lg:py-0">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full h-full"
              >
                {/* Logo and Title */}
                <div className="flex justify-center items-center mb-[33px]">
                  <h1 className="text-[36px] font-bold text-[#007CFF] font-inter text-center leading-normal">
                    Manova
                  </h1>
                </div>

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

                {/* Signup Form */}
                <form onSubmit={handleSubmit} className="space-y-[23px]">
                  {/* Name Field */}
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      className="w-full h-[60px] px-4 py-4 border border-[#C5C5C5] rounded-[12px] bg-white focus:outline-none focus:ring-2 focus:ring-[#007CFF] focus:border-transparent text-[16px] font-inter text-[#777] placeholder-[#777]"
                      placeholder="Enter your name"
                      required
                    />
                  </div>

                  {/* Date of Birth Field */}
                  <div className="relative">
                    <input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) =>
                        handleInputChange("dateOfBirth", e.target.value)
                      }
                      className="w-full h-[60px] px-4 py-4 border border-[#C5C5C5] rounded-[12px] bg-white focus:outline-none focus:ring-2 focus:ring-[#007CFF] focus:border-transparent text-[16px] font-inter text-[#777] placeholder-[#777]"
                      placeholder="Date of birth"
                      required
                    />
                  </div>

                  {/* Email Field */}
                  <div className="relative">
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      className="w-full h-[60px] px-4 py-4 border border-[#C5C5C5] rounded-[12px] bg-white focus:outline-none focus:ring-2 focus:ring-[#007CFF] focus:border-transparent text-[16px] font-inter text-[#777] placeholder-[#777]"
                      placeholder="Enter your email address"
                      required
                    />
                  </div>

                  {/* Password Field */}
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) =>
                        handleInputChange("password", e.target.value)
                      }
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

                  {/* Confirm Password Field */}
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        handleInputChange("confirmPassword", e.target.value)
                      }
                      className="w-full h-[60px] px-4 py-4 border border-[#C5C5C5] rounded-[12px] bg-white focus:outline-none focus:ring-2 focus:ring-[#007CFF] focus:border-transparent text-[16px] font-inter text-[#777] placeholder-[#777] pr-12"
                      placeholder="Confirm Password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  {/* Sign Up Button */}
                  <div className="mt-[25px]">
                    <motion.button
                      type="submit"
                      disabled={
                        loading ||
                        formData.password !== formData.confirmPassword
                      }
                      className="w-[208px] h-[50px] mx-auto block bg-[#007CFF] hover:bg-[#0066CC] text-white font-bold text-[16px] font-inter rounded-[24px] transition-colors duration-300 shadow-[0px_4px_20px_0px_rgba(0,0,0,0.25)] disabled:opacity-50 disabled:cursor-not-allowed"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {loading ? (
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Creating account...</span>
                        </div>
                      ) : (
                        "Sign up"
                      )}
                    </motion.button>
                  </div>
                </form>

                {/* Divider */}
                <div className="relative mt-[25px] mb-[20px]">
                  <svg
                    className="w-full max-w-[423px] h-[2px] mx-auto"
                    viewBox="0 0 423 2"
                    fill="none"
                  >
                    <path
                      d="M0.0288086 0.763428H105.704H158.541H200.423M422.728 0.763428H317.053H264.216H221.73"
                      stroke="#C5C5C5"
                    />
                  </svg>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <span className="bg-white px-2 text-[12px] text-[#777] font-inter font-medium">
                      OR
                    </span>
                  </div>
                </div>

                {/* Social Signup Buttons */}
                <div className="flex justify-center space-x-[37.5px] mt-[20px]">
                  {/* Google */}
                  <motion.button
                    onClick={() => handleSocialSignup("google")}
                    className="w-[45px] h-[45px] rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg className="w-6 h-6" viewBox="0 0 24 24">
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
                  </motion.button>

                  {/* Facebook */}
                  <motion.button
                    onClick={() => handleSocialSignup("facebook")}
                    className="w-[45px] h-[45px] rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg className="w-6 h-6" fill="#1877F2" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </motion.button>

                  {/* X/Twitter */}
                  <motion.button
                    onClick={() => handleSocialSignup("twitter")}
                    className="w-[45px] h-[45px] rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg className="w-5 h-5" fill="#000000" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </motion.button>
                </div>

                {/* Sign In Link */}
                <div className="text-center mt-8">
                  <p className="text-base text-gray-600">
                    Already have an account?{" "}
                    <Link
                      to="/login"
                      className="text-[#007CFF] hover:text-[#0066CC] font-semibold transition-colors"
                    >
                      Sign in
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

export default SignupPage;
