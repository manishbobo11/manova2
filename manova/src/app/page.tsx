"use client";

import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="min-h-screen bg-app">
      <main className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
        {/* Hero */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center mb-16"
        >
          <div>
            <h1 className="text-fg text-4xl sm:text-5xl font-semibold tracking-tight mb-4">
              Welcome back
            </h1>
            <p className="text-fgm text-lg mb-6">
              Prioritize your mental wellness with clean, calming design and easy tools.
            </p>
            <button className="btn-brand">Start Your Check-in</button>
          </div>
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex justify-center lg:justify-end"
          >
            <div className="card-surface w-64 h-64 sm:w-72 sm:h-72 lg:w-80 lg:h-80 flex items-center justify-center">
              <span className="text-6xl" aria-label="avatar">🧘‍♀️</span>
            </div>
          </motion.div>
        </motion.section>

        {/* Features */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <h2 className="text-fg text-3xl sm:text-4xl font-semibold text-center mb-10">Your Wellness Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[{
              title: "Daily Check-in",
              desc: "Reflect on your mood with a gentle guided assessment.",
              cta: "Start Check-in",
            },{
              title: "Meditation",
              desc: "Find calm with short, effective meditations.",
              cta: "Start Session",
            },{
              title: "Sleep Stories",
              desc: "Unwind with soothing bedtime narration.",
              cta: "Listen Tonight",
            }].map((card) => (
              <motion.div
                key={card.title}
                whileHover={{ y: -4 }}
                className="card-surface p-8"
              >
                <h3 className="text-fg text-xl font-semibold mb-3">{card.title}</h3>
                <p className="text-fgm mb-8 leading-relaxed">{card.desc}</p>
                <button className="btn-brand w-full">{card.cta}</button>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* CTA */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6 }}
          className="rounded-3xl p-10"
          style={{ background: "linear-gradient(180deg, rgba(37,99,235,0.08), rgba(37,99,235,0.05))" }}
        >
          <div className="max-w-3xl mx-auto text-center">
            <h3 className="text-fg text-3xl sm:text-4xl font-semibold mb-4">Take the next step toward calm</h3>
            <p className="text-fgm text-lg mb-8">Explore meditations, sleep stories, and breathing exercises designed to help you unwind.</p>
            <button className="btn-brand">View Your Analytics</button>
          </div>
        </motion.section>
      </main>
    </div>
  );
}
