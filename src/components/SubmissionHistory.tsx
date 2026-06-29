import React, { useState } from 'react';
import { Language, DICTIONARY, Registration, SECTORS, PLANS, EmailLog } from '../types';
import { 
  Calendar, 
  Trash2, 
  Database, 
  ShieldAlert, 
  Layers, 
  ExternalLink,
  Lock, 
  Shield, 
  Key, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  LogOut, 
  Eye, 
  EyeOff, 
  AlertCircle,
  FileCheck,
  TrendingUp,
  Mail
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import AdminDashboard from './AdminDashboard';
import { getMockEmailLogs, clearMockEmailLogs } from '../lib/mockEmailService';



interface SubmissionHistoryProps {
  currentLang: Language;
  registrations: Registration[];
  onDeleteRecord: (id: string) => void;
  onClearAll: () => void;
  onClose: () => void;
  onLinkRecords: (sourceId: string, targetId: string | undefined) => void;
  onUpdateStatus: (id: string, status: 'pending' | 'approved' | 'rejected') => void;
  onSeedDemoData: () => void;
  onBulkUpdateStatus: (ids: string[], status: 'pending' | 'approved' | 'rejected') => void;
  onBulkDeleteRecords: (ids: string[]) => void;
  selectedIds?: string[];
  onSelectedIdsChange?: (ids: string[]) => void;
}

export default function SubmissionHistory({
  currentLang,
  registrations,
  onDeleteRecord,
  onClearAll,
  onClose,
  onLinkRecords,
  onUpdateStatus,
  onSeedDemoData,
  onBulkUpdateStatus,
  onBulkDeleteRecords,
  selectedIds: propSelectedIds,
  onSelectedIdsChange,
}: SubmissionHistoryProps) {
  const d = DICTIONARY[currentLang];

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('madar_admin_auth') === 'true';
  });
  const [activeTab, setActiveTab] = useState<'submissions' | 'analytics' | 'emails'>('submissions');
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');

  const [localSelectedIds, setLocalSelectedIds] = useState<string[]>([]);
  const isControlled = propSelectedIds !== undefined;
  const selectedIds = isControlled ? propSelectedIds! : localSelectedIds;

  const setSelectedIds = (updater: string[] | ((prev: string[]) => string[])) => {
    const nextVal = typeof updater === 'function' ? updater(selectedIds) : updater;
    if (isControlled) {
      onSelectedIdsChange?.(nextVal);
    } else {
      setLocalSelectedIds(nextVal);
    }
  };

  const toggleSelectRecord = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    if (selectedIds.length === registrations.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(registrations.map((r) => r.id));
    }
  };

  const handleTabSelect = (tab: 'submissions' | 'analytics' | 'emails') => {
    setActiveTab(tab);
    if (tab === 'emails') {
      setEmailLogs(getMockEmailLogs());
    }
  };

  const handleClearEmails = () => {
    clearMockEmailLogs();
    setEmailLogs([]);
  };


  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === 'madar2026') {
      setIsAuthenticated(true);
      sessionStorage.setItem('madar_admin_auth', 'true');
      setAuthError('');
    } else {
      setAuthError(d.adminLoginErr);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('madar_admin_auth');
    setPasswordInput('');
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString(currentLang === 'en' ? 'en-US' : 'ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!isAuthenticated) {
    return (
      <div
        className="w-full bg-brand-card border border-brand-teal/20 rounded-lg p-6 md:p-8 shadow-2xl relative overflow-hidden max-w-lg mx-auto backdrop-blur-md animate-fade-in"
        id="madar-admin-auth-panel"
      >
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-brand-gold animate-pulse" />
        
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-brand-gold/10 border border-brand-gold/20 text-brand-gold mb-3">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-lg md:text-xl font-serif font-bold text-brand-gold">
            {d.adminLoginTitle}
          </h3>
          <p className="text-xs text-brand-text/50 mt-1.5 leading-relaxed">
            {d.adminLoginSub}
          </p>
        </div>

        <form onSubmit={handleAuthSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono uppercase tracking-wider text-brand-teal block">
              {d.adminPassLabel}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder={d.adminPassPlaceholder}
                className="w-full bg-brand-bg border border-brand-teal/20 text-brand-text rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-gold/40 placeholder:text-brand-text/25 font-mono"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-text/30 hover:text-brand-gold/80 transition"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {authError && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <div className="p-3 bg-brand-gold/5 border border-brand-gold/10 rounded text-center space-y-1">
            <span className="text-[10px] font-mono text-brand-gold/85 block uppercase tracking-wider">
              {currentLang === 'en' ? 'Quick Access Code' : 'رمز المرور للوصول التجريبي'}
            </span>
            <code className="text-xs font-mono text-brand-text/80 select-all font-bold tracking-widest px-2 py-0.5 bg-brand-bg/80 rounded border border-brand-gold/20 inline-block">
              madar2026
            </code>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 py-2 border border-brand-teal/20 text-brand-text/60 text-xs font-mono rounded uppercase tracking-wider hover:bg-brand-teal/5 transition cursor-pointer"
            >
              {currentLang === 'en' ? 'Cancel' : 'إلغاء'}
            </button>
            <button
              type="submit"
              className="w-1/2 py-2 bg-brand-gold hover:bg-brand-gold/80 text-brand-bg text-xs font-mono font-bold rounded uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Key className="w-3.5 h-3.5" />
              <span>{d.adminLoginBtn}</span>
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div
      className="w-full bg-brand-card border border-brand-teal/20 rounded-lg p-6 md:p-8 shadow-2xl relative overflow-hidden max-w-4xl mx-auto backdrop-blur-md animate-fade-in"
      id="madar-local-storage-viewer"
    >
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-brand-teal" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-brand-teal/15 pb-4">
        <div>
          <h3 className="text-lg md:text-xl font-serif font-bold text-brand-gold flex items-center gap-2">
            <Shield className="w-5 h-5 text-brand-gold" />
            <span>{d.historyTitle}</span>
          </h3>
          <p className="text-xs text-brand-text/50 mt-1">
            {d.historySubtitle}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          {registrations.length > 0 && (
            <button
              onClick={onClearAll}
              id="btn-clear-cache"
              className="text-xs font-mono px-3 py-1.5 rounded border border-red-500/30 bg-red-500/5 hover:bg-red-500/15 text-red-400 hover:text-red-300 transition duration-200 flex items-center gap-1.5 cursor-pointer"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>{d.historyClear}</span>
            </button>
          )}
          
          <button
            onClick={handleLogout}
            className="text-xs font-mono px-3 py-1.5 rounded border border-brand-teal/20 bg-brand-bg hover:bg-brand-teal/5 text-brand-text/70 hover:text-brand-gold transition duration-200 flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{d.adminLogoutBtn}</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-brand-teal/15 mb-6 text-xs font-mono overflow-x-auto whitespace-nowrap">
        <button
          onClick={() => handleTabSelect('submissions')}
          className={`px-4 py-2.5 font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'submissions'
              ? 'border-brand-gold text-brand-gold bg-brand-gold/5'
              : 'border-transparent text-brand-text/50 hover:text-brand-text hover:bg-brand-teal/5'
          }`}
        >
          {currentLang === 'en' ? '📁 Submissions Registry' : '📁 سجل طلبات العضوية'}
        </button>
        <button
          onClick={() => handleTabSelect('analytics')}
          className={`px-4 py-2.5 font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'analytics'
              ? 'border-brand-gold text-brand-gold bg-brand-gold/5'
              : 'border-transparent text-brand-text/50 hover:text-brand-text hover:bg-brand-teal/5'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>{currentLang === 'en' ? '📈 Projections & Stats' : '📈 التوقعات والإحصاءات'}</span>
        </button>
        <button
          onClick={() => handleTabSelect('emails')}
          className={`px-4 py-2.5 font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'emails'
              ? 'border-brand-gold text-brand-gold bg-brand-gold/5'
              : 'border-transparent text-brand-text/50 hover:text-brand-text hover:bg-brand-teal/5'
          }`}
        >
          <Mail className="w-3.5 h-3.5" />
          <span>{currentLang === 'en' ? '✉️ Email Dispatch Logs' : '✉️ سجل الإشعارات والبريد'}</span>
        </button>
      </div>

      {activeTab === 'analytics' ? (
        <AdminDashboard registrations={registrations} currentLang={currentLang} />
      ) : activeTab === 'emails' ? (
        <div className="space-y-4 animate-fade-in" id="admin-email-logs-tab">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 pb-3 border-b border-brand-teal/10">
            <div>
              <h4 className="text-sm font-serif font-bold text-brand-gold flex items-center gap-2">
                <Mail className="w-4 h-4 text-brand-teal" />
                <span>{currentLang === 'en' ? 'Audit Dispatch Ledger' : 'سجل تدقيق الإشعارات الصادرة'}</span>
              </h4>
              <p className="text-[11px] text-brand-text/50 mt-0.5">
                {currentLang === 'en' ? 'Simulated SMS and Email logs sent upon status updates.' : 'سجلات رسائل البريد الصادرة التي يتم إرسالها تلقائياً عند تغيير حالة الطلب.'}
              </p>
            </div>
            {emailLogs.length > 0 && (
              <button
                onClick={handleClearEmails}
                className="text-xs font-mono px-3 py-1.5 rounded border border-red-500/30 bg-red-500/5 hover:bg-red-500/15 text-red-400 hover:text-red-300 transition duration-200 cursor-pointer"
              >
                {currentLang === 'en' ? 'Clear Dispatch Logs' : 'مسح سجل الإرسال'}
              </button>
            )}
          </div>

          {emailLogs.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-brand-teal/10 rounded-xl bg-brand-bg/20 space-y-3">
              <Mail className="w-10 h-10 text-brand-text/25 mx-auto" />
              <div className="space-y-1">
                <p className="text-sm font-bold text-brand-text/80">
                  {currentLang === 'en' ? 'No Dispatched Notifications' : 'لا توجد إشعارات مرسلة حالياً'}
                </p>
                <p className="text-xs text-brand-text/40 max-w-md mx-auto leading-relaxed">
                  {currentLang === 'en' 
                    ? 'Simulated emails are logged here immediately when you change a candidate registration status between Approved, Pending, or Rejected.' 
                    : 'سيتم تسجيل رسائل البريد الإلكتروني المحاكاة هنا تلقائياً فور تعديل حالة طلب أي منشأة بين مقبول، قيد المراجعة، أو مرفوض.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              {[...emailLogs]
                .sort((a, b) => {
                  if (a.urgent && !b.urgent) return -1;
                  if (!a.urgent && b.urgent) return 1;
                  return 0;
                })
                .map((log) => (
                <div 
                  key={log.id} 
                  className={`border rounded-lg p-4 space-y-3 transition duration-200 ${
                    log.urgent 
                      ? 'bg-[#141E34] border-brand-gold shadow-[0_0_12px_rgba(217,119,6,0.35)]' 
                      : 'bg-[#0B1324] border-brand-teal/15 hover:border-brand-gold/30'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-2 border-b border-brand-teal/10 pb-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono text-brand-gold font-bold bg-brand-gold/10 px-2 py-0.5 rounded">
                          {log.id}
                        </span>
                        {log.urgent && (
                          <span className="text-[9px] font-bold font-mono text-brand-gold bg-brand-gold/10 border border-brand-gold/30 px-1.5 py-0.5 rounded animate-pulse">
                            {currentLang === 'en' ? 'URGENT' : 'عاجل'}
                          </span>
                        )}
                        <span className="text-xs text-brand-teal font-mono font-bold">
                          {log.recipientEmail}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-brand-text/90 mt-1">
                        {currentLang === 'en' ? 'Recipient: ' : 'المستلم: '} {log.recipientName} ({log.registrationId})
                      </p>
                    </div>
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                        SENT SUCCESSFUL
                      </span>
                      <p className="text-[10px] text-brand-text/40 font-mono mt-1">
                        {new Date(log.timestamp).toLocaleString(currentLang === 'en' ? 'en-US' : 'ar-SA')}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs font-bold text-brand-text/80 flex gap-1">
                      <span>{currentLang === 'en' ? 'Subject:' : 'الموضوع:'}</span>
                      <span className="text-brand-text">{log.subject}</span>
                    </div>
                    <div className="bg-black/30 rounded p-3 font-mono text-[11px] leading-relaxed text-brand-text/70 whitespace-pre-wrap border border-brand-teal/5">
                      {log.body}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <>

        {/* List content */}
        {registrations.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-brand-teal/10 rounded-xl bg-brand-bg/20 space-y-5">
          <Database className="w-10 h-10 text-brand-text/25 mx-auto" />
          <div className="space-y-1">
            <p className="text-sm font-bold text-brand-text/80">
              {d.historyNoRecord}
            </p>
            <p className="text-xs text-brand-text/40 max-w-md mx-auto leading-relaxed">
              {currentLang === 'en' 
                ? 'Generate realistic Saudi industrial registry records to test out status approvals, product galleries, and matchmaking links immediately.' 
                : 'قم بتوليد سجلات سعودية صناعية تجريبية لتجربة ميزات اعتماد الطلبات، واستعراض معرض المنتجات، والمطابقة الفورية.'}
            </p>
          </div>
          <button
            onClick={onSeedDemoData}
            className="px-4 py-2 bg-brand-gold text-brand-bg text-xs font-mono font-bold rounded uppercase tracking-wider hover:bg-brand-gold/80 transition cursor-pointer inline-flex items-center gap-2 shadow-lg shadow-brand-gold/15 hover:shadow-brand-gold/25"
          >
            <RefreshCw className="w-3.5 h-3.5 text-brand-bg" />
            <span>
              {currentLang === 'en' ? 'Seed Demo Registrations' : 'توليد سجلات صناعية تجريبية'}
            </span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Bulk actions control bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-brand-teal/5 border border-brand-teal/15 rounded-lg text-xs font-mono">
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 cursor-pointer select-none text-brand-text/80 hover:text-brand-gold transition duration-150">
                <input
                  type="checkbox"
                  checked={registrations.length > 0 && selectedIds.length === registrations.length}
                  ref={(el) => {
                    if (el) {
                      el.indeterminate = selectedIds.length > 0 && selectedIds.length < registrations.length;
                    }
                  }}
                  onChange={handleToggleSelectAll}
                  className="w-4 h-4 rounded border-brand-teal/30 text-brand-gold focus:ring-brand-gold bg-brand-bg cursor-pointer accent-brand-gold"
                />
                <span className="font-bold">
                  {currentLang === 'en' ? 'Select All' : 'تحديد الكل'}
                </span>
              </label>
              <span className="text-brand-text/40">|</span>
              <span className="text-brand-teal font-bold">
                {currentLang === 'en' 
                  ? `${selectedIds.length} of ${registrations.length} selected` 
                  : `تم تحديد ${selectedIds.length} من أصل ${registrations.length}`}
              </span>
            </div>

            {selectedIds.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => {
                    onBulkUpdateStatus(selectedIds, 'approved');
                    setSelectedIds([]);
                  }}
                  className="px-2.5 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded transition cursor-pointer font-bold flex items-center gap-1 text-[11px]"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{currentLang === 'en' ? 'Approve Selected' : 'اعتماد المحدد'}</span>
                </button>
                <button
                  onClick={() => {
                    const confirmMsg = currentLang === 'en'
                      ? `Are you sure you want to delete ${selectedIds.length} selected records?`
                      : `هل أنت متأكد من رغبتك في حذف ${selectedIds.length} من السجلات المحددة؟`;
                    if (window.confirm(confirmMsg)) {
                      onBulkDeleteRecords(selectedIds);
                      setSelectedIds([]);
                    }
                  }}
                  className="px-2.5 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 rounded transition cursor-pointer font-bold flex items-center gap-1 text-[11px]"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{currentLang === 'en' ? 'Delete Selected' : 'حذف المحدد'}</span>
                </button>
                <button
                  onClick={() => setSelectedIds([])}
                  className="px-2 py-1.5 text-brand-text/50 hover:text-brand-text transition cursor-pointer text-[11px]"
                >
                  {currentLang === 'en' ? 'Cancel' : 'إلغاء'}
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-1">
          <AnimatePresence mode="popLayout">
            {[...registrations]
              .sort((a, b) => {
                if (a.urgent && !b.urgent) return -1;
                if (!a.urgent && b.urgent) return 1;
                return 0;
              })
              .map((record) => {
              const plan = PLANS.find((p) => p.id === record.planId);
              const planName = plan ? (currentLang === 'en' ? plan.enName : plan.arName) : '';

              const userTypeLabel =
                record.userType === 'supplier'
                  ? d.tabSupplier
                  : record.userType === 'technician'
                  ? d.tabTechnician
                  : d.tabFactory;

              const sectorNames = record.sectors
                .map((sId) => {
                  const sector = SECTORS.find((s) => s.id === sId);
                  return sector ? (currentLang === 'en' ? sector.en : sector.ar) : '';
                })
                .filter(Boolean)
                .join(', ');

              return (
                <motion.div
                  key={record.id}
                  id={`record-card-${record.id}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className={`bg-brand-bg/80 border rounded-xl p-4 flex flex-col justify-between transition duration-300 relative group ${
                    record.urgent 
                      ? 'border-brand-gold shadow-[0_0_12px_rgba(217,119,6,0.35)] bg-brand-gold/5' 
                      : 'border-brand-teal/10 hover:border-brand-teal/25'
                  }`}
                >
                  {/* Delete button */}
                  <button
                    onClick={() => onDeleteRecord(record.id)}
                    id={`btn-delete-${record.id}`}
                    className="absolute top-3 right-3 p-1.5 text-brand-text/30 hover:text-red-400 hover:bg-red-500/5 rounded transition duration-200 cursor-pointer"
                    title="Delete Record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="space-y-2.5">
                    {/* ID, Date & Status */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-brand-teal/5 pb-2 pr-6">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(record.id)}
                          onChange={() => toggleSelectRecord(record.id)}
                          className="w-4 h-4 rounded border-brand-teal/30 text-brand-gold focus:ring-brand-gold bg-brand-bg cursor-pointer accent-brand-gold shrink-0"
                          title={currentLang === 'en' ? 'Select entity' : 'تحديد المنشأة'}
                        />
                        <div className="flex items-center gap-1.5 text-[10px] font-mono text-brand-text/40">
                          <Calendar className="w-3.5 h-3.5 text-brand-teal/60" />
                          <span>{formatDate(record.timestamp)}</span>
                        </div>
                      </div>
                      
                      {/* Approval Status Badge */}
                      {record.status === 'approved' ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[9px] font-bold tracking-wider">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          <span>{d.adminApproved}</span>
                        </span>
                      ) : record.status === 'rejected' ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-500/10 border border-red-500/30 text-red-400 text-[9px] font-bold tracking-wider">
                          <XCircle className="w-2.5 h-2.5" />
                          <span>{d.adminRejected}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[9px] font-bold tracking-wider animate-pulse">
                          <RefreshCw className="w-2.5 h-2.5 animate-spin-slow" />
                          <span>{d.adminPending}</span>
                        </span>
                      )}
                    </div>

                    {/* Name */}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="block text-[10px] font-mono uppercase tracking-wider text-brand-gold">
                          {record.id}
                        </span>
                        {record.urgent && (
                          <span className="text-[8px] font-bold font-mono text-brand-gold bg-brand-gold/10 border border-brand-gold/30 px-1 py-0.5 rounded animate-pulse">
                            {currentLang === 'en' ? 'URGENT' : 'عاجل'}
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-brand-text">
                        {record.fullName}
                      </h4>
                    </div>

                    {/* Meta values */}
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 pt-2 border-t border-brand-teal/5 text-[11px]">
                      <div>
                        <span className="text-brand-text/40 block">
                          {d.historyCardType}
                        </span>
                        <span className="font-medium text-brand-text/90">
                          {userTypeLabel}
                        </span>
                      </div>

                      <div>
                        <span className="text-brand-text/40 block">
                          {d.historyCardPlan}
                        </span>
                        <span className="font-bold text-brand-gold">
                          {planName}
                        </span>
                      </div>

                      {record.phoneNumber && (
                        <div className="col-span-2">
                          <span className="text-brand-text/40 block">
                            {d.fieldPhone}
                          </span>
                          <span className="font-mono text-brand-text/90">
                            +966 {record.phoneNumber}
                          </span>
                        </div>
                      )}

                      {record.crNo && (
                        <div className="col-span-2">
                          <span className="text-brand-text/40 block">
                            {d.historyCardCr}
                          </span>
                          <span className="font-mono text-brand-text/90">
                            {record.crNo}
                          </span>
                        </div>
                      )}

                      {record.licenseNo && (
                        <div className="col-span-2">
                          <span className="text-brand-text/40 block">
                            {d.historyCardLicense}
                          </span>
                          <span className="font-mono text-brand-text/90">
                            {record.licenseNo}
                          </span>
                        </div>
                      )}

                      <div className="col-span-2">
                        <span className="text-brand-text/40 block">
                          {d.historyCardSectors}
                        </span>
                        <span className="text-brand-text/90 line-clamp-2">
                          {sectorNames}
                        </span>
                      </div>

                      {record.pricingRates && (
                        <div className="col-span-2 border-t border-brand-teal/5 pt-1.5">
                          <span className="text-brand-text/40 block font-mono">
                            {d.fieldRates}
                          </span>
                          <span className="font-medium text-brand-gold">
                            {record.pricingRates}
                          </span>
                        </div>
                      )}

                      {record.productImage && (
                        <div className="col-span-2 border-t border-brand-teal/5 pt-1.5">
                          <span className="text-brand-text/40 block font-mono mb-1">
                            {currentLang === 'en' ? 'Uploaded Product' : 'الصورة المرفوعة'}
                          </span>
                          <div className="relative rounded overflow-hidden border border-brand-teal/20 max-h-24 bg-brand-bg flex justify-center">
                            <img
                              src={record.productImage}
                              alt="Product upload preview"
                              referrerPolicy="no-referrer"
                              className="w-full h-20 object-cover"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Admin Action Control Hub */}
                    <div className="mt-4 pt-3 border-t border-brand-teal/10 space-y-3 bg-brand-teal/5 -mx-4 -mb-4 p-4 rounded-b-xl border-dashed">
                      {/* Approval Decisions */}
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-brand-teal block">
                          {d.adminStatusLabel}
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => onUpdateStatus(record.id, 'approved')}
                            className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded text-[11px] font-semibold transition cursor-pointer ${
                              record.status === 'approved'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                : 'bg-brand-bg hover:bg-emerald-500/10 text-brand-text/60 hover:text-emerald-300 border border-brand-teal/15'
                            }`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{currentLang === 'en' ? 'Approve' : 'اعتماد'}</span>
                          </button>
                          
                          <button
                            onClick={() => onUpdateStatus(record.id, 'rejected')}
                            className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded text-[11px] font-semibold transition cursor-pointer ${
                              record.status === 'rejected'
                                ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                                : 'bg-brand-bg hover:bg-red-500/10 text-brand-text/60 hover:text-red-300 border border-brand-teal/15'
                            }`}
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>{currentLang === 'en' ? 'Reject' : 'رفض'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Partner Matching Engine */}
                      <div className="space-y-1.5 border-t border-brand-teal/15 pt-2.5">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-brand-gold flex items-center gap-1">
                          <Layers className="w-3.5 h-3.5 text-brand-teal" />
                          <span>{d.adminControlsTitle}</span>
                        </span>
                        
                        {record.matchedWith ? (
                          (() => {
                            const targetMatch = registrations.find((r) => r.id === record.matchedWith);
                            if (!targetMatch) return null;
                            return (
                              <div className="flex items-center justify-between bg-brand-teal/10 rounded border border-brand-teal/25 p-2">
                                <div className="min-w-0 flex-1">
                                  <span className="text-[9px] font-mono text-brand-teal uppercase tracking-wider block font-bold">
                                    {d.adminStatusMatched}
                                  </span>
                                  <span className="text-[11px] font-bold text-brand-text/95 block truncate">
                                    {targetMatch.fullName}
                                  </span>
                                </div>
                                <button
                                  onClick={() => onLinkRecords(record.id, undefined)}
                                  className="px-2 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 text-[10px] font-mono rounded transition cursor-pointer shrink-0 ml-2"
                                >
                                  {d.adminUnmatchBtn}
                                </button>
                              </div>
                            );
                          })()
                        ) : (
                          <div className="space-y-1.5">
                            {registrations.filter((r) => r.id !== record.id).length > 0 ? (
                              <div className="flex gap-2">
                                <select
                                  id={`match-select-${record.id}`}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    if (val) {
                                      onLinkRecords(record.id, val);
                                    }
                                  }}
                                  className="w-full bg-brand-bg/95 border border-brand-teal/20 text-brand-text rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand-gold/40 flex-grow cursor-pointer"
                                  defaultValue=""
                                >
                                  <option value="" disabled>
                                    {d.adminSelectMatchTarget}
                                  </option>
                                  {registrations
                                    .filter((r) => r.id !== record.id)
                                    .map((item) => {
                                      const typeLabel = item.userType === 'factory' ? d.tabFactory : item.userType === 'supplier' ? d.tabSupplier : d.tabTechnician;
                                      return (
                                        <option key={item.id} value={item.id}>
                                          {item.fullName} ({typeLabel})
                                        </option>
                                      );
                                    })}
                                </select>
                              </div>
                            ) : (
                              <p className="text-[10px] text-brand-text/40 italic">
                                {currentLang === 'en' ? 'Register other entities first to enable matching links.' : 'سجل كيانات أخرى أولاً لتمكين ميزة ربط ومطابقة الطلبات.'}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
        </div>
      )}
        </>
      )}

      {/* Close button */}
      <div className="mt-6 pt-4 border-t border-brand-teal/10 flex justify-end">
        <button
          onClick={onClose}
          id="btn-close-history"
          className="px-4 py-2 bg-brand-teal/10 hover:bg-brand-teal/20 text-brand-teal hover:text-brand-text text-xs font-mono rounded uppercase tracking-wider transition duration-200 cursor-pointer"
        >
          {currentLang === 'en' ? 'Close Panel' : 'إغلاق اللوحة'}
        </button>
      </div>
    </div>
  );
}
