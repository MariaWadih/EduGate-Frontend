import React, { useState, useEffect, useRef } from 'react';
import client from '../../api/client';

const ini = name => name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';

const tokens = {
    promoted:  { bg: '#ECFDF5', color: '#065F46', dot: '#10B981' },
    retained:  { bg: '#FFFBEB', color: '#92400E', dot: '#F59E0B' },
    graduated: { bg: '#EEF2FF', color: '#3730A3', dot: '#6366F1' },
};

const Badge = ({ status }) => {
    const t = tokens[status] || tokens.promoted;
    return (
        <span style={{
            background: t.bg, color: t.color, fontSize: 11, fontWeight: 600,
            padding: '3px 10px', borderRadius: 20, letterSpacing: '.02em',
            display: 'inline-flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap',
        }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: t.dot, flexShrink: 0 }} />
            {status}
        </span>
    );
};

const Avatar = ({ name, size = 34 }) => (
    <div style={{
        width: size, height: size, borderRadius: '50%',
        background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
        color: '#fff', display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: size * 0.32, fontWeight: 700,
        flexShrink: 0, letterSpacing: '.03em',
    }}>
        {ini(name)}
    </div>
);

const StepTrack = ({ current, labels }) => (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 32 }}>
        {labels.map((label, i) => {
            const n = i + 1;
            const done = n < current, active = n === current;
            return (
                <React.Fragment key={n}>
                    {i > 0 && (
                        <div style={{
                            flex: 1, height: 2, borderRadius: 2,
                            background: done ? '#6366F1' : 'var(--border-color)',
                            transition: 'background .3s',
                        }} />
                    )}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                        <div style={{
                            width: 32, height: 32, borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 12, fontWeight: 700, transition: 'all .3s',
                            background: done || active ? '#6366F1' : 'var(--bg-main)',
                            color: (done || active) ? '#fff' : 'var(--text-muted)',
                            border: active ? '3px solid #C7D2FE' : done ? 'none' : '2px solid var(--border-color)',
                            boxShadow: active ? '0 0 0 4px rgba(99,102,241,.12)' : 'none',
                        }}>
                            {done ? '✓' : n}
                        </div>
                        <span style={{
                            fontSize: 11, fontWeight: active ? 600 : 400, whiteSpace: 'nowrap',
                            color: active ? 'var(--text-main)' : done ? '#6366F1' : 'var(--text-muted)',
                        }}>
                            {label}
                        </span>
                    </div>
                </React.Fragment>
            );
        })}
    </div>
);

// shared styles
const card = { background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 16, padding: '24px' };
const fieldLabel = { fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 7, display: 'block' };
const selectStyle = {
    fontFamily: 'inherit', fontSize: 13, color: 'var(--text-main)',
    background: 'var(--bg-main)', border: '1.5px solid var(--border-color)',
    borderRadius: 10, padding: '9px 12px', width: '100%', outline: 'none',
    cursor: 'pointer', transition: 'border-color .2s', appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center', paddingRight: 32,
};
const btnBase = {
    fontFamily: 'inherit', cursor: 'pointer', borderRadius: 10, padding: '9px 18px',
    fontSize: 13, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 7,
    transition: 'all .2s', border: '1.5px solid var(--border-color)',
    background: 'var(--bg-card)', color: 'var(--text-main)',
};
const btnPrimary = { ...btnBase, background: 'linear-gradient(135deg, #6366F1, #4F46E5)', color: '#fff', border: 'none', boxShadow: '0 4px 14px rgba(99,102,241,.35)' };
const btnPrimaryDisabled = { ...btnPrimary, opacity: 0.5, cursor: 'not-allowed', boxShadow: 'none' };

// Student row — shared between both modes
const StudentRow = ({ s, d, targetClassOptions, isLast, updateDecision }) => (
    <div style={{ padding: '14px 20px', borderBottom: isLast ? 'none' : '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Avatar name={s.name} />
            <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{s.name}</div>
                {s.current_class && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{s.current_class}</div>}
                {s.already_promoted && (
                    <span style={{ fontSize: 10, fontWeight: 600, background: '#F3F4F6', color: '#6B7280', padding: '1px 7px', borderRadius: 8 }}>
                        already promoted
                    </span>
                )}
            </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: 10, alignItems: 'start' }}>
            <select
                style={{
                    ...selectStyle, fontSize: 12, padding: '8px 28px 8px 10px', fontWeight: 600,
                    color: d.status === 'promoted' ? '#065F46' : d.status === 'retained' ? '#92400E' : '#3730A3',
                    background: d.status === 'promoted' ? '#ECFDF5' : d.status === 'retained' ? '#FFFBEB' : '#EEF2FF',
                    border: '1.5px solid',
                    borderColor: d.status === 'promoted' ? '#6EE7B7' : d.status === 'retained' ? '#FCD34D' : '#A5B4FC',
                }}
                value={d.status || 'promoted'}
                disabled={s.already_promoted}
                onChange={e => updateDecision(s.id, 'status', e.target.value)}
            >
                <option value="promoted">Promote</option>
                <option value="retained">Retain</option>
                <option value="graduated">Graduate</option>
            </select>
            {d.status === 'graduated' ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#3730A3', fontWeight: 500, padding: '8px 0' }}>
                    🎓 Will graduate this year
                </div>
            ) : (
                <div>
                    <select
                        style={{ ...selectStyle, fontSize: 12, padding: '8px 28px 8px 10px', borderColor: !d.toClassId ? '#FCA5A5' : 'var(--border-color)', background: !d.toClassId ? '#FEF2F2' : 'var(--bg-main)' }}
                        value={d.toClassId || ''}
                        disabled={s.already_promoted}
                        onChange={e => updateDecision(s.id, 'toClassId', e.target.value)}
                    >
                        <option value="">Pick a section...</option>
                        {targetClassOptions.map(c => (
                            <option key={c.id} value={c.id}>{c.name} – {c.section}{c.id === s.suggested_class_id ? ' ★' : ''}</option>
                        ))}
                    </select>
                    {d.toClassId && String(d.toClassId) === String(s.suggested_class_id) && (
                        <div style={{ fontSize: 10, color: '#6366F1', marginTop: 4, fontWeight: 600 }}>★ auto-suggested</div>
                    )}
                </div>
            )}
        </div>
    </div>
);

// ── main ──────────────────────────────────────────────────────────
const StudentPromotion = () => {
    const [mode, setMode] = useState('class'); // 'class' | 'single'
    const [step, setStep] = useState(1);

    // shared
    const [academicYears, setAcademicYears] = useState([]);
    const [fromYearId, setFromYearId] = useState('');
    const [toYearId, setToYearId] = useState('');
    const [toYearClasses, setToYearClasses] = useState([]);
    const [preview, setPreview] = useState(null);
    const [decisions, setDecisions] = useState({});
    const [loading, setLoading] = useState(false);
    const [doneMsg, setDoneMsg] = useState('');
    const [doneResults, setDoneResults] = useState(null);

    // class mode
    const [fromClasses, setFromClasses] = useState([]);
    const [fromClassId, setFromClassId] = useState('');

    // single mode
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [singleClassId, setSingleClassId] = useState('');
    const [classStudents, setClassStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const searchTimer = useRef(null);

    // boot
    useEffect(() => {
        client.get('/academic-years').then(res => {
            const years = res.data || [];
            setAcademicYears(years);
            const active = years.find(y => y.is_active);
            if (active) {
                setToYearId(String(active.id));
                const prev = years.filter(y => !y.is_active).sort((a, b) => b.name.localeCompare(a.name))[0];
                if (prev) setFromYearId(String(prev.id));
            }
        }).catch(() => {});
    }, []);

    useEffect(() => {
        if (!fromYearId) return;
        setFromClassId(''); setFromClasses([]);
        client.get('/promotions/classes', { params: { year_id: fromYearId } })
            .then(res => setFromClasses(res.data || [])).catch(() => {});
    }, [fromYearId]);

    useEffect(() => {
        if (!toYearId) return;
        client.get('/promotions/classes', { params: { year_id: toYearId } })
            .then(res => setToYearClasses(res.data || [])).catch(() => setToYearClasses([]));
    }, [toYearId]);

    // class students for browse list
    useEffect(() => {
        if (!singleClassId || !toYearId) { setClassStudents([]); return; }
        client.get('/promotions/preview', { params: { class_id: singleClassId, to_year_id: toYearId } })
            .then(res => setClassStudents(res.data?.students || []))
            .catch(() => setClassStudents([]));
    }, [singleClassId, toYearId]);

    // debounced search across all fromYear classes
    useEffect(() => {
        if (!searchQuery.trim()) { setSearchResults([]); return; }
        clearTimeout(searchTimer.current);
        searchTimer.current = setTimeout(async () => {
            if (!fromClasses.length || !toYearId) return;
            setSearching(true);
            try {
                const all = [];
                for (const cls of fromClasses) {
                    const res = await client.get('/promotions/preview', { params: { class_id: cls.id, to_year_id: toYearId } });
                    (res.data?.students || []).forEach(s => {
                        if (s.name.toLowerCase().includes(searchQuery.toLowerCase())) {
                            all.push({ ...s, current_class: `${cls.name} – ${cls.section}`, class_id: cls.id });
                        }
                    });
                }
                setSearchResults(all.slice(0, 20));
            } catch { setSearchResults([]); }
            finally { setSearching(false); }
        }, 400);
    }, [searchQuery, fromClasses, toYearId]);

    const pickStudent = async (student) => {
        if (!toYearId) { alert('Please select a target year first.'); return; }
        setLoading(true);
        try {
            const classId = student.class_id || singleClassId;
            const res = await client.get('/promotions/preview', { params: { class_id: classId, to_year_id: toYearId } });
            const data = res.data;
            const s = data.students.find(x => x.id === student.id) || student;
            const cls = data.target_year_classes.find(c => c.id === s.suggested_class_id);
            setPreview({ ...data, students: [{ ...s, current_class: student.current_class }] });
            setDecisions({ [s.id]: { status: s.suggested_status || 'promoted', toClassId: s.suggested_class_id || '', toClassLabel: cls ? `${cls.name} – ${cls.section}` : '' } });
            setSelectedStudent(student);
            setStep(2);
        } catch (e) {
            alert('Failed to load student: ' + (e.response?.data?.message || e.message));
        } finally { setLoading(false); }
    };

    const loadClass = async () => {
        if (!fromClassId || !toYearId) return;
        setLoading(true);
        try {
            const res = await client.get('/promotions/preview', { params: { class_id: fromClassId, to_year_id: toYearId } });
            const data = res.data;
            setPreview(data);
            const init = {};
            data.students.forEach(s => {
                const cls = data.target_year_classes.find(c => c.id === s.suggested_class_id);
                init[s.id] = { status: s.suggested_status, toClassId: s.suggested_class_id || '', toClassLabel: cls ? `${cls.name} – ${cls.section}` : '' };
            });
            setDecisions(init);
            setStep(2);
        } catch (e) {
            alert('Failed to load students: ' + (e.response?.data?.message || e.message));
        } finally { setLoading(false); }
    };

    const updateDecision = (studentId, field, value) => {
        setDecisions(prev => {
            const updated = { ...prev[studentId], [field]: value };
            if (field === 'status' && value === 'graduated') { updated.toClassId = ''; updated.toClassLabel = ''; }
            if (field === 'toClassId' && preview) {
                const cls = preview.target_year_classes.find(c => String(c.id) === String(value));
                updated.toClassLabel = cls ? `${cls.name} – ${cls.section}` : '';
            }
            return { ...prev, [studentId]: updated };
        });
    };

    const goStep3 = () => {
        const missing = (preview?.students || []).filter(s => decisions[s.id]?.status !== 'graduated' && !decisions[s.id]?.toClassId);
        if (missing.length) { alert(`${missing.length} student(s) still need a target class:\n${missing.map(s => s.name).join('\n')}`); return; }
        setStep(3);
    };

    const doSubmit = async () => {
        setLoading(true);
        try {
            const fromCls = preview?.source_class?.id || fromClassId || selectedStudent?.class_id || singleClassId;
            const payload = {
                from_class_id: fromCls,
                to_academic_year_id: toYearId,
                students: (preview?.students || []).map(s => ({ id: s.id, status: decisions[s.id]?.status, to_class_id: decisions[s.id]?.toClassId || null })),
            };
            const res = await client.post('/promotions/execute', payload);
            const r = res.data.results;
            setDoneResults(r);
            setDoneMsg(`${r.success.length} promoted · ${r.skipped.length} skipped · ${r.errors.length} failed`);
            if (r.errors.length) alert('Some failed:\n' + r.errors.map(e => `Student ${e.id}: ${e.reason}`).join('\n'));
            setStep(4);
        } catch (e) {
            alert('Failed: ' + (e.response?.data?.message || e.message));
        } finally { setLoading(false); }
    };

    const restart = () => {
        setStep(1); setPreview(null); setDecisions({});
        setFromClassId(''); setSelectedStudent(null);
        setSearchQuery(''); setSearchResults([]);
        setSingleClassId(''); setClassStudents([]);
        setDoneResults(null);
    };

    const switchMode = (m) => { setMode(m); restart(); };

    const counts = Object.values(decisions).reduce((acc, d) => { acc[d.status] = (acc[d.status] || 0) + 1; return acc; }, {});
    const missingCount = (preview?.students || []).filter(s => decisions[s.id]?.status !== 'graduated' && !decisions[s.id]?.toClassId).length;
    const selectedFromClass = fromClasses.find(c => String(c.id) === String(fromClassId));
    const toYearName = academicYears.find(y => String(y.id) === String(toYearId))?.name || '';
    const targetClassOptions = preview?.target_year_classes || [];
    const stepLabels = mode === 'class' ? ['Select class', 'Assign students', 'Confirm'] : ['Find student', 'Assign', 'Confirm'];

    // student list for single mode
    const singleList = searchQuery.trim()
        ? searchResults
        : classStudents.map(s => ({
            ...s,
            current_class: fromClasses.find(c => String(c.id) === String(singleClassId)) ? `${fromClasses.find(c => String(c.id) === String(singleClassId)).name} – ${fromClasses.find(c => String(c.id) === String(singleClassId)).section}` : '',
            class_id: singleClassId,
        }));

    return (
        <div style={{ paddingBottom: 48, maxWidth: 860, margin: '0 auto' }}>
            {/* header */}
            <div style={{ marginBottom: 28 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #6366F1, #4F46E5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                    </div>
                    <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-.02em' }}>Student Promotion</h1>
                </div>
                <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem', paddingLeft: 48 }}>
                    Move students into next year's classes.
                </p>
            </div>

            {/* mode toggle — only visible on step 1 */}
            {step === 1 && (
                <div style={{ display: 'inline-flex', background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 4, marginBottom: 24, gap: 4 }}>
                    {[{ key: 'class', icon: '👥', label: 'Whole class' }, { key: 'single', icon: '👤', label: 'Single student' }].map(({ key, icon, label }) => (
                        <button key={key} onClick={() => switchMode(key)} style={{
                            fontFamily: 'inherit', cursor: 'pointer', borderRadius: 8, padding: '8px 18px',
                            fontSize: 13, fontWeight: 600, border: 'none', display: 'inline-flex', alignItems: 'center', gap: 7,
                            transition: 'all .2s',
                            background: mode === key ? 'var(--bg-card)' : 'transparent',
                            color: mode === key ? '#6366F1' : 'var(--text-muted)',
                            boxShadow: mode === key ? '0 1px 4px rgba(0,0,0,.08)' : 'none',
                        }}>
                            {icon} {label}
                        </button>
                    ))}
                </div>
            )}

            <StepTrack current={step} labels={stepLabels} />

            {/* ── STEP 1 CLASS ── */}
            {step === 1 && mode === 'class' && (
                <div style={card}>
                    <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>Which class are you promoting?</div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>Select the source class and the year you're promoting into.</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 20 }}>
                        <div>
                            <label style={fieldLabel}>From year</label>
                            <select style={selectStyle} value={fromYearId} onChange={e => setFromYearId(e.target.value)}>
                                <option value="">Select year...</option>
                                {academicYears.map(y => <option key={y.id} value={y.id}>{y.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={fieldLabel}>Source class</label>
                            <select style={selectStyle} value={fromClassId} onChange={e => setFromClassId(e.target.value)}>
                                <option value="">Select class...</option>
                                {fromClasses.map(c => <option key={c.id} value={c.id}>{c.name} – {c.section} ({c.students_count ?? 0})</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={fieldLabel}>Into year</label>
                            <select style={selectStyle} value={toYearId} onChange={e => setToYearId(e.target.value)}>
                                <option value="">Select year...</option>
                                {academicYears.map(y => <option key={y.id} value={y.id}>{y.name}</option>)}
                            </select>
                        </div>
                    </div>
                    {fromClassId && toYearId && toYearClasses.length === 0 && (
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 10, padding: '12px 14px', marginBottom: 16 }}>
                            <span style={{ fontSize: 16, flexShrink: 0 }}>⚠️</span>
                            <div style={{ fontSize: 13, color: '#92400E' }}>No classes found in <strong>{toYearName}</strong>. Create them in Class Management first.</div>
                        </div>
                    )}
                    {fromClassId && selectedFromClass && toYearClasses.length > 0 && (
                        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 18, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--bg-main)', borderRadius: 10, padding: '10px 14px', flex: 1, minWidth: 0 }}>
                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981', flexShrink: 0 }} />
                                <div>
                                    <div style={{ fontSize: 13, fontWeight: 600 }}>{selectedFromClass.name} – {selectedFromClass.section} <span style={{ margin: '0 4px', color: 'var(--text-muted)' }}>→</span> {toYearName}</div>
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>{selectedFromClass.students_count ?? 0} students · auto-suggestion will be applied</div>
                                </div>
                            </div>
                            <button style={loading ? btnPrimaryDisabled : btnPrimary} onClick={loadClass} disabled={loading}>
                                {loading ? 'Loading...' : 'Load students →'}
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* ── STEP 1 SINGLE ── */}
            {step === 1 && mode === 'single' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {/* year selectors */}
                    <div style={card}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
                            <div>
                                <label style={fieldLabel}>From year</label>
                                <select style={selectStyle} value={fromYearId} onChange={e => setFromYearId(e.target.value)}>
                                    <option value="">Select year...</option>
                                    {academicYears.map(y => <option key={y.id} value={y.id}>{y.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={fieldLabel}>Into year</label>
                                <select style={selectStyle} value={toYearId} onChange={e => setToYearId(e.target.value)}>
                                    <option value="">Select year...</option>
                                    {academicYears.map(y => <option key={y.id} value={y.id}>{y.name}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* search card */}
                    <div style={card}>
                        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Find a student</div>

                        {/* name search */}
                        <div style={{ marginBottom: 14 }}>
                            <label style={fieldLabel}>Search by name</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="text"
                                    placeholder="Type a student name..."
                                    value={searchQuery}
                                    onChange={e => { setSearchQuery(e.target.value); setSingleClassId(''); setClassStudents([]); }}
                                    style={{ ...selectStyle, appearance: 'none', backgroundImage: 'none', paddingLeft: 36, paddingRight: 12 }}
                                />
                                <svg style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', opacity: .4 }}
                                    width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                                </svg>
                                {searching && (
                                    <svg style={{ position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)', animation: 'spin 1s linear infinite', opacity: .5 }}
                                        width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                                    </svg>
                                )}
                            </div>
                        </div>

                        {/* divider */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                            <div style={{ flex: 1, height: 1, background: 'var(--border-color)' }} />
                            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>or browse by class</span>
                            <div style={{ flex: 1, height: 1, background: 'var(--border-color)' }} />
                        </div>

                        {/* class filter */}
                        <div style={{ marginBottom: 16 }}>
                            <label style={fieldLabel}>Filter by class</label>
                            <select style={selectStyle} value={singleClassId} onChange={e => { setSingleClassId(e.target.value); setSearchQuery(''); setSearchResults([]); }}>
                                <option value="">Select a class...</option>
                                {fromClasses.map(c => <option key={c.id} value={c.id}>{c.name} – {c.section}</option>)}
                            </select>
                        </div>

                        {/* results */}
                        {singleList.length > 0 && (
                            <div style={{ border: '1px solid var(--border-color)', borderRadius: 12, overflow: 'hidden' }}>
                                {singleList.map((s, idx) => (
                                    <div
                                        key={s.id}
                                        onClick={() => !loading && pickStudent(s)}
                                        style={{
                                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                            padding: '12px 16px', cursor: loading ? 'wait' : 'pointer',
                                            borderBottom: idx < singleList.length - 1 ? '1px solid var(--border-color)' : 'none',
                                            background: 'var(--bg-card)', transition: 'background .15s',
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-main)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-card)'}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <Avatar name={s.name} size={32} />
                                            <div>
                                                <div style={{ fontSize: 13, fontWeight: 600 }}>{s.name}</div>
                                                {s.current_class && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.current_class}</div>}
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            {s.already_promoted && (
                                                <span style={{ fontSize: 10, background: '#F3F4F6', color: '#6B7280', padding: '2px 8px', borderRadius: 8, fontWeight: 600 }}>done</span>
                                            )}
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {(searchQuery || singleClassId) && !singleList.length && !searching && (
                            <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: 13 }}>No students found</div>
                        )}
                    </div>
                </div>
            )}

            {/* ── STEP 2 ASSIGN (shared) ── */}
            {step === 2 && preview && (
                <>
                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                        <div>
                            <div style={{ fontSize: 15, fontWeight: 600 }}>
                                {mode === 'class'
                                    ? <>{preview.source_class?.label} <span style={{ color: 'var(--text-muted)', margin: '0 6px' }}>→</span> {preview.target_year?.name}</>
                                    : <>Promoting {preview.students[0]?.name}</>}
                            </div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                                {preview.students.length} student{preview.students.length !== 1 ? 's' : ''} · adjust then click Review
                            </div>
                        </div>
                        <button style={btnBase} onClick={() => setStep(1)}>← Back</button>
                    </div>

                    <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
                        <div className="promotion-thead" style={{ display: 'grid', gridTemplateColumns: '1fr 130px 1fr', gap: 16, padding: '12px 20px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-main)' }}>
                            {['Student', 'Action', 'Target class'].map(h => <div key={h} style={{ ...fieldLabel, margin: 0 }}>{h}</div>)}
                        </div>
                        {preview.students.map((s, idx) => (
                            <StudentRow key={s.id} s={s} d={decisions[s.id] || {}} targetClassOptions={targetClassOptions} isLast={idx === preview.students.length - 1} updateDecision={updateDecision} />
                        ))}
                    </div>

                    <div style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            {counts.promoted > 0 && <span style={{ ...tokens.promoted, fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 20 }}>{counts.promoted} promoted</span>}
                            {counts.retained > 0 && <span style={{ ...tokens.retained, fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 20 }}>{counts.retained} retained</span>}
                            {counts.graduated > 0 && <span style={{ ...tokens.graduated, fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 20 }}>{counts.graduated} graduated</span>}
                        </div>
                        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                            {missingCount > 0 && <span style={{ fontSize: 12, color: '#DC2626', fontWeight: 500 }}>⚠ {missingCount} need a target class</span>}
                            <button style={btnPrimary} onClick={goStep3}>Review →</button>
                        </div>
                    </div>
                </>
            )}

            {/* ── STEP 3 CONFIRM (shared) ── */}
            {step === 3 && preview && (
                <>
                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                        <div>
                            <div style={{ fontSize: 15, fontWeight: 600 }}>Review transitions</div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Confirm before applying.</div>
                        </div>
                        <button style={btnBase} onClick={() => setStep(2)}>← Back to edit</button>
                    </div>

                    <div style={{ ...card, padding: 0, overflow: 'hidden', marginBottom: 16 }}>
                        {preview.students.map((s, idx) => {
                            const d = decisions[s.id] || {};
                            const t = tokens[d.status] || tokens.promoted;
                            return (
                                <div key={s.id} style={{
                                    display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between',
                                    alignItems: 'center', padding: '13px 20px', gap: 10,
                                    borderBottom: idx < preview.students.length - 1 ? '1px solid var(--border-color)' : 'none',
                                    borderLeft: `3px solid ${t.dot}`,
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <Avatar name={s.name} />
                                        <div>
                                            <div style={{ fontSize: 13, fontWeight: 500 }}>{s.name}</div>
                                            {s.current_class && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.current_class}</div>}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                                        <Badge status={d.status} />
                                        {d.toClassLabel && (
                                            <span style={{ fontSize: 12, color: 'var(--text-muted)', background: 'var(--bg-main)', padding: '3px 10px', borderRadius: 8, fontWeight: 500 }}>
                                                {d.toClassLabel}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, flexWrap: 'wrap' }}>
                        <button style={btnBase} onClick={() => setStep(2)}>← Back</button>
                        <button style={loading ? btnPrimaryDisabled : btnPrimary} onClick={doSubmit} disabled={loading}>
                            {loading ? 'Saving...' : '✓ Confirm promotions'}
                        </button>
                    </div>
                </>
            )}

            {/* ── STEP 4 DONE (shared) ── */}
            {step === 4 && (
                <div style={{ ...card, textAlign: 'center', padding: '56px 24px' }}>
                    <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #10B981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 8px 24px rgba(16,185,129,.3)', fontSize: 28 }}>✓</div>
                    <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Promotions applied!</div>
                    <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 28 }}>{doneMsg}</div>
                    {doneResults && (
                        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 28 }}>
                            {[
                                { label: 'Promoted', value: doneResults.success?.length, color: '#10B981', bg: '#ECFDF5' },
                                { label: 'Skipped',  value: doneResults.skipped?.length,  color: '#6366F1', bg: '#EEF2FF' },
                                { label: 'Failed',   value: doneResults.errors?.length,   color: '#EF4444', bg: '#FEF2F2' },
                            ].map(({ label, value, color, bg }) => value > 0 ? (
                                <div key={label} style={{ background: bg, borderRadius: 12, padding: '12px 20px', minWidth: 90 }}>
                                    <div style={{ fontSize: 22, fontWeight: 800, color }}>{value}</div>
                                    <div style={{ fontSize: 11, fontWeight: 600, color, opacity: .8, textTransform: 'uppercase', letterSpacing: '.05em' }}>{label}</div>
                                </div>
                            ) : null)}
                        </div>
                    )}
                    <button style={btnBase} onClick={restart}>
                        {mode === 'single' ? 'Promote another student' : 'Promote another class'}
                    </button>
                </div>
            )}

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                select:focus, input:focus { border-color: #6366F1 !important; outline: none; }
                @media (max-width: 600px) { .promotion-thead { display: none !important; } }
            `}</style>
        </div>
    );
};

export default StudentPromotion;