export type Language = 'en' | 'ar';

export type UserType = 'supplier' | 'technician' | 'factory';

export interface Registration {
  id: string;
  fullName: string;
  phoneNumber: string;
  crNo?: string;
  licenseNo?: string;
  userType: UserType;
  sectors: string[];
  planId: 'basic' | 'pro' | 'enterprise'; // basic: 90, pro: 200, enterprise: 300
  pricingRates?: string;
  productImage?: string; // base64 premium product image
  matchedWith?: string; // ID of another registration this is linked with
  status?: 'pending' | 'approved' | 'rejected' | 'in_progress'; // Approval state managed by the secure admin panel
  timestamp: number;
  urgent?: boolean;
  privateNote?: string;
  comments?: Comment[];
}

export interface Comment {
  id: string;
  adminName: string;
  text: string;
  timestamp: number;
}

export interface SectorOption {
  id: string;
  en: string;
  ar: string;
}

export interface PricingPlan {
  id: 'basic' | 'pro' | 'enterprise';
  enName: string;
  arName: string;
  enPrice: string;
  arPrice: string;
  enPeriod: string;
  arPeriod: string;
  enFeatures: string[];
  arFeatures: string[];
  popular?: boolean;
}

export const SECTORS: SectorOption[] = [
  { id: 'petrochemicals', en: 'Petrochemicals', ar: 'البتروكيماويات' },
  { id: 'manufacturing', en: 'Manufacturing', ar: 'التصنيع الغذائي والتحويلي' },
  { id: 'food_beverage', en: 'Food & Beverage', ar: 'الأغذية والمشروبات' },
  { id: 'construction', en: 'Construction', ar: 'التشييد والبناء' },
  { id: 'utilities', en: 'Utilities', ar: 'المرافق والخدمات العامة' },
  { id: 'logistics', en: 'Logistics', ar: 'الخدمات اللوجستية والنقل' },
];

export const PLANS: PricingPlan[] = [
  {
    id: 'basic',
    enName: 'Basic Entry',
    arName: 'الدخول الأساسي',
    enPrice: '90 SAR',
    arPrice: '٩٠ ر.س',
    enPeriod: 'per month',
    arPeriod: 'شهريًا',
    enFeatures: [
      'Standard directory listing',
      'Receive inbound RFQs',
      'Basic profile page',
      'List your specialized sectors'
    ],
    arFeatures: [
      'إدراج أساسي في دليل الشركات والموردين',
      'استلام طلبات عروض الأسعار الواردة',
      'صفحة تعريفية للمنشأة',
      'إدراج القطاعات المتخصصة والخدمات'
    ]
  },
  {
    id: 'pro',
    enName: 'Advanced Premium',
    arName: 'المحترف المميز',
    enPrice: '200 SAR',
    arPrice: '٢٠٠ ر.س',
    enPeriod: 'per month',
    arPeriod: 'شهريًا',
    enFeatures: [
      'Upload Custom Products & Catalog',
      'List specific pricing & work rates',
      'Verified Supplier Gold Badge',
      'Priority quote placement',
      'Direct messaging with factories'
    ],
    arFeatures: [
      'رفع صور المنتجات وعينات الأعمال لملف التعريف',
      'إدراج تفاصيل الأسعار ومعدلات الأجور بالتفصيل',
      'شارة المورد المعتمد الذهبية',
      'الأولوية في تصدر عروض الأسعار',
      'التراسل والتعاقد المباشر والموثق'
    ],
    popular: true
  },
  {
    id: 'enterprise',
    enName: 'Elite Ultimate',
    arName: 'النخبة الشامل',
    enPrice: '300 SAR',
    arPrice: '٣٠٠ ر.س',
    enPeriod: 'per month',
    arPeriod: 'شهريًا',
    enFeatures: [
      'All Advanced Premium features included',
      'Unlimited product uploads & gallery',
      'Match & auto-link with smart contract pipelines',
      'Custom API/ERP systems connection',
      'Dedicated local procurement officer'
    ],
    arFeatures: [
      'تشمل كافة الميزات للمحترف المميز',
      'رفع عدد غير محدود من صور المنتجات والمعارض',
      'الربط والمطابقة التلقائية مع عقود المشاريع الكبرى',
      'تكامل مخصص مع أنظمة المشتريات والـ ERP',
      'مسؤول مشتريات محلي مخصص لتسهيل الصفقات'
    ]
  }
];

export interface Dict {
  brand: string;
  tagline: string;
  eyebrow: string;
  heroTitle: string;
  heroSubtitle: string;
  stat1Num: string;
  stat1Label: string;
  stat2Num: string;
  stat2Label: string;
  stat3Num: string;
  stat3Label: string;
  switchLang: string;
  formTitle: string;
  formSubtitle: string;
  tabSupplier: string;
  tabTechnician: string;
  tabFactory: string;
  fieldName: string;
  fieldNamePlaceholder: string;
  fieldPhone: string;
  fieldPhonePlaceholder: string;
  fieldCr: string;
  fieldCrPlaceholder: string;
  fieldLicense: string;
  fieldLicensePlaceholder: string;
  sectorsHeading: string;
  sectorsSub: string;
  pricingHeading: string;
  pricingSub: string;
  submitBtn: string;
  submittingBtn: string;
  successTitle: string;
  successMsg: string;
  successRef: string;
  successMeta: string;
  successBack: string;
  errName: string;
  errPhone: string;
  errPhoneFormat: string;
  errCr: string;
  errLicense: string;
  errSectors: string;
  historyTitle: string;
  historySubtitle: string;
  historyNoRecord: string;
  historyClear: string;
  historyCardType: string;
  historyCardCr: string;
  historyCardLicense: string;
  historyCardSectors: string;
  historyCardPlan: string;
  historyCardDate: string;
  popularLabel: string;
  // New pricing & products translated fields
  fieldRates: string;
  fieldRatesPlaceholder: string;
  fieldProductImage: string;
  fieldProductUploadHelp: string;
  premiumOnlyNotice: string;
  adminControlsTitle: string;
  adminControlsSub: string;
  adminMatchBtn: string;
  adminUnmatchBtn: string;
  adminStatusMatched: string;
  adminSelectMatchTarget: string;
  adminLinkWithText: string;
  adminLoginTitle: string;
  adminLoginSub: string;
  adminPassLabel: string;
  adminPassPlaceholder: string;
  adminLoginBtn: string;
  adminLogoutBtn: string;
  adminLoginErr: string;
  adminApproved: string;
  adminPending: string;
  adminRejected: string;
  adminActionApprove: string;
  adminActionReject: string;
  adminStatusLabel: string;
}

export const DICTIONARY: Record<Language, Dict> = {
  en: {
    brand: 'MADAR',
    tagline: 'Connect. Supply. Deliver.',
    eyebrow: 'INTELLIGENT B2B INDUSTRIAL ENGINE',
    heroTitle: 'Connect. Supply. Deliver.',
    heroSubtitle: 'MADAR is the premier digital gateway linking manufacturers, verified suppliers, and professional technicians across the region. Secure your position in the industrial supply chain of tomorrow.',
    stat1Num: '500+',
    stat1Label: 'Verified Factories',
    stat2Num: '12',
    stat2Label: 'Industrial Sectors',
    stat3Num: 'Active',
    stat3Label: 'Early Access Open',
    switchLang: 'عربي',
    formTitle: 'Early Access Registration',
    formSubtitle: 'Join MADAR today to list your capabilities and match with heavy-industry procurement pipelines.',
    tabSupplier: 'Supplier / Vendor',
    tabTechnician: 'Technician',
    tabFactory: 'Factory / Plant',
    fieldName: 'Full Name',
    fieldNamePlaceholder: 'e.g. Abdullah bin Fahad',
    fieldPhone: 'Phone Number',
    fieldPhonePlaceholder: '5XXXXXXXX',
    fieldCr: 'Commercial Registration (CR) No.',
    fieldCrPlaceholder: '10-digit CR number (e.g. 1010XXXXXX)',
    fieldLicense: 'Professional License / ID No.',
    fieldLicensePlaceholder: 'Enter professional license or national ID',
    sectorsHeading: 'Industrial Sectors',
    sectorsSub: 'Select the industrial domains you operate in (select at least one)',
    pricingHeading: 'Select Subscription Tier',
    pricingSub: 'Choose a plan for your early-access onboarding (no credit card required)',
    submitBtn: 'Secure My Early Access',
    submittingBtn: 'Processing Credentials...',
    successTitle: 'Onboarding Authorized',
    successMsg: 'Your registration was recorded successfully in MADAR directory storage.',
    successRef: 'Reference ID',
    successMeta: 'Credentials stored locally. Our logistics verification team will contact you within 24 hours.',
    successBack: 'Register Another Account',
    errName: 'Full name is required (minimum 3 characters)',
    errPhone: 'Phone number is required',
    errPhoneFormat: 'Please enter a valid Saudi phone number (9 digits starting with 5)',
    errCr: 'Valid 10-digit CR number is required',
    errLicense: 'Valid license or ID is required (minimum 5 characters)',
    errSectors: 'Please select at least one industrial sector',
    historyTitle: 'Control Room (Local Database)',
    historySubtitle: 'Verify registrations, track status, and link suppliers with manufacturing plants.',
    historyNoRecord: 'No active local registrations found.',
    historyClear: 'Clear Local Cache',
    historyCardType: 'Entity Class',
    historyCardCr: 'CR Registry',
    historyCardLicense: 'License/ID',
    historyCardSectors: 'Sectors',
    historyCardPlan: 'Tier',
    historyCardDate: 'Registered On',
    popularLabel: 'RECOMMENDED',
    fieldRates: 'Pricing, Wages or Supply Rates',
    fieldRatesPlaceholder: 'e.g., 250 SAR/hour, or dynamic quotation',
    fieldProductImage: 'Upload Product or Portfolio Image',
    fieldProductUploadHelp: 'Drag & drop or click to upload (Premium feature)',
    premiumOnlyNotice: 'Unlocked only on Premium Plans (200 SAR or 300 SAR plans). Choose a premium tier below to showcase your portfolio/products.',
    adminControlsTitle: 'Madar Matching Engine',
    adminControlsSub: 'Link this registrant with an existing factory/supplier to establish pipeline agreements.',
    adminMatchBtn: 'Link/Match Entity',
    adminUnmatchBtn: 'Break Match Link',
    adminStatusMatched: 'MATCHED AGREEMENT',
    adminSelectMatchTarget: 'Select target entity to link with:',
    adminLinkWithText: 'LINKED WITH',
    adminLoginTitle: 'Admin Portal Authentication',
    adminLoginSub: 'Secure gateway for verified MADAR administrators and operators.',
    adminPassLabel: 'Security Access Passcode',
    adminPassPlaceholder: 'Enter administrator security key',
    adminLoginBtn: 'Authenticate & Access',
    adminLogoutBtn: 'Disconnect Session',
    adminLoginErr: 'Invalid administrator security key code.',
    adminApproved: 'Approved',
    adminPending: 'Pending Review',
    adminRejected: 'Rejected',
    adminActionApprove: 'Approve Submission',
    adminActionReject: 'Reject Submission',
    adminStatusLabel: 'Registry Approval Status',
  },
  ar: {
    brand: 'مدار',
    tagline: 'تواصل. جهّز. سلّم.',
    eyebrow: 'المحرك الصناعي الذكي لقطاع الأعمال B2B',
    heroTitle: 'تواصل. جهّز. سلّم.',
    heroSubtitle: '«مدار» هي البوابة الرقمية الرائدة التي تربط المصانع، والموردين المعتمدين، والفنيين المهنيين في جميع أنحاء المنطقة. أمّن مكانك الريادي في سلاسل التوريد الصناعية للمستقبل.',
    stat1Num: '+٥٠٠',
    stat1Label: 'مصنع معتمد ومسجل',
    stat2Num: '١٢',
    stat2Label: 'قطاعاً صناعياً',
    stat3Num: 'مفتوح',
    stat3Label: 'باب التسجيل المبكر',
    switchLang: 'English',
    formTitle: 'تسجيل الانضمام المبكر',
    formSubtitle: 'انضم إلى مدار اليوم لإدراج قدراتك اللوجستية والارتباط بقنوات التوريد والمشتريات الثقيلة.',
    tabSupplier: 'مورد / بائع',
    tabTechnician: 'فني مهني',
    tabFactory: 'مصنع / منشأة',
    fieldName: 'الاسم الكامل',
    fieldNamePlaceholder: 'مثال: عبدالله بن فهد',
    fieldPhone: 'رقم الجوال',
    fieldPhonePlaceholder: '5XXXXXXXX',
    fieldCr: 'رقم السجل التجاري',
    fieldCrPlaceholder: 'رقم السجل التجاري المكون من ١٠ أرقام',
    fieldLicense: 'رقم الترخيص المهني / الهوية',
    fieldLicensePlaceholder: 'أدخل رقم الترخيص المهني أو الهوية الوطنية',
    sectorsHeading: 'القطاعات الصناعية',
    sectorsSub: 'اختر المجالات الصناعية التي تعمل بها (يرجى اختيار قطاع واحد على الأقل)',
    pricingHeading: 'اختر باقة الاشتراك المرجوة',
    pricingSub: 'اختر باقة مناسبة لانضمامك المبكر (لا يتطلب بطاقة ائتمانية حالياً)',
    submitBtn: 'تأكيد التسجيل المبكر',
    submittingBtn: 'جاري معالجة البيانات...',
    successTitle: 'تم تأكيد طلب الانضمام',
    successMsg: 'تم تسجيل بياناتك بنجاح في نظام قاعدة بيانات مدار المحلية.',
    successRef: 'الرقم المرجعي للطلب',
    successMeta: 'البيانات مسجلة محلياً في المتصفح. سيتواصل معك فريق التحقق واللوجستيات لدينا خلال ٢٤ ساعة.',
    successBack: 'تسجيل حساب آخر',
    errName: 'الاسم الكامل مطلوب (أكثر من ٣ أحرف)',
    errPhone: 'رقم الجوال مطلوب لتأكيد الهوية',
    errPhoneFormat: 'يرجى إدخال رقم جوال سعودي صحيح (٩ أرقام تبدأ بـ 5)',
    errCr: 'مطلوب رقم سجل تجاري صحيح مكون من ١٠ أرقام',
    errLicense: 'مطلوب رقم ترخيص أو هوية وطنية صحيحة (٥ خانات على الأقل)',
    errSectors: 'يرجى اختيار قطاع صناعي واحد على الأقل للمطابقة',
    historyTitle: 'لوحة تحكم المشرفين والربط',
    historySubtitle: 'التحقق الآمن من بيانات المسجلين، اعتماد الطلبات أو رفضها، ومطابقة الكيانات المختلفة.',
    historyNoRecord: 'لا توجد سجلات انضمام نشطة مخزنة حالياً.',
    historyClear: 'مسح التخزين المؤقت بالكامل',
    historyCardType: 'فئة الجهة',
    historyCardCr: 'رقم السجل التجاري',
    historyCardLicense: 'رقم الترخيص/الهوية',
    historyCardSectors: 'القطاعات المسجلة',
    historyCardPlan: 'باقة الاشتراك',
    historyCardDate: 'تاريخ التسجيل',
    popularLabel: 'الباقة الموصى بها',
    fieldRates: 'الأسعار، الأجور أو تكلفة التوريد المعروضة',
    fieldRatesPlaceholder: 'مثال: ٢٥٠ ر.س/ساعة، أو عروض تسعير مرنة حسب الطلب',
    fieldProductImage: 'رفع صورة لمنتج أو عينات من أعمالك',
    fieldProductUploadHelp: 'اسحب وأفلت الصورة هنا أو انقر للرفع (ميزة الباقة المميزة)',
    premiumOnlyNotice: 'مفتوح فقط في الباقات المميزة (باقة ٢٠٠ وباقة ٣٠٠ ر.س). يرجى تحديد باقة مميزة بالأسفل لتتمكن من إدراج معرض وصور أعمالك.',
    adminControlsTitle: 'محرك مطابقة وإسناد مدار للطلبات',
    adminControlsSub: 'اربط هذا المسجل مع مصنع أو مورد حالي لتوقيع شراكة لوجستية أو إسناد مهمة توريد.',
    adminMatchBtn: 'مطابقة وإسناد الطلب',
    adminUnmatchBtn: 'إلغاء ربط المطابقة',
    adminStatusMatched: 'تم إسناد وتوقيع المطابقة',
    adminSelectMatchTarget: 'اختر الكيان المستهدف لربطه معه:',
    adminLinkWithText: 'مرتبط ومسند إلى الكيان',
    adminLoginTitle: 'بوابة تسجيل دخول المشرفين الموثوقة',
    adminLoginSub: 'الوصول آمن ومحمي لمشرفي منصة مدار لإقرار الطلبات والمطابقة.',
    adminPassLabel: 'رمز المرور الأمني للمشرفين',
    adminPassPlaceholder: 'أدخل الرقم السري للمشرف لفك قفل النظام',
    adminLoginBtn: 'تسجيل دخول آمن وتأكيد الصلاحية',
    adminLogoutBtn: 'تسجيل الخروج الأمني',
    adminLoginErr: 'رمز المرور الأمني الذي أدخلته غير صحيح.',
    adminApproved: 'تم الاعتماد والموافقة',
    adminPending: 'قيد المراجعة والتدقيق',
    adminRejected: 'مرفوض',
    adminActionApprove: 'اعتماد وموافقة على الطلب',
    adminActionReject: 'رفض وإلغاء الطلب',
    adminStatusLabel: 'حالة الطلب في سجل المنصة',
  }
};

export interface EmailLog {
  id: string;
  registrationId: string;
  recipientName: string;
  recipientEmail: string;
  subject: string;
  body: string;
  status: 'sent' | 'failed';
  timestamp: number;
  urgent?: boolean;
}


