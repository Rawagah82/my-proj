import { Language, DICTIONARY, Registration, SECTORS, PLANS } from '../types';
import { ShieldCheck, CheckCircle2, RotateCcw, Copy, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';

interface SuccessViewProps {
  currentLang: Language;
  registration: Registration;
  onReset: () => void;
}

export default function SuccessView({
  currentLang,
  registration,
  onReset,
}: SuccessViewProps) {
  const d = DICTIONARY[currentLang];
  const [copied, setCopied] = useState(false);

  // Find translated labels
  const plan = PLANS.find((p) => p.id === registration.planId);
  const planName = plan ? (currentLang === 'en' ? plan.enName : plan.arName) : '';

  const userTypeLabel =
    registration.userType === 'supplier'
      ? d.tabSupplier
      : registration.userType === 'technician'
      ? d.tabTechnician
      : d.tabFactory;

  const sectorNames = registration.sectors
    .map((sId) => {
      const sector = SECTORS.find((s) => s.id === sId);
      return sector ? (currentLang === 'en' ? sector.en : sector.ar) : '';
    })
    .filter(Boolean)
    .join(', ');

  const handleCopyRef = () => {
    navigator.clipboard.writeText(registration.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4 }}
      className="w-full bg-brand-card border border-brand-gold/30 rounded-lg p-6 md:p-8 shadow-2xl relative overflow-hidden text-center max-w-2xl mx-auto"
      id="madar-success-card"
    >
      {/* Blueprint background grid visual */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-brand-gold" />

      {/* GOLD DIAMOND ICON */}
      <div className="relative flex justify-center mb-6 mt-4">
        <div className="relative group">
          {/* Pulsing glow under diamond */}
          <div className="absolute -inset-4 bg-brand-gold/15 rounded-full blur-xl animate-pulse" />
          
          {/* Custom SVG Industrial Diamond */}
          <svg
            className="w-20 h-20 text-brand-gold"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            id="success-gold-diamond"
          >
            {/* Spinning outward rings */}
            <motion.rect
              x="20"
              y="20"
              width="60"
              height="60"
              rx="4"
              stroke="var(--color-brand-gold)"
              strokeWidth="1.5"
              strokeDasharray="6 4"
              style={{ originX: 0.5, originY: 0.5 }}
              animate={{ rotate: 45 }}
              className="opacity-40"
            />
            <motion.rect
              x="25"
              y="25"
              width="50"
              height="50"
              rx="2"
              stroke="var(--color-brand-teal)"
              strokeWidth="1"
              strokeDasharray="4 2"
              style={{ originX: 0.5, originY: 0.5 }}
              animate={{ rotate: -45 }}
              className="opacity-40"
            />
            {/* Core Diamond */}
            <path
              d="M50 15 L80 50 L50 85 L20 50 Z"
              fill="rgba(200, 151, 58, 0.15)"
              stroke="var(--color-brand-gold)"
              strokeWidth="4"
              strokeLinejoin="round"
            />
            {/* Inner technical lines */}
            <path
              d="M50 15 L50 85 M20 50 L80 50"
              stroke="var(--color-brand-gold)"
              strokeWidth="1"
              className="opacity-30"
            />
            {/* Center pulsing core dot */}
            <circle cx="50" cy="50" r="5" fill="var(--color-brand-gold)" className="animate-ping" />
            <circle cx="50" cy="50" r="3" fill="var(--color-brand-gold)" />
          </svg>
        </div>
      </div>

      {/* SUCCESS TITLE & BADGE */}
      <div className="inline-flex items-center gap-1.5 bg-brand-gold/10 px-3 py-1 rounded-full border border-brand-gold/30 text-brand-gold text-xs font-mono mb-4">
        <ShieldCheck className="w-3.5 h-3.5" />
        <span className="uppercase tracking-wider font-bold">
          {currentLang === 'en' ? 'DIRECTORY AUTHORIZED' : 'تم اعتماد العضوية'}
        </span>
      </div>

      <h2 className="text-2xl md:text-3xl font-serif font-bold text-brand-text mb-3">
        {d.successTitle}
      </h2>
      <p className="text-sm text-brand-text/75 max-w-md mx-auto mb-6">
        {d.successMsg}
      </p>

      {/* REFERENCE CARD */}
      <div className="bg-brand-bg border border-brand-teal/10 rounded-xl p-4 mb-6 max-w-md mx-auto">
        <span className="block text-[10px] font-mono uppercase tracking-widest text-brand-teal">
          {d.successRef}
        </span>
        <div className="flex items-center justify-center gap-2 mt-1">
          <span className="text-lg font-mono font-bold text-brand-gold tracking-wider">
            {registration.id}
          </span>
          <button
            onClick={handleCopyRef}
            id="btn-copy-ref"
            className="p-1.5 text-brand-text/50 hover:text-brand-gold rounded hover:bg-brand-card/50 transition"
            title="Copy Reference ID"
          >
            {copied ? (
              <span className="text-xs text-brand-teal font-mono font-semibold">
                Copied!
              </span>
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* SUBMISSION CREDENTIAL SUMMARY */}
      <div className="border border-brand-teal/10 rounded-xl p-5 mb-8 text-left bg-brand-bg/40 max-w-md mx-auto space-y-3.5">
        <h4 className="text-xs font-mono uppercase tracking-widest text-brand-gold border-b border-brand-teal/10 pb-2 flex items-center justify-between">
          <span>{currentLang === 'en' ? 'ENTITY CREDENTIALS' : 'بيانات الاعتماد المسجلة'}</span>
          <CheckCircle2 className="w-3.5 h-3.5 text-brand-teal" />
        </h4>

        {/* Name */}
        <div className="flex justify-between items-start text-xs">
          <span className="text-brand-text/50">{d.fieldName}:</span>
          <span className="text-brand-text font-medium text-right">{registration.fullName}</span>
        </div>

        {/* Phone */}
        <div className="flex justify-between items-start text-xs">
          <span className="text-brand-text/50">{d.fieldPhone}:</span>
          <span className="text-brand-text font-mono text-right">+966 {registration.phoneNumber}</span>
        </div>

        {/* Entity class */}
        <div className="flex justify-between items-start text-xs">
          <span className="text-brand-text/50">
            {currentLang === 'en' ? 'Entity Class:' : 'فئة الجهة:'}
          </span>
          <span className="text-brand-text font-medium text-right">{userTypeLabel}</span>
        </div>

        {/* CR or License */}
        {registration.crNo && (
          <div className="flex justify-between items-start text-xs">
            <span className="text-brand-text/50">{d.fieldCr}:</span>
            <span className="text-brand-text font-mono text-right">{registration.crNo}</span>
          </div>
        )}

        {registration.licenseNo && (
          <div className="flex justify-between items-start text-xs">
            <span className="text-brand-text/50">{d.fieldLicense}:</span>
            <span className="text-brand-text font-mono text-right">{registration.licenseNo}</span>
          </div>
        )}

        {/* Sectors */}
        <div className="flex justify-between items-start text-xs">
          <span className="text-brand-text/50">{d.sectorsHeading}:</span>
          <span className="text-brand-text font-medium text-right max-w-[200px] line-clamp-2">
            {sectorNames}
          </span>
        </div>

        {/* Plan Selected */}
        <div className="flex justify-between items-start text-xs">
          <span className="text-brand-text/50">
            {currentLang === 'en' ? 'Subscribed Tier:' : 'باقة الاشتراك:'}
          </span>
          <span className="text-brand-gold font-bold text-right">{planName}</span>
        </div>

        {/* Pricing / Rates if present */}
        {registration.pricingRates && (
          <div className="flex justify-between items-start text-xs border-t border-brand-teal/5 pt-2">
            <span className="text-brand-text/50">
              {currentLang === 'en' ? 'Pricing & Rates:' : 'الأسعار والتعرفة المعروضة:'}
            </span>
            <span className="text-brand-text font-medium text-right">{registration.pricingRates}</span>
          </div>
        )}

        {/* Product Image preview if present */}
        {registration.productImage && (
          <div className="border-t border-brand-teal/5 pt-3 space-y-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-brand-teal block">
              {currentLang === 'en' ? 'Product Portfolio Gallery' : 'معرض وصور عينات الأعمال'}
            </span>
            <div className="relative rounded overflow-hidden border border-brand-teal/20 max-h-40 bg-brand-bg">
              <img
                src={registration.productImage}
                alt="Uploaded Product Sample"
                referrerPolicy="no-referrer"
                className="w-full h-32 object-cover"
              />
            </div>
          </div>
        )}
      </div>

      <p className="text-[11px] text-brand-text/40 italic mb-8 max-w-sm mx-auto">
        {d.successMeta}
      </p>

      {/* RE-REGISTER BUTTON */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          onClick={onReset}
          id="btn-register-another"
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-lg border border-brand-gold bg-transparent hover:bg-brand-gold/10 text-brand-gold text-xs font-mono uppercase tracking-wider font-bold transition duration-300 w-full sm:w-auto cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>{d.successBack}</span>
        </button>
      </div>
    </motion.div>
  );
}
