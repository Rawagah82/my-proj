import { Registration, Language, EmailLog } from '../types';

/**
 * Generate a simulated transactional email when a registration's approval status changes.
 */
export function sendMockStatusEmail(
  registration: Registration,
  oldStatus: string | undefined,
  newStatus: 'pending' | 'approved' | 'rejected',
  lang: Language
): EmailLog {
  const emailId = `MSG-${Math.floor(100000 + Math.random() * 900000)}`;
  const cleanName = registration.fullName.replace(/\s+/g, '').toLowerCase();
  const recipientEmail = `${cleanName}@madar-industrial.sa`;

  let subject = '';
  let body = '';

  const isEn = lang === 'en';

  if (newStatus === 'approved') {
    subject = isEn 
      ? `[MADAR] Account Approved - Welcome to the B2B Industrial Network (${registration.id})`
      : `[مدار] تم اعتماد طلبك بنجاح - أهلاً بك في شبكة الإسناد الصناعية (${registration.id})`;

    body = isEn ? `
Dear ${registration.fullName},

We are pleased to inform you that your registration under Reference ID: ${registration.id} has been fully APPROVED by the MADAR Security and Compliance Committee.

Your early-access subscription has been activated:
- Entity Class: ${registration.userType.toUpperCase()}
- Chosen Tier: ${registration.planId.toUpperCase()}
- Commercial Status: Fully Verified

Your organization profile is now active on our B2B match engine. Verified procurement partners can now send request for proposals (RFPs) and match against your industrial sectors:
${registration.sectors.map(s => `• ${s}`).join('\n')}

Welcome aboard!
Best regards,
MADAR Verification Office
Al-Khobar, Kingdom of Saudi Arabia
    `.trim() : `
عزيزي ${registration.fullName}،

يسعدنا إبلاغك بأن طلب التسجيل الخاص بك ذو الرقم المرجعي: ${registration.id} قد تم اعتماده وقبوله بالكامل من قبل لجنة التفتيش ومطابقة البيانات في منصة مدار.

تم تفعيل ميزات باقة الاشتراك المبكر الخاصة بك بنجاح:
- فئة الكيان: ${registration.userType === 'factory' ? 'مصنع / منشأة صناعية' : registration.userType === 'supplier' ? 'مورد معتمد' : 'فني مؤهل'}
- باقة الاشتراك: ${registration.planId === 'enterprise' ? 'النخبة الشاملة (300 ر.س/شهرياً)' : registration.planId === 'pro' ? 'المحترف المميز (200 ر.س/شهرياً)' : 'الأساسي (90 ر.س/شهرياً)'}
- حالة الكيان: معتمد وموثق

سجل الكيان الخاص بك متاح الآن على محرك مطابقة مدار للمنشآت. يمكن الآن لشركاء التوريد والمصانع إرسال طلبات الإسناد والمطابقة لقطاعاتك الصناعية المسجلة:
${registration.sectors.map(s => `• ${s}`).join('\n')}

أهلاً بك معنا في مدار!
مع خالص التحيات،
مكتب تدقيق السجلات - منصة مدار الصناعية
الخبر، المملكة العربية السعودية
    `.trim();

  } else if (newStatus === 'rejected') {
    subject = isEn
      ? `[MADAR] Registration Status Update: Revision Required (${registration.id})`
      : `[مدار] تحديث بخصوص طلب التسجيل: يتطلب مراجعة المستندات (${registration.id})`;

    body = isEn ? `
Dear ${registration.fullName},

Thank you for your interest in MADAR. After reviewing your registration credentials under Reference ID: ${registration.id}, our auditing team could not fully verify your records.

Status: REJECTED / SUSPENDED
Reason: Missing matching regulatory details or insufficient documentation for selected industrial sectors.

To appeal this decision or upload updated credentials (CR or Professional License), please contact our operations team at compliance@madar-industrial.sa.

Best regards,
MADAR Compliance and Audit Department
    `.trim() : `
عزيزي ${registration.fullName}،

نشكرك على اهتمامك بالتسجيل في منصة مدار الصناعية. بعد مراجعة بيانات التسجيل والتحقق من الوثائق المقدمة تحت الرقم المرجعي: ${registration.id}، لم يتمكن فريق التدقيق من مطابقة وثائقك بشكل كامل.

الحالة: مرفوض مؤقتاً / معلق
السبب: عدم تطابق السجل التجاري أو رخصة العمل مع الفئات أو القطاعات الصناعية المختارة.

لإعادة مراجعة الطلب أو تحديث وثائق الكيان (السجل التجاري أو رخصة مزاولة المهنة)، يرجى التواصل مع فريق المطابقة عبر البريد الإلكتروني compliance@madar-industrial.sa.

مع تحيات،
إدارة الالتزام وتدقيق السجلات - منصة مدار
    `.trim();

  } else {
    subject = isEn
      ? `[MADAR] Registration Received - Under Active Verification (${registration.id})`
      : `[مدار] تم استلام طلب التسجيل - قيد التحقق والتدقيق (${registration.id})`;

    body = isEn ? `
Dear ${registration.fullName},

Your registration under Reference ID: ${registration.id} has been set back to PENDING. Our operations desk is currently auditing the credentials against official industrial registries.

We will notify you immediately via email once our verification processes are completed.

Sincerely,
MADAR Operations Team
    `.trim() : `
عزيزي ${registration.fullName}،

تمت إعادة تعيين طلب التسجيل الخاص بك ذو الرقم المرجعي: ${registration.id} إلى حالة "قيد المراجعة والانتظار". يقوم فريق العمليات حالياً بالتحقق من وثائق الكيان مقابل السجلات الرسمية.

سنقوم بإعلامك بالنتيجة فور الانتهاء من عملية التدقيق والتحقق الجارية.

شاكرين لتعاونك،
فريق العمليات - منصة مدار
    `.trim();
  }

  const emailLog: EmailLog = {
    id: emailId,
    registrationId: registration.id,
    recipientName: registration.fullName,
    recipientEmail,
    subject,
    body,
    status: 'sent',
    timestamp: Date.now()
  };

  // Log to localStorage to persist logs across sessions
  try {
    const existingLogsJson = localStorage.getItem('madar_email_logs');
    const existingLogs: EmailLog[] = existingLogsJson ? JSON.parse(existingLogsJson) : [];
    const updatedLogs = [emailLog, ...existingLogs];
    localStorage.setItem('madar_email_logs', JSON.stringify(updatedLogs));
  } catch (error) {
    console.error('Failed to log simulated email to localStorage', error);
  }

  return emailLog;
}

/**
 * Retrieve all registered mock emails from persistent localStorage.
 */
export function getMockEmailLogs(): EmailLog[] {
  try {
    const logsJson = localStorage.getItem('madar_email_logs');
    return logsJson ? JSON.parse(logsJson) : [];
  } catch (error) {
    console.error('Failed to retrieve mock email logs', error);
    return [];
  }
}

/**
 * Wipe the mock email notification logs
 */
export function clearMockEmailLogs() {
  localStorage.removeItem('madar_email_logs');
}
