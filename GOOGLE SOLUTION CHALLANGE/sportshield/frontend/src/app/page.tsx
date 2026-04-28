'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  Shield, 
  Zap, 
  Lock, 
  Globe, 
  Cpu, 
  Users,
  ArrowRight,
  CheckCircle,
  Play,
  Star
} from 'lucide-react'

const features = [
  {
    icon: Shield,
    title: 'AI-Powered Protection',
    description: 'Advanced machine learning detects unauthorized use, deepfakes, and content misuse with 97.2% accuracy.'
  },
  {
    icon: Lock,
    title: 'Blockchain Ownership',
    description: 'Immutable ownership records on Polygon blockchain. Every asset is tokenized as an NFT with full licensing rights.'
  },
  {
    icon: Zap,
    title: 'C2PA Verification',
    description: 'Industry-first implementation of C2PA content provenance standard. Prove authenticity of any sports content.'
  },
  {
    icon: Globe,
    title: 'Global Marketplace',
    description: 'Trade sports content securely with automatic royalty distribution. 94% of proceeds go to creators.'
  },
  {
    icon: Cpu,
    title: 'Real-time Detection',
    description: '24/7 monitoring across platforms. Get instant alerts when your content is used without authorization.'
  },
  {
    icon: Users,
    title: 'Creator First',
    description: 'Built by athletes, for athletes. Simple registration, transparent earnings, complete control.'
  }
]

const stats = [
  { value: '15,000+', label: 'Athletes Protected' },
  { value: '250K+', label: 'Assets Secured' },
  { value: '97.2%', label: 'Detection Accuracy' },
  { value: '$2.5M', label: 'Monthly GMV' }
]

const testimonials = [
  {
    name: 'Marcus Thompson',
    sport: 'Professional Basketball',
    quote: 'SportShield helped me recover $50K in unauthorized use of my highlights. The AI detection is incredible.',
    avatar: 'MT'
  },
  {
    name: 'Sofia Rodriguez',
    sport: 'Olympic Soccer',
    quote: 'Finally, a platform that understands athlete content. My earnings increased 300% in 3 months.',
    avatar: 'SR'
  },
  {
    name: 'James Chen',
    sport: 'Pro Tennis Player',
    quote: 'The C2PA verification gives my fans confidence they\'re getting authentic content. Game changer.',
    avatar: 'JC'
  }
]

export default function Home() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-500/20 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_#020617_100%)]" />
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 py-20">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-primary-300">
              <Star className="w-4 h-4 text-yellow-400" />
              #1 Platform for Sports Content Protection
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold mb-6 font-display"
          >
            Protect Your
            <span className="block gradient-text">Digital Legacy</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-sport-gray max-w-2xl mx-auto mb-10"
          >
            The first comprehensive platform combining AI detection, blockchain ownership, 
            and C2PA authenticity to protect athletes, creators, and sports organizations.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          >
            <Link 
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-semibold transition-all hover:scale-105"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              href="/marketplace"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 glass hover:bg-white/10 rounded-xl font-semibold transition-all"
            >
              <Play className="w-5 h-5" />
              View Demo
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
          >
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold gradient-text mb-2">{stat.value}</div>
                <div className="text-sport-gray text-sm">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 border-2 border-white/20 rounded-full flex justify-center pt-2">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-1.5 h-1.5 bg-primary-400 rounded-full"
            />
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4 font-display">
              Everything You Need to <span className="gradient-text">Protect & Monetize</span>
            </h2>
            <p className="text-sport-gray text-lg max-w-2xl mx-auto">
              A complete solution for sports content protection, from AI detection to blockchain ownership.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass-card p-8 hover:border-primary-500/50 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-primary-400" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-sport-gray">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-4 bg-sport-dark/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4 font-display">
              How <span className="gradient-text">SportShield</span> Works
            </h2>
            <p className="text-sport-gray text-lg max-w-2xl mx-auto">
              Three simple steps to protect and monetize your sports content.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Register', desc: 'Upload your content and let our AI analyze it for uniqueness and safety.' },
              { step: '02', title: 'Protect', desc: 'Your content is minted as an NFT and monitored 24/7 across platforms.' },
              { step: '03', title: 'Monetize', desc: 'Set your prices, earn royalties, and track everything in real-time.' }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="relative"
              >
                <div className="text-6xl font-bold text-primary-500/20 mb-4">{item.step}</div>
                <h3 className="text-2xl font-semibold mb-3">{item.title}</h3>
                <p className="text-sport-gray">{item.desc}</p>
                {index < 2 && (
                  <ArrowRight className="hidden md:block absolute -right-4 top-1/2 text-primary-500/50 w-8 h-8" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4 font-display">
              Trusted by <span className="gradient-text">Athletes Worldwide</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass-card p-8"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center font-bold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-sport-gray">{testimonial.sport}</div>
                  </div>
                </div>
                <p className="text-sport-gray italic">"{testimonial.quote}"</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card p-12 text-center gradient-border"
          >
            <h2 className="text-4xl font-bold mb-4 font-display">
              Ready to Protect Your Content?
            </h2>
            <p className="text-sport-gray text-lg mb-8 max-w-xl mx-auto">
              Join 15,000+ athletes already protecting their digital legacy with SportShield.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-semibold transition-all hover:scale-105"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link 
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 glass hover:bg-white/10 rounded-xl font-semibold transition-all"
              >
                Contact Sales
              </Link>
            </div>
            <div className="mt-6 flex items-center justify-center gap-6 text-sm text-sport-gray">
              <span className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                No credit card required
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                14-day free trial
              </span>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}