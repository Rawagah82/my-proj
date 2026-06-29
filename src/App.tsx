import { useState, useEffect } from 'react';
import { Language, Registration, DICTIONARY, SECTORS, EmailLog, Comment } from './types';
import BackgroundGrid from './components/BackgroundGrid';
import Header from './components/Header';
import Hero from './components/Hero';
import RegistrationForm from './components/RegistrationForm';
import SuccessView from './components/SuccessView';
import SubmissionHistory from './components/SubmissionHistory';
import { motion, AnimatePresence } from 'motion/react';
import { Database, AlertCircle, HelpCircle, Maximize2, X, Printer, Shield, Share2, MessageSquare, Send, User, ChevronDown, FileText, Layers } from 'lucide-react';
import { sendMockStatusEmail } from './lib/mockEmailService';

const timelineContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.18,
      delayChildren: 0.25,
    }
  }
};

const timelineItemVariants = {
  hidden: { opacity: 0, y: 15, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 90,
      damping: 14
    }
  }
};

export default function App() {
  // Load initial settings
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('madar_lang');
    if (saved === 'en' || saved === 'ar') return saved;
    // Default based on browser locale or standard English
    return 'en';
  });

  const [step, setStep] = useState<'register' | 'success'>('register');
  const [activeRegistration, setActiveRegistration] = useState<Registration | null>(null);
  const [allRegistrations, setAllRegistrations] = useState<Registration[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [toastNotification, setToastNotification] = useState<{
    id: string;
    recipient: string;
    subject: string;
    body: string;
    urgent?: boolean;
  } | null>(null);
  const [isEmailExpanded, setIsEmailExpanded] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');
  const [activeTemplateDropdown, setActiveTemplateDropdown] = useState<'private_note' | 'comm_log' | null>(null);
  const [selectedRegIds, setSelectedRegIds] = useState<string[]>([]);

  const BILINGUAL_TEMPLATES = [
    {
      id: 'under_review',
      labelEn: 'Under Compliance Review',
      labelAr: 'قيد مراجعة الامتثال',
      textEn: 'Registration is currently under compliance review. Secondary verification of credentials and industrial licenses is in progress.',
      textAr: 'التسجيل قيد مراجعة الامتثال حالياً. جاري التحقق الثانوي من أوراق الاعتماد والتراخيص الصناعية.'
    },
    {
      id: 'missing_docs',
      labelEn: 'Missing Supporting Documents',
      labelAr: 'مستندات داعمة مفقودة',
      textEn: 'Additional supporting documentation is required. Pending verification of the industrial license validity and local commercial registration.',
      textAr: 'مطلوب مستندات داعمة إضافية. قيد انتظار التحقق من صلاحية الترخيص الصناعي والسجل التجاري المحلي.'
    },
    {
      id: 'approved_conditional',
      labelEn: 'Approved with Conditions',
      labelAr: 'موافقة مشروطة',
      textEn: 'Approved with standard conditional compliance. Subject to annual audit and routine inspections.',
      textAr: 'التسجيل معتمد بشروط امتثال قياسية. يخضع للتدقيق السنوي والزيارات الميدانية الروتينية.'
    },
    {
      id: 'security_cleared',
      labelEn: 'Security & Integrity Verified',
      labelAr: 'التحقق من الأمان والسلامة',
      textEn: 'Security clearance and background verification completed successfully. Approved for operational readiness.',
      textAr: 'تم الانتهاء من التخليص الأمني والتحقق من الخلفية بنجاح. معتمد للجاهزية التشغيلية.'
    }
  ];


  // Synchronize document direction and lang attributes for full native RTL layout
  useEffect(() => {
    const dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.dir = dir;
    document.documentElement.lang = language;
    localStorage.setItem('madar_lang', language);
  }, [language]);

  // Load submissions on mount
  useEffect(() => {
    const saved = localStorage.getItem('madar_registrations');
    if (saved) {
      try {
        setAllRegistrations(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse registrations', e);
      }
    }
  }, []);

  // Save submissions helper
  const saveRegistrations = (records: Registration[]) => {
    setAllRegistrations(records);
    localStorage.setItem('madar_registrations', JSON.stringify(records));
  };

  // Toggle Language
  const handleLanguageToggle = () => {
    setLanguage((prev) => (prev === 'en' ? 'ar' : 'en'));
  };

  // Handle Submit Success
  const handleSubmitSuccess = (formData: Omit<Registration, 'id' | 'timestamp'>) => {
    // Generate simple industrial reference code e.g. MADAR-739281
    const randId = Math.floor(100000 + Math.random() * 900000);
    const newRecord: Registration = {
      ...formData,
      id: `MADAR-${randId}`,
      status: 'pending',
      timestamp: Date.now(),
    };

    const updated = [newRecord, ...allRegistrations];
    saveRegistrations(updated);
    setActiveRegistration(newRecord);
    setStep('success');
    setShowHistory(false); // Close history view to show success
  };

  // Delete Individual Record
  const handleDeleteRecord = (id: string) => {
    const filtered = allRegistrations.filter((r) => r.id !== id);
    saveRegistrations(filtered);
    if (activeRegistration && activeRegistration.id === id) {
      setActiveRegistration(null);
      setStep('register');
    }
  };

  // Clear All Records
  const handleClearAll = () => {
    if (
      window.confirm(
        language === 'en'
          ? 'Are you sure you want to delete all registration records from local storage?'
          : 'هل أنت متأكد من رغبتك في حذف جميع سجلات التسجيل من التخزين المحلي؟'
      )
    ) {
      saveRegistrations([]);
      setActiveRegistration(null);
      setStep('register');
      setShowHistory(false);
    }
  };

  // Link/Match Two Registrations
  const handleLinkRecords = (sourceId: string, targetId: string | undefined) => {
    const updated = allRegistrations.map((r) => {
      if (r.id === sourceId) {
        return { ...r, matchedWith: targetId };
      }
      // Also vice versa if they select to auto-pair, but let's keep it clean: one-way assignment of pipeline.
      return r;
    });
    saveRegistrations(updated);
  };

  // Update Approval Status
  const handleUpdateStatus = (id: string, status: 'pending' | 'approved' | 'rejected') => {
    let matchedRecord: Registration | undefined;
    const updated = allRegistrations.map((r) => {
      if (r.id === id) {
        matchedRecord = r;
        return { ...r, status };
      }
      return r;
    });
    saveRegistrations(updated);
    // Also update activeRegistration state if currently viewed
    if (activeRegistration && activeRegistration.id === id) {
      setActiveRegistration({ ...activeRegistration, status });
    }

    if (matchedRecord) {
      // Simulate sending transactional email
      const emailLog = sendMockStatusEmail(matchedRecord, matchedRecord.status, status, language);
      setIsEmailExpanded(false);
      setToastNotification({
        id: emailLog.id,
        recipient: emailLog.recipientEmail,
        subject: emailLog.subject,
        body: emailLog.body,
      });
      // Auto-dismiss after 8 seconds
      setTimeout(() => {
        setToastNotification((prev) => prev?.id === emailLog.id ? null : prev);
      }, 8000);
    }
  };

  // Bulk Update Approval Status
  const handleBulkUpdateStatus = (ids: string[], status: 'pending' | 'approved' | 'rejected') => {
    let matchedRecords: Registration[] = [];
    const updated = allRegistrations.map((r) => {
      if (ids.includes(r.id)) {
        matchedRecords.push(r);
        return { ...r, status };
      }
      return r;
    });
    saveRegistrations(updated);

    // Update activeRegistration state if currently viewed and is in bulk change
    if (activeRegistration && ids.includes(activeRegistration.id)) {
      setActiveRegistration({ ...activeRegistration, status });
    }

    // Trigger mock emails for each record
    matchedRecords.forEach((record) => {
      sendMockStatusEmail(record, record.status, status, language);
    });

    // Show a bulk notification toast
    if (matchedRecords.length > 0) {
      setIsEmailExpanded(false);
      setToastNotification({
        id: `BULK-${Date.now()}`,
        recipient: language === 'en' 
          ? `${matchedRecords.length} Selected Entities` 
          : `${matchedRecords.length} من الكيانات المحددة`,
        subject: language === 'en'
          ? `[MADAR] Bulk Status Update - ${status.toUpperCase()}`
          : `[مدار] تحديث جماعي للحالة - ${status === 'approved' ? 'مقبول' : status === 'rejected' ? 'مرفوض' : 'قيد الانتظار'}`,
        body: language === 'en'
          ? `Status updated to ${status.toUpperCase()} for ${matchedRecords.length} organizations.\n\nSimulated email alerts have been logged and dispatched to their procurement channels.\nCheck the "Email Dispatch Logs" tab for details.`
          : `تم تحديث الحالة إلى [${status === 'approved' ? 'مقبول' : status === 'rejected' ? 'مرفوض' : 'قيد الانتظار'}] لعدد ${matchedRecords.length} من المنشآت والكيانات الصناعية.\n\nتم إرسال وحفظ رسائل البريد المحاكاة الخاصة بهم بنجاح.\nيرجى مراجعة التفاصيل في تبويب "سجل الإشعارات والبريد".`,
      });
    }
  };

  // Bulk Delete Records
  const handleBulkDeleteRecords = (ids: string[]) => {
    const filtered = allRegistrations.filter((r) => !ids.includes(r.id));
    saveRegistrations(filtered);
    if (activeRegistration && ids.includes(activeRegistration.id)) {
      setActiveRegistration(null);
      setStep('register');
    }
  };


  // Seed Realistic Demo Data for Testing Approvals & Matching
  const handleSeedDemoData = () => {
    const demoRecords: Registration[] = [
      {
        id: 'MADAR-482931',
        fullName: language === 'en' ? 'Al-Faris Petrochemicals Factory' : 'مصنع الفارس للبتروكيماويات والبوليمرات',
        phoneNumber: '551234567',
        crNo: '1010948372',
        userType: 'factory',
        sectors: ['petrochemicals', 'manufacturing'],
        planId: 'enterprise',
        status: 'pending',
        timestamp: Date.now() - 3600000 * 24, // 1 day ago
      },
      {
        id: 'MADAR-910283',
        fullName: language === 'en' ? 'SABIC Raw Logistics & Supply' : 'شركة سابك اللوجستية وتوريد المواد الخام',
        phoneNumber: '569876543',
        crNo: '1010837492',
        userType: 'supplier',
        sectors: ['logistics', 'petrochemicals'],
        planId: 'pro',
        pricingRates: language === 'en' ? '120 SAR / metric ton' : '١٢٠ ر.س لكل طن متري',
        productImage: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=400',
        status: 'approved',
        timestamp: Date.now() - 3600000 * 12, // 12 hours ago
      },
      {
        id: 'MADAR-283749',
        fullName: language === 'en' ? 'Eng. Omar Al-Ahmadi (Piping Expert)' : 'المهندس عمر الأحمدي (خبير الأنابيب واللحام)',
        phoneNumber: '547382910',
        licenseNo: '4829102',
        userType: 'technician',
        sectors: ['construction', 'utilities'],
        planId: 'pro',
        pricingRates: language === 'en' ? '150 SAR / hour' : '١٥٠ ر.س لكل ساعة عمل',
        productImage: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=400',
        status: 'pending',
        timestamp: Date.now() - 1800000, // 30 mins ago
      }
    ];
    saveRegistrations(demoRecords);
  };

  const handleResetForm = () => {
    setActiveRegistration(null);
    setStep('register');
    setShowHistory(false);
  };

  const d = DICTIONARY[language];

  // Find the registration associated with the currently shown toast (if any)
  const printRegistrant = toastNotification ? allRegistrations.find(
    (r) => r.id === toastNotification.id || 
    toastNotification.recipient.includes(r.id) ||
    toastNotification.body.includes(r.id) ||
    (r.fullName && toastNotification.recipient.toLowerCase().includes(r.fullName.toLowerCase())) ||
    (r.phoneNumber && toastNotification.body.includes(r.phoneNumber))
  ) : null;

  // Generate visual timeline status checkpoints for print-ready audit logs
  const getTimelineEvents = (record: Registration) => {
    interface TimelineEvent {
      title: string;
      description: string;
      time: string;
      completed: boolean;
      highlight?: 'success' | 'danger' | 'warning';
    }

    const events: TimelineEvent[] = [
      {
        title: language === 'en' ? 'Registration Submitted' : 'تقديم طلب التسجيل الإلكتروني',
        description: language === 'en' 
          ? `Entity registered on MADAR portal under the ${record.planId.toUpperCase()} plan.`
          : `تم تقديم طلب التسجيل الإلكتروني بنجاح على بوابة مدار تحت الباقة [${record.planId.toUpperCase()}].`,
        time: new Date(record.timestamp).toLocaleString(language === 'en' ? 'en-US' : 'ar-SA'),
        completed: true,
      },
      {
        title: language === 'en' ? 'Automated Document Verification' : 'التحقق الآلي ومطابقة الوثائق',
        description: record.crNo 
          ? (language === 'en' ? `Commercial Registry ${record.crNo} validated against national database.` : `تمت مطابقة السجل التجاري رقم ${record.crNo} آلياً مع قواعد البيانات الموحدة.`)
          : record.licenseNo 
            ? (language === 'en' ? `Professional License ${record.licenseNo} validated.` : `تم التحقق من الرخصة المهنية رقم ${record.licenseNo} بنجاح.`)
            : (language === 'en' ? 'Basic credentials and contact profile verified.' : 'تم التحقق من البيانات التعريفية الأساسية وجوال التواصل.'),
        time: new Date(record.timestamp + 5 * 60 * 1000).toLocaleString(language === 'en' ? 'en-US' : 'ar-SA'),
        completed: true,
      },
      {
        title: language === 'en' ? 'MADAR Compliance Audit Board' : 'مراجعة لجنة الالتزام والتدقيق',
        description: language === 'en'
          ? 'Manual compliance routing, sector alignment, and credential review.'
          : 'إحالة الطلب للمراجعة البشرية ومطابقة التخصصات وتصنيفات النشاط الصناعي.',
        time: new Date(record.timestamp + 15 * 60 * 1000).toLocaleString(language === 'en' ? 'en-US' : 'ar-SA'),
        completed: true,
      },
    ];

    const finalStatus = record.status || 'pending';
    if (finalStatus === 'approved') {
      events.push({
        title: language === 'en' ? 'Final Status: APPROVED' : 'القرار النهائي: مقبول ومعتمد',
        description: language === 'en'
          ? 'Official endorsement granted. Procurement channel opened and dispatch notice generated.'
          : 'تمت الموافقة الرسمية واعتماد المنشأة بالكامل في دليل الموردين وتفعيل قنوات التواصل.',
        time: new Date(record.timestamp + 45 * 60 * 1000).toLocaleString(language === 'en' ? 'en-US' : 'ar-SA'),
        completed: true,
        highlight: 'success',
      });
    } else if (finalStatus === 'rejected') {
      events.push({
        title: language === 'en' ? 'Final Status: REJECTED' : 'القرار النهائي: مرفوض',
        description: language === 'en'
          ? 'Application did not meet MADAR standard procurement guidelines. Notification issued.'
          : 'لم يستوفِ الطلب الشروط أو الإرشادات القياسية لشبكة مدار. تم إرسال الإشعار والتوضيحات.',
        time: new Date(record.timestamp + 45 * 60 * 1000).toLocaleString(language === 'en' ? 'en-US' : 'ar-SA'),
        completed: true,
        highlight: 'danger',
      });
    } else {
      events.push({
        title: language === 'en' ? 'Final Status: PENDING REVIEW' : 'القرار النهائي: قيد الانتظار والمراجعة',
        description: language === 'en'
          ? 'Awaiting final administrative sign-off or partner matching feedback.'
          : 'بانتظار الاعتماد النهائي من الإدارة أو مطابقة قنوات التوريد المناسبة للارتباط.',
        time: language === 'en' ? 'In Progress' : 'قيد الإجراء حالياً',
        completed: false,
        highlight: 'warning',
      });
    }

    return events;
  };

  const getGeneralTimelineEvents = () => {
    interface TimelineEvent {
      title: string;
      description: string;
      time: string;
      completed: boolean;
      highlight?: 'success' | 'danger' | 'warning';
    }
    
    return [
      {
        title: language === 'en' ? 'System Notification Generated' : 'تم إنتاج إشعار النظام المعتمد',
        description: language === 'en' 
          ? 'Automated notification template generated successfully.' 
          : 'تم تجميع وإنشاء قالب الإشعار التلقائي للمعاملة بنجاح.',
        time: language === 'en' ? 'Verified Session' : 'جلسة موثقة',
        completed: true,
      },
      {
        title: language === 'en' ? 'DKIM Cryptographic Signature' : 'التوقيع الرقمي والتشفير الآمن',
        description: language === 'en' 
          ? 'Email envelope cryptographically signed with 2048-bit keys.' 
          : 'تم توقيع مغلف البريد الإلكتروني رقمياً لحماية البيانات وموثوقية المصدر.',
        time: language === 'en' ? 'TLS 1.3 Active' : 'بروتوكول TLS 1.3 نشط',
        completed: true,
      },
      {
        title: language === 'en' ? 'Dispatched to Delivery Gateway' : 'تم التسليم لبوابة الإرسال بنجاح',
        description: language === 'en' 
          ? 'Transactional dispatch logged and transmitted to recipient.' 
          : 'تم إرسال وقيد المعاملة الصادرة ونقلها إلى بريد المستهدفين بنجاح.',
        time: language === 'en' ? 'Delivered' : 'تم التسليم',
        completed: true,
        highlight: 'success' as const,
      }
    ];
  };

  const getRecordStatus = (): 'approved' | 'rejected' | 'pending' | 'in_progress' => {
    if (printRegistrant) {
      return (printRegistrant.status as 'approved' | 'rejected' | 'pending' | 'in_progress') || 'pending';
    }
    const subjectLower = toastNotification?.subject.toLowerCase() || '';
    const bodyLower = toastNotification?.body.toLowerCase() || '';
    if (subjectLower.includes('approved') || subjectLower.includes('approval') || bodyLower.includes('approved') || bodyLower.includes('تم قبول') || bodyLower.includes('معتمد')) {
      return 'approved';
    }
    if (subjectLower.includes('rejected') || subjectLower.includes('rejection') || bodyLower.includes('rejected') || bodyLower.includes('تم رفض') || bodyLower.includes('مرفوض')) {
      return 'rejected';
    }
    return 'pending';
  };

  const renderStatusBadge = (status: 'approved' | 'rejected' | 'pending' | 'in_progress', size: 'sm' | 'md' = 'sm') => {
    let bg = '';
    let border = '';
    let text = '';
    let labelEn = '';
    let labelAr = '';

    if (status === 'approved') {
      bg = 'bg-brand-teal/15';
      border = 'border-brand-teal/30';
      text = 'text-brand-teal';
      labelEn = 'Approved';
      labelAr = 'مقبول / معتمد';
    } else if (status === 'rejected') {
      bg = 'bg-red-500/10';
      border = 'border-red-500/30';
      text = 'text-red-400';
      labelEn = 'Rejected';
      labelAr = 'مرفوض';
    } else if (status === 'in_progress') {
      bg = 'bg-sky-500/15';
      border = 'border-sky-500/30';
      text = 'text-sky-400';
      labelEn = 'In Progress';
      labelAr = 'قيد العمل';
    } else {
      bg = 'bg-brand-gold/15';
      border = 'border-brand-gold/30';
      text = 'text-brand-gold';
      labelEn = 'Pending Review';
      labelAr = 'قيد المراجعة';
    }

    const padding = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

    return (
      <span className={`inline-flex items-center font-mono font-bold rounded border ${bg} ${border} ${text} ${padding} gap-1.5 shrink-0 shadow-sm`}>
        <span className={`w-1.5 h-1.5 rounded-full ${
          status === 'approved' ? 'bg-brand-teal animate-pulse' :
          status === 'rejected' ? 'bg-red-400' :
          status === 'in_progress' ? 'bg-sky-400 animate-pulse' :
          'bg-brand-gold animate-pulse'
        }`} />
        <span>{language === 'en' ? labelEn : labelAr}</span>
      </span>
    );
  };

  const handleToggleUrgent = () => {
    if (!toastNotification) return;
    const nextUrgent = !toastNotification.urgent;
    
    // 1. Update active toast state
    setToastNotification({
      ...toastNotification,
      urgent: nextUrgent
    });

    // 2. Update persistent mock email log in localStorage
    try {
      const existingLogsJson = localStorage.getItem('madar_email_logs');
      if (existingLogsJson) {
        const existingLogs: EmailLog[] = JSON.parse(existingLogsJson);
        const updatedLogs = existingLogs.map(log => {
          if (log.id === toastNotification.id) {
            return { ...log, urgent: nextUrgent };
          }
          return log;
        });
        localStorage.setItem('madar_email_logs', JSON.stringify(updatedLogs));
      }
    } catch (e) {
      console.error('Failed to update email log urgent status', e);
    }

    // 3. Update corresponding Registration urgent status if possible
    try {
      const existingLogsJson = localStorage.getItem('madar_email_logs');
      if (existingLogsJson) {
        const existingLogs: EmailLog[] = JSON.parse(existingLogsJson);
        const targetLog = existingLogs.find(log => log.id === toastNotification.id);
        if (targetLog && targetLog.registrationId) {
          const updatedRegs = allRegistrations.map(r => {
            if (r.id === targetLog.registrationId) {
              return { ...r, urgent: nextUrgent };
            }
            return r;
          });
          saveRegistrations(updatedRegs);
          if (activeRegistration && activeRegistration.id === targetLog.registrationId) {
            setActiveRegistration({ ...activeRegistration, urgent: nextUrgent });
          }
        }
      }
    } catch (e) {
      console.error('Failed to update registration urgent status', e);
    }
  };

  const handleUpdatePrivateNote = (note: string) => {
    if (!toastNotification) return;

    // We can find the registration corresponding to this toastNotification
    const targetReg = allRegistrations.find(
      (r) => r.id === toastNotification.id || 
      toastNotification.recipient.includes(r.id) ||
      toastNotification.body.includes(r.id) ||
      (r.fullName && toastNotification.recipient.toLowerCase().includes(r.fullName.toLowerCase())) ||
      (r.phoneNumber && toastNotification.body.includes(r.phoneNumber))
    );

    if (targetReg) {
      const updatedRegs = allRegistrations.map(r => {
        if (r.id === targetReg.id) {
          return { ...r, privateNote: note };
        }
        return r;
      });
      saveRegistrations(updatedRegs);
      
      if (activeRegistration && activeRegistration.id === targetReg.id) {
        setActiveRegistration({ ...activeRegistration, privateNote: note });
      }
    }
  };

  const handleAssignToMe = () => {
    if (!toastNotification) return;

    const targetReg = allRegistrations.find(
      (r) => r.id === toastNotification.id || 
      toastNotification.recipient.includes(r.id) ||
      toastNotification.body.includes(r.id) ||
      (r.fullName && toastNotification.recipient.toLowerCase().includes(r.fullName.toLowerCase())) ||
      (r.phoneNumber && toastNotification.body.includes(r.phoneNumber))
    );

    if (targetReg) {
      const adminName = "rawagah.j";
      const assignmentLine = language === 'en'
        ? `[Assigned to Admin ${adminName}]`
        : `[تم التعيين للمشرف ${adminName}]`;

      const existingNote = targetReg.privateNote || '';
      const newNote = existingNote 
        ? `${existingNote.trim()}\n${assignmentLine}`
        : assignmentLine;

      const updatedRegs = allRegistrations.map(r => {
        if (r.id === targetReg.id) {
          return { ...r, privateNote: newNote, status: 'in_progress' as const };
        }
        return r;
      });
      saveRegistrations(updatedRegs);
      
      if (activeRegistration && activeRegistration.id === targetReg.id) {
        setActiveRegistration({ ...activeRegistration, privateNote: newNote, status: 'in_progress' });
      }
    }
  };

  const simulateColleagueReply = (targetRegId: string) => {
    const currentRegs = JSON.parse(localStorage.getItem('madar_registrations') || '[]');
    const targetReg = currentRegs.find((r: Registration) => r.id === targetRegId);
    if (!targetReg) return;

    const mockAdmins = [
      { name: "Sarah_Compliance", replyEn: "Compliance check complete. Documents verified.", replyAr: "اكتمل فحص المطابقة. تم التحقق من المستندات." },
      { name: "Faisal_Legal", replyEn: "Reviewing license validation. Looks fully compliant.", replyAr: "مراجعة صلاحية الترخيص. يبدو متوافقاً تماماً." },
      { name: "Compliance_Bot", replyEn: "Automated risk assessment: LOW RISK. Standard operational flow enabled.", replyAr: "تقييم المخاطر التلقائي: مخاطر منخفضة. تم تفعيل مسار العمل القياسي." },
      { name: "Yousef_Audit", replyEn: "Verification audit trail updated. Ready for final approval.", replyAr: "تم تحديث سجل مراجعة التحقق. جاهز للموافقة النهائية." }
    ];

    const randomAdmin = mockAdmins[Math.floor(Math.random() * mockAdmins.length)];
    const replyText = language === 'en' ? randomAdmin.replyEn : randomAdmin.replyAr;

    const replyComment: Comment = {
      id: `CMT-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      adminName: randomAdmin.name,
      text: replyText,
      timestamp: Date.now(),
    };

    const updatedComments = [...(targetReg.comments || []), replyComment];
    const updatedRegs = currentRegs.map((r: Registration) => {
      if (r.id === targetReg.id) {
        return { ...r, comments: updatedComments };
      }
      return r;
    });

    setAllRegistrations(updatedRegs);
    localStorage.setItem('madar_registrations', JSON.stringify(updatedRegs));
    
    if (activeRegistration && activeRegistration.id === targetReg.id) {
      setActiveRegistration(prev => prev ? { ...prev, comments: updatedComments } : null);
    }
  };

  const handleAddComment = (commentText: string, authorName: string = "rawagah.j") => {
    if (!toastNotification || !commentText.trim()) return;

    const targetReg = allRegistrations.find(
      (r) => r.id === toastNotification.id || 
      toastNotification.recipient.includes(r.id) ||
      toastNotification.body.includes(r.id) ||
      (r.fullName && toastNotification.recipient.toLowerCase().includes(r.fullName.toLowerCase())) ||
      (r.phoneNumber && toastNotification.body.includes(r.phoneNumber))
    );

    if (targetReg) {
      const newComment: Comment = {
        id: `CMT-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        adminName: authorName,
        text: commentText,
        timestamp: Date.now(),
      };

      const updatedComments = [...(targetReg.comments || []), newComment];
      const updatedRegs = allRegistrations.map(r => {
        if (r.id === targetReg.id) {
          return { ...r, comments: updatedComments };
        }
        return r;
      });
      saveRegistrations(updatedRegs);
      
      if (activeRegistration && activeRegistration.id === targetReg.id) {
        setActiveRegistration({ ...activeRegistration, comments: updatedComments });
      }

      if (authorName === "rawagah.j") {
        setTimeout(() => {
          simulateColleagueReply(targetReg.id);
        }, 1500);
      }
    }
  };

  const handleInsertTemplate = (target: 'private_note' | 'comm_log', templateId: string) => {
    const template = BILINGUAL_TEMPLATES.find(t => t.id === templateId);
    if (!template) return;

    const bilingualText = `[EN] ${template.textEn}\n[AR] ${template.textAr}`;

    if (target === 'private_note') {
      if (!toastNotification) return;
      const targetReg = allRegistrations.find(
        (r) => r.id === toastNotification.id || 
        toastNotification.recipient.includes(r.id) ||
        toastNotification.body.includes(r.id) ||
        (r.fullName && toastNotification.recipient.toLowerCase().includes(r.fullName.toLowerCase())) ||
        (r.phoneNumber && toastNotification.body.includes(r.phoneNumber))
      );
      if (targetReg) {
        const existingNote = targetReg.privateNote || '';
        const newNote = existingNote 
          ? `${existingNote.trim()}\n\n${bilingualText}`
          : bilingualText;
        
        const updatedRegs = allRegistrations.map(r => {
          if (r.id === targetReg.id) {
            return { ...r, privateNote: newNote };
          }
          return r;
        });
        saveRegistrations(updatedRegs);
        
        if (activeRegistration && activeRegistration.id === targetReg.id) {
          setActiveRegistration({ ...activeRegistration, privateNote: newNote });
        }
      }
    } else if (target === 'comm_log') {
      setNewCommentText(bilingualText);
    }
    setActiveTemplateDropdown(null);
  };

  const handleApplyNoteToBatch = () => {
    if (!printRegistrant) return;
    const noteText = printRegistrant.privateNote || '';
    if (!noteText.trim()) {
      alert(language === 'en' 
        ? 'Please write a private note or insert a template first.' 
        : 'يرجى كتابة ملاحظة خاصة أو إدراج قالب أولاً.');
      return;
    }

    if (selectedRegIds.length === 0) {
      alert(language === 'en' 
        ? 'No registrations selected in the main table. Please select registrations in the submissions history table first.' 
        : 'لم يتم تحديد أي تسجيلات في الجدول الرئيسي. يرجى تحديد التسجيلات في جدول سجل الطلبات أولاً.');
      return;
    }

    const confirmMsg = language === 'en'
      ? `Are you sure you want to apply this note to all ${selectedRegIds.length} selected registrations?`
      : `هل أنت متأكد من رغبتك في تطبيق هذه الملاحظة على جميع التسجيلات المحددة البالغ عددها ${selectedRegIds.length}؟`;

    if (window.confirm(confirmMsg)) {
      const updatedRegs = allRegistrations.map(r => {
        if (selectedRegIds.includes(r.id)) {
          return { ...r, privateNote: noteText };
        }
        return r;
      });
      saveRegistrations(updatedRegs);
      
      // Update active registration if it is part of the updated ones
      if (activeRegistration && selectedRegIds.includes(activeRegistration.id)) {
        setActiveRegistration({ ...activeRegistration, privateNote: noteText });
      }

      alert(language === 'en'
        ? `Successfully applied private note to ${selectedRegIds.length} registrations.`
        : `تم تطبيق الملاحظة الخاصة بنجاح على ${selectedRegIds.length} من التسجيلات.`);
    }
  };

  const handleShare = async () => {
    if (!toastNotification) return;

    const shareData = {
      title: toastNotification.subject,
      text: toastNotification.body,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        console.warn('Native sharing failed, using mailto fallback:', err);
      }
    }

    // Fallback: Mailto link triggered via temporary anchor to be robust in iframes
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(toastNotification.subject)}&body=${encodeURIComponent(toastNotification.body)}`;
    const a = document.createElement('a');
    a.href = mailtoUrl;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="min-h-screen relative bg-brand-bg text-brand-text flex flex-col justify-between font-sans selection:bg-brand-gold selection:text-brand-bg pb-12">
      {/* 1. Animated Industrial Blueprint Background Grid */}
      <BackgroundGrid />

      {/* 2. Sticky Header with Logo and Language switcher */}
      <Header
        currentLang={language}
        onLanguageToggle={handleLanguageToggle}
        onSubmitCount={allRegistrations.length}
        onToggleHistory={() => setShowHistory((prev) => !prev)}
        showHistory={showHistory}
      />

      {/* 3. Main Body Container */}
      <main className="flex-grow flex items-center relative z-10 py-6 md:py-10 px-4 md:px-8">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Hero & Industrial Stats */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <Hero currentLang={language} />
          </div>

          {/* Right Column: Dynamic Form, Success State, or Storage History view */}
          <div className="lg:col-span-7 w-full flex flex-col justify-center">
            <AnimatePresence mode="wait">
              {showHistory ? (
                <motion.div
                  key="history-view"
                  initial={{ opacity: 0, x: language === 'ar' ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: language === 'ar' ? 20 : -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <SubmissionHistory
                    currentLang={language}
                    registrations={allRegistrations}
                    onDeleteRecord={handleDeleteRecord}
                    onClearAll={handleClearAll}
                    onClose={() => setShowHistory(false)}
                    onLinkRecords={handleLinkRecords}
                    onUpdateStatus={handleUpdateStatus}
                    onSeedDemoData={handleSeedDemoData}
                    onBulkUpdateStatus={handleBulkUpdateStatus}
                    onBulkDeleteRecords={handleBulkDeleteRecords}
                    selectedIds={selectedRegIds}
                    onSelectedIdsChange={setSelectedRegIds}
                  />
                </motion.div>
              ) : step === 'register' ? (
                <motion.div
                  key="register-form"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                >
                  <RegistrationForm
                    currentLang={language}
                    onSubmitSuccess={handleSubmitSuccess}
                  />
                </motion.div>
              ) : (
                activeRegistration && (
                  <motion.div
                    key="success-view"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.3 }}
                  >
                    <SuccessView
                      currentLang={language}
                      registration={activeRegistration}
                      onReset={handleResetForm}
                    />
                  </motion.div>
                )
              )}
            </AnimatePresence>
          </div>
          
        </div>
      </main>

      {/* 4. Footer */}
      <footer className="relative z-10 w-full border-t border-brand-teal/5 mt-10 pt-6 px-4 md:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-mono text-brand-text/40">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-gold" />
            <span>
              {language === 'en'
                ? 'MADAR Industrial Platform © 2026. All rights reserved.'
                : 'منصة مدار الصناعية © ٢٠٢٦. جميع الحقوق محفوظة.'}
            </span>
          </div>

          <div className="flex gap-4">
            <a href="#terms" className="hover:text-brand-gold transition duration-200">
              {language === 'en' ? 'Terms of Operations' : 'شروط العمليات'}
            </a>
            <a href="#privacy" className="hover:text-brand-teal transition duration-200">
              {language === 'en' ? 'Supply Chain Protocol' : 'بروتوكول سلسلة الإمداد'}
            </a>
          </div>
        </div>
      </footer>

      {/* 5. Real-Time Outgoing Email Simulation Toast */}
      <AnimatePresence>
        {toastNotification && (
          <motion.div
            key={toastNotification.id}
            initial={{ opacity: 0, y: 60, scale: 0.92, rotateX: 15, rotateY: -10, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0, rotateY: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 30, scale: 0.94, rotateX: -10, filter: "blur(4px)" }}
            transition={{
              type: "spring",
              damping: 18,
              stiffness: 110,
              filter: { duration: 0.3 }
            }}
            style={{ transformPerspective: 1200 }}
            className={`fixed bottom-6 right-6 z-50 max-w-md w-[calc(100vw-32px)] bg-[#0D1526]/95 border-2 hover:bg-[#111B30]/95 rounded-lg shadow-2xl p-4 overflow-hidden backdrop-blur-xl cursor-pointer group transition-all duration-200 ${
              toastNotification.urgent 
                ? 'border-brand-gold shadow-[0_0_20px_rgba(217,119,6,0.65)]' 
                : 'border-brand-gold/40 hover:border-brand-gold/80'
            }`}
            id="simulated-email-toast"
            onClick={() => setIsEmailExpanded(true)}
            title={language === 'en' ? 'Click to expand email view' : 'انقر لتكبير عرض البريد الإلكتروني'}
          >
            {/* Top gold ambient light bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-teal to-brand-gold" />
            
            <div className="flex justify-between items-start gap-4 mb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-mono font-bold text-brand-gold uppercase tracking-widest">
                  {language === 'en' ? '✉️ OUTBOUND EMAIL DISPATCHED (MOCK)' : '✉️ محاكاة إرسال بريد إلكتروني صادر'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                {toastNotification.urgent && (
                  <span className="text-[9px] font-bold font-mono text-brand-gold bg-brand-gold/10 border border-brand-gold/20 px-1.5 py-0.5 rounded tracking-wide animate-pulse">
                    URGENT
                  </span>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEmailExpanded(true);
                  }}
                  className="text-brand-text/40 hover:text-brand-gold transition duration-150 cursor-pointer p-0.5 rounded hover:bg-white/5"
                  title={language === 'en' ? 'Expand View' : 'تكبير العرض'}
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setToastNotification(null);
                  }}
                  className="text-brand-text/40 hover:text-brand-gold transition duration-150 cursor-pointer text-xs font-mono font-bold"
                >
                  ✕ {language === 'en' ? 'Dismiss' : 'إغلاق'}
                </button>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="bg-black/40 border border-brand-teal/10 rounded p-2 font-mono space-y-1">
                <div className="flex justify-between items-start gap-2">
                  <div className="space-y-1 min-w-0">
                    <div>
                      <span className="text-brand-text/50">{language === 'en' ? 'To: ' : 'إلى: '}</span>
                      <span className="text-brand-teal font-bold break-all">{toastNotification.recipient}</span>
                    </div>
                    <div>
                      <span className="text-brand-text/50">{language === 'en' ? 'Subject: ' : 'الموضوع: '}</span>
                      <span className="text-brand-text break-all">{toastNotification.subject}</span>
                    </div>
                  </div>
                  <div className="shrink-0 pt-0.5">
                    {renderStatusBadge(getRecordStatus(), 'sm')}
                  </div>
                </div>
              </div>

              <div className="bg-black/50 border border-brand-teal/10 rounded p-2.5 font-mono text-[11px] leading-relaxed text-brand-text/80 h-32 overflow-y-auto whitespace-pre-wrap select-all">
                {toastNotification.body}
              </div>

              {/* Admin Urgent Toggle Row */}
              <div 
                onClick={(e) => e.stopPropagation()} 
                className={`flex justify-between items-center bg-black/40 border rounded px-2.5 py-1.5 text-[11px] font-mono transition duration-150 ${
                  toastNotification.urgent 
                    ? 'border-brand-gold/40 bg-brand-gold/5' 
                    : 'border-brand-teal/10'
                }`}
              >
                <div className="flex items-center gap-1.5 text-brand-text/60">
                  <Shield className="w-3.5 h-3.5 text-brand-gold/80" />
                  <span className="font-bold text-[10px] uppercase tracking-wider">{language === 'en' ? 'Admin Override:' : 'تجاوز المشرف:'}</span>
                </div>
                <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                  <span className={`text-[10px] font-bold ${toastNotification.urgent ? 'text-brand-gold animate-pulse' : 'text-brand-text/40'}`}>
                    {language === 'en' ? 'MARK AS URGENT' : 'تحديد كعاجل'}
                  </span>
                  <input
                    type="checkbox"
                    checked={!!toastNotification.urgent}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleToggleUrgent();
                    }}
                    className="w-3.5 h-3.5 rounded border-brand-teal/30 text-brand-gold focus:ring-brand-gold bg-brand-bg cursor-pointer accent-brand-gold"
                  />
                </label>
              </div>

              <div className="text-[10px] text-brand-text/40 italic font-mono text-center pt-1 flex items-center justify-center gap-1 group-hover:text-brand-gold transition duration-150">
                <span>🔎 {language === 'en' ? 'Click anywhere on this card to Expand' : 'انقر في أي مكان لتكبير العرض'}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expanded Email Modal Overlay */}
      <AnimatePresence>
        {isEmailExpanded && toastNotification && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
            onClick={() => setIsEmailExpanded(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="relative max-w-4xl w-full bg-[#0D1526] border-2 border-brand-gold rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Gold gradient top line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-teal via-brand-gold to-brand-teal" />
              
              {/* Modal Header */}
              <div className="flex justify-between items-center px-6 py-4 border-b border-brand-teal/15 bg-black/20">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-2.5 w-2.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <h3 className="text-xs font-mono font-bold text-brand-gold uppercase tracking-wider">
                    {language === 'en' ? '✉️ TRANSACTIONAL EMAIL OUTBOX (SIMULATED)' : '✉️ صندوق الصادر البريدي للمحاكاة'}
                  </h3>
                </div>
                <div className="flex items-center gap-3">
                  {renderStatusBadge(getRecordStatus(), 'sm')}
                  <button
                    onClick={() => setIsEmailExpanded(false)}
                    className="p-1 rounded-full text-brand-text/40 hover:text-brand-gold hover:bg-white/5 transition duration-150 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto flex-1">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  
                  {/* Left Column: Email Headers and Body */}
                  <div className="lg:col-span-7 space-y-4">
                    {/* Simulated Email Envelope Headers */}
                    <div className="bg-black/35 border border-brand-teal/15 rounded-lg p-4 font-mono text-xs space-y-2">
                      <div className="flex">
                        <span className="w-20 text-brand-text/40 font-bold shrink-0">{language === 'en' ? 'From:' : 'من:'}</span>
                        <span className="text-brand-text/80">verification@madar-industrial.sa</span>
                      </div>
                      <div className="flex">
                        <span className="w-20 text-brand-text/40 font-bold shrink-0">{language === 'en' ? 'To:' : 'إلى:'}</span>
                        <span className="text-brand-teal font-bold break-all">{toastNotification.recipient}</span>
                      </div>
                      <div className="flex">
                        <span className="w-20 text-brand-text/40 font-bold shrink-0">{language === 'en' ? 'Subject:' : 'الموضوع:'}</span>
                        <span className="text-brand-text font-bold break-all text-brand-gold">{toastNotification.subject}</span>
                      </div>
                      <div className="flex">
                        <span className="w-20 text-brand-text/40 font-bold shrink-0">{language === 'en' ? 'Security:' : 'الأمان:'}</span>
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          🛡️ {language === 'en' ? 'DKIM-Signed & TLS Encrypted' : 'موقع برمجياً ومشفر آمن'}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className="w-20 text-brand-text/40 font-bold shrink-0">{language === 'en' ? 'Status:' : 'الحالة:'}</span>
                        {renderStatusBadge(getRecordStatus(), 'md')}
                      </div>
                      <div className="flex items-center pt-1.5 border-t border-brand-teal/10 justify-between">
                        <div className="flex items-center gap-1.5 text-brand-text/50">
                          <Shield className="w-3.5 h-3.5 text-brand-gold/80" />
                          <span className="font-bold text-[10px] uppercase tracking-wider">{language === 'en' ? 'Admin Action:' : 'إجراء المشرف:'}</span>
                        </div>
                        <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                          <span className={`text-[10px] font-bold ${toastNotification.urgent ? 'text-brand-gold animate-pulse' : 'text-brand-text/40'}`}>
                            {language === 'en' ? 'MARK AS URGENT' : 'تحديد كعاجل'}
                          </span>
                          <input
                            type="checkbox"
                            checked={!!toastNotification.urgent}
                            onChange={() => handleToggleUrgent()}
                            className="w-3.5 h-3.5 rounded border-brand-teal/30 text-brand-gold focus:ring-brand-gold bg-brand-bg cursor-pointer accent-brand-gold"
                          />
                        </label>
                      </div>
                    </div>

                    {/* Email Body */}
                    <div className="bg-black/50 border border-brand-teal/10 rounded-lg p-5 font-mono text-xs leading-relaxed text-brand-text/90 whitespace-pre-wrap select-all min-h-[250px]">
                      {toastNotification.body}
                    </div>

                    {/* Private Admin Notes Section */}
                    {printRegistrant && (
                      <div className="bg-[#121A2E]/80 border border-brand-gold/30 rounded-lg p-4 space-y-2 font-mono text-xs mt-4">
                        <div className="flex justify-between items-center flex-wrap gap-2 mb-1">
                          <div className="flex items-center gap-2 text-brand-gold font-bold">
                            <Shield className="w-4 h-4 text-brand-gold" />
                            <span className="uppercase tracking-wider">
                              {language === 'en' ? '🔒 INTERNAL PRIVATE NOTE (ADMIN ONLY)' : '🔒 ملاحظة داخلية خاصة (للمشرفين فقط)'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {/* Templates Dropdown for Private Note */}
                            <div className="relative">
                              <button
                                type="button"
                                onClick={() => setActiveTemplateDropdown(activeTemplateDropdown === 'private_note' ? null : 'private_note')}
                                className="px-2.5 py-1 bg-brand-teal/15 hover:bg-brand-teal/25 border border-brand-teal/40 text-brand-teal text-[10px] font-mono font-bold rounded transition cursor-pointer flex items-center gap-1"
                              >
                                <FileText className="w-3 h-3" />
                                <span>{language === 'en' ? 'Templates' : 'القوالب'}</span>
                                <ChevronDown className="w-3 h-3" />
                              </button>
                              
                              {activeTemplateDropdown === 'private_note' && (
                                <div className="absolute right-0 top-full mt-1.5 w-64 bg-[#0d1526] border border-brand-teal/30 rounded-lg shadow-xl z-50 py-1 divide-y divide-brand-teal/10">
                                  {BILINGUAL_TEMPLATES.map((tmpl) => (
                                    <button
                                      key={tmpl.id}
                                      type="button"
                                      onClick={() => handleInsertTemplate('private_note', tmpl.id)}
                                      className="w-full text-left rtl:text-right px-3 py-2 text-[10px] hover:bg-brand-teal/10 text-brand-text/80 hover:text-brand-gold transition duration-150 block"
                                    >
                                      <div className="font-bold">{language === 'en' ? tmpl.labelEn : tmpl.labelAr}</div>
                                      <div className="text-[9px] text-brand-text/40 truncate mt-0.5">{language === 'en' ? tmpl.textEn : tmpl.textAr}</div>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={handleApplyNoteToBatch}
                              disabled={selectedRegIds.length === 0}
                              className={`px-2.5 py-1 text-[10px] font-mono font-bold rounded transition flex items-center gap-1.5 ${
                                selectedRegIds.length > 0
                                  ? 'bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-400 cursor-pointer'
                                  : 'bg-white/5 border border-white/5 text-brand-text/30 cursor-not-allowed opacity-50'
                              }`}
                              title={
                                selectedRegIds.length > 0
                                  ? (language === 'en' ? `Apply this private note to ${selectedRegIds.length} selected records` : `تطبيق هذه الملاحظة الخاصة على ${selectedRegIds.length} سجلات محددة`)
                                  : (language === 'en' ? 'Select registrations in the main table first to apply' : 'حدد التسجيلات في الجدول الرئيسي أولاً لتطبيق الملاحظة')
                              }
                            >
                              <Layers className="w-3 h-3" />
                              <span>
                                {language === 'en' 
                                  ? `Apply to Batch${selectedRegIds.length > 0 ? ` (${selectedRegIds.length})` : ''}` 
                                  : `تطبيق على الدفعة${selectedRegIds.length > 0 ? ` (${selectedRegIds.length})` : ''}`}
                              </span>
                            </button>

                            <button
                              type="button"
                              onClick={handleAssignToMe}
                              className="px-2.5 py-1 bg-brand-gold/15 hover:bg-brand-gold/25 border border-brand-gold/40 text-brand-gold text-[10px] font-mono font-bold rounded transition cursor-pointer flex items-center gap-1.5"
                            >
                              👤 {language === 'en' ? 'Assign to Me' : 'تعيين لي'}
                            </button>
                          </div>
                        </div>
                        <p className="text-[10px] text-brand-text/40 italic">
                          {language === 'en' 
                            ? 'This note is confidential, saved in the registration file, and included in official print outputs as an Internal Note.' 
                            : 'هذه الملاحظة سرية ومحفوظة في ملف التسجيل، وتظهر فقط في مخرجات الطباعة الرسمية كملاحظة داخلية.'}
                        </p>
                        <textarea
                          rows={3}
                          className="w-full bg-black/40 border border-brand-teal/20 rounded p-2 text-brand-text focus:outline-none focus:border-brand-gold transition text-xs leading-normal resize-none placeholder-brand-text/30"
                          placeholder={language === 'en' ? 'Enter private internal verification notes, compliance flags, audit decisions...' : 'أدخل ملاحظات التحقق الداخلي السرية، علامات الامتثال، قرارات التدقيق...'}
                          value={printRegistrant.privateNote || ''}
                          onChange={(e) => handleUpdatePrivateNote(e.target.value)}
                        />
                      </div>
                    )}
                  </div>

                  {/* Right Column: Sequentially Animated Status Timeline & Collaborative Communication Log */}
                  <div className="lg:col-span-5 flex flex-col gap-4 max-h-[600px] overflow-y-auto pr-1">
                    
                    {/* 1. PROCESS AUDIT TIMELINE */}
                    <div className="bg-black/20 border border-brand-teal/15 rounded-xl p-4 flex flex-col">
                      <h4 className="text-xs font-mono font-bold text-brand-gold uppercase tracking-wider mb-3 border-b border-brand-teal/15 pb-2 flex items-center justify-between">
                        <span>⚡ {language === 'en' ? 'PROCESS AUDIT TIMELINE' : 'المخطط الزمني لمراجعة العمليات'}</span>
                        <span className="text-[9px] text-brand-text/40 font-normal font-mono uppercase">
                          {language === 'en' ? 'Real-Time Feed' : 'مباشر'}
                        </span>
                      </h4>
                      
                      <motion.div
                        variants={timelineContainerVariants}
                        initial="hidden"
                        animate="visible"
                        className="relative pl-5 rtl:pl-0 rtl:pr-5 space-y-3 border-l border-brand-teal/20 rtl:border-l-0 rtl:border-r border-dashed ml-1.5 rtl:ml-0 rtl:mr-1.5 max-h-[200px] overflow-y-auto pr-1"
                      >
                        {(printRegistrant ? getTimelineEvents(printRegistrant) : getGeneralTimelineEvents()).map((evt, idx) => (
                          <motion.div
                            key={idx}
                            variants={timelineItemVariants}
                            className="relative text-[11px]"
                          >
                            {/* Indicator Dot */}
                            <div className={`absolute -left-[25px] rtl:-left-auto rtl:-right-[25px] top-1.5 w-2 h-2 rounded-full border border-[#0d1526] z-10 ${
                              evt.highlight === 'success' ? 'bg-brand-teal shadow-[0_0_8px_rgba(20,184,166,0.7)]' :
                              evt.highlight === 'danger' ? 'bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.7)]' :
                              evt.highlight === 'warning' ? 'bg-brand-gold shadow-[0_0_8px_rgba(217,119,6,0.7)]' :
                              'bg-brand-text/40'
                            }`} />
                            
                            {/* Event Card */}
                            <div className="bg-black/40 border border-brand-teal/10 rounded-lg p-2.5 hover:border-brand-teal/30 transition duration-150">
                              <div className="flex justify-between items-start gap-1 flex-wrap mb-1">
                                <h5 className={`font-bold font-mono text-[10px] ${
                                  evt.highlight === 'success' ? 'text-brand-teal' :
                                  evt.highlight === 'danger' ? 'text-red-400' :
                                  evt.highlight === 'warning' ? 'text-brand-gold' :
                                  'text-brand-text/85'
                                }`}>
                                  {evt.title}
                                </h5>
                              </div>
                              <p className="text-[9px] text-brand-text/60 leading-normal mb-1">{evt.description}</p>
                              <div className="text-[8px] font-mono text-brand-text/30 text-right">{evt.time}</div>
                            </div>
                          </motion.div>
                        ))}
                      </motion.div>
                    </div>

                    {/* 2. REAL-TIME COMMUNICATION LOG / COMMENTS */}
                    <div className="bg-black/20 border border-brand-teal/15 rounded-xl p-4 flex flex-col space-y-3">
                      <h4 className="text-xs font-mono font-bold text-brand-gold uppercase tracking-wider border-b border-brand-teal/15 pb-2 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>{language === 'en' ? 'COMMUNICATION LOG' : 'سجل الاتصالات والملاحظات'}</span>
                        </span>
                        <span className="text-[8px] text-emerald-400 font-bold font-mono uppercase bg-emerald-500/10 border border-emerald-500/30 px-1 py-0.5 rounded animate-pulse">
                          ● {language === 'en' ? 'Collaborative' : 'تعاوني'}
                        </span>
                      </h4>

                      {/* Comment Feed List */}
                      <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1 flex flex-col">
                        {!printRegistrant?.comments || printRegistrant.comments.length === 0 ? (
                          <div className="text-center py-6 text-brand-text/30 font-mono text-[10px] space-y-1">
                            <div>💬 {language === 'en' ? 'NO INTERNAL NOTES RECORDED' : 'لا توجد ملاحظات داخلية مسجلة'}</div>
                            <div className="text-[9px] text-brand-text/20">
                              {language === 'en' ? 'Leave a compliance review comment below.' : 'اكتب تعليقاً لمراجعة الامتثال في الأسفل.'}
                            </div>
                          </div>
                        ) : (
                          printRegistrant.comments.map((cmt) => {
                            const isCurrentUser = cmt.adminName === "rawagah.j";
                            return (
                              <div
                                key={cmt.id}
                                className={`p-2.5 rounded-lg border font-mono text-[11px] leading-relaxed transition ${
                                  isCurrentUser
                                    ? 'bg-brand-teal/5 border-brand-teal/20 ml-4 rtl:ml-0 rtl:mr-4'
                                    : 'bg-brand-gold/5 border-brand-gold/20 mr-4 rtl:mr-0 rtl:ml-4'
                                }`}
                              >
                                <div className="flex justify-between items-center mb-1 text-[9px] border-b border-white/5 pb-1">
                                  <span className={`font-bold flex items-center gap-1 ${
                                    isCurrentUser ? 'text-brand-teal' : 'text-brand-gold'
                                  }`}>
                                    <User className="w-2.5 h-2.5" />
                                    {cmt.adminName} {isCurrentUser && `(${language === 'en' ? 'You' : 'أنت'})`}
                                  </span>
                                  <span className="text-brand-text/30">
                                    {new Date(cmt.timestamp).toLocaleTimeString(language === 'en' ? 'en-US' : 'ar-SA', {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                      second: '2-digit',
                                    })}
                                  </span>
                                </div>
                                <p className="text-brand-text/90 text-[10px] break-words whitespace-pre-wrap">{cmt.text}</p>
                              </div>
                            );
                          })
                        )}
                      </div>

                      {/* Comment Input Form */}
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (!newCommentText.trim()) return;
                          handleAddComment(newCommentText, "rawagah.j");
                          setNewCommentText('');
                        }}
                        className="flex gap-2 items-center pt-2 border-t border-brand-teal/10 relative"
                      >
                        {/* Templates Dropdown Button for Comm Log */}
                        <div className="relative shrink-0">
                          <button
                            type="button"
                            onClick={() => setActiveTemplateDropdown(activeTemplateDropdown === 'comm_log' ? null : 'comm_log')}
                            className="p-1.5 bg-brand-teal/15 hover:bg-brand-teal/25 border border-brand-teal/40 text-brand-teal rounded transition cursor-pointer flex items-center justify-center"
                            title={language === 'en' ? 'Quick Templates' : 'القوالب السريعة'}
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>
                          
                          {activeTemplateDropdown === 'comm_log' && (
                            <div className="absolute left-0 rtl:left-auto rtl:right-0 bottom-full mb-1.5 w-64 bg-[#0d1526] border border-brand-teal/30 rounded-lg shadow-xl z-50 py-1 divide-y divide-brand-teal/10">
                              {BILINGUAL_TEMPLATES.map((tmpl) => (
                                <button
                                  key={tmpl.id}
                                  type="button"
                                  onClick={() => handleInsertTemplate('comm_log', tmpl.id)}
                                  className="w-full text-left rtl:text-right px-3 py-2 text-[10px] hover:bg-brand-teal/10 text-brand-text/80 hover:text-brand-gold transition duration-150 block"
                                >
                                  <div className="font-bold">{language === 'en' ? tmpl.labelEn : tmpl.labelAr}</div>
                                  <div className="text-[9px] text-brand-text/40 truncate mt-0.5">{language === 'en' ? tmpl.textEn : tmpl.textAr}</div>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        <input
                          type="text"
                          value={newCommentText}
                          onChange={(e) => setNewCommentText(e.target.value)}
                          placeholder={language === 'en' ? 'Add operational note...' : 'إضافة ملاحظة تشغيلية...'}
                          className="flex-1 min-w-0 bg-black/40 border border-brand-teal/20 rounded px-2.5 py-1.5 text-brand-text text-[11px] font-mono focus:outline-none focus:border-brand-gold transition placeholder-brand-text/30"
                        />
                        <button
                          type="submit"
                          disabled={!newCommentText.trim()}
                          className={`p-1.5 rounded transition ${
                            newCommentText.trim()
                              ? 'bg-brand-gold/20 text-brand-gold hover:bg-brand-gold/30 border border-brand-gold/40 cursor-pointer'
                              : 'bg-white/5 text-brand-text/20 border border-white/5 cursor-not-allowed'
                          }`}
                          title={language === 'en' ? 'Send Note' : 'إرسال الملاحظة'}
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </form>
                    </div>

                  </div>

                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-brand-teal/15 bg-black/10 flex flex-col sm:flex-row justify-between items-center gap-3">
                <span className="text-[10px] text-brand-text/40 italic font-mono">
                  ⚡ {language === 'en' ? 'This notification is logged in the Audit Ledger tab.' : 'تم تسجيل هذا الإشعار تلقائياً في سجلات المراجعة.'}
                </span>
                <div className="flex gap-2 flex-wrap justify-end">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(toastNotification.body);
                    }}
                    className="px-3.5 py-1.5 bg-brand-teal/10 hover:bg-brand-teal/20 border border-brand-teal/30 text-brand-teal text-xs font-mono font-bold rounded transition cursor-pointer"
                  >
                    {language === 'en' ? '📋 Copy Text' : '📋 نسخ المحتوى'}
                  </button>
                  <button
                    onClick={handleShare}
                    className="px-3.5 py-1.5 bg-brand-teal/15 hover:bg-brand-teal/25 border border-brand-teal/40 text-brand-teal text-xs font-mono font-bold rounded transition cursor-pointer flex items-center gap-1.5"
                    title={language === 'en' ? 'Share via Email' : 'مشاركة عبر البريد الإلكتروني'}
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>{language === 'en' ? 'Share via Email' : 'مشاركة البريد'}</span>
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="px-3.5 py-1.5 bg-brand-gold/15 hover:bg-brand-gold/25 border border-brand-gold/40 text-brand-gold text-xs font-mono font-bold rounded transition cursor-pointer flex items-center gap-1.5"
                    title={language === 'en' ? 'Print or Save as PDF' : 'طباعة أو حفظ بصيغة PDF'}
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>{language === 'en' ? 'Print / Save PDF' : 'طباعة / حفظ كـ PDF'}</span>
                  </button>
                  <button
                    onClick={() => setIsEmailExpanded(false)}
                    className="px-3.5 py-1.5 bg-brand-gold hover:bg-brand-gold/80 text-black text-xs font-mono font-bold rounded transition cursor-pointer"
                  >
                    {language === 'en' ? 'Close' : 'إغلاق'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Printable Document (Hidden in Web, Visible in Print via CSS @media print) */}
      <div id="print-document" className="hidden print:block font-sans text-black p-8 bg-white max-w-4xl mx-auto" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        {/* Letterhead */}
        <div className="flex justify-between items-center border-b-4 border-double border-gray-800 pb-4 mb-6">
          <div className="text-left">
            <h1 className="text-2xl font-serif font-black tracking-wider text-gray-900">MADAR INDUSTRIAL</h1>
            <p className="text-[10px] font-mono tracking-widest text-gray-500 uppercase">National B2B Industrial Network</p>
          </div>
          <div className="text-right">
            <h1 className="text-2xl font-serif font-black text-gray-900">شبكة مدار الصناعية</h1>
            <p className="text-[10px] font-mono tracking-widest text-gray-500 uppercase">الشبكة الوطنية لقطاع الأعمال واللوجستيات</p>
          </div>
        </div>

        {/* Document Title */}
        <div className="text-center my-6 space-y-1">
          <h2 className="text-lg font-serif font-bold uppercase tracking-wider text-gray-800 border-b border-gray-300 pb-2 max-w-md mx-auto">
            {language === 'en' ? 'Official Decision & Archival Ledger' : 'سجل القرار الرسمي ووثيقة الاعتماد المعتمدة'}
          </h2>
          <p className="text-[11px] font-mono text-gray-500">
            {language === 'en' ? 'DOCUMENT REF ID:' : 'رقم مرجع الوثيقة:'} {toastNotification?.id || 'MADAR-GEN-LOG'}
          </p>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 gap-6 border border-gray-300 rounded p-4 mb-6 text-xs leading-relaxed">
          <div className="space-y-1">
            <p><strong className="text-gray-700">{language === 'en' ? 'Date generated:' : 'تاريخ الإصدار:'}</strong> {new Date().toLocaleString(language === 'en' ? 'en-US' : 'ar-SA')}</p>
            <p><strong className="text-gray-700">{language === 'en' ? 'Authority Group:' : 'الجهة المصدرة:'}</strong> MADAR Procurement & Compliance Board</p>
            <p>
              <strong className="text-gray-700">{language === 'en' ? 'Compliance Status:' : 'حالة الامتثال:'}</strong>{' '}
              <span className="px-2 py-0.5 border border-black font-bold uppercase font-mono rounded">
                {printRegistrant?.status?.toUpperCase() || (toastNotification?.subject.includes('Bulk') || toastNotification?.id.startsWith('BULK') ? 'BULK STATUS UPDATE' : 'DISPATCHED NOTICE')}
              </span>
            </p>
          </div>
          <div className="space-y-1 text-right">
            {printRegistrant ? (
              <>
                <p><strong className="text-gray-700">{language === 'en' ? 'Entity Name:' : 'اسم الكيان:'}</strong> {printRegistrant.fullName}</p>
                <p><strong className="text-gray-700">{language === 'en' ? 'Entity Type:' : 'نوع النشاط:'}</strong> {printRegistrant.userType === 'supplier' ? (language === 'en' ? 'Supplier / Vendor' : 'مورد / بائع') : printRegistrant.userType === 'technician' ? (language === 'en' ? 'Technician' : 'فني مهني') : (language === 'en' ? 'Factory / Plant' : 'مصنع / منشأة')}</p>
                <p><strong className="text-gray-700">{language === 'en' ? 'Subscription Tier:' : 'باقة الاشتراك:'}</strong> {printRegistrant.planId.toUpperCase()}</p>
              </>
            ) : (
              <>
                <p><strong className="text-gray-700">{language === 'en' ? 'Dispatch Category:' : 'فئة الإرسال:'}</strong> {language === 'en' ? 'System Bulk Broadcast' : 'بث النظام الجماعي'}</p>
                <p><strong className="text-gray-700">{language === 'en' ? 'Recipients Affected:' : 'الجهات المستهدفة:'}</strong> {toastNotification?.recipient}</p>
                <p><strong className="text-gray-700">{language === 'en' ? 'Communication Type:' : 'نوع الاتصال:'}</strong> Transactional Email Broadcast</p>
              </>
            )}
          </div>
        </div>

        {/* Detailed Entity Specification Table */}
        {printRegistrant && (
          <>
            <div className="mb-6 space-y-3">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-gray-700 border-b border-gray-200 pb-1">
                {language === 'en' ? 'I. Registry & License Credentials' : 'أولاً: بيانات القيد والتراخيص المهنية'}
              </h3>
              <table className="w-full text-xs text-left border-collapse border border-gray-200">
                <thead>
                  <tr className="bg-gray-100 border-b border-gray-200">
                    <th className="p-2 border-r border-gray-200 font-mono">{language === 'en' ? 'Parameter' : 'المعيار'}</th>
                    <th className="p-2 font-mono">{language === 'en' ? 'Recorded Value' : 'القيمة المسجلة'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="p-2 border-r border-gray-200 font-bold">{language === 'en' ? 'Contact Phone' : 'جوال التواصل'}</td>
                    <td className="p-2 font-mono">0{printRegistrant.phoneNumber}</td>
                  </tr>
                  {printRegistrant.crNo && (
                    <tr>
                      <td className="p-2 border-r border-gray-200 font-bold">{language === 'en' ? 'Commercial Reg (CR)' : 'السجل التجاري'}</td>
                      <td className="p-2 font-mono">{printRegistrant.crNo}</td>
                    </tr>
                  )}
                  {printRegistrant.licenseNo && (
                    <tr>
                      <td className="p-2 border-r border-gray-200 font-bold">{language === 'en' ? 'Professional License' : 'رقم الرخصة المهنية'}</td>
                      <td className="p-2 font-mono">{printRegistrant.licenseNo}</td>
                    </tr>
                  )}
                  <tr>
                    <td className="p-2 border-r border-gray-200 font-bold">{language === 'en' ? 'Authorized Sectors' : 'القطاعات المصرح بها'}</td>
                    <td className="p-2">
                      {printRegistrant.sectors.map(id => {
                        const sec = SECTORS.find(s => s.id === id);
                        return sec ? (language === 'en' ? sec.en : sec.ar) : id;
                      }).join(', ')}
                    </td>
                  </tr>
                  {printRegistrant.pricingRates && (
                    <tr>
                      <td className="p-2 border-r border-gray-200 font-bold">{language === 'en' ? 'Supply/Wage Rates' : 'تسعير الخدمات/التوريد'}</td>
                      <td className="p-2 font-mono">{printRegistrant.pricingRates}</td>
                    </tr>
                  )}
                  {printRegistrant.matchedWith && (
                    <tr>
                      <td className="p-2 border-r border-gray-200 font-bold">{language === 'en' ? 'Linked Strategic Partner' : 'الارتباط الاستراتيجي'}</td>
                      <td className="p-2 font-mono font-bold text-gray-800">
                        🔗 {printRegistrant.matchedWith}
                      </td>
                    </tr>
                  )}
                  {printRegistrant.privateNote && (
                    <tr>
                      <td className="p-2 border-r border-gray-200 font-bold bg-amber-50/40 text-amber-900">{language === 'en' ? 'Internal Note' : 'ملاحظة داخلية'}</td>
                      <td className="p-2 font-mono text-gray-700 italic bg-amber-50/40">{printRegistrant.privateNote}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Status History Timeline */}
            <div className="mb-6 space-y-3 no-break">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-gray-700 border-b border-gray-200 pb-1">
                {language === 'en' ? 'I.B Registration Status Timeline' : 'أولاً - ب: المخطط الزمني لحالة طلب التسجيل والاعتماد'}
              </h3>
              <div className="relative pl-6 rtl:pl-0 rtl:pr-6 py-2 space-y-4 border-l-2 border-gray-300 rtl:border-l-0 rtl:border-r-2 ml-2 rtl:ml-0 rtl:mr-2">
                {getTimelineEvents(printRegistrant).map((evt, idx) => (
                  <div key={idx} className="relative text-xs">
                    {/* Circle Node indicator on the border line */}
                    <div className="absolute -left-[7px] rtl:-left-auto rtl:-right-[7px] top-1 w-3 h-3 rounded-full border-2 border-gray-800 bg-white flex items-center justify-center z-10">
                      {evt.completed && <div className="w-1.5 h-1.5 rounded-full bg-gray-800" />}
                    </div>
                    
                    {/* Content Card */}
                    <div className="bg-gray-50 border border-gray-200 rounded p-2.5">
                      <div className="flex justify-between items-start gap-2 flex-wrap mb-1">
                        <h4 className={`font-bold ${
                          evt.highlight === 'success' ? 'text-emerald-700' :
                          evt.highlight === 'danger' ? 'text-red-700' :
                          evt.highlight === 'warning' ? 'text-amber-700' :
                          'text-gray-900'
                        }`}>
                          {evt.title}
                        </h4>
                        <span className="text-[10px] font-mono text-gray-500">{evt.time}</span>
                      </div>
                      <p className="text-[11px] text-gray-600 leading-normal">{evt.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Notice Body Section */}
        <div className="mb-8 space-y-3 no-break">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-gray-700 border-b border-gray-200 pb-1">
            {language === 'en' ? 'II. Outbound Communication Log' : 'ثانياً: سجل إشعار الصادر والخطاب'}
          </h3>
          <div className="border border-gray-300 rounded p-4 bg-gray-50 font-mono text-[11px] leading-relaxed whitespace-pre-wrap text-gray-800">
            <div className="border-b border-gray-200 pb-2 mb-3 space-y-1">
              <p><strong>{language === 'en' ? 'SUBJECT:' : 'موضوع الخطاب:'}</strong> {toastNotification?.subject}</p>
              <p><strong>{language === 'en' ? 'TO:' : 'إلى بريد المستلم:'}</strong> {toastNotification?.recipient}</p>
            </div>
            {toastNotification?.body}
          </div>
        </div>

        {/* Archival Sign-off and Security */}
        <div className="grid grid-cols-2 gap-8 pt-8 border-t border-gray-400 text-xs no-break mt-12">
          <div>
            <p className="font-mono text-[10px] text-gray-500 uppercase tracking-widest">{language === 'en' ? 'VERIFICATION CRYPTO-HASH' : 'رمز التشفير للتحقق الرقمي'}</p>
            <p className="font-mono text-[9px] text-gray-600 break-all mt-1 bg-gray-50 p-2 border border-gray-200 rounded">
              SHA-256: {toastNotification ? btoa(toastNotification.id + toastNotification.subject).slice(0, 48).toUpperCase() : '8F4E2CD893B881E99D7713FFBAA55D1823C89B1A0D5C3278'}
            </p>
            <p className="text-[10px] text-gray-500 mt-2">
              {language === 'en' ? 'This record is protected by local compliance directory hashing policies.' : 'هذا السجل محمي وموقع رقمياً ضمن السياسات الأمنية لشبكة مدار.'}
            </p>
          </div>
          <div className="flex flex-col items-end justify-between">
            <div className="text-center space-y-1">
              <div className="w-48 border-b border-gray-400 h-10"></div>
              <p className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">{language === 'en' ? 'MADAR COMPLIANCE REGISTRAR' : 'مسؤول التوثيق والاعتماد لشبكة مدار'}</p>
              <p className="text-[9px] text-gray-400 italic">Electronic Sign-Off Authorized</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
