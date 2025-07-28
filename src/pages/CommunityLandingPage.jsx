import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  UsersIcon, 
  ShieldCheckIcon, 
  HeartIcon, 
  MessageCircleIcon,
  TrendingUpIcon,
  StarIcon,
  LockIcon,
  ZapIcon,
  Globe2Icon,
  CheckCircleIcon
} from 'lucide-react';

const CommunityLandingPage = () => {
  useEffect(() => {
    document.title = 'Manova | Community';
  }, []);
  
  const features = [
    {
      icon: ShieldCheckIcon,
      title: "Anonymous & Safe",
      description: "Share openly without revealing your identity. Our moderated environment ensures respectful, supportive interactions."
    },
    {
      icon: UsersIcon,
      title: "Peer Support",
      description: "Connect with others who understand your journey. Share experiences, offer support, and grow together."
    },
    {
      icon: StarIcon,
      title: "Expert Guidance",
      description: "Licensed therapists and mental health professionals contribute insights and moderate discussions."
    },
    {
      icon: HeartIcon,
      title: "Emotional Milestones",
      description: "Celebrate progress, share breakthroughs, and inspire others with your healing journey."
    }
  ];

  const communityStats = [
    { number: "10,000+", label: "Community Members" },
    { number: "50+", label: "Licensed Therapists" },
    { number: "24/7", label: "Support Available" },
    { number: "95%", label: "Feel More Supported" }
  ];

  const topics = [
    "Anxiety & Stress Management",
    "Depression Support",
    "Relationship Challenges", 
    "Work-Life Balance",
    "Self-Care Tips",
    "Coping Strategies",
    "Personal Growth",
    "Crisis Support"
  ];

  const testimonials = [
    {
      text: "This community helped me realize I'm not alone in my struggles. The support here is incredible.",
      author: "Sarah M.",
      role: "Community Member"
    },
    {
      text: "As a therapist, I'm amazed by the wisdom and compassion shown by community members every day.",
      author: "Dr. Chen",
      role: "Licensed Therapist"
    },
    {
      text: "I've learned more coping strategies from this community than anywhere else. It's life-changing.",
      author: "Michael R.",
      role: "Community Member"
    }
  ];

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-5xl mx-auto px-4 py-20">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-3xl font-bold mb-4">
            Join Our <span className="text-blue-600">Community</span>
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed max-w-3xl mx-auto">
            Join a safe, anonymous group space where users share experiences, healing tips, and emotional milestones.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <button
              onClick={() => window.location.href = '/signup'}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded px-6 py-2 transition-colors duration-300"
            >
              Join Community
            </button>
            <button
              onClick={() => window.location.href = '/community'}
              className="border border-blue-600 text-blue-600 font-medium rounded px-6 py-2 hover:bg-blue-600 hover:text-white transition-colors duration-300"
            >
              Browse Discussions
            </button>
          </div>
        </motion.div>

        {/* Community Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-16"
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {communityStats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                className="text-center"
              >
                <div className="text-2xl lg:text-3xl font-bold text-blue-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">What Makes Our Community Special</h2>
            <p className="text-lg text-gray-600">A supportive environment designed for healing and growth</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 + index * 0.1 }}
                className="bg-white border border-gray-200 rounded-lg p-6 text-center hover:shadow-lg transition-shadow duration-300"
              >
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Topics Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Discussion Topics</h2>
            <p className="text-lg text-gray-600">Find support for whatever you're going through</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {topics.map((topic, index) => (
              <motion.div
                key={topic}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 1.1 + index * 0.05 }}
                className="bg-white border border-gray-200 rounded-lg p-4 text-center hover:shadow-md transition-shadow duration-300"
              >
                <CheckCircleIcon className="w-5 h-5 text-blue-600 mx-auto mb-2" />
                <span className="text-gray-700 font-medium text-sm">{topic}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Testimonials Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.4 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">What Our Members Say</h2>
            <p className="text-lg text-gray-600">Real stories from our community</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.5 + index * 0.1 }}
                className="bg-white border border-gray-200 rounded-lg p-6"
              >
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">"{testimonial.text}"</p>
                <div className="border-t pt-4">
                  <p className="font-semibold text-gray-900">{testimonial.author}</p>
                  <p className="text-sm text-blue-600">{testimonial.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Community Guidelines Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.8 }}
          className="mb-16"
        >
          <div className="bg-blue-600 rounded-lg p-8 text-white text-center">
            <LockIcon className="w-12 h-12 mx-auto mb-6 opacity-90" />
            <h2 className="text-2xl font-bold mb-4">Safe & Supportive Environment</h2>
            <p className="text-lg mb-6 opacity-90">
              Our community is built on respect, empathy, and understanding. All discussions are moderated by mental health professionals to ensure a positive experience for everyone.
            </p>
            <div className="grid md:grid-cols-3 gap-6 mt-8">
              <div className="text-center">
                <ShieldCheckIcon className="w-8 h-8 mx-auto mb-2 opacity-90" />
                <div className="font-semibold">Verified Members</div>
              </div>
              <div className="text-center">
                <MessageCircleIcon className="w-8 h-8 mx-auto mb-2 opacity-90" />
                <div className="font-semibold">Moderated Discussions</div>
              </div>
              <div className="text-center">
                <HeartIcon className="w-8 h-8 mx-auto mb-2 opacity-90" />
                <div className="font-semibold">Supportive Culture</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 2.0 }}
          className="text-center"
        >
          <div className="bg-gray-50 rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-4">Ready to Join Our Community?</h2>
            <p className="text-lg text-gray-600 leading-relaxed mb-8">
              Take the first step towards connection, support, and healing.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => window.location.href = '/signup'}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded px-6 py-2 transition-colors duration-300"
              >
                Sign Up Free
              </button>
              <button
                onClick={() => window.location.href = '/about'}
                className="border border-gray-300 text-gray-700 font-medium rounded px-6 py-2 hover:bg-gray-50 transition-colors duration-300"
              >
                Learn More
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CommunityLandingPage;