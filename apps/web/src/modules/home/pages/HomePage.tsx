import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, Sparkles, Shield, Brain, Eye, Zap,
  Users, Briefcase, GraduationCap, MessageCircle,
  TrendingUp, Heart, Globe, ExternalLink, Moon, Sun,
  FileText, Target, Bell, CheckCircle2
} from 'lucide-react';
import { Button } from '../../../components/ui';
import { IMAGES } from '../../../utils/images';
import { useAccessibility } from '../../../store/accessibility.store';

// ============ PREMIUM ANIMATION VARIANTS ============

const fadeUpVariant = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.2,
    },
  },
};

const scaleInVariant = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
};


// ============ ANIMATED NUMBER (Impact stats) ============

function useCountUp(target: number, duration = 1200) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;

        const start = Date.now();
        const tick = () => {
          const t = Math.min((Date.now() - start) / duration, 1);
          setCount(Math.floor(t * target));
          if (t < 1) requestAnimationFrame(tick);
        };

        tick();
        obs.disconnect();
      },
      { threshold: 0.25 }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [target, duration]);

  return { count, ref };
}

function AnimatedNumber({ value, suffix }: { value: number; suffix?: string }) {
  const { count, ref } = useCountUp(value);
  return (
    <div ref={ref} className="text-2xl lg:text-3xl font-bold text-white">
      {count.toLocaleString()}
      {suffix || ''}
    </div>
  );
}


// ============ PREMIUM BACKGROUND ELEMENTS ============

const PremiumGlowOrbs = ({ isDark }: { isDark: boolean }) => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {/* Primary Indigo Orb - Top Left */}
    <motion.div
      className="absolute -top-20 -left-32 w-96 h-96 rounded-full"
      style={{ background: 'radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, transparent 70%)' }}
      animate={{
        y: [0, -60, 0],
        x: [0, 40, 0],
        opacity: [0.3, 0.5, 0.3],
        scale: [1, 1.2, 1],
      }}
      transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      aria-hidden="true"
    />

    {/* Cyan Orb - Top Right */}
    <motion.div
      className="absolute -top-40 -right-40 w-80 h-80 rounded-full"
      style={{ background: 'radial-gradient(circle, rgba(6, 182, 212, 0.2) 0%, transparent 70%)' }}
      animate={{
        y: [0, -40, 0],
        x: [0, -30, 0],
        opacity: [0.25, 0.4, 0.25],
        scale: [1, 1.15, 1],
      }}
      transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      aria-hidden="true"
    />

    {/* Purple Orb - Bottom Center */}
    <motion.div
      className="absolute -bottom-32 left-1/3 w-96 h-96 rounded-full"
      style={{ background: 'radial-gradient(circle, rgba(139, 92, 246, 0.2) 0%, transparent 70%)' }}
      animate={{
        y: [0, 50, 0],
        x: [0, -20, 0],
        opacity: [0.2, 0.4, 0.2],
        scale: [1, 1.1, 1],
      }}
      transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
      aria-hidden="true"
    />

    {/* Accent Cyan - Bottom Right */}
    <motion.div
      className="absolute -bottom-40 -right-20 w-72 h-72 rounded-full"
      style={{ background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)' }}
      animate={{
        y: [0, -30, 0],
        x: [0, 20, 0],
        opacity: [0.15, 0.3, 0.15],
        scale: [1, 1.12, 1],
      }}
      transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      aria-hidden="true"
    />
  </div>
);

const GlassmorphicCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div
    className={`card ${className}`}
    style={{
      background: 'rgba(17, 24, 39, 0.8)',
      backdropFilter: 'blur(20px)',
      borderColor: 'rgba(255, 255, 255, 0.1)',
    }}
  >
    {children}
  </div>
);

// ============ HERO SECTION ============

const HeroSection = ({ isDark }: { isDark: boolean }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <motion.section
      ref={containerRef}
      className="relative min-h-screen pt-20 pb-32 overflow-hidden flex items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      {/* Premium Background Gradient */}
      <div
        className="absolute inset-0 bg-gradient-hero opacity-30"
        style={{
          background: `linear-gradient(135deg, rgb(11, 16, 32) 0%, rgb(26, 35, 51) 50%, rgb(6, 182, 212) 100%)`,
        }}
        aria-hidden="true"
      />

      {/* Premium Glow Orbs */}
      <PremiumGlowOrbs isDark={isDark} />

      {/* Premium Grid Background */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `linear-gradient(0deg, transparent 24%, rgba(255, 255, 255, .05) 25%, rgba(255, 255, 255, .05) 26%, transparent 27%, transparent 74%, rgba(255, 255, 255, .05) 75%, rgba(255, 255, 255, .05) 76%, transparent 77%, transparent),
                            linear-gradient(90deg, transparent 24%, rgba(255, 255, 255, .05) 25%, rgba(255, 255, 255, .05) 26%, transparent 27%, transparent 74%, rgba(255, 255, 255, .05) 75%, rgba(255, 255, 255, .05) 76%, transparent 77%, transparent)`,
          backgroundSize: '50px 50px',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 w-full gradient-mesh">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-[600px]">

          {/* Left: Hero Content */}
          <motion.div {...fadeUpVariant} className="flex flex-col justify-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center gap-2 w-fit mb-8 px-4 py-2 rounded-full"
              style={{
                background: 'rgba(99, 102, 241, 0.1)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
              }}
            >
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span className="text-sm font-semibold text-indigo-300">Next-Generation AI Platform</span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] mb-6 tracking-tight"
              style={{
                background: 'linear-gradient(135deg, #FFFFFF 0%, #D1D5DB 50%, #6366F1 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Your career,{' '}
              <span className="text-ai-gradient">powered by AI</span>
              <br />
              <span className="text-white/90">for everyone</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="text-lg lg:text-xl text-white/70 max-w-lg leading-relaxed mb-8 font-medium"
            >
              Navigate your career with confidence. We help people with disabilities discover strengths, explore opportunities, and land meaningful work.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 mb-12"
            >
              <Link to="/login">
                <Button
                  variant="primary"
                  size="lg"
                  className="group shadow-lg shadow-violet-500/20 hover:shadow-xl hover:shadow-violet-500/30 transition-all duration-300"
                >
                  Start Your Journey
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button
                variant="secondary"
                size="lg"
                className="shadow-lg"
              >
                View Demo
                <ExternalLink className="w-5 h-5" />
              </Button>
            </motion.div>

            {/* Stats Row */}
            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="grid grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {[
                { target: 50000, value: '50,000+', label: 'Users Supported', suffix: '+' },
                { target: 92, value: '92%', label: 'Satisfaction', suffix: '%' },
                { target: 1200, value: '1,200+', label: 'Jobs Matched', suffix: '+' },
              ].map((stat) => (
                <motion.div key={stat.label} variants={fadeUpVariant} className="flex flex-col">
                  <AnimatedNumber value={stat.target} suffix={stat.suffix} />
                  <span className="text-sm text-white/50 mt-1">{stat.label}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right: Premium Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, x: 40 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.4 }}
            className="hidden lg:block relative"
          >
            {/* Premium Dashboard Preview Card */}
            <div
              className="relative rounded-3xl overflow-hidden shadow-2xl"
              style={{
                boxShadow: '0 0 60px rgba(99, 102, 241, 0.3), 0 0 100px rgba(6, 182, 212, 0.2)',
              }}
            >
              {/* Glassmorphic Border */}
              <div
                className="absolute inset-0 rounded-3xl pointer-events-none"
                style={{
                  border: '2px solid rgba(255, 255, 255, 0.15)',
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(99, 102, 241, 0.05) 100%)',
                }}
              />

              <img
                src={IMAGES.fourStep}
                alt="Premium AI Dashboard"
                className="w-full h-auto object-cover"
              />

              {/* Floating Badge */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute top-6 right-6 px-4 py-2 rounded-full bg-emerald-500/90 backdrop-blur-xl border border-emerald-400/50 text-white text-sm font-semibold flex items-center gap-2 shadow-lg"
              >
                <div className="w-2 h-2 bg-emerald-300 rounded-full animate-pulse" />
                AI Powered
              </motion.div>
            </div>

            {/* Decorative Glow Elements */}
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl opacity-20 pointer-events-none" />
            <div className="absolute -top-20 -left-20 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl opacity-20 pointer-events-none" />
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
};

// ============ PREMIUM FEATURES SECTION ============

const FeaturesSection = ({ isDark }: { isDark: boolean }) => {
  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Matching',
      desc: 'Intelligent algorithms match your unique skills and preferences with perfect career opportunities.',
      color: '#6366F1',
      gradient: 'from-indigo-600 to-indigo-400',
    },
    {
      icon: Target,
      title: 'Skill Gap Analyzer',
      desc: 'Identify gaps between your current skills and target roles with personalized learning paths.',
      color: '#F59E0B',
      gradient: 'from-amber-600 to-amber-400',
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      desc: 'Get instant matches and recommendations powered by cutting-edge machine learning.',
      color: '#10B981',
      gradient: 'from-emerald-600 to-emerald-400',
    },
    {
      icon: Bell,
      title: 'Smart Notifications',
      desc: 'Stay updated with intelligent alerts for opportunities that match your profile.',
      color: '#8B5CF6',
      gradient: 'from-violet-600 to-violet-400',
    },
  ];

  return (
    <section className="relative py-24 lg:py-32 overflow-hidden">
      {/* Section Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/50 to-slate-950 pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16 lg:mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6" style={{ background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="text-sm font-semibold text-indigo-300">Premium Features</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-white">
            Powerful Tools for Your Future
          </h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            Everything you need to discover your strengths, prepare with confidence, and land your dream role.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                variants={fadeUpVariant}
                whileHover={{ y: -8 }}
                className="group relative overflow-hidden rounded-2xl p-8 transition-all duration-300"
                style={{
                  background: 'rgba(17, 24, 39, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(20px)',
                }}
              >
                {/* Hover Gradient Overlay */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{
                    background: `linear-gradient(135deg, ${feature.color}15 0%, transparent 100%)`,
                  }}
                />

                {/* Icon */}
                <div
                  className="relative z-10 w-16 h-16 rounded-xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6"
                  style={{ background: `${feature.color}20` }}
                >
                  <Icon className="w-8 h-8" style={{ color: feature.color }} />
                </div>

                {/* Content */}
                <h3 className="relative z-10 text-lg font-bold text-white mb-3">{feature.title}</h3>
                <p className="relative z-10 text-white/60 leading-relaxed mb-4">{feature.desc}</p>

                {/* Premium Border Glow */}
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{
                    boxShadow: `inset 0 1px 2px rgba(255, 255, 255, 0.1), 0 0 30px ${feature.color}40`,
                  }}
                />
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

// ============ STATS SECTION ============

const StatsSection = ({ isDark }: { isDark: boolean }) => {
  const stats = [
    { value: '50,000+', label: 'Users Empowered', suffix: 'worldwide' },
    { value: '92%', label: 'Satisfaction Rate', suffix: 'proven impact' },
    { value: '1,200+', label: 'Jobs Matched', suffix: 'successfully' },
    { value: '85%', label: 'Interview Success', suffix: 'rate' },
  ];

  return (
    <section className="relative py-24 lg:py-32 overflow-hidden">
      {/* Section Background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(6, 182, 212, 0.05) 100%)',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-white">
            The Impact We're Making
          </h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            Real numbers from real people transforming their careers every single day.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              variants={fadeUpVariant}
              className="relative p-8 rounded-2xl overflow-hidden group"
              style={{
                background: 'rgba(17, 24, 39, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(20px)',
              }}
            >
              {/* Animated Border Glow */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  boxShadow: 'inset 0 1px 2px rgba(255, 255, 255, 0.1), 0 0 40px rgba(99, 102, 241, 0.2)',
                }}
              />

              <div className="relative z-10 text-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="text-4xl lg:text-5xl font-bold mb-2 bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent"
                >
                  {stat.value}
                </motion.div>
                <p className="text-white font-semibold mb-1">{stat.label}</p>
                <p className="text-white/50 text-sm">{stat.suffix}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

// ============ CTA SECTION ============

const CTASection = ({ isDark }: { isDark: boolean }) => {
  return (
    <section className="relative py-24 lg:py-32 overflow-hidden">
      {/* Background Gradients */}
      <PremiumGlowOrbs isDark={isDark} />

      <div className="relative z-10 max-w-4xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9 }}
          className="relative rounded-3xl overflow-hidden p-12 lg:p-16 text-center"
          style={{
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(6, 182, 212, 0.1) 100%)',
            border: '2px solid rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 0 60px rgba(99, 102, 241, 0.2)',
          }}
        >
          {/* Decorative Elements */}
          <div className="absolute top-0 left-0 w-40 h-40 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-white">
              Ready to Transform Your Career?
            </h2>
            <p className="text-lg text-white/70 max-w-2xl mx-auto mb-8">
              Join thousands of people who've already discovered their perfect career path with AI guidance.
            </p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link to="/login">
                <Button variant="primary" size="lg" className="glow-indigo shadow-lg">
                  Get Started Now
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Button variant="secondary" size="lg" className="shadow-lg">
                Schedule a Demo
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// ============ PARTNERS SECTION ============

const PartnersSection = ({ isDark }: { isDark: boolean }) => {
  const partners = [
    { logo: IMAGES.openai, name: 'OpenAI' },
    { logo: IMAGES.google, name: 'Google' },
    { logo: IMAGES.azure, name: 'Microsoft Azure' },
    { logo: IMAGES.supabase, name: 'Supabase' },
    { logo: IMAGES.vercel, name: 'Vercel' },
  ];

  return (
    <section className="relative py-24 lg:py-32 overflow-hidden">
      {/* Section Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/30 to-transparent pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-white">
            Trusted by Industry Leaders
          </h2>
          <p className="text-lg text-white/60">
            Built with cutting-edge technology from the world's best platforms
          </p>
        </motion.div>

        {/* Partners Grid */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 lg:gap-8"
        >
          {partners.map((partner) => (
            <motion.div
              key={partner.name}
              variants={fadeUpVariant}
              whileHover={{ y: -8, scale: 1.05 }}
              className="flex items-center justify-center p-6 rounded-2xl"
              style={{
                background: 'rgba(17, 24, 39, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <img
                src={partner.logo}
                alt={partner.name}
                className="h-12 lg:h-16 object-contain opacity-80 hover:opacity-100 transition-opacity"
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

// ============ TEAM SECTION ============

const TeamSection = ({ isDark }: { isDark: boolean }) => {
  const teamMembers = [
    { image: IMAGES.people.drAngelaPratt, name: 'Dr. Angela Pratt', role: 'Accessibility Expert' },
    { image: IMAGES.people.drNguyenDangTri, name: 'Dr. Nguyen Dang Tri', role: 'AI Specialist' },
    { image: IMAGES.people.drNguyenVanMui, name: 'Dr. Nguyen Van Mui', role: 'Career Counselor' },
    { image: IMAGES.people.hoMinhDuy, name: 'Ho Minh Duy', role: 'Product Lead' },
    { image: IMAGES.people.nguyenThanhNam, name: 'Nguyen Thanh Nam', role: 'Engineering Lead' },
    { image: IMAGES.people.silviaDanailov, name: 'Silvia Danailov', role: 'UX Designer' },
  ];

  return (
    <section className="relative py-24 lg:py-32 overflow-hidden">
      {/* Background Gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(6, 182, 212, 0.05) 100%)',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-white">
            Meet Our Expert Team
          </h2>
          <p className="text-lg text-white/60">
            Dedicated professionals committed to your career success
          </p>
        </motion.div>

        {/* Team Grid */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {teamMembers.map((member) => (
            <motion.div
              key={member.name}
              variants={fadeUpVariant}
              whileHover={{ y: -12 }}
              className="group relative overflow-hidden rounded-3xl"
            >
              {/* Image Container */}
              <div className="relative overflow-hidden rounded-3xl h-96 bg-gradient-to-br from-indigo-600/20 to-cyan-600/20">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Info Overlay */}
                <div className="absolute inset-0 flex flex-col justify-end p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <h3 className="text-xl font-bold text-white mb-1">{member.name}</h3>
                  <p className="text-sm text-indigo-300">{member.role}</p>
                </div>
              </div>

              {/* Card Border */}
              <div
                className="absolute inset-0 rounded-3xl pointer-events-none"
                style={{
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

// ============ ORGANIZATIONS SECTION ============

const OrganizationsSection = ({ isDark }: { isDark: boolean }) => {
  const organizations = [
    { logo: IMAGES.unicef, name: 'UNICEF' },
    { logo: IMAGES.who, name: 'World Health Organization' },
    { logo: IMAGES.giaDinhUniversity, name: 'Gia Dinh University' },
  ];

  return (
    <section className="relative py-24 lg:py-32 overflow-hidden">
      {/* Section Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/50 to-slate-950 pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-white">
            Supporting Global Initiatives
          </h2>
          <p className="text-lg text-white/60">
            Partnering with international organizations to make a real difference
          </p>
        </motion.div>

        {/* Organizations Grid */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-8"
        >
          {organizations.map((org) => (
            <motion.div
              key={org.name}
              variants={fadeUpVariant}
              whileHover={{ scale: 1.05 }}
              className="relative p-8 rounded-2xl text-center"
              style={{
                background: 'rgba(17, 24, 39, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(20px)',
              }}
            >
              <img
                src={org.logo}
                alt={org.name}
                className="h-24 object-contain mx-auto mb-4 opacity-90 hover:opacity-100 transition-opacity"
              />
              <h3 className="text-lg font-semibold text-white">{org.name}</h3>

              {/* Hover Glow */}
              <div
                className="absolute inset-0 rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{
                  boxShadow: 'inset 0 1px 2px rgba(255, 255, 255, 0.1), 0 0 30px rgba(99, 102, 241, 0.15)',
                }}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

// ============ MAIN COMPONENT ============

export default function HomePagePremium() {
  const { settings, setTheme } = useAccessibility();
  const isDark = settings.theme === 'dark';

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl border-b border-white/5 bg-slate-950/80">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                AVORA
              </span>
            </Link>


            {/* Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              <a href="#features" className="px-4 py-2 text-sm font-medium text-white/60 hover:text-white transition-colors">
                Features
              </a>
              <a href="#impact" className="px-4 py-2 text-sm font-medium text-white/60 hover:text-white transition-colors">
                Impact
              </a>
              <a href="/docs" className="px-4 py-2 text-sm font-medium text-white/60 hover:text-white transition-colors">
                Docs
              </a>
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setTheme(isDark ? 'light' : 'dark')}
                className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all"
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <Link to="/login">
                <Button variant="primary" size="sm">
                  Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

            {/* Hero Section */}
      <HeroSection isDark={isDark} />

      {/* Features Section */}
      <FeaturesSection isDark={isDark} />


      {/* Stats Section */}
      <StatsSection isDark={isDark} />

      {/* CTA Section */}
      <CTASection isDark={isDark} />

      {/* Partners Section */}
      <PartnersSection isDark={isDark} />

      {/* Team Section */}
      <TeamSection isDark={isDark} />

      {/* Organizations Section */}
      <OrganizationsSection isDark={isDark} />

      {/* Footer */}
      <footer className="relative border-t border-white/5 bg-slate-950/50 backdrop-blur-xl py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            {/* Company Info */}
            <div>
              <h3 className="text-white font-bold mb-4">AVORA</h3>
              <p className="text-white/50 text-sm leading-relaxed">
                Empowering people with disabilities to find meaningful careers through AI-driven guidance.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">Product</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-white/60 text-sm hover:text-white transition-colors">Features</a></li>
                <li><a href="/docs" className="text-white/60 text-sm hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="text-white/60 text-sm hover:text-white transition-colors">Pricing</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">Company</h4>
              <ul className="space-y-2">
                <li><a href="/partners" className="text-white/60 text-sm hover:text-white transition-colors">Partners</a></li>
                <li><a href="#" className="text-white/60 text-sm hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="text-white/60 text-sm hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">Legal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-white/60 text-sm hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="text-white/60 text-sm hover:text-white transition-colors">Terms</a></li>
                <li><a href="#" className="text-white/60 text-sm hover:text-white transition-colors">Accessibility</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom */}
          <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between">
            <p className="text-white/50 text-sm">© 2026 AVORA. All rights reserved.</p>
            <div className="flex items-center gap-4 mt-4 sm:mt-0">
              <a href="#" className="text-white/50 hover:text-white transition-colors">Twitter</a>
              <a href="#" className="text-white/50 hover:text-white transition-colors">GitHub</a>
              <a href="#" className="text-white/50 hover:text-white transition-colors">LinkedIn</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
