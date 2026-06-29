import React, { useState } from 'react';
import {
  Language,
  DICTIONARY,
  UserType,
  SECTORS,
  PLANS,
  Registration,
} from '../types';
import {
  User,
  Phone,
  Building2,
  FileText,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  DollarSign,
  Briefcase,
  UploadCloud,
  Lock,
  Image as ImageIcon,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface RegistrationFormProps {
  currentLang: Language;
  onSubmitSuccess: (registration: Omit<Registration, 'id' | 'timestamp'>) => void;
}

export default function RegistrationForm({
  currentLang,
  onSubmitSuccess,
}: RegistrationFormProps) {
  const d = DICTIONARY[currentLang];

  // Form states
  const [userType, setUserType] = useState<UserType>('supplier');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [crNo, setCrNo] = useState('');
  const [licenseNo, setLicenseNo] = useState('');
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<'basic' | 'pro' | 'enterprise'>('pro');
  
  // Premium fields states
  const [pricingRates, setPricingRates] = useState('');
  const [productImage, setProductImage] = useState<string | undefined>(undefined);
  const [isDragging, setIsDragging] = useState(false);

  // Error states
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Switch tabs
  const handleTabChange = (type: UserType) => {
    setUserType(type);
    // Clear errors when switching tabs
    setErrors({});
  };

  // Multi-select sector chips
  const toggleSector = (sectorId: string) => {
    if (selectedSectors.includes(sectorId)) {
      setSelectedSectors(selectedSectors.filter((id) => id !== sectorId));
    } else {
      setSelectedSectors([...selectedSectors, sectorId]);
    }
    // Clear sector error if selected
    if (errors.sectors) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy.sectors;
        return copy;
      });
    }
  };

  // File Upload Handlers (Base64 conversion)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProductImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (selectedPlan !== 'basic') {
      setIsDragging(true);
    }
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (selectedPlan === 'basic') return;
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProductImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Name validation
    if (!fullName || fullName.trim().length < 3) {
      newErrors.fullName = d.errName;
    }

    // Phone validation (Saudi phone number: 9 digits starting with 5, e.g. 512345678)
    const saudiPhoneRegex = /^5[0-9]{8}$/;
    if (!phoneNumber) {
      newErrors.phoneNumber = d.errPhone;
    } else if (!saudiPhoneRegex.test(phoneNumber.trim())) {
      newErrors.phoneNumber = d.errPhoneFormat;
    }

    // CR No. validation for Supplier and Factory (10 digits)
    if (userType === 'supplier' || userType === 'factory') {
      const crRegex = /^[0-9]{10}$/;
      if (!crNo) {
        newErrors.crNo = d.errCr;
      } else if (!crRegex.test(crNo.trim())) {
        newErrors.crNo = d.errCr;
      }
    }

    // License No. validation for Technician
    if (userType === 'technician') {
      if (!licenseNo || licenseNo.trim().length < 5) {
        newErrors.licenseNo = d.errLicense;
      }
    }

    // Sectors validation (at least 1 sector must be selected)
    if (selectedSectors.length === 0) {
      newErrors.sectors = d.errSectors;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      // Find first error and scroll to it if necessary
      return;
    }

    setIsSubmitting(true);

    // Simulate authentic network latency for high fidelity
    setTimeout(() => {
      onSubmitSuccess({
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.trim(),
        crNo: (userType === 'supplier' || userType === 'factory') ? crNo.trim() : undefined,
        licenseNo: userType === 'technician' ? licenseNo.trim() : undefined,
        userType,
        sectors: selectedSectors,
        planId: selectedPlan,
        pricingRates: (selectedPlan !== 'basic' && pricingRates.trim()) ? pricingRates.trim() : undefined,
        productImage: (selectedPlan !== 'basic') ? productImage : undefined,
      });
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <div
      className="w-full bg-brand-card/90 border border-brand-teal/30 rounded-lg p-6 md:p-8 shadow-2xl relative overflow-hidden backdrop-blur-md"
      id="madar-registration-card"
    >
      {/* Decorative technical line in corner */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-brand-teal via-brand-gold to-brand-teal" />

      {/* Form Header */}
      <div className="mb-6">
        <h2 className="text-xl md:text-2xl font-serif font-bold text-brand-gold">
          {d.formTitle}
        </h2>
        <p className="text-xs md:text-sm text-brand-text/70 mt-1">
          {d.formSubtitle}
        </p>
      </div>

      {/* TABS SELECTOR */}
      <div className="grid grid-cols-3 gap-1 bg-brand-bg/60 p-1.5 rounded-lg border border-brand-teal/10 mb-6">
        {(['supplier', 'technician', 'factory'] as UserType[]).map((type) => {
          const isActive = userType === type;
          let label = d.tabSupplier;
          if (type === 'technician') label = d.tabTechnician;
          if (type === 'factory') label = d.tabFactory;

          return (
            <button
              key={type}
              type="button"
              id={`tab-select-${type}`}
              onClick={() => handleTabChange(type)}
              className={`py-2 px-1 text-xs md:text-sm rounded-md font-medium transition-all duration-300 cursor-pointer text-center ${
                isActive
                  ? 'bg-brand-gold text-brand-bg font-semibold shadow'
                  : 'text-brand-text/60 hover:text-brand-text hover:bg-brand-card/50'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* INPUT FIELDS */}
        <div className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-brand-teal/80 mb-1.5 font-medium">
              {d.fieldName} <span className="text-brand-gold">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-brand-text/40">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={fullName}
                id="input-full-name"
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (errors.fullName) {
                    setErrors((prev) => {
                      const c = { ...prev };
                      delete c.fullName;
                      return c;
                    });
                  }
                }}
                className={`w-full bg-brand-bg/75 border rounded-lg py-2.5 pl-10 pr-4 text-sm text-brand-text placeholder-brand-text/30 focus:outline-none focus:ring-1 transition-all ${
                  errors.fullName
                    ? 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500'
                    : 'border-brand-teal/25 focus:ring-brand-gold/50 focus:border-brand-gold'
                }`}
                placeholder={d.fieldNamePlaceholder}
              />
            </div>
            {errors.fullName && (
              <p className="text-[11px] text-red-400 mt-1 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                <span>{errors.fullName}</span>
              </p>
            )}
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-brand-teal/80 mb-1.5 font-medium">
              {d.fieldPhone} <span className="text-brand-gold">*</span>
            </label>
            <div className="relative">
              {/* Country Code Badge */}
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-brand-text/40 gap-1.5">
                <Phone className="w-4 h-4" />
                <span className="text-xs font-mono text-brand-teal/70 font-semibold border-r border-brand-teal/20 pr-2">
                  +966
                </span>
              </div>
              <input
                type="text"
                value={phoneNumber}
                id="input-phone-number"
                onChange={(e) => {
                  // Only allow digits, max 9 length
                  const val = e.target.value.replace(/\D/g, '').slice(0, 9);
                  setPhoneNumber(val);
                  if (errors.phoneNumber) {
                    setErrors((prev) => {
                      const c = { ...prev };
                      delete c.phoneNumber;
                      return c;
                    });
                  }
                }}
                className={`w-full bg-brand-bg/75 border rounded-lg py-2.5 pl-24 pr-4 text-sm font-mono text-brand-text placeholder-brand-text/30 focus:outline-none focus:ring-1 transition-all ${
                  errors.phoneNumber
                    ? 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500'
                    : 'border-brand-teal/25 focus:ring-brand-gold/50 focus:border-brand-gold'
                }`}
                placeholder={d.fieldPhonePlaceholder}
              />
            </div>
            {errors.phoneNumber && (
              <p className="text-[11px] text-red-400 mt-1 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                <span>{errors.phoneNumber}</span>
              </p>
            )}
          </div>

          {/* CR Number (Supplier and Factory only) */}
          {(userType === 'supplier' || userType === 'factory') && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
            >
              <label className="block text-xs font-mono uppercase tracking-wider text-brand-teal/80 mb-1.5 font-medium">
                {d.fieldCr} <span className="text-brand-gold">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-brand-text/40">
                  <Building2 className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={crNo}
                  id="input-cr-number"
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setCrNo(val);
                    if (errors.crNo) {
                      setErrors((prev) => {
                        const c = { ...prev };
                        delete c.crNo;
                        return c;
                      });
                    }
                  }}
                  className={`w-full bg-brand-bg/75 border rounded-lg py-2.5 pl-10 pr-4 text-sm font-mono text-brand-text placeholder-brand-text/30 focus:outline-none focus:ring-1 transition-all ${
                    errors.crNo
                      ? 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500'
                      : 'border-brand-teal/25 focus:ring-brand-gold/50 focus:border-brand-gold'
                  }`}
                  placeholder={d.fieldCrPlaceholder}
                />
              </div>
              {errors.crNo && (
                <p className="text-[11px] text-red-400 mt-1 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                  <span>{errors.crNo}</span>
                </p>
              )}
            </motion.div>
          )}

          {/* Professional License (Technician only) */}
          {userType === 'technician' && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
            >
              <label className="block text-xs font-mono uppercase tracking-wider text-brand-teal/80 mb-1.5 font-medium">
                {d.fieldLicense} <span className="text-brand-gold">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-brand-text/40">
                  <FileText className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={licenseNo}
                  id="input-license-number"
                  onChange={(e) => {
                    setLicenseNo(e.target.value);
                    if (errors.licenseNo) {
                      setErrors((prev) => {
                        const c = { ...prev };
                        delete c.licenseNo;
                        return c;
                      });
                    }
                  }}
                  className={`w-full bg-brand-bg/75 border rounded-lg py-2.5 pl-10 pr-4 text-sm text-brand-text placeholder-brand-text/30 focus:outline-none focus:ring-1 transition-all ${
                    errors.licenseNo
                      ? 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500'
                      : 'border-brand-teal/25 focus:ring-brand-gold/50 focus:border-brand-gold'
                  }`}
                  placeholder={d.fieldLicensePlaceholder}
                />
              </div>
              {errors.licenseNo && (
                <p className="text-[11px] text-red-400 mt-1 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                  <span>{errors.licenseNo}</span>
                </p>
              )}
            </motion.div>
          )}
        </div>

        {/* PREMIUM FIELDS (Wages, pricing and Product Portfolio) */}
        <div className="border border-brand-teal/15 bg-brand-bg/30 rounded-lg p-5 relative overflow-hidden">
          {/* Overlay for Basic Plan */}
          {selectedPlan === 'basic' && (
            <div className="absolute inset-0 bg-brand-bg/90 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center z-10 transition-all duration-300">
              <div className="w-10 h-10 rounded-full bg-brand-gold/10 flex items-center justify-center mb-2 border border-brand-gold/30">
                <Lock className="w-5 h-5 text-brand-gold animate-pulse" />
              </div>
              <h4 className="text-xs font-mono uppercase tracking-wider text-brand-gold font-bold">
                {currentLang === 'en' ? 'Premium Feature Locked' : 'ميزة الباقات المميزة مغلقة'}
              </h4>
              <p className="text-[11px] text-brand-text/70 max-w-sm mt-1 mb-3 leading-relaxed">
                {d.premiumOnlyNotice}
              </p>
              <button
                type="button"
                onClick={() => setSelectedPlan('pro')}
                className="px-3 py-1.5 bg-brand-gold text-brand-bg text-[11px] font-sans font-bold rounded hover:bg-brand-gold/90 transition-all cursor-pointer uppercase tracking-wider"
              >
                {currentLang === 'en' ? 'Upgrade to Pro Plan (200 SAR)' : 'الترقية للباقة المميزة (٢٠٠ ر.س)'}
              </button>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="text-sm font-mono uppercase tracking-wider text-brand-gold flex items-center gap-1.5 font-bold">
              <Briefcase className="w-4 h-4 text-brand-teal" />
              <span>{currentLang === 'en' ? 'Portfolio & Service Rates' : 'معرض المنتجات ومعدلات الأسعار'}</span>
              <span className="text-[10px] bg-brand-teal/20 text-brand-teal px-1.5 py-0.5 rounded uppercase tracking-widest font-sans font-normal ml-auto">
                PREMIUM
              </span>
            </h3>

            {/* Pricing Rates Field */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-brand-teal/80 mb-1.5 font-medium">
                {d.fieldRates}
              </label>
              <div className="relative">
                <div className="absolute top-3 left-3 text-brand-text/40">
                  <DollarSign className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={pricingRates}
                  id="input-pricing-rates"
                  onChange={(e) => setPricingRates(e.target.value)}
                  className="w-full bg-brand-bg/75 border border-brand-teal/25 rounded-lg py-2.5 pl-10 pr-4 text-sm text-brand-text placeholder-brand-text/30 focus:outline-none focus:ring-1 focus:ring-brand-gold/50 focus:border-brand-gold transition-all"
                  placeholder={d.fieldRatesPlaceholder}
                />
              </div>
            </div>

            {/* Product Image drag and drop Upload */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-brand-teal/80 mb-1.5 font-medium">
                {d.fieldProductImage}
              </label>

              {productImage ? (
                <div className="relative rounded-lg border border-brand-teal/30 bg-brand-bg/60 p-2 overflow-hidden flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={productImage}
                      alt="Product sample"
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 rounded object-cover border border-brand-teal/20"
                    />
                    <div>
                      <p className="text-xs font-mono text-brand-teal font-medium">
                        {currentLang === 'en' ? 'Product image selected' : 'تم اختيار صورة المنتج'}
                      </p>
                      <p className="text-[10px] text-brand-text/50">
                        {currentLang === 'en' ? 'Ready to upload' : 'جاهزة للرفع والمطابقة'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setProductImage(undefined)}
                    className="p-1.5 rounded-full bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-300 relative ${
                    isDragging
                      ? 'border-brand-gold bg-brand-gold/5'
                      : 'border-brand-teal/20 bg-brand-bg/45 hover:border-brand-teal/40'
                  }`}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <UploadCloud className="w-8 h-8 text-brand-teal/50 mx-auto mb-2" />
                  <p className="text-xs text-brand-text font-medium">
                    {d.fieldProductUploadHelp}
                  </p>
                  <p className="text-[10px] text-brand-text/45 mt-1">
                    {currentLang === 'en' ? 'Supports PNG, JPG, GIF up to 5MB' : 'يدعم صيغ PNG, JPG, GIF حتى ٥ ميجابايت'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SECTORS MULTI-SELECT CHIPS */}
        <div>
          <div className="mb-2">
            <label className="block text-xs font-mono uppercase tracking-wider text-brand-teal/80 font-medium">
              {d.sectorsHeading} <span className="text-brand-gold">*</span>
            </label>
            <p className="text-[11px] text-brand-text/50 mt-0.5">
              {d.sectorsSub}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {SECTORS.map((sector) => {
              const isSelected = selectedSectors.includes(sector.id);
              const labelName = currentLang === 'en' ? sector.en : sector.ar;

              return (
                <button
                  key={sector.id}
                  type="button"
                  id={`sector-chip-${sector.id}`}
                  onClick={() => toggleSector(sector.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? 'bg-brand-teal/15 text-brand-teal border-brand-teal shadow-md'
                      : 'bg-brand-bg/40 text-brand-text/70 border-brand-teal/10 hover:border-brand-teal/35 hover:text-brand-text'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-brand-teal animate-pulse" />}
                    <span>{labelName}</span>
                  </span>
                </button>
              );
            })}
          </div>
          {errors.sectors && (
            <p className="text-[11px] text-red-400 mt-1.5 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 flex-shrink-0" />
              <span>{errors.sectors}</span>
            </p>
          )}
        </div>

        {/* PRICING PLANS GRID */}
        <div>
          <div className="mb-4">
            <label className="block text-xs font-mono uppercase tracking-wider text-brand-teal/80 font-medium">
              {d.pricingHeading}
            </label>
            <p className="text-[11px] text-brand-text/50 mt-0.5">
              {d.pricingSub}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {PLANS.map((plan) => {
              const isSelected = selectedPlan === plan.id;
              const name = currentLang === 'en' ? plan.enName : plan.arName;
              const price = currentLang === 'en' ? plan.enPrice : plan.arPrice;
              const period = currentLang === 'en' ? plan.enPeriod : plan.arPeriod;
              const features = currentLang === 'en' ? plan.enFeatures : plan.arFeatures;

              return (
                <div
                  key={plan.id}
                  id={`pricing-card-${plan.id}`}
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`p-4 rounded-xl border relative cursor-pointer flex flex-col justify-between transition-all duration-300 ${
                    isSelected
                      ? 'bg-brand-bg border-brand-gold shadow-lg shadow-brand-gold/10 scale-[1.02]'
                      : 'bg-brand-bg/40 border-brand-teal/10 hover:border-brand-teal/25 hover:bg-brand-bg/60'
                  }`}
                >
                  {plan.popular && (
                    <span className="absolute -top-2.5 left-4 px-2 py-0.5 bg-brand-gold text-brand-bg text-[9px] font-mono font-bold rounded uppercase tracking-wider">
                      {d.popularLabel}
                    </span>
                  )}

                  <div>
                    {/* Header */}
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-bold text-brand-text">
                        {name}
                      </span>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                          isSelected
                            ? 'border-brand-gold bg-brand-gold/20'
                            : 'border-brand-text/25'
                        }`}
                      >
                        {isSelected && (
                          <div className="w-1.5 h-1.5 rounded-full bg-brand-gold" />
                        )}
                      </div>
                    </div>

                    {/* Price */}
                    <div className="mb-3">
                      <span className="text-lg font-serif font-black text-brand-gold">
                        {price}
                      </span>
                      <span className="text-[10px] text-brand-text/50 ml-1 block">
                        {period}
                      </span>
                    </div>

                    {/* Features (Mini style for grid layout compaction) */}
                    <ul className="space-y-1.5 text-[10px] text-brand-text/75 mt-4 border-t border-brand-teal/5 pt-3">
                      {features.slice(0, 3).map((f, i) => (
                        <li key={i} className="flex items-start gap-1">
                          <CheckCircle2 className="w-3 h-3 text-brand-teal mt-0.5 flex-shrink-0" />
                          <span className="line-clamp-2">{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <motion.button
          type="submit"
          id="btn-submit-registration"
          disabled={isSubmitting}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="w-full relative group bg-brand-gold hover:bg-brand-gold-hover text-brand-bg font-sans font-bold py-3.5 px-6 rounded-xl transition duration-300 disabled:opacity-50 flex items-center justify-center gap-2 shadow-xl shadow-brand-gold/10 cursor-pointer text-sm"
        >
          {isSubmitting ? (
            <>
              {/* Spinner */}
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-brand-bg"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  document-dir="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>{d.submittingBtn}</span>
            </>
          ) : (
            <>
              <span>{d.submitBtn}</span>
              {currentLang === 'en' ? (
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              ) : (
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              )}
            </>
          )}
        </motion.button>
      </form>
    </div>
  );
}
