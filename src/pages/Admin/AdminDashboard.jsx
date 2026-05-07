import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../../api/client';
import {
    Users, TrendingUp, AlertTriangle, ChevronRight,
    Bell, GraduationCap, Plus, Award, Target, Activity,
    ArrowUpRight, Zap, BarChart3, ShieldCheck, Globe,
    BookOpen, Filter, X, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, BarChart, Bar, Cell, AreaChart,
    Area, PieChart as RePieChart, Pie, Legend
} from 'recharts';
import { Button, Badge, Avatar, Card } from '../../components/atoms';
import { Modal, FormField, SelectField } from '../../components/molecules';
import { useAcademicYear } from '../../context/AcademicYearContext';

/* ─── palette ────────────────────────────────────────────────────────── */
const PALETTE = ['#7C3AED', '#0EA5E9', '#10B981', '#F59E0B', '#EC4899', '#6366F1'];
const SEV_COLOR = { high: '#EF4444', medium: '#F59E0B', low: '#10B981' };

/* ─── tiny helpers ───────────────────────────────────────────────────── */
const pct = (v) => v === null || v === undefined ? 'N/A' : `${v}%`;
const num  = (v) => (v ?? 0).toLocaleString();

const Pill = ({ color, children, style = {} }) => (
    <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        padding: '2px 10px', borderRadius: 999, fontSize: '0.7rem',
        fontWeight: 800, letterSpacing: '0.04em',
        background: color + '20', color, ...style,
    }}>{children}</span>
);

const StatCard = ({ label, value, sub, icon, accent, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay }}
        style={{
            background: 'white',
            borderRadius: 20,
            padding: '28px 24px',
            border: '1px solid #F1F0FF',
            boxShadow: '0 2px 12px rgba(124,58,237,0.06)',
            position: 'relative',
            overflow: 'hidden',
        }}
    >
        {/* accent bar */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: accent }} />
        <div style={{
            width: 44, height: 44, borderRadius: 14, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            background: accent + '15', color: accent, marginBottom: 16,
        }}>
            {icon}
        </div>
        <div style={{ fontSize: '2rem', fontWeight: 900, lineHeight: 1, letterSpacing: '-0.03em', color: '#1a1230' }}>
            {value}
        </div>
        <div style={{ marginTop: 6, fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#9B8FC0' }}>
            {label}
        </div>
        {sub && (
            <div style={{ marginTop: 4, fontSize: '0.75rem', color: accent, fontWeight: 700 }}>{sub}</div>
        )}
    </motion.div>
);

/* ─── custom tooltip ─────────────────────────────────────────────────── */
const ChartTip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{
            background: '#1a1230', color: 'white', borderRadius: 12,
            padding: '10px 16px', fontSize: '0.8rem', boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
        }}>
            <div style={{ fontWeight: 700, marginBottom: 4, opacity: 0.6 }}>{label}</div>
            {payload.map((p, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color }} />
                    <span style={{ fontWeight: 800 }}>{typeof p.value === 'number' ? p.value.toFixed(1) : p.value}</span>
                </div>
            ))}
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════════════ */
const AdminDashboard = () => {
    const { activeYear } = useAcademicYear();
    const [data,    setData]    = useState(null);
    const [loading, setLoading] = useState(true);
    const [refresh, setRefresh] = useState(0);
    const navigate = useNavigate();

    const [activeModal, setActiveModal] = useState(null);
    const [activeTab,   setActiveTab]   = useState('overview');

    // Filters — classId is an integer (real FK), segment is a string
    const [filters, setFilters] = useState({ classId: '', segment: 'All Students' });
    const [classOptions,   setClassOptions]   = useState([]);
    const [segmentOptions, setSegmentOptions] = useState(['All Students', 'High Performers', 'At Risk', 'New Enrollees']);

    const [facultyForm,  setFacultyForm]  = useState({ name: '', email: '', role: 'teacher' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    /* ── fetch ───────────────────────────────────────────────────────── */
    const fetchData = useCallback(() => {
        setLoading(true);
        const params = {
            ...(activeYear?.id ? { academic_year_id: activeYear.id } : {}),
            ...(filters.classId   ? { class_id: filters.classId }   : {}),
            ...(filters.segment !== 'All Students' ? { segment: filters.segment } : {}),
        };
        client.get('/analytics/admin/overview', { params })
            .then(res => {
                setData(res.data);
                // populate dropdowns from real API response
                if (res.data.filter_options?.classes) {
                    setClassOptions(res.data.filter_options.classes);
                }
                if (res.data.filter_options?.segments) {
                    setSegmentOptions(res.data.filter_options.segments);
                }
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, [activeYear, filters, refresh]);

    useEffect(() => { fetchData(); }, [fetchData]);

    /* ── submit faculty ──────────────────────────────────────────────── */
    const handleFacultySubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        client.post('/users/register', { ...facultyForm, password: 'password' })
            .then(() => { setFacultyForm({ name: '', email: '', role: 'teacher' }); setActiveModal(null); setRefresh(r => r + 1); })
            .catch(err => console.error(err))
            .finally(() => setIsSubmitting(false));
    };

    /* ── loading ─────────────────────────────────────────────────────── */
    if (loading && !data) return (
        <div style={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, background: '#F7F5FF' }}>
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}
                style={{ width: 48, height: 48, borderRadius: '50%', border: '4px solid #E9D5FF', borderTopColor: '#7C3AED' }}
            />
            <p style={{ color: '#9B8FC0', fontWeight: 600, fontSize: '0.9rem' }}>Loading intelligence data…</p>
        </div>
    );

    if (!data) return (
        <div style={{ padding: 40, color: '#EF4444', fontWeight: 600 }}>
            Failed to load dashboard data. Please refresh.
        </div>
    );

    const { metrics, rankings, charts, insights, operations } = data;
    const hasFilters = filters.classId || filters.segment !== 'All Students';

    /* ── active class label ──────────────────────────────────────────── */
    const activeClassLabel = filters.classId
        ? classOptions.find(c => String(c.id) === String(filters.classId))?.label ?? 'Class'
        : null;

    /* ══════════════════════════════════════════════════════════════════
       RENDER
    ══════════════════════════════════════════════════════════════════ */
    return (
        <div style={{ padding: '24px 0', maxWidth: 1520, margin: '0 auto', background: '#F7F5FF', minHeight: '100vh' }}>

            {/* ── HEADER ────────────────────────────────────────────────── */}
            <motion.header
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, padding: '0 2px' }}
            >
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                        <div style={{ width: 8, height: 32, borderRadius: 4, background: 'linear-gradient(180deg, #7C3AED, #0EA5E9)' }} />
                        <h1 style={{ fontSize: '1.9rem', fontWeight: 900, letterSpacing: '-0.03em', margin: 0, color: '#1a1230' }}>
                            Command Center
                        </h1>
                    </div>
                    <p style={{ color: '#9B8FC0', fontSize: '0.9rem', margin: '0 0 0 18px', fontWeight: 500 }}>
                        {activeYear?.name ? `Academic Year ${activeYear.name}` : 'All Academic Years'}
                        {activeClassLabel && ` · ${activeClassLabel}`}
                        {filters.segment !== 'All Students' && ` · ${filters.segment}`}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    {loading && (
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            style={{ color: '#7C3AED' }}
                        >
                            <RefreshCw size={16} />
                        </motion.div>
                    )}
                    <button
                        onClick={() => setRefresh(r => r + 1)}
                        style={{ background: 'white', border: '1px solid #E9D5FF', borderRadius: 12, padding: '8px 16px', color: '#7C3AED', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                        <RefreshCw size={14} /> Refresh
                    </button>
                    <button
                        onClick={() => setActiveModal('faculty')}
                        style={{ background: 'linear-gradient(135deg, #7C3AED, #6366F1)', border: 'none', borderRadius: 12, padding: '10px 20px', color: 'white', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 16px rgba(124,58,237,0.35)' }}
                    >
                        <Plus size={16} /> Add Member
                    </button>
                </div>
            </motion.header>

            {/* ── FILTER BAR ────────────────────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 }}
                style={{
                    background: 'white',
                    borderRadius: 18,
                    padding: '14px 20px',
                    marginBottom: 28,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    flexWrap: 'wrap',
                    border: '1px solid #EDE9FF',
                    boxShadow: '0 2px 8px rgba(124,58,237,0.05)',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#7C3AED', fontWeight: 800, fontSize: '0.72rem', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>
                    <Filter size={13} /> FILTERS
                </div>

                {/* Class filter — dynamically populated from API */}
                <FilterSelect
                    value={filters.classId}
                    onChange={v => setFilters(f => ({ ...f, classId: v }))}
                    placeholder="All Classes"
                    options={classOptions.map(c => ({ value: c.id, label: c.label }))}
                />

                {/* Segment filter */}
                <FilterSelect
                    value={filters.segment}
                    onChange={v => setFilters(f => ({ ...f, segment: v }))}
                    placeholder="All Students"
                    options={segmentOptions.map(s => ({ value: s, label: s }))}
                />

                {/* Active filter chips */}
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flex: 1, flexWrap: 'wrap' }}>
                    {activeClassLabel && (
                        <FilterChip label={activeClassLabel} onRemove={() => setFilters(f => ({ ...f, classId: '' }))} />
                    )}
                    {filters.segment !== 'All Students' && (
                        <FilterChip label={filters.segment} onRemove={() => setFilters(f => ({ ...f, segment: 'All Students' }))} />
                    )}
                </div>

                {hasFilters && (
                    <button
                        onClick={() => setFilters({ classId: '', segment: 'All Students' })}
                        style={{ background: 'none', border: 'none', color: '#9B8FC0', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px', borderRadius: 8, transition: 'color 0.15s' }}
                    >
                        <X size={12} /> Clear all
                    </button>
                )}
            </motion.div>

            {/* ── TABS ──────────────────────────────────────────────────── */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 28, background: 'white', borderRadius: 14, padding: 6, width: 'fit-content', border: '1px solid #EDE9FF' }}>
                {[
                    { id: 'overview',    label: 'Overview',    icon: <Globe size={15} /> },
                    { id: 'academic',    label: 'Academic',    icon: <BarChart3 size={15} /> },
                    { id: 'operations', label: 'Operations',   icon: <Zap size={15} /> },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 7,
                            padding: '9px 18px', borderRadius: 10, border: 'none', cursor: 'pointer',
                            fontWeight: 700, fontSize: '0.82rem', transition: 'all 0.2s',
                            background: activeTab === tab.id ? 'linear-gradient(135deg, #7C3AED, #6366F1)' : 'transparent',
                            color:      activeTab === tab.id ? 'white' : '#9B8FC0',
                            boxShadow:  activeTab === tab.id ? '0 4px 12px rgba(124,58,237,0.3)' : 'none',
                        }}
                    >
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            {/* ── TAB CONTENT ───────────────────────────────────────────── */}
            <AnimatePresence mode="wait">

                {/* ══ OVERVIEW ══════════════════════════════════════════ */}
                {activeTab === 'overview' && (
                    <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>

                        {/* Hero banner */}
                        <div style={{
                            background: 'linear-gradient(135deg, #1a1230 0%, #2D1B69 50%, #1e3a5f 100%)',
                            borderRadius: 28, padding: '44px 48px', color: 'white',
                            marginBottom: 28, position: 'relative', overflow: 'hidden',
                        }}>
                            {/* decorative blobs */}
                            <div style={{ position: 'absolute', top: -60, right: -60, width: 280, height: 280, background: 'radial-gradient(circle, rgba(124,58,237,0.25) 0%, transparent 70%)', borderRadius: '50%' }} />
                            <div style={{ position: 'absolute', bottom: -80, left: '15%', width: 340, height: 340, background: 'radial-gradient(circle, rgba(14,165,233,0.15) 0%, transparent 70%)', borderRadius: '50%' }} />
                            <div style={{ position: 'absolute', top: '20%', right: '20%', width: 160, height: 160, background: 'radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)', borderRadius: '50%' }} />

                            <div style={{ position: 'relative', zIndex: 2 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
                                    <Pill color="#10B981" style={{ background: 'rgba(16,185,129,0.15)', color: '#4ADE80' }}>
                                        <ShieldCheck size={10} /> SYSTEM STABLE
                                    </Pill>
                                    <Pill color="#A78BFA" style={{ background: 'rgba(167,139,250,0.15)', color: '#A78BFA' }}>
                                        {operations.active_year_name}
                                    </Pill>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 20, flexWrap: 'wrap' }}>
                                    <div>
                                        <div style={{ fontSize: '0.8rem', fontWeight: 700, opacity: 0.5, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>
                                            Strategic Growth Index
                                        </div>
                                        <div style={{ fontSize: '4rem', fontWeight: 900, lineHeight: 1, letterSpacing: '-0.04em' }}>
{metrics.growth_index === null ? (
    <span style={{ color: '#9B8FC0', fontSize: '2.5rem' }}>N/A</span>
) : (
    <span style={{ color: metrics.growth_index >= 0 ? '#4ADE80' : '#F87171' }}>
        {metrics.growth_index > 0 ? '+' : ''}{metrics.growth_index}%
    </span>
)}
                                        </div>
                                    </div>
                                    <div style={{ paddingBottom: 8, opacity: 0.7, fontSize: '0.95rem', maxWidth: 520, lineHeight: 1.7 }}>
                                        Serving <strong style={{ color: 'white', opacity: 1 }}>{num(metrics.total_students)} students</strong> across{' '}
                                        <strong style={{ color: 'white', opacity: 1 }}>{metrics.total_classes} sections</strong> taught by{' '}
                                        <strong style={{ color: 'white', opacity: 1 }}>{metrics.total_teachers} faculty</strong>.
                                    </div>
                                </div>

                                {/* mini stats row */}
                                <div style={{ display: 'flex', gap: 32, marginTop: 32, flexWrap: 'wrap' }}>
                                    {[
                                        { label: 'Attendance', value: pct(metrics.attendance_rate) },
                                        { label: 'Proficiency', value: pct(metrics.proficiency_rate) },
                                        { label: 'Retention', value: pct(metrics.retention_rate) },
                                        { label: 'Subjects', value: num(metrics.total_subjects) },
                                    ].map((m, i) => (
                                        <div key={i}>
                                            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'white' }}>{m.value}</div>
                                            <div style={{ fontSize: '0.72rem', fontWeight: 700, opacity: 0.5, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{m.label}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Stat cards */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 28 }}>
                            <StatCard label="Attendance Rate"   value={pct(metrics.attendance_rate)}  sub="Global average"                   icon={<Activity size={20} />}     accent={PALETTE[2]} delay={0} />
                            <StatCard label="Proficiency Rate"  value={pct(metrics.proficiency_rate)} sub="Students scoring ≥75%"             icon={<Target size={20} />}       accent={PALETTE[0]} delay={0.05} />
                            <StatCard
    label="Student Retention"
    value={pct(metrics.retention_rate)}
    sub={metrics.retention_rate === null ? 'No prior year to compare' : 'vs previous year'}
    icon={<GraduationCap size={20} />}
    accent={PALETTE[1]}
    delay={0.1}
/>
                            <StatCard label="Faculty Members"   value={num(metrics.total_teachers)}   sub={`Ratio: ${operations.teacher_student_ratio}`} icon={<Users size={20} />}  accent={PALETTE[4]} delay={0.15} />
                        </div>

                        {/* Charts row */}
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 28 }}>

                            {/* Performance trend */}
                            <SectionCard title="Performance Trend" sub="Average score by term across all grades">
                                {charts.performance_trend?.length > 0 ? (
                                    <div style={{ height: 300 }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={charts.performance_trend} margin={{ left: -10 }}>
                                                <defs>
                                                    <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%"  stopColor="#7C3AED" stopOpacity={0.15} />
                                                        <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F0FF" />
                                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#B0A8CC', fontWeight: 600 }} />
                                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#B0A8CC' }} domain={[0, 100]} />
                                                <Tooltip content={<ChartTip />} />
                                                <Area type="monotone" dataKey="avg_score" stroke="#7C3AED" strokeWidth={3} fillOpacity={1} fill="url(#grad1)" dot={{ r: 5, fill: '#7C3AED', stroke: 'white', strokeWidth: 2 }} />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                ) : <EmptyChart message="No grade data available for this selection." />}
                            </SectionCard>

                            {/* Capacity utilization */}
                            <SectionCard title="Class Enrollment" sub="Students per section">
                                {charts.students_by_class?.length > 0 ? (
                                    <div style={{ height: 300 }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={charts.students_by_class} layout="vertical" margin={{ left: -10 }}>
                                                <XAxis type="number" hide />
                                                <YAxis dataKey="class_name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: '#6B5B9A' }} width={90} />
                                                <Tooltip content={<ChartTip />} cursor={{ fill: 'rgba(124,58,237,0.04)' }} />
                                                <Bar dataKey="count" radius={[0, 8, 8, 0]} barSize={20}>
                                                    {charts.students_by_class.map((_, i) => (
                                                        <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                ) : <EmptyChart message="No class data found." />}
                            </SectionCard>
                        </div>

                        {/* Bottom row */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>

                            {/* Strategic Insights */}
                            <SectionCard title="Strategic Insights" titleIcon={<Zap size={16} color="#F59E0B" />} dark>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    {insights?.length > 0 ? insights.map((ins, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, x: -8 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.06 }}
                                            style={{ padding: '14px 16px', background: 'rgba(255,255,255,0.07)', borderRadius: 14, border: '1px solid rgba(255,255,255,0.08)' }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                                <Pill color={SEV_COLOR[ins.severity]} style={{ background: SEV_COLOR[ins.severity] + '25', color: SEV_COLOR[ins.severity] }}>
                                                    {ins.severity?.toUpperCase()}
                                                </Pill>
                                                <span style={{ fontSize: '0.68rem', opacity: 0.4 }}>
                                                    {new Date(ins.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p style={{ margin: 0, fontSize: '0.82rem', lineHeight: 1.55, opacity: 0.85 }}>{ins.message}</p>
                                        </motion.div>
                                    )) : (
                                        <div style={{ textAlign: 'center', padding: '32px 0', opacity: 0.35, fontSize: '0.85rem' }}>
                                            No insights yet.
                                        </div>
                                    )}
                                </div>
                            </SectionCard>

                            {/* Top Scholars */}
                            <SectionCard title="Top Scholars" titleIcon={<Award size={16} color={PALETTE[0]} />}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                    {rankings?.best_students?.length > 0 ? rankings.best_students.map((s, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                            <div style={{ position: 'relative', flexShrink: 0 }}>
                                                <Avatar name={s.name} size={40} style={{ borderRadius: 12 }} />
                                                <div style={{
                                                    position: 'absolute', top: -5, right: -5,
                                                    background: i === 0 ? '#F59E0B' : i === 1 ? '#9CA3AF' : '#CD7C2F',
                                                    color: 'white', fontSize: '0.6rem', width: 16, height: 16,
                                                    borderRadius: '50%', display: 'flex', alignItems: 'center',
                                                    justifyContent: 'center', fontWeight: 900,
                                                }}>
                                                    {i + 1}
                                                </div>
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#1a1230', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.name}</div>
                                                <div style={{ fontSize: '0.72rem', color: '#9B8FC0', marginTop: 2 }}>{s.class}</div>
                                            </div>
                                            <div style={{ fontWeight: 900, color: PALETTE[0], fontSize: '1.1rem', flexShrink: 0 }}>
                                                {s.gpa}
                                            </div>
                                        </div>
                                    )) : <EmptyChart message="No student data found." />}
                                </div>
                            </SectionCard>

                            {/* Class Efficiency */}
                            <SectionCard title="Class Efficiency" titleIcon={<Activity size={16} color={PALETTE[2]} />}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                                    {rankings?.top_classes?.length > 0 ? rankings.top_classes.map((cls, i) => (
                                        <div key={i}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
                                                <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1a1230' }}>{cls.name}</span>
                                                <span style={{ fontWeight: 900, color: PALETTE[i % PALETTE.length], fontSize: '0.9rem' }}>{cls.avg_score}%</span>
                                            </div>
                                            <div style={{ height: 7, background: '#F1F0FF', borderRadius: 4, overflow: 'hidden' }}>
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${cls.avg_score}%` }}
                                                    transition={{ duration: 1, delay: i * 0.1, ease: 'easeOut' }}
                                                    style={{ height: '100%', background: PALETTE[i % PALETTE.length], borderRadius: 4 }}
                                                />
                                            </div>
                                        </div>
                                    )) : <EmptyChart message="No class data found." />}
                                </div>
                                <button
                                    onClick={() => navigate('/academy')}
                                    style={{ width: '100%', marginTop: 24, padding: '10px', borderRadius: 12, border: '1.5px solid #EDE9FF', background: 'transparent', color: '#7C3AED', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}
                                >
                                    Full Academic Audit →
                                </button>
                            </SectionCard>
                        </div>
                    </motion.div>
                )}

                {/* ══ ACADEMIC ══════════════════════════════════════════ */}
                {activeTab === 'academic' && (
                    <motion.div key="academic" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>

                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 28 }}>
                            <SectionCard title="Subject Proficiency Matrix" sub="Average score per department">
                                {charts.subject_performance?.length > 0 ? (
                                    <div style={{ height: 340 }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={charts.subject_performance} margin={{ left: -10 }}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F0FF" />
                                                <XAxis dataKey="subject" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#9B8FC0' }} />
                                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} domain={[0, 100]} />
                                                <Tooltip content={<ChartTip />} cursor={{ fill: 'rgba(124,58,237,0.04)' }} />
                                                <Bar dataKey="score" radius={[6, 6, 0, 0]} barSize={32}>
                                                    {charts.subject_performance.map((_, i) => (
                                                        <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                ) : <EmptyChart message="No subject performance data." />}
                            </SectionCard>

                            <SectionCard title="Grade Distribution" sub="Student density by score bracket">
                                {charts.grade_distribution?.some(d => d.value > 0) ? (
                                    <>
                                        <div style={{ height: 260 }}>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <RePieChart>
                                                    <Pie data={charts.grade_distribution} cx="50%" cy="50%" innerRadius={55} outerRadius={95} paddingAngle={4} dataKey="value">
                                                        {charts.grade_distribution.map((_, i) => (
                                                            <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip />
                                                </RePieChart>
                                            </ResponsiveContainer>
                                        </div>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
                                            {charts.grade_distribution.map((item, i) => (
                                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.73rem', fontWeight: 700, color: '#6B5B9A' }}>
                                                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: PALETTE[i % PALETTE.length] }} />
                                                    {item.name}
                                                    <span style={{ color: '#B0A8CC' }}>({item.value})</span>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                ) : <EmptyChart message="No grade data for this selection." />}
                            </SectionCard>
                        </div>

                        {/* Subject highlights */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
                            <HighlightCard
                                color="#10B981" bgColor="#F0FDF4" borderColor="#DCFCE7"
                                icon={<Award size={22} />}
                                title="High Proficiency Subject"
                                name={rankings?.subject_highlights?.best?.name ?? 'N/A'}
                                detail={rankings?.subject_highlights?.best ? `${rankings.subject_highlights.best.score}% avg. across sections` : 'No data available.'}
                            />
                            <HighlightCard
                                color="#F59E0B" bgColor="#FFFBEB" borderColor="#FEF3C7"
                                icon={<Activity size={22} />}
                                title="Most Improved Subject"
                                name={rankings?.subject_highlights?.most_improved?.name ?? '—'}
                                detail={rankings?.subject_highlights?.most_improved
                                    ? `+${rankings.subject_highlights.most_improved.improvement}% vs previous year`
                                    : 'No prior year data.'}
                            />
                            <HighlightCard
                                color="#EF4444" bgColor="#FEF2F2" borderColor="#FEE2E2"
                                icon={<AlertTriangle size={22} />}
                                title="Needs Attention"
                                name={rankings?.subject_highlights?.needs_attention?.name ?? 'N/A'}
                                detail={rankings?.subject_highlights?.needs_attention
                                    ? `${rankings.subject_highlights.needs_attention.score}% avg. Requires intervention.`
                                    : 'No data available.'}
                            />
                        </div>
                    </motion.div>
                )}

                {/* ══ OPERATIONS ════════════════════════════════════════ */}
                {activeTab === 'operations' && (
                    <motion.div key="operations" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>

                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 28 }}>
                            <SectionCard title="Attendance by Day" sub="Average presence rate — weekdays only">
                                {charts.attendance_trend?.length > 0 ? (
                                    <div style={{ height: 320 }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={charts.attendance_trend} margin={{ left: -10 }}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F0FF" />
                                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700, fill: '#9B8FC0' }} />
                                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} domain={[0, 100]} />
                                                <Tooltip content={<ChartTip />} />
                                                <Line type="monotone" dataKey="rate" stroke={PALETTE[2]} strokeWidth={3} dot={{ r: 6, fill: PALETTE[2], stroke: 'white', strokeWidth: 2 }} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                ) : <EmptyChart message="No attendance records found." />}
                            </SectionCard>

                            <SectionCard title="Enrollment Growth" sub="Students registered per academic year">
                                {charts.registration_trend?.length > 0 ? (
                                    <div style={{ height: 320 }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={charts.registration_trend} margin={{ left: -10 }}>
                                                <XAxis dataKey="academic_year" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#9B8FC0' }} />
                                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                                                <Tooltip content={<ChartTip />} cursor={{ fill: 'rgba(124,58,237,0.04)' }} />
                                                <Bar dataKey="count" fill={PALETTE[0]} radius={[6, 6, 0, 0]} barSize={36} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                ) : <EmptyChart message="No enrollment history found." />}
                            </SectionCard>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
                            <OpCard
                                label="Teacher–Student Ratio"
                                value={operations.teacher_student_ratio}
                                sub="Within optimal range"
                                subColor={PALETTE[2]}
                                icon={<Users size={22} />}
                                accent={PALETTE[1]}
                            />
                            <OpCard
                                label="Active Subjects"
                                value={num(metrics.total_subjects)}
                                sub="Across all classes"
                                subColor={PALETTE[0]}
                                icon={<BookOpen size={22} />}
                                accent={PALETTE[0]}
                            />
                            <div style={{
                                background: 'linear-gradient(135deg, #7C3AED, #4F46E5)',
                                borderRadius: 20, padding: '32px 28px', color: 'white',
                                boxShadow: '0 8px 24px rgba(124,58,237,0.3)',
                                position: 'relative', overflow: 'hidden',
                            }}>
                                <div style={{ position: 'absolute', top: -20, right: -20, width: 120, height: 120, background: 'rgba(255,255,255,0.07)', borderRadius: '50%' }} />
                                <div style={{ fontSize: '0.72rem', fontWeight: 800, opacity: 0.65, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                                    Next Academic Year
                                </div>
                                <div style={{ fontSize: '1.6rem', fontWeight: 900 }}>
                                    {operations.upcoming_year ?? 'Not scheduled yet'}
                                </div>
                                <div style={{ marginTop: 14, fontSize: '0.82rem', opacity: 0.7, lineHeight: 1.5 }}>
                                    Upcoming enrollment period for the next academic cycle.
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── ADD FACULTY MODAL ──────────────────────────────────────── */}
            <Modal isOpen={activeModal === 'faculty'} onClose={() => setActiveModal(null)} title="Onboard New Member" width="480px">
                <form onSubmit={handleFacultySubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                    <FormField
                        label="Full Name" placeholder="Dr. Jane Doe" required
                        value={facultyForm.name}
                        onChange={e => setFacultyForm({ ...facultyForm, name: e.target.value })}
                    />
                    <FormField
                        label="Email Address" type="email" placeholder="jane@school.edu" required
                        value={facultyForm.email}
                        onChange={e => setFacultyForm({ ...facultyForm, email: e.target.value })}
                    />
                    <SelectField
                        label="Role"
                        value={facultyForm.role}
                        onChange={e => setFacultyForm({ ...facultyForm, role: e.target.value })}
                    >
                        <option value="teacher">Faculty Member</option>
                        <option value="admin">System Administrator</option>
                    </SelectField>
                    <button
                        type="submit" disabled={isSubmitting}
                        style={{
                            marginTop: 8, padding: '13px', borderRadius: 14, border: 'none',
                            background: 'linear-gradient(135deg, #7C3AED, #6366F1)',
                            color: 'white', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer',
                            opacity: isSubmitting ? 0.7 : 1, transition: 'opacity 0.2s',
                        }}
                    >
                        {isSubmitting ? 'Processing…' : 'Authorize Onboarding'}
                    </button>
                </form>
            </Modal>
        </div>
    );
};

/* ─── Sub-components ────────────────────────────────────────────────── */

const FilterSelect = ({ value, onChange, placeholder, options }) => (
    <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
            padding: '8px 14px', borderRadius: 10, border: '1.5px solid #EDE9FF',
            background: 'white', color: '#1a1230', fontWeight: 600, fontSize: '0.82rem',
            cursor: 'pointer', outline: 'none', minWidth: 160,
        }}
    >
        <option value="">{placeholder}</option>
        {options.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
        ))}
    </select>
);

const FilterChip = ({ label, onRemove }) => (
    <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        background: '#EDE9FF', color: '#7C3AED', borderRadius: 999,
        padding: '3px 10px 3px 12px', fontSize: '0.75rem', fontWeight: 700,
    }}>
        {label}
        <button onClick={onRemove} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9B8FC0', display: 'flex', padding: 0 }}>
            <X size={12} />
        </button>
    </span>
);

const SectionCard = ({ title, sub, titleIcon, dark, children }) => (
    <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
            background: dark ? '#1a1230' : 'white',
            color: dark ? 'white' : '#1a1230',
            borderRadius: 22,
            padding: '28px 28px 24px',
            border: dark ? 'none' : '1px solid #EDE9FF',
            boxShadow: dark
                ? '0 8px 32px rgba(26,18,48,0.25)'
                : '0 2px 10px rgba(124,58,237,0.05)',
        }}
    >
        <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                {titleIcon}
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: dark ? 'white' : '#1a1230' }}>
                    {title}
                </h3>
            </div>
            {sub && <p style={{ margin: 0, fontSize: '0.78rem', color: dark ? 'rgba(255,255,255,0.45)' : '#B0A8CC', fontWeight: 500 }}>{sub}</p>}
        </div>
        {children}
    </motion.div>
);

const EmptyChart = ({ message }) => (
    <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8, color: '#B0A8CC' }}>
        <BarChart3 size={32} strokeWidth={1.5} />
        <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: 600 }}>{message}</p>
    </div>
);

const HighlightCard = ({ color, bgColor, borderColor, icon, title, name, detail }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ padding: '26px 24px', borderRadius: 20, border: `1.5px solid ${borderColor}`, background: bgColor }}
    >
        <div style={{ color, marginBottom: 12 }}>{icon}</div>
        <h4 style={{ margin: '0 0 6px 0', color, fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{title}</h4>
        <div style={{ fontSize: '1.3rem', fontWeight: 900, color, marginBottom: 8 }}>{name}</div>
        <p style={{ margin: 0, fontSize: '0.82rem', color, opacity: 0.75, lineHeight: 1.5 }}>{detail}</p>
    </motion.div>
);

const OpCard = ({ label, value, sub, subColor, icon, accent }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ background: 'white', borderRadius: 20, padding: '32px 28px', border: '1px solid #EDE9FF', boxShadow: '0 2px 10px rgba(124,58,237,0.05)', position: 'relative', overflow: 'hidden' }}
    >
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: accent }} />
        <div style={{ color: accent, marginBottom: 14, background: accent + '12', width: 44, height: 44, borderRadius: 13, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {icon}
        </div>
        <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9B8FC0', marginBottom: 8 }}>{label}</div>
        <div style={{ fontSize: '2rem', fontWeight: 900, color: '#1a1230', lineHeight: 1 }}>{value}</div>
        {sub && <div style={{ marginTop: 8, fontSize: '0.75rem', color: subColor, fontWeight: 700 }}>{sub}</div>}
    </motion.div>
);

export default AdminDashboard;