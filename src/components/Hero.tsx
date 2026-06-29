import { Language, DICTIONARY } from '../types';
import { Factory, Layers, Award, Radio } from 'lucide-react';
import { motion } from 'motion/react';

interface HeroProps {
  currentLang: Language;
}

export default function Hero({ currentLang }: HeroProps) {
  const d = DICTIONARY[currentLang];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col justify-center h-full text-brand-text py-6"
    >
      {/* EYEBROW */}
      <motion.div variants={itemVariants} className="inline-flex items-center gap-2 self-start mb-4">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-gold opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-gold"></span>
        </span>
        <span className="text-[10px] md:text-xs font-mono font-bold tracking-[0.2em] text-brand-teal/90 uppercase bg-brand-teal/5 px-2.5 py-1 rounded border border-brand-teal/15">
          {d.eyebrow}
        </span>
      </motion.div>

      {/* GOLD DIVIDER (Move above headline according to design html) */}
      <motion.div
        variants={itemVariants}
        className="w-[80px] h-[4px] bg-brand-gold mb-6 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent animate-shimmer" />
      </motion.div>

      {/* HEADLINE (Bold Typography 64px) */}
      <motion.h1
        variants={itemVariants}
        className="text-5xl md:text-6xl lg:text-[64px] font-serif font-bold text-brand-text leading-[1.1] tracking-tight mb-6"
        id="hero-headline"
      >
        {d.heroTitle}
      </motion.h1>

      {/* SUBTITLE */}
      <motion.p
        variants={itemVariants}
        className="text-base md:text-lg text-brand-text/80 leading-relaxed font-sans max-w-xl mb-8"
      >
        {d.heroSubtitle}
      </motion.p>

      {/* STATS */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-3 gap-3 md:gap-4 border-t border-brand-teal/10 pt-8"
      >
        {/* Stat 1: Factories */}
        <div className="relative p-4 rounded-lg bg-brand-card/30 border border-brand-teal/5 hover:border-brand-teal/15 transition-all duration-300">
          <div className="flex items-center gap-2 text-brand-teal mb-2">
            <Factory className="w-4 h-4" />
            <span className="text-[10px] font-mono tracking-wider text-brand-teal/80">01</span>
          </div>
          <div className="text-xl md:text-2xl font-serif font-bold text-brand-gold">
            {d.stat1Num}
          </div>
          <div className="text-[10px] md:text-xs text-brand-text/60 mt-1 line-clamp-2">
            {d.stat1Label}
          </div>
        </div>

        {/* Stat 2: Sectors */}
        <div className="relative p-4 rounded-lg bg-brand-card/30 border border-brand-teal/5 hover:border-brand-teal/15 transition-all duration-300">
          <div className="flex items-center gap-2 text-brand-teal mb-2">
            <Layers className="w-4 h-4" />
            <span className="text-[10px] font-mono tracking-wider text-brand-teal/80">02</span>
          </div>
          <div className="text-xl md:text-2xl font-serif font-bold text-brand-gold">
            {d.stat2Num}
          </div>
          <div className="text-[10px] md:text-xs text-brand-text/60 mt-1 line-clamp-2">
            {d.stat2Label}
          </div>
        </div>

        {/* Stat 3: Status */}
        <div className="relative p-4 rounded-lg bg-brand-card/30 border border-brand-teal/5 hover:border-brand-teal/15 transition-all duration-300 overflow-hidden">
          {/* Subtle pulse background */}
          <div className="absolute inset-0 bg-brand-gold/5 animate-pulse" />
          <div className="relative flex items-center gap-2 text-brand-gold mb-2">
            <Radio className="w-4 h-4 animate-pulse" />
            <span className="text-[10px] font-mono tracking-wider text-brand-gold/80">03</span>
          </div>
          <div className="relative text-xl md:text-2xl font-serif font-bold text-brand-gold flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-brand-gold inline-block animate-ping" />
            <span>{d.stat3Num}</span>
          </div>
          <div className="relative text-[10px] md:text-xs text-brand-text/60 mt-1 line-clamp-2">
            {d.stat3Label}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
