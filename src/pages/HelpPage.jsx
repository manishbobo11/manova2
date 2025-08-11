import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const HelpPage = () => {
  useEffect(() => {
    document.title = 'Help Center - Manova';
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Help Center
          </h1>
          <p className="text-xl text-gray-600">
            We're here to help you make the most of your mental wellness journey
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Coming Soon
          </h2>
          <p className="text-gray-600 mb-4">
            Our comprehensive help center is currently under development. We're working hard to provide you with detailed guides, FAQs, and support resources.
          </p>
          <p className="text-gray-600 mb-6">
            In the meantime, if you need immediate assistance, please don't hesitate to reach out to us directly.
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">
              Need Help Right Now?
            </h3>
            <div className="space-y-2">
              <p className="text-blue-800">
                📧 Email us: <a href="mailto:contact@manova.life" className="underline hover:text-blue-600">contact@manova.life</a>
              </p>
              <p className="text-blue-800">
                🔗 Visit our community: <Link to="/community" className="underline hover:text-blue-600">Join discussions</Link>
              </p>
              <p className="text-blue-800">
                📱 Crisis Support: <a href="https://telemanas.mohfw.gov.in/" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-600">KIRAN 1800-599-0019</a>
              </p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;