import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="w-full bg-white/80 backdrop-blur-md shadow-inner py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center text-gray-500 text-sm">
        <div className="text-gray-600 text-base font-medium">
          © {new Date().getFullYear()} Manova
        </div>
        <div className="flex space-x-6 text-gray-600 text-base font-medium">
          <Link to="/about" className="hover:text-blue-600 transition-colors">About</Link>
          <Link to="/contact" className="hover:text-blue-600 transition-colors">Contact</Link>
          <Link to="/privacy" className="hover:text-blue-600 transition-colors">Privacy Policy</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 