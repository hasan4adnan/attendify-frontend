'use client';

import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { getCourses, type Course } from '../utils/courseData';
import AnimatedText from '../components/AnimatedText';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

// Types
type SessionType = 'Lecture' | 'Lab' | 'Exam';
type AttendanceStatus = 'Present' | 'Absent' | 'Excused';

type AttendanceSession = {
  id: string;
  date: string;
  courseId: number;
  courseName: string;
  courseCode: string;
  sessionType: SessionType;
  startTime: string;
  endTime: string;
  present: number;
  absent: number;
  excused: number;
  attendanceRate: number;
  totalStudents: number;
};

type StudentAttendance = {
  studentId: number;
  studentName: string;
  studentNumber: string;
  status: AttendanceStatus;
};

type SessionDetail = AttendanceSession & {
  students: StudentAttendance[];
};

type StudentReport = {
  id: number;
  name: string;
  studentNumber: string;
  email: string;
  overallRate: number;
  courseRates: Array<{
    courseId: number;
    courseCode: string;
    courseName: string;
    rate: number;
  }>;
  history: Array<{
    date: string;
    courseCode: string;
    courseName: string;
    sessionType: SessionType;
    status: AttendanceStatus;
    notes?: string;
  }>;
};

// Mock data generators
const generateSessions = (courseId: number | null, dateRange: string): AttendanceSession[] => {
  const sessions: AttendanceSession[] = [];
  const today = new Date();
  const daysBack = dateRange === 'week' ? 7 : dateRange === 'month' ? 30 : dateRange === 'quarter' ? 90 : 30;
  
  for (let i = 0; i < daysBack; i += 2) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const sessionTypes: SessionType[] = ['Lecture', 'Lab', 'Exam'];
    const sessionType = sessionTypes[Math.floor(Math.random() * sessionTypes.length)];
    
    const totalStudents = 50 + Math.floor(Math.random() * 20);
    const present = Math.floor(totalStudents * (0.75 + Math.random() * 0.2));
    const absent = totalStudents - present - Math.floor(Math.random() * 3);
    const excused = totalStudents - present - absent;
    const attendanceRate = Math.round((present / totalStudents) * 100);
    
    sessions.push({
      id: `session-${i}`,
      date: dateStr,
      courseId: courseId || 1,
      courseName: 'Introduction to Computer Science',
      courseCode: 'CS101',
      sessionType,
      startTime: '09:00',
      endTime: '11:00',
      present,
      absent,
      excused,
      attendanceRate,
      totalStudents,
    });
  }
  
  return sessions.reverse();
};

const generateStudentReports = (): StudentReport[] => {
  return [
    {
      id: 1,
      name: 'Ahmet Yılmaz',
      studentNumber: '1001',
      email: 'ahmet.yilmaz@university.edu.tr',
      overallRate: 88,
      courseRates: [
        { courseId: 1, courseCode: 'CS101', courseName: 'Introduction to Computer Science', rate: 88 },
        { courseId: 2, courseCode: 'CS201', courseName: 'Data Structures', rate: 92 },
        { courseId: 3, courseCode: 'CS305', courseName: 'Algorithms', rate: 85 },
      ],
      history: [
        { date: '2024-01-15', courseCode: 'CS101', courseName: 'Introduction to Computer Science', sessionType: 'Lecture', status: 'Present' },
        { date: '2024-01-17', courseCode: 'CS101', courseName: 'Introduction to Computer Science', sessionType: 'Lab', status: 'Absent' },
        { date: '2024-01-20', courseCode: 'CS201', courseName: 'Data Structures', sessionType: 'Lecture', status: 'Present' },
      ],
    },
    {
      id: 2,
      name: 'Ayşe Demir',
      studentNumber: '1002',
      email: 'ayse.demir@university.edu.tr',
      overallRate: 72,
      courseRates: [
        { courseId: 1, courseCode: 'CS101', courseName: 'Introduction to Computer Science', rate: 68 },
        { courseId: 2, courseCode: 'CS201', courseName: 'Data Structures', rate: 75 },
        { courseId: 3, courseCode: 'CS305', courseName: 'Algorithms', rate: 73 },
      ],
      history: [
        { date: '2024-01-15', courseCode: 'CS101', courseName: 'Introduction to Computer Science', sessionType: 'Lecture', status: 'Present' },
        { date: '2024-01-17', courseCode: 'CS101', courseName: 'Introduction to Computer Science', sessionType: 'Lab', status: 'Absent' },
        { date: '2024-01-20', courseCode: 'CS201', courseName: 'Data Structures', sessionType: 'Lecture', status: 'Absent' },
      ],
    },
    {
      id: 3,
      name: 'Mehmet Kaya',
      studentNumber: '1003',
      email: 'mehmet.kaya@university.edu.tr',
      overallRate: 96,
      courseRates: [
        { courseId: 1, courseCode: 'CS101', courseName: 'Introduction to Computer Science', rate: 96 },
        { courseId: 2, courseCode: 'CS201', courseName: 'Data Structures', rate: 98 },
        { courseId: 3, courseCode: 'CS305', courseName: 'Algorithms', rate: 94 },
      ],
      history: [
        { date: '2024-01-15', courseCode: 'CS101', courseName: 'Introduction to Computer Science', sessionType: 'Lecture', status: 'Present' },
        { date: '2024-01-17', courseCode: 'CS101', courseName: 'Introduction to Computer Science', sessionType: 'Lab', status: 'Present' },
        { date: '2024-01-20', courseCode: 'CS201', courseName: 'Data Structures', sessionType: 'Lecture', status: 'Present' },
      ],
    },
  ];
};

export default function ReportsPage() {
  const { t } = useLanguage();
  const { actualTheme } = useTheme();
  const isDark = actualTheme === 'dark';
  
  // State
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'quarter'>('month');
  const [sessionType, setSessionType] = useState<SessionType | 'All'>('All');
  const [chartView, setChartView] = useState<'session' | 'week' | 'month'>('session');
  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<SessionDetail | null>(null);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [studentReports, setStudentReports] = useState<StudentReport[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentReport | null>(null);
  const [studentSearch, setStudentSearch] = useState('');
  const [isStudentDropdownOpen, setIsStudentDropdownOpen] = useState(false);
  const [isCourseDropdownOpen, setIsCourseDropdownOpen] = useState(false);
  const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);
  const [isSessionTypeDropdownOpen, setIsSessionTypeDropdownOpen] = useState(false);
  const [exporting, setExporting] = useState<'pdf' | 'csv' | null>(null);
  
  const courseDropdownRef = useRef<HTMLDivElement>(null);
  const dateDropdownRef = useRef<HTMLDivElement>(null);
  const sessionTypeDropdownRef = useRef<HTMLDivElement>(null);
  const studentDropdownRef = useRef<HTMLDivElement>(null);
  
  // Load courses
  useEffect(() => {
    const loadedCourses = getCourses();
    setCourses(loadedCourses);
    setStudentReports(generateStudentReports());
  }, []);
  
  // Generate sessions when filters change
  useEffect(() => {
    const newSessions = generateSessions(selectedCourse, dateRange);
    let filtered = newSessions;
    
    if (sessionType !== 'All') {
      filtered = filtered.filter(s => s.sessionType === sessionType);
    }
    
    setSessions(filtered);
  }, [selectedCourse, dateRange, sessionType]);
  
  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (courseDropdownRef.current && !courseDropdownRef.current.contains(event.target as Node)) {
        setIsCourseDropdownOpen(false);
      }
      if (dateDropdownRef.current && !dateDropdownRef.current.contains(event.target as Node)) {
        setIsDateDropdownOpen(false);
      }
      if (sessionTypeDropdownRef.current && !sessionTypeDropdownRef.current.contains(event.target as Node)) {
        setIsSessionTypeDropdownOpen(false);
      }
      if (studentDropdownRef.current && !studentDropdownRef.current.contains(event.target as Node)) {
        setIsStudentDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Calculate metrics
  const calculateMetrics = () => {
    if (sessions.length === 0) {
      return {
        overallRate: 0,
        avgPerSession: 0,
        totalSessions: 0,
        studentsAtRisk: 0,
        trend: 0,
      };
    }
    
    const totalRate = sessions.reduce((sum, s) => sum + s.attendanceRate, 0);
    const overallRate = Math.round(totalRate / sessions.length);
    const avgPerSession = Math.round(sessions.reduce((sum, s) => sum + s.present, 0) / sessions.length);
    const totalSessions = sessions.length;
    
    // Calculate students at risk (< 70% attendance)
    const studentsAtRisk = studentReports.filter(s => s.overallRate < 70).length;
    
    // Mock trend (would be calculated from previous period)
    const trend = 2.1;
    
    return {
      overallRate,
      avgPerSession,
      totalSessions,
      studentsAtRisk,
      trend,
    };
  };
  
  const metrics = calculateMetrics();
  
  // Prepare chart data
  const chartData = sessions.map(session => ({
    date: new Date(session.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    attendance: session.attendanceRate,
    present: session.present,
    absent: session.absent,
    excused: session.excused,
  }));
  
  // Handle session detail view
  const handleViewSession = (session: AttendanceSession) => {
    // Generate mock student attendance for this session
    const students: StudentAttendance[] = [];
    const total = session.totalStudents;
    
    for (let i = 0; i < session.present; i++) {
      students.push({
        studentId: i + 1,
        studentName: `Student ${i + 1}`,
        studentNumber: `100${i + 1}`,
        status: 'Present',
      });
    }
    
    for (let i = 0; i < session.absent; i++) {
      students.push({
        studentId: session.present + i + 1,
        studentName: `Student ${session.present + i + 1}`,
        studentNumber: `100${session.present + i + 1}`,
        status: 'Absent',
      });
    }
    
    for (let i = 0; i < session.excused; i++) {
      students.push({
        studentId: session.present + session.absent + i + 1,
        studentName: `Student ${session.present + session.absent + i + 1}`,
        studentNumber: `100${session.present + session.absent + i + 1}`,
        status: 'Excused',
      });
    }
    
    setSelectedSession({
      ...session,
      students,
    });
    setShowSessionModal(true);
  };
  
  // Handle export
  const handleExport = async (format: 'pdf' | 'csv') => {
    setExporting(format);
    // Mock export - in real app, this would generate and download the file
    await new Promise(resolve => setTimeout(resolve, 1500));
    setExporting(null);
    // Show success message (would use toast in real app)
    alert(`${format.toUpperCase()} export completed!`);
  };
  
  // Filter students for search
  const filteredStudents = studentReports.filter(s =>
    s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.studentNumber.includes(studentSearch) ||
    s.email.toLowerCase().includes(studentSearch.toLowerCase())
  );
  
  // Chart colors
  const barColor = isDark ? '#0046FF' : '#001BB7';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
  const textColor = isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(10, 10, 15, 0.7)';
  const tooltipBg = isDark ? 'rgba(6, 1, 40, 0.95)' : 'rgba(245, 241, 220, 0.95)';
  const tooltipBorder = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
  
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div
          style={{
            backgroundColor: tooltipBg,
            border: `1px solid ${tooltipBorder}`,
            borderRadius: '12px',
            padding: '12px 16px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          }}
        >
          <p style={{ color: textColor, marginBottom: '8px', fontWeight: 600 }}>
            {data.date}
          </p>
          <p style={{ color: '#0046FF', marginBottom: '4px' }}>
            Attendance: {data.attendance}%
          </p>
          <p style={{ color: '#22c55e', marginBottom: '4px' }}>
            Present: {data.present}
          </p>
          <p style={{ color: '#ef4444', marginBottom: '4px' }}>
            Absent: {data.absent}
          </p>
          <p style={{ color: '#FF8040' }}>
            Excused: {data.excused}
          </p>
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className="p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Title */}
        <div className="mt-6 space-y-2">
          <h2 
            className="text-3xl lg:text-4xl font-bold"
            style={{ color: 'var(--text-primary)' }}
          >
            <AnimatedText speed={35}>
              {t.reports.title}
            </AnimatedText>
          </h2>
          <p 
            className="text-lg"
            style={{ color: 'var(--text-tertiary)' }}
          >
            <AnimatedText speed={40}>
              {t.reports.subtitle}
            </AnimatedText>
          </p>
        </div>
        
        {/* Filter Bar */}
        <div 
          className="backdrop-blur-2xl rounded-3xl border shadow-2xl p-6"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            borderColor: 'var(--border-primary)',
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Course Selector */}
            <div className="relative" ref={courseDropdownRef}>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: 'var(--text-secondary)' }}
              >
                {t.reports.course}
              </label>
              <button
                type="button"
                onClick={() => setIsCourseDropdownOpen(!isCourseDropdownOpen)}
                className="w-full px-4 py-3 rounded-xl border text-left flex items-center justify-between transition-all duration-300"
                style={{
                  backgroundColor: '#1e1e2d',
                  borderColor: isCourseDropdownOpen ? '#0046FF' : '#2A2A3B',
                  color: 'var(--text-primary)',
                }}
              >
                <span>
                  {selectedCourse === null 
                    ? t.reports.allCourses 
                    : courses.find(c => c.id === selectedCourse)?.code + ' - ' + courses.find(c => c.id === selectedCourse)?.name
                  }
                </span>
                <svg
                  className={`w-5 h-5 transition-transform duration-300 ${isCourseDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isCourseDropdownOpen && (
                <div
                  className="absolute z-50 w-full mt-2 rounded-2xl border shadow-2xl max-h-60 overflow-y-auto"
                  style={{
                    backgroundColor: '#1e1e2d',
                    borderColor: '#2A2A3B',
                    opacity: 1,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCourse(null);
                      setIsCourseDropdownOpen(false);
                    }}
                    className="w-full px-4 py-3 rounded-xl text-left transition-all duration-200 hover:scale-[1.02]"
                    style={{
                      backgroundColor: selectedCourse === null ? 'rgba(0, 70, 255, 0.15)' : '#1e1e2d',
                      color: '#E4E4E7',
                      border: selectedCourse === null ? '1px solid rgba(0, 70, 255, 0.3)' : '1px solid transparent',
                    }}
                    onMouseEnter={(e) => {
                      if (selectedCourse !== null) {
                        e.currentTarget.style.backgroundColor = '#2A2A3B';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedCourse !== null) {
                        e.currentTarget.style.backgroundColor = '#1e1e2d';
                      }
                    }}
                  >
                    {t.reports.allCourses}
                  </button>
                  {courses.map((course) => (
                    <button
                      key={course.id}
                      type="button"
                      onClick={() => {
                        setSelectedCourse(course.id);
                        setIsCourseDropdownOpen(false);
                      }}
                      className="w-full px-4 py-3 rounded-xl text-left transition-all duration-200 hover:scale-[1.02]"
                      style={{
                        backgroundColor: selectedCourse === course.id ? 'rgba(0, 70, 255, 0.15)' : '#1e1e2d',
                        color: '#E4E4E7',
                        border: selectedCourse === course.id ? '1px solid rgba(0, 70, 255, 0.3)' : '1px solid transparent',
                      }}
                      onMouseEnter={(e) => {
                        if (selectedCourse !== course.id) {
                          e.currentTarget.style.backgroundColor = '#2A2A3B';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedCourse !== course.id) {
                          e.currentTarget.style.backgroundColor = '#1e1e2d';
                        }
                      }}
                    >
                      <div className="font-semibold">{course.code} - {course.name}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Date Range */}
            <div className="relative" ref={dateDropdownRef}>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: 'var(--text-secondary)' }}
              >
                {t.reports.dateRange}
              </label>
              <button
                type="button"
                onClick={() => setIsDateDropdownOpen(!isDateDropdownOpen)}
                className="w-full px-4 py-3 rounded-xl border text-left flex items-center justify-between transition-all duration-300"
                style={{
                  backgroundColor: '#1e1e2d',
                  borderColor: isDateDropdownOpen ? '#0046FF' : '#2A2A3B',
                  color: 'var(--text-primary)',
                }}
              >
                <span>
                  {dateRange === 'week' ? t.reports.thisWeek : 
                   dateRange === 'month' ? t.reports.thisMonth : 
                   t.reports.last3Months}
                </span>
                <svg
                  className={`w-5 h-5 transition-transform duration-300 ${isDateDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isDateDropdownOpen && (
                <div
                  className="absolute z-50 w-full mt-2 rounded-2xl border shadow-2xl"
                  style={{
                    backgroundColor: '#1e1e2d',
                    borderColor: '#2A2A3B',
                    opacity: 1,
                  }}
                >
                  {(['week', 'month', 'quarter'] as const).map((range) => (
                    <button
                      key={range}
                      type="button"
                      onClick={() => {
                        setDateRange(range);
                        setIsDateDropdownOpen(false);
                      }}
                      className="w-full px-4 py-3 rounded-xl text-left transition-all duration-200 hover:scale-[1.02] first:rounded-t-2xl last:rounded-b-2xl"
                      style={{
                        backgroundColor: dateRange === range ? 'rgba(0, 70, 255, 0.15)' : '#1e1e2d',
                        color: '#E4E4E7',
                        border: dateRange === range ? '1px solid rgba(0, 70, 255, 0.3)' : '1px solid transparent',
                      }}
                      onMouseEnter={(e) => {
                        if (dateRange !== range) {
                          e.currentTarget.style.backgroundColor = '#2A2A3B';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (dateRange !== range) {
                          e.currentTarget.style.backgroundColor = '#1e1e2d';
                        }
                      }}
                    >
                      {range === 'week' ? t.reports.thisWeek : 
                       range === 'month' ? t.reports.thisMonth : 
                       t.reports.last3Months}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Session Type */}
            <div className="relative" ref={sessionTypeDropdownRef}>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: 'var(--text-secondary)' }}
              >
                {t.reports.sessionType}
              </label>
              <button
                type="button"
                onClick={() => setIsSessionTypeDropdownOpen(!isSessionTypeDropdownOpen)}
                className="w-full px-4 py-3 rounded-xl border text-left flex items-center justify-between transition-all duration-300"
                style={{
                  backgroundColor: '#1e1e2d',
                  borderColor: isSessionTypeDropdownOpen ? '#0046FF' : '#2A2A3B',
                  color: 'var(--text-primary)',
                }}
              >
                <span>{sessionType === 'All' ? t.reports.allTypes : sessionType}</span>
                <svg
                  className={`w-5 h-5 transition-transform duration-300 ${isSessionTypeDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isSessionTypeDropdownOpen && (
                <div
                  className="absolute z-50 w-full mt-2 rounded-2xl border shadow-2xl"
                  style={{
                    backgroundColor: '#1e1e2d',
                    borderColor: '#2A2A3B',
                    opacity: 1,
                  }}
                >
                  {(['All', 'Lecture', 'Lab', 'Exam'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => {
                        setSessionType(type);
                        setIsSessionTypeDropdownOpen(false);
                      }}
                      className="w-full px-4 py-3 rounded-xl text-left transition-all duration-200 hover:scale-[1.02] first:rounded-t-2xl last:rounded-b-2xl"
                      style={{
                        backgroundColor: sessionType === type ? 'rgba(0, 70, 255, 0.15)' : '#1e1e2d',
                        color: '#E4E4E7',
                        border: sessionType === type ? '1px solid rgba(0, 70, 255, 0.3)' : '1px solid transparent',
                      }}
                      onMouseEnter={(e) => {
                        if (sessionType !== type) {
                          e.currentTarget.style.backgroundColor = '#2A2A3B';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (sessionType !== type) {
                          e.currentTarget.style.backgroundColor = '#1e1e2d';
                        }
                      }}
                    >
                      {type === 'All' ? t.reports.allTypes : type}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Export Actions */}
            <div className="flex items-end gap-2">
              <button
                onClick={() => handleExport('pdf')}
                disabled={exporting !== null}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-[#0046FF] to-[#001BB7] text-white font-semibold rounded-xl shadow-lg shadow-[#0046FF]/25 hover:shadow-[#0046FF]/40 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {exporting === 'pdf' ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {t.reports.exporting}
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    PDF
                  </>
                )}
              </button>
              <button
                onClick={() => handleExport('csv')}
                disabled={exporting !== null}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-[#FF8040] to-[#FF6B35] text-white font-semibold rounded-xl shadow-lg shadow-[#FF8040]/25 hover:shadow-[#FF8040]/40 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {exporting === 'csv' ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {t.reports.exporting}
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    CSV
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
        
        {/* Key Metrics Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {[
            {
              title: t.reports.overallAttendanceRate,
              value: `${metrics.overallRate}%`,
              change: `+${metrics.trend}%`,
              icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
              gradient: 'from-[#0046FF] via-[#FF8040] to-[#FF6B35]',
            },
            {
              title: t.reports.avgAttendancePerSession,
              value: metrics.avgPerSession.toString(),
              change: '+5',
              icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
              gradient: 'from-[#FF8040] to-[#FF6B35]',
            },
            {
              title: t.reports.totalSessions,
              value: metrics.totalSessions.toString(),
              change: '+12',
              icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
              gradient: 'from-[#001BB7] to-[#0046FF]',
            },
            {
              title: t.reports.studentsAtRisk,
              value: metrics.studentsAtRisk.toString(),
              change: '-2',
              icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
              gradient: 'from-[#ef4444] to-[#dc2626]',
            },
          ].map((card, index) => (
            <div
              key={index}
              className="backdrop-blur-2xl rounded-3xl border shadow-2xl p-6 space-y-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-[#0046FF]/20 group relative overflow-hidden"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border-primary)'
              }}
            >
              <div 
                className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-3xl`}
              />
              
              <div className="flex items-center justify-between relative z-10">
                <div 
                  className={`p-3.5 rounded-xl bg-gradient-to-br ${card.gradient} shadow-lg shadow-[#0046FF]/25 group-hover:scale-110 transition-transform duration-300`}
                >
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={card.icon} />
                  </svg>
                </div>
                <span 
                  className="text-sm font-semibold px-3 py-1 rounded-lg backdrop-blur-sm"
                  style={{
                    backgroundColor: card.change.startsWith('-') 
                      ? 'rgba(239, 68, 68, 0.15)' 
                      : 'rgba(0, 70, 255, 0.15)',
                    color: card.change.startsWith('-') ? '#ef4444' : '#0046FF',
                    border: `1px solid ${card.change.startsWith('-') ? 'rgba(239, 68, 68, 0.2)' : 'rgba(0, 70, 255, 0.2)'}`
                  }}
                >
                  {card.change}
                </span>
              </div>
              <div className="relative z-10">
                <p 
                  className="text-sm mb-2 font-medium"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  {card.title}
                </p>
                <p 
                  className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-[#001BB7] via-[#0046FF] to-[#FF8040] bg-clip-text text-transparent"
                >
                  {card.value}
                </p>
              </div>
            </div>
          ))}
        </div>
        
        {/* Main Reports Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Course Attendance Overview Chart */}
          <div 
            className="lg:col-span-2 backdrop-blur-2xl rounded-3xl border shadow-2xl p-6 lg:p-8 transition-all duration-300 hover:shadow-[#0046FF]/20"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderColor: 'var(--border-primary)'
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 
                  className="text-xl font-bold mb-1"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {t.reports.attendanceOverview}
                </h3>
                <p 
                  className="text-sm"
                  style={{ color: 'var(--text-quaternary)' }}
                >
                  {t.reports.attendanceBySession}
                </p>
              </div>
              <div className="flex gap-2">
                {(['session', 'week', 'month'] as const).map((view) => (
                  <button
                    key={view}
                    onClick={() => setChartView(view)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 ${
                      chartView === view
                        ? 'bg-gradient-to-r from-[#0046FF] to-[#001BB7] text-white shadow-lg shadow-[#0046FF]/25'
                        : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border border-[var(--border-primary)] hover:border-[#0046FF]/50'
                    }`}
                  >
                    {view === 'session' ? t.reports.bySession : 
                     view === 'week' ? t.reports.byWeek : 
                     t.reports.byMonth}
                  </button>
                ))}
              </div>
            </div>
            {chartData.length > 0 ? (
              <div 
                className="h-[400px] rounded-xl relative overflow-hidden p-4"
                style={{
                  backgroundColor: 'var(--bg-tertiary)',
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                    <XAxis 
                      dataKey="date" 
                      stroke={textColor}
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis 
                      stroke={textColor}
                      style={{ fontSize: '12px' }}
                      label={{ value: 'Attendance %', angle: -90, position: 'insideLeft', fill: textColor }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar 
                      dataKey="attendance" 
                      fill={barColor}
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div 
                className="h-[400px] rounded-xl flex items-center justify-center"
                style={{
                  backgroundColor: 'var(--bg-tertiary)',
                }}
              >
                <p style={{ color: 'var(--text-tertiary)' }}>
                  {t.reports.noDataAvailable}
                </p>
              </div>
            )}
          </div>
          
          {/* Insights Card */}
          <div 
            className="backdrop-blur-2xl rounded-3xl border shadow-2xl p-6 lg:p-8 transition-all duration-300 hover:shadow-[#0046FF]/20"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderColor: 'var(--border-primary)'
            }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div 
                className="p-3 rounded-xl bg-gradient-to-br from-[#0046FF] to-[#001BB7]"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 
                className="text-xl font-bold"
                style={{ color: 'var(--text-primary)' }}
              >
                {t.reports.insights}
              </h3>
            </div>
            <div className="space-y-4">
              {metrics.studentsAtRisk > 0 && (
                <div 
                  className="p-4 rounded-xl border"
                  style={{
                    backgroundColor: 'var(--bg-tertiary)',
                    borderColor: '#ef4444/30',
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <p className="font-semibold text-sm" style={{ color: '#ef4444' }}>
                      {t.reports.studentsBelowThreshold}
                    </p>
                  </div>
                  <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                    {metrics.studentsAtRisk} {t.reports.studentsHaveLowAttendance}
                  </p>
                </div>
              )}
              {sessions.length > 0 && (
                <div 
                  className="p-4 rounded-xl border"
                  style={{
                    backgroundColor: 'var(--bg-tertiary)',
                    borderColor: 'var(--border-primary)',
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                      {t.reports.averageAttendance}
                    </p>
                  </div>
                  <p className="text-2xl font-bold" style={{ color: '#22c55e' }}>
                    {metrics.overallRate}%
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Session List Table */}
        <div 
          className="backdrop-blur-2xl rounded-3xl border shadow-2xl p-6 lg:p-8 transition-all duration-300 hover:shadow-[#0046FF]/20"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            borderColor: 'var(--border-primary)'
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 
              className="text-xl font-bold"
              style={{ color: 'var(--text-primary)' }}
            >
              {t.reports.sessionList}
            </h3>
            <span 
              className="text-sm"
              style={{ color: 'var(--text-tertiary)' }}
            >
              {sessions.length} {t.reports.sessions}
            </span>
          </div>
          
          {sessions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-primary)' }}>
                    {[
                      t.reports.date,
                      t.reports.course,
                      t.reports.sessionType,
                      t.reports.time,
                      t.reports.present,
                      t.reports.absent,
                      t.reports.excused,
                      t.reports.attendanceRate,
                      t.reports.actions,
                    ].map((header, index) => (
                      <th
                        key={index}
                        className="px-4 py-3 text-left text-sm font-semibold"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((session) => (
                    <tr
                      key={session.id}
                      className="transition-all duration-200 hover:scale-[1.01] cursor-pointer"
                      style={{
                        borderBottom: '1px solid var(--border-primary)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-primary)' }}>
                        {new Date(session.date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-primary)' }}>
                        {session.courseCode}
                      </td>
                      <td className="px-4 py-3">
                        <span 
                          className="px-2 py-1 rounded-lg text-xs font-medium"
                          style={{
                            backgroundColor: session.sessionType === 'Lecture' 
                              ? 'rgba(0, 70, 255, 0.15)' 
                              : session.sessionType === 'Lab'
                              ? 'rgba(255, 128, 64, 0.15)'
                              : 'rgba(239, 68, 68, 0.15)',
                            color: session.sessionType === 'Lecture'
                              ? '#0046FF'
                              : session.sessionType === 'Lab'
                              ? '#FF8040'
                              : '#ef4444',
                          }}
                        >
                          {session.sessionType}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-primary)' }}>
                        {session.startTime} - {session.endTime}
                      </td>
                      <td className="px-4 py-3 text-sm" style={{ color: '#22c55e' }}>
                        {session.present}
                      </td>
                      <td className="px-4 py-3 text-sm" style={{ color: '#ef4444' }}>
                        {session.absent}
                      </td>
                      <td className="px-4 py-3 text-sm" style={{ color: '#FF8040' }}>
                        {session.excused}
                      </td>
                      <td className="px-4 py-3">
                        <span 
                          className={`px-2 py-1 rounded-lg text-xs font-medium ${
                            session.attendanceRate >= 90 
                              ? 'bg-green-500/20 text-green-400'
                              : session.attendanceRate >= 70
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}
                        >
                          {session.attendanceRate}%
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleViewSession(session)}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 hover:scale-105"
                          style={{
                            backgroundColor: 'var(--bg-tertiary)',
                            color: '#0046FF',
                            border: '1px solid rgba(0, 70, 255, 0.3)',
                          }}
                        >
                          {t.reports.viewDetails}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <p style={{ color: 'var(--text-tertiary)' }}>
                {t.reports.noSessionsFound}
              </p>
            </div>
          )}
        </div>
        
        {/* Student-Focused Reports Section */}
        <div 
          className="backdrop-blur-2xl rounded-3xl border shadow-2xl p-6 lg:p-8 transition-all duration-300 hover:shadow-[#0046FF]/20"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            borderColor: 'var(--border-primary)'
          }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div 
              className="p-3 rounded-xl bg-gradient-to-br from-[#0046FF] to-[#001BB7]"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 
              className="text-xl font-bold"
              style={{ color: 'var(--text-primary)' }}
            >
              {t.reports.studentReports}
            </h3>
          </div>
          
          {/* Student Selector */}
          <div className="relative mb-6" ref={studentDropdownRef}>
            <label 
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--text-secondary)' }}
            >
              {t.reports.selectStudent}
            </label>
            <div className="relative">
              <input
                type="text"
                value={studentSearch}
                onChange={(e) => {
                  setStudentSearch(e.target.value);
                  setIsStudentDropdownOpen(true);
                }}
                onFocus={() => setIsStudentDropdownOpen(true)}
                placeholder={t.reports.searchStudentPlaceholder}
                className="w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#0046FF]/50"
                style={{
                  backgroundColor: '#1e1e2d',
                  borderColor: '#2A2A3B',
                  color: 'var(--text-primary)',
                }}
              />
              {isStudentDropdownOpen && filteredStudents.length > 0 && (
                <div
                  className="absolute z-50 w-full mt-2 rounded-2xl border shadow-2xl max-h-60 overflow-y-auto"
                  style={{
                    backgroundColor: '#1e1e2d',
                    borderColor: '#2A2A3B',
                    opacity: 1,
                  }}
                >
                  {filteredStudents.map((student) => (
                    <button
                      key={student.id}
                      type="button"
                      onClick={() => {
                        setSelectedStudent(student);
                        setStudentSearch(student.name);
                        setIsStudentDropdownOpen(false);
                      }}
                      className="w-full px-4 py-3 rounded-xl text-left transition-all duration-200 hover:scale-[1.02]"
                      style={{
                        backgroundColor: selectedStudent?.id === student.id ? 'rgba(0, 70, 255, 0.15)' : '#1e1e2d',
                        color: '#E4E4E7',
                        border: selectedStudent?.id === student.id ? '1px solid rgba(0, 70, 255, 0.3)' : '1px solid transparent',
                      }}
                      onMouseEnter={(e) => {
                        if (selectedStudent?.id !== student.id) {
                          e.currentTarget.style.backgroundColor = '#2A2A3B';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedStudent?.id !== student.id) {
                          e.currentTarget.style.backgroundColor = '#1e1e2d';
                        }
                      }}
                    >
                      <div className="font-semibold">{student.name}</div>
                      <div className="text-xs text-gray-400">{student.studentNumber} • {student.email}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Selected Student Report */}
          {selectedStudent && (
            <div className="space-y-6">
              {/* Student Summary */}
              <div 
                className="p-6 rounded-2xl border"
                style={{
                  backgroundColor: 'var(--bg-tertiary)',
                  borderColor: 'var(--border-primary)',
                }}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#0046FF] to-[#001BB7] flex items-center justify-center text-white font-bold text-xl">
                    {selectedStudent.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h4 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                      {selectedStudent.name}
                    </h4>
                    <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                      {selectedStudent.studentNumber} • {selectedStudent.email}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                      {t.reports.overallAttendanceRate}
                    </p>
                    <p className="text-3xl font-bold" style={{ color: '#0046FF' }}>
                      {selectedStudent.overallRate}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                      {t.reports.attendanceByCourse}
                    </p>
                    <div className="space-y-2">
                      {selectedStudent.courseRates.map((course) => (
                        <div key={course.courseId} className="flex items-center justify-between">
                          <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                            {course.courseCode}
                          </span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 rounded-full bg-gray-700">
                              <div
                                className="h-2 rounded-full bg-gradient-to-r from-[#0046FF] to-[#001BB7]"
                                style={{ width: `${course.rate}%` }}
                              />
                            </div>
                            <span className="text-sm font-semibold w-12 text-right" style={{ color: 'var(--text-primary)' }}>
                              {course.rate}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Student Attendance History */}
              <div>
                <h4 
                  className="text-lg font-bold mb-4"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {t.reports.attendanceHistory}
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-primary)' }}>
                        {[
                          t.reports.date,
                          t.reports.course,
                          t.reports.sessionType,
                          t.reports.status,
                          t.reports.notes,
                        ].map((header, index) => (
                          <th
                            key={index}
                            className="px-4 py-3 text-left text-sm font-semibold"
                            style={{ color: 'var(--text-secondary)' }}
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {selectedStudent.history.map((record, index) => (
                        <tr
                          key={index}
                          style={{
                            borderBottom: '1px solid var(--border-primary)',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                        >
                          <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-primary)' }}>
                            {new Date(record.date).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-primary)' }}>
                            {record.courseCode}
                          </td>
                          <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-primary)' }}>
                            {record.sessionType}
                          </td>
                          <td className="px-4 py-3">
                            <span 
                              className="px-2 py-1 rounded-lg text-xs font-medium"
                              style={{
                                backgroundColor: record.status === 'Present' 
                                  ? 'rgba(34, 197, 94, 0.15)' 
                                  : record.status === 'Absent'
                                  ? 'rgba(239, 68, 68, 0.15)'
                                  : 'rgba(255, 128, 64, 0.15)',
                                color: record.status === 'Present'
                                  ? '#22c55e'
                                  : record.status === 'Absent'
                                  ? '#ef4444'
                                  : '#FF8040',
                              }}
                            >
                              {record.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-tertiary)' }}>
                            {record.notes || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Session Details Modal */}
      {showSessionModal && selectedSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div
            className="w-full max-w-4xl rounded-3xl border shadow-2xl p-8 space-y-6 max-h-[90vh] overflow-y-auto"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderColor: 'var(--border-primary)',
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 
                  className="text-2xl font-bold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {t.reports.sessionDetails}
                </h3>
                <p 
                  className="text-sm mt-1"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  {selectedSession.courseCode} - {selectedSession.courseName}
                </p>
              </div>
              <button
                onClick={() => setShowSessionModal(false)}
                className="p-2 rounded-xl hover:bg-[var(--bg-tertiary)] transition-colors"
                style={{ color: 'var(--text-primary)' }}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div 
                className="p-4 rounded-xl border"
                style={{
                  backgroundColor: 'var(--bg-tertiary)',
                  borderColor: 'var(--border-primary)',
                }}
              >
                <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
                  {t.reports.date}
                </p>
                <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {new Date(selectedSession.date).toLocaleDateString()}
                </p>
              </div>
              <div 
                className="p-4 rounded-xl border"
                style={{
                  backgroundColor: 'var(--bg-tertiary)',
                  borderColor: 'var(--border-primary)',
                }}
              >
                <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
                  {t.reports.time}
                </p>
                <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {selectedSession.startTime} - {selectedSession.endTime}
                </p>
              </div>
              <div 
                className="p-4 rounded-xl border"
                style={{
                  backgroundColor: 'var(--bg-tertiary)',
                  borderColor: 'var(--border-primary)',
                }}
              >
                <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
                  {t.reports.sessionType}
                </p>
                <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {selectedSession.sessionType}
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div 
                className="p-4 rounded-xl border"
                style={{
                  backgroundColor: 'rgba(34, 197, 94, 0.1)',
                  borderColor: 'rgba(34, 197, 94, 0.3)',
                }}
              >
                <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
                  {t.reports.present}
                </p>
                <p className="text-2xl font-bold" style={{ color: '#22c55e' }}>
                  {selectedSession.present}
                </p>
              </div>
              <div 
                className="p-4 rounded-xl border"
                style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  borderColor: 'rgba(239, 68, 68, 0.3)',
                }}
              >
                <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
                  {t.reports.absent}
                </p>
                <p className="text-2xl font-bold" style={{ color: '#ef4444' }}>
                  {selectedSession.absent}
                </p>
              </div>
              <div 
                className="p-4 rounded-xl border"
                style={{
                  backgroundColor: 'rgba(255, 128, 64, 0.1)',
                  borderColor: 'rgba(255, 128, 64, 0.3)',
                }}
              >
                <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
                  {t.reports.excused}
                </p>
                <p className="text-2xl font-bold" style={{ color: '#FF8040' }}>
                  {selectedSession.excused}
                </p>
              </div>
            </div>
            
            <div>
              <h4 
                className="text-lg font-bold mb-4"
                style={{ color: 'var(--text-primary)' }}
              >
                {t.reports.studentList}
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-primary)' }}>
                      <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
                        {t.reports.studentName}
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
                        {t.reports.studentNumber}
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
                        {t.reports.status}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedSession.students.map((student) => (
                      <tr
                        key={student.studentId}
                        style={{
                          borderBottom: '1px solid var(--border-primary)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-primary)' }}>
                          {student.studentName}
                        </td>
                        <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-primary)' }}>
                          {student.studentNumber}
                        </td>
                        <td className="px-4 py-3">
                          <span 
                            className="px-2 py-1 rounded-lg text-xs font-medium"
                            style={{
                              backgroundColor: student.status === 'Present' 
                                ? 'rgba(34, 197, 94, 0.15)' 
                                : student.status === 'Absent'
                                ? 'rgba(239, 68, 68, 0.15)'
                                : 'rgba(255, 128, 64, 0.15)',
                              color: student.status === 'Present'
                                ? '#22c55e'
                                : student.status === 'Absent'
                                ? '#ef4444'
                                : '#FF8040',
                            }}
                          >
                            {student.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

