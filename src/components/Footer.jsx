import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="w-full bg-[#101828] py-16">
      <div className="w-full max-w-[1440px] mx-auto px-4">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-16">
          {/* Brand Section */}
          <div className="mb-8 lg:mb-0">
            <div className="flex items-center mb-6">
              <img
                src="/logo/manova-logo.png"
                alt="Manova Logo"
                className="w-[35px] h-[35px] mr-3 object-contain"
              />
              <span className="text-[20px] font-bold font-inter text-white">
                Manova
              </span>
            </div>
            <p className="text-[16px] font-normal font-inter text-white leading-5 max-w-[827px]">
              Empowering mental wellness through AI-driven insights and
              compassionate support. Your journey to better mental health
              starts here.
            </p>
          </div>
          {/* Connect Section */}
          <div className="text-center lg:text-right">
            <h3 className="text-[16px] font-bold font-inter text-white mb-4">
              Connect with Us
            </h3>
          </div>
        </div>
        
        {/* Divider */}
        <div className="w-full h-px bg-[#B3B2B2] mb-16"></div>
        
        {/* Links Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {/* Product Column */}
          <div>
            <h4 className="text-[16px] font-bold font-inter text-white mb-6">
              Product
            </h4>
            <ul className="space-y-4">
              <li>
                <Link
                  to="/how-it-works"
                  className="text-[14px] font-normal font-inter text-[#B3B2B2] hover:text-white transition-colors"
                >
                  How It Works
                </Link>
              </li>
              <li>
                <Link
                  to="/dashboard"
                  className="text-[14px] font-normal font-inter text-[#B3B2B2] hover:text-white transition-colors"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  to="/community"
                  className="text-[14px] font-normal font-inter text-[#B3B2B2] hover:text-white transition-colors"
                >
                  Community
                </Link>
              </li>
              <li>
                <Link
                  to="/therapist-booking"
                  className="text-[14px] font-normal font-inter text-[#B3B2B2] hover:text-white transition-colors"
                >
                  Therapist Booking
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Support Column */}
          <div>
            <h4 className="text-[16px] font-bold font-inter text-white mb-6">
              Support
            </h4>
            <ul className="space-y-4">
              <li>
                <Link
                  to="/support"
                  className="text-[14px] font-normal font-inter text-[#B3B2B2] hover:text-white transition-colors"
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="text-[14px] font-normal font-inter text-[#B3B2B2] hover:text-white transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-[14px] font-normal font-inter text-[#B3B2B2] hover:text-white transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <a
                  href="mailto:support@manova.life"
                  className="text-[14px] font-normal font-inter text-[#B3B2B2] hover:text-white transition-colors"
                >
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
          
          {/* Company Column */}
          <div>
            <h4 className="text-[16px] font-bold font-inter text-white mb-6">
              Company
            </h4>
            <ul className="space-y-4">
              <li>
                <Link
                  to="/about"
                  className="text-[14px] font-normal font-inter text-[#B3B2B2] hover:text-white transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/articles"
                  className="text-[14px] font-normal font-inter text-[#B3B2B2] hover:text-white transition-colors"
                >
                  Articles
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Resources Column */}
          <div>
            <h4 className="text-[16px] font-bold font-inter text-white mb-6">
              Resources
            </h4>
            <ul className="space-y-4">
              <li>
                <Link
                  to="/survey"
                  className="text-[14px] font-normal font-inter text-[#B3B2B2] hover:text-white transition-colors"
                >
                  Wellness Check-in
                </Link>
              </li>
              <li>
                <Link
                  to="/accessibility"
                  className="text-[14px] font-normal font-inter text-[#B3B2B2] hover:text-white transition-colors"
                >
                  Accessibility
                </Link>
              </li>
              <li>
                <a
                  href="tel:1800-599-0019"
                  className="text-[14px] font-normal font-inter text-[#B3B2B2] hover:text-white transition-colors"
                >
                  Crisis Support (KIRAN 1800-599-0019)
                </a>
              </li>
              <li>
                <Link
                  to="/cookies"
                  className="text-[14px] font-normal font-inter text-[#B3B2B2] hover:text-white transition-colors"
                >
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Bottom Section */}
        <div className="border-t border-[#B3B2B2] pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-[14px] font-normal font-inter text-[#B3B2B2]">
              © {new Date().getFullYear()} Manova. All rights reserved.
            </div>
            <div className="text-[14px] font-normal font-inter text-[#B3B2B2]">
              Made with ❤️ for mental wellness
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;