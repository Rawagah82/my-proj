import React, { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell, 
  AreaChart, 
  Area, 
  CartesianGrid 
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  Briefcase, 
  Wrench, 
  Building2, 
  PiggyBank, 
  CalendarRange, 
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  Percent
} from 'lucide-react';
import { Registration, Language } from '../types';

interface AdminDashboardProps {
  registrations: Registration[];
  currentLang: Language;
}

// Color palette derived from @theme in index.css
const COLORS = {
  gold: '#C8973A',
  teal: '#4A9EBA',
  text: '#E8E4DC',
  card: '#0D1526',
  bg: '#080D1C',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  muted: '#5F6D7E',
  slate: '#1E293B'
};

export default function AdminDashboard({ registrations, currentLang }: AdminDashboardProps) {
  const [forecastMonths, setForecastMonths] = useState<3 | 6 | 12>(6);

  // Helper pricing mappings
  const getPlanPrice = (planId: 'basic' | 'pro' | 'enterprise') => {
    switch (planId) {
      case 'enterprise': return 300;
      case 'pro': return 200;
      case 'basic': return 90;
      default: return 90;
    }
  };

  // Translations
  const t = useMemo(() => {
    return {
      en: {
        title: 'Registry Analytics & Projections',
        sub: 'Secure financial metrics, sign-up distribution, and predictive recurring revenue analytics.',
        totalSignups: 'Total Registrations',
        approved: 'Approved Entities',
        pending: 'Pending Review',
        activeMrr: 'Current MRR',
        pendingMrr: 'Pending MRR',
        forecastTitle: 'Compounding Revenue Forecast',
        forecastSub: 'Simulated recurring revenue accumulation over the chosen timescale.',
        typeDist: 'Distribution by Entity Type',
        planDist: 'Subscription Plan Popularity',
        statusDist: 'Registration Status Distribution',
        month: 'Month',
        revenue: 'Monthly Revenue (SAR)',
        baseForecast: 'Approved Base Revenue',
        optimisticForecast: 'Optimistic Pipeline Forecast',
        saudiRiyals: 'SAR',
        factories: 'Factories',
        suppliers: 'Suppliers',
        technicians: 'Technicians',
        timescale: 'Projections Horizon',
        months3: '3 Months',
        months6: '6 Months',
        months12: '12 Months',
        growthAssump: 'Assumes 10% MoM growth & complete pending activation',
        noData: 'No active records. Use the "Seed Demo Registrations" button to populate data instantly.',
        avgValue: 'Avg Value / User',
        topPlan: 'Dominant Tier'
      },
      ar: {
        title: 'تحليلات وتوقعات سجل المنصة',
        sub: 'المؤشرات المالية الآمنة، توزيع المشتركين، وتحليلات وتنبؤات العوائد الدورية المتكررة.',
        totalSignups: 'إجمالي المسجلين',
        approved: 'المنشآت المعتمدة',
        pending: 'قيد التدقيق والمراجعة',
        activeMrr: 'الدخل الشهري الحالي',
        pendingMrr: 'الدخل المعلق المتوقع',
        forecastTitle: 'توقعات العوائد التراكمية',
        forecastSub: 'محاكاة نمو وتراكم الإيرادات الدورية على المدى الزمني المختار.',
        typeDist: 'توزيع الأعضاء حسب الفئة',
        planDist: 'شعبية باقات الاشتراك الدورية',
        statusDist: 'توزيع حالات طلبات العضوية',
        month: 'الشهر',
        revenue: 'الإيرادات الشهرية (ر.س)',
        baseForecast: 'عوائد الكيانات المعتمدة',
        optimisticForecast: 'التوقعات المتفائلة مع قيد الانتظار',
        saudiRiyals: 'ر.س',
        factories: 'المصانع',
        suppliers: 'الموردين',
        technicians: 'الفنيين',
        timescale: 'المدى الزمني للتوقعات',
        months3: '٣ أشهر',
        months6: '٦ أشهر',
        months12: '١٢ شهرًا',
        growthAssump: 'يفترض نمو شهري بنسبة ١٠٪ واعتماد السجلات المعلقة',
        noData: 'لا توجد بيانات حالية. اضغط على زر "توليد سجلات صناعية تجريبية" لتعبئة البيانات فوراً.',
        avgValue: 'متوسط قيمة العضو',
        topPlan: 'الباقة الأكثر طلباً'
      }
    }[currentLang];
  }, [currentLang]);

  // 1. Calculate General Metrics
  const metrics = useMemo(() => {
    const total = registrations.length;
    const approvedCount = registrations.filter(r => r.status === 'approved').length;
    const pendingCount = registrations.filter(r => r.status === 'pending' || !r.status).length;
    
    // MRR Metrics
    const approvedMRR = registrations
      .filter(r => r.status === 'approved')
      .reduce((acc, curr) => acc + getPlanPrice(curr.planId), 0);
      
    const pendingMRR = registrations
      .filter(r => r.status === 'pending' || !r.status)
      .reduce((acc, curr) => acc + getPlanPrice(curr.planId), 0);

    const avgValue = total > 0 
      ? Math.round(registrations.reduce((acc, curr) => acc + getPlanPrice(curr.planId), 0) / total)
      : 0;

    // Find most popular plan
    const planCounts = registrations.reduce((acc, curr) => {
      acc[curr.planId] = (acc[curr.planId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    let topPlan = 'None';
    let maxCount = -1;
    Object.entries(planCounts).forEach(([plan, count]) => {
      if (count > maxCount) {
        maxCount = count;
        topPlan = plan === 'enterprise' ? 'Elite' : plan === 'pro' ? 'Premium' : 'Basic';
      }
    });

    return {
      total,
      approvedCount,
      pendingCount,
      approvedMRR,
      pendingMRR,
      avgValue,
      topPlan
    };
  }, [registrations]);

  // 2. Data for Entity Types Bar Chart
  const typeChartData = useMemo(() => {
    const factoryCount = registrations.filter(r => r.userType === 'factory').length;
    const supplierCount = registrations.filter(r => r.userType === 'supplier').length;
    const techCount = registrations.filter(r => r.userType === 'technician').length;

    return [
      {
        name: t.factories,
        count: factoryCount,
        color: COLORS.gold,
      },
      {
        name: t.suppliers,
        count: supplierCount,
        color: COLORS.teal,
      },
      {
        name: t.technicians,
        count: techCount,
        color: COLORS.success,
      }
    ];
  }, [registrations, t]);

  // 3. Data for Pricing Plans Donut Chart
  const planChartData = useMemo(() => {
    const basic = registrations.filter(r => r.planId === 'basic').length;
    const pro = registrations.filter(r => r.planId === 'pro').length;
    const enterprise = registrations.filter(r => r.planId === 'enterprise').length;

    return [
      { name: currentLang === 'en' ? 'Basic Entry' : 'الدخول الأساسي', value: basic, color: '#94A3B8' },
      { name: currentLang === 'en' ? 'Advanced Premium' : 'المحترف المميز', value: pro, color: COLORS.teal },
      { name: currentLang === 'en' ? 'Elite Ultimate' : 'النخبة الشامل', value: enterprise, color: COLORS.gold },
    ].filter(item => item.value > 0);
  }, [registrations, currentLang]);

  // 3.5. Data for Status Distribution Donut Chart
  const statusChartData = useMemo(() => {
    const approved = registrations.filter(r => r.status === 'approved').length;
    const pending = registrations.filter(r => r.status === 'pending' || !r.status).length;
    const rejected = registrations.filter(r => r.status === 'rejected').length;

    return [
      { name: currentLang === 'en' ? 'Approved' : 'مقبول / معتمد', value: approved, color: COLORS.success },
      { name: currentLang === 'en' ? 'Pending' : 'قيد المراجعة', value: pending, color: COLORS.warning },
      { name: currentLang === 'en' ? 'Rejected' : 'مرفوض', value: rejected, color: COLORS.danger },
    ].filter(item => item.value > 0);
  }, [registrations, currentLang]);

  // 4. Dynamic Revenue Projections Data
  const forecastData = useMemo(() => {
    const data = [];
    const baseMRR = metrics.approvedMRR;
    const fullMRR = metrics.approvedMRR + metrics.pendingMRR;

    // Build chronological month sequence starting from current month
    const baseDate = new Date();
    const formatter = new Intl.DateTimeFormat(currentLang === 'en' ? 'en-US' : 'ar-SA', { month: 'short' });

    for (let i = 1; i <= forecastMonths; i++) {
      const monthDate = new Date(baseDate.getFullYear(), baseDate.getMonth() + i - 1, 1);
      const label = formatter.format(monthDate);

      // Model A: Approved base revenue stays constant + very minor organic growth (3% MoM)
      const baseProjected = Math.round(baseMRR * Math.pow(1.03, i - 1));

      // Model B: Optimistic pipeline (starts with all approved + pending) + 10% MoM compound industry expansion
      const optimisticProjected = Math.round(fullMRR * Math.pow(1.10, i - 1));

      data.push({
        month: label,
        [t.baseForecast]: baseProjected,
        [t.optimisticForecast]: optimisticProjected
      });
    }

    return data;
  }, [metrics, forecastMonths, currentLang, t]);

  // Render glassmorphic loading/empty state if no data
  if (registrations.length === 0) {
    return (
      <div className="p-8 text-center bg-brand-bg/40 border border-brand-teal/10 rounded-lg backdrop-blur">
        <TrendingUp className="w-10 h-10 text-brand-gold/40 mx-auto mb-3" />
        <p className="text-sm text-brand-text/60 italic leading-relaxed max-w-md mx-auto">
          {t.noData}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in" id="admin-analytics-dashboard">
      
      {/* 1. KEY METRICS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total registrations */}
        <div className="bg-brand-bg/85 border border-brand-teal/15 p-4 rounded-lg relative overflow-hidden group hover:border-brand-gold/40 transition-all duration-300">
          <div className="absolute top-0 right-0 p-3 text-brand-text/10 group-hover:text-brand-gold/20 transition-colors">
            <Users className="w-10 h-10" />
          </div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-brand-teal block">
            {t.totalSignups}
          </span>
          <div className="flex items-baseline gap-1.5 mt-1.5">
            <span className="text-2xl md:text-3xl font-serif font-bold text-brand-text">
              {metrics.total}
            </span>
            <span className="text-[10px] text-brand-gold font-mono flex items-center">
              <ArrowUpRight className="w-3 h-3" />
              100%
            </span>
          </div>
          <div className="mt-2 text-[10px] text-brand-text/40 font-mono">
            {metrics.approvedCount} {currentLang === 'en' ? 'Active' : 'نشط'}
          </div>
        </div>

        {/* Metric 2: Active Monthly Recurring Revenue */}
        <div className="bg-brand-bg/85 border border-brand-teal/15 p-4 rounded-lg relative overflow-hidden group hover:border-brand-gold/40 transition-all duration-300">
          <div className="absolute top-0 right-0 p-3 text-brand-text/10 group-hover:text-brand-gold/20 transition-colors">
            <PiggyBank className="w-10 h-10" />
          </div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-brand-gold block">
            {t.activeMrr}
          </span>
          <div className="flex items-baseline gap-1 mt-1.5">
            <span className="text-2xl md:text-3xl font-serif font-bold text-brand-gold">
              {metrics.approvedMRR.toLocaleString()}
            </span>
            <span className="text-[10px] text-brand-text/50 font-mono">
              {t.saudiRiyals}
            </span>
          </div>
          <div className="mt-2 text-[10px] text-brand-text/40 font-mono flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>{currentLang === 'en' ? 'Guaranteed streams' : 'تدفقات مالية معتمدة'}</span>
          </div>
        </div>

        {/* Metric 3: Pending verification pipeline value */}
        <div className="bg-brand-bg/85 border border-brand-teal/15 p-4 rounded-lg relative overflow-hidden group hover:border-brand-gold/40 transition-all duration-300">
          <div className="absolute top-0 right-0 p-3 text-brand-text/10 group-hover:text-brand-gold/20 transition-colors">
            <CalendarRange className="w-10 h-10" />
          </div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-brand-teal block">
            {t.pendingMrr}
          </span>
          <div className="flex items-baseline gap-1 mt-1.5">
            <span className="text-2xl md:text-3xl font-serif font-bold text-brand-teal">
              {metrics.pendingMRR.toLocaleString()}
            </span>
            <span className="text-[10px] text-brand-text/50 font-mono">
              {t.saudiRiyals}
            </span>
          </div>
          <div className="mt-2 text-[10px] text-amber-400/80 font-mono">
            {metrics.pendingCount} {t.pending}
          </div>
        </div>

        {/* Metric 4: Average Subscription Yield */}
        <div className="bg-brand-bg/85 border border-brand-teal/15 p-4 rounded-lg relative overflow-hidden group hover:border-brand-gold/40 transition-all duration-300">
          <div className="absolute top-0 right-0 p-3 text-brand-text/10 group-hover:text-brand-gold/20 transition-colors">
            <Percent className="w-10 h-10" />
          </div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-brand-text/60 block">
            {t.avgValue}
          </span>
          <div className="flex items-baseline gap-1 mt-1.5">
            <span className="text-2xl md:text-3xl font-serif font-bold text-brand-text/90">
              {metrics.avgValue}
            </span>
            <span className="text-[10px] text-brand-text/50 font-mono">
              {t.saudiRiyals}
            </span>
          </div>
          <div className="mt-2 text-[10px] text-brand-gold font-mono uppercase tracking-wider">
            {t.topPlan}: {metrics.topPlan}
          </div>
        </div>
      </div>

      {/* 2. MAIN CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* DONUT & BAR - ENTITY BREAKDOWNS */}
        <div className="bg-brand-bg/60 border border-brand-teal/15 rounded-lg p-5 space-y-5">
          <h4 className="text-sm font-serif font-bold text-brand-gold flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-brand-teal" />
            <span>{t.typeDist}</span>
          </h4>
          
          <div className="h-60 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={typeChartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
                barSize={32}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke={COLORS.muted} 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={{ stroke: '#1E293B' }}
                />
                <YAxis 
                  stroke={COLORS.muted} 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={{ stroke: '#1E293B' }}
                />
                <Tooltip 
                  cursor={{ fill: '#142035', opacity: 0.2 }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-brand-card/95 border border-brand-teal/30 p-2.5 rounded shadow-xl backdrop-blur-md">
                          <p className="text-xs font-bold text-brand-text">{data.name}</p>
                          <p className="text-[11px] text-brand-gold mt-1 font-mono">
                            {currentLang === 'en' ? 'Registries:' : 'الطلبات المسجلة:'} <span className="font-bold">{data.count}</span>
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {typeChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* PIE CHART - SUBSCRIPTION PLANS */}
        <div className="bg-brand-bg/60 border border-brand-teal/15 rounded-lg p-5 flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-serif font-bold text-brand-gold flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-brand-gold" />
              <span>{t.planDist}</span>
            </h4>
            
            <div className="h-48 w-full relative flex items-center justify-center">
              {planChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={planChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {planChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-brand-card/95 border border-brand-teal/30 p-2.5 rounded shadow-xl backdrop-blur">
                              <p className="text-xs font-bold text-brand-text">{data.name}</p>
                              <p className="text-[11px] text-brand-teal font-mono mt-0.5">
                                {data.value} {currentLang === 'en' ? 'Sign-ups' : 'عمليات تسجيل'}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-xs text-brand-text/40 italic">{t.noData}</p>
              )}
            </div>
          </div>

          {/* Legend indicator list */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-brand-teal/10">
            {planChartData.map((item, idx) => (
              <div key={idx} className="text-center">
                <span className="inline-block w-2.5 h-2.5 rounded-full mr-1" style={{ backgroundColor: item.color }} />
                <span className="text-[10px] text-brand-text/60 font-mono block truncate mt-1">
                  {item.name}
                </span>
                <span className="text-xs font-bold text-brand-text font-mono">
                  {item.value} ({Math.round((item.value / registrations.length) * 100)}%)
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* DONUT CHART - REGISTRATION STATUSES */}
        <div className="bg-brand-bg/60 border border-brand-teal/15 rounded-lg p-5 flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-serif font-bold text-brand-gold flex items-center gap-2 mb-4">
              <ShieldCheck className="w-4 h-4 text-brand-teal" />
              <span>{t.statusDist}</span>
            </h4>
            
            <div className="h-48 w-full relative flex items-center justify-center">
              {statusChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {statusChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-brand-card/95 border border-brand-teal/30 p-2.5 rounded shadow-xl backdrop-blur">
                              <p className="text-xs font-bold text-brand-text">{data.name}</p>
                              <p className="text-[11px] text-brand-teal font-mono mt-0.5">
                                {data.value} {currentLang === 'en' ? 'Registrations' : 'طلبات تسجيل'}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-xs text-brand-text/40 italic">{t.noData}</p>
              )}
            </div>
          </div>

          {/* Legend indicator list */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-brand-teal/10">
            {statusChartData.map((item, idx) => (
              <div key={idx} className="text-center">
                <span className="inline-block w-2.5 h-2.5 rounded-full mr-1" style={{ backgroundColor: item.color }} />
                <span className="text-[10px] text-brand-text/60 font-mono block truncate mt-1">
                  {item.name}
                </span>
                <span className="text-xs font-bold text-brand-text font-mono">
                  {item.value} ({Math.round((item.value / registrations.length) * 100)}%)
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 3. REVENUE FORECAST CHART */}
      <div className="bg-brand-bg/60 border border-brand-teal/15 rounded-lg p-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5 pb-3 border-b border-brand-teal/10">
          <div>
            <h4 className="text-sm font-serif font-bold text-brand-gold flex items-center gap-2">
              <TrendingUp className="w-4.5 h-4.5 text-brand-gold animate-bounce-slow" />
              <span>{t.forecastTitle}</span>
            </h4>
            <p className="text-[11px] text-brand-text/50 mt-0.5">
              {t.forecastSub}
            </p>
          </div>

          {/* Timescale selector tabs */}
          <div className="flex bg-brand-card border border-brand-teal/15 rounded p-0.5 text-xs font-mono">
            {([3, 6, 12] as const).map((months) => (
              <button
                key={months}
                onClick={() => setForecastMonths(months)}
                className={`px-3 py-1 rounded transition-colors text-[10px] uppercase font-bold cursor-pointer ${
                  forecastMonths === months
                    ? 'bg-brand-gold text-brand-bg shadow'
                    : 'text-brand-text/60 hover:text-brand-gold'
                }`}
              >
                {months === 3 ? t.months3 : months === 6 ? t.months6 : t.months12}
              </button>
            ))}
          </div>
        </div>

        <div className="h-64 w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={forecastData}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorBase" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.teal} stopOpacity={0.25}/>
                  <stop offset="95%" stopColor={COLORS.teal} stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="colorOptimistic" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.gold} stopOpacity={0.25}/>
                  <stop offset="95%" stopColor={COLORS.gold} stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
              <XAxis 
                dataKey="month" 
                stroke={COLORS.muted} 
                fontSize={10}
                tickLine={false}
                axisLine={{ stroke: '#1E293B' }}
              />
              <YAxis 
                stroke={COLORS.muted} 
                fontSize={10}
                tickLine={false}
                axisLine={{ stroke: '#1E293B' }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-brand-card/95 border border-brand-teal/30 p-3 rounded shadow-xl backdrop-blur-md text-xs space-y-1.5">
                        <p className="font-bold text-brand-text border-b border-brand-teal/10 pb-1">
                          {payload[0].payload.month} Projections
                        </p>
                        {payload.map((item: any, i: number) => (
                          <div key={i} className="flex justify-between gap-6">
                            <span className="text-brand-text/60 font-mono text-[11px]">
                              {item.name}:
                            </span>
                            <span className="font-bold font-mono" style={{ color: item.color }}>
                              {item.value.toLocaleString()} {t.saudiRiyals}
                            </span>
                          </div>
                        ))}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend 
                verticalAlign="top" 
                height={36} 
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: '10px', fontFamily: 'monospace' }}
              />
              <Area 
                type="monotone" 
                dataKey={t.baseForecast} 
                stroke={COLORS.teal} 
                fillOpacity={1} 
                fill="url(#colorBase)" 
                strokeWidth={2}
              />
              <Area 
                type="monotone" 
                dataKey={t.optimisticForecast} 
                stroke={COLORS.gold} 
                fillOpacity={1} 
                fill="url(#colorOptimistic)" 
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <p className="text-[10px] text-center text-brand-text/30 font-mono mt-3 italic flex items-center justify-center gap-1">
          <Sparkles className="w-3 h-3 text-brand-gold animate-pulse" />
          <span>* {t.growthAssump}</span>
        </p>
      </div>

    </div>
  );
}
