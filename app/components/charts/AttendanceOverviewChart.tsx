'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '../../context/ThemeContext';
import { getCourses, type Course } from '../../utils/courseData';

// Generate fake attendance data for a course
const generateAttendanceData = (courseId: number) => {
  // Different data for different courses to make it realistic
  const baseData = [
    { name: 'Mon', attendance: 220 + (courseId * 10) },
    { name: 'Tue', attendance: 245 + (courseId * 8) },
    { name: 'Wed', attendance: 200 + (courseId * 12) },
    { name: 'Thu', attendance: 260 + (courseId * 5) },
    { name: 'Fri', attendance: 230 + (courseId * 7) },
    { name: 'Sat', attendance: 180 + (courseId * 15) },
    { name: 'Sun', attendance: 150 + (courseId * 20) },
  ];
  return baseData;
};

interface AttendanceOverviewChartProps {
  selectedCourseId?: number;
  onCourseChange?: (courseId: number) => void;
}

export default function AttendanceOverviewChart({ selectedCourseId, onCourseChange }: AttendanceOverviewChartProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [currentCourseId, setCurrentCourseId] = useState<number | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { actualTheme } = useTheme();
  const isDark = actualTheme === 'dark';

  // Load courses on mount
  useEffect(() => {
    const loadedCourses = getCourses();
    setCourses(loadedCourses);
    if (loadedCourses.length > 0) {
      const initialCourseId = selectedCourseId || loadedCourses[0].id;
      setCurrentCourseId(initialCourseId);
      if (onCourseChange) {
        onCourseChange(initialCourseId);
      }
    }
  }, [selectedCourseId, onCourseChange]);

  // Update when selectedCourseId prop changes
  useEffect(() => {
    if (selectedCourseId && selectedCourseId !== currentCourseId) {
      setCurrentCourseId(selectedCourseId);
    }
  }, [selectedCourseId, currentCourseId]);

  const handleCourseSelect = (courseId: number) => {
    setCurrentCourseId(courseId);
    setIsDropdownOpen(false);
    if (onCourseChange) {
      onCourseChange(courseId);
    }
  };

  const currentCourse = courses.find(c => c.id === currentCourseId);
  const data = currentCourseId ? generateAttendanceData(currentCourseId) : [];

  // Colors that match the app's design system
  const barColor = isDark ? '#0046FF' : '#001BB7';
  const barGradientId = 'barGradient';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
  const textColor = isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(10, 10, 15, 0.7)';
  const textPrimary = isDark ? 'rgba(255, 255, 255, 0.9)' : 'rgba(10, 10, 15, 0.9)';
  const tooltipBg = isDark ? 'rgba(6, 1, 40, 0.95)' : 'rgba(245, 241, 220, 0.95)';
  const tooltipBorder = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isDropdownOpen && !target.closest('[data-course-selector]')) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            backgroundColor: tooltipBg,
            border: `1px solid ${tooltipBorder}`,
            borderRadius: '12px',
            padding: '12px 16px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <p
            style={{
              color: isDark ? 'rgba(255, 255, 255, 0.9)' : 'rgba(10, 10, 15, 0.9)',
              marginBottom: '4px',
              fontSize: '14px',
              fontWeight: 600,
            }}
          >
            {payload[0].payload.name}
          </p>
          <p
            style={{
              color: '#0046FF',
              fontSize: '18px',
              fontWeight: 700,
            }}
          >
            {payload[0].value} students
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-full animate-in">
      {/* Course Selector */}
      <div className="relative mb-4" data-course-selector>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="w-full px-4 py-2.5 rounded-xl border transition-all duration-300 flex items-center justify-between"
          style={{
            backgroundColor: 'var(--bg-tertiary)',
            borderColor: isDropdownOpen ? '#0046FF' : 'var(--border-primary)',
            color: 'var(--text-primary)',
          }}
        >
          <div className="flex items-center gap-3">
            <svg
              className="w-5 h-5"
              style={{ color: '#0046FF' }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span className="text-sm font-medium">
              {currentCourse ? `${currentCourse.code} - ${currentCourse.name}` : 'Select Course'}
            </span>
          </div>
          <svg
            className={`w-5 h-5 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`}
            style={{ color: 'var(--text-tertiary)' }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown */}
        {isDropdownOpen && courses.length > 0 && (
          <div
            className="absolute top-full left-0 right-0 mt-2 rounded-xl border shadow-2xl z-50 max-h-64 overflow-y-auto animate-in slide-in-from-top-2"
            style={{
              backgroundColor: '#1e1e2d',
              borderColor: '#2A2A3B',
              opacity: 1,
              backdropFilter: 'none',
            }}
          >
            {courses.map((course) => (
              <button
                key={course.id}
                onClick={() => handleCourseSelect(course.id)}
                className="w-full px-4 py-3 text-left transition-all duration-200 flex items-center gap-3 border-b last:border-b-0"
                style={{
                  backgroundColor: currentCourseId === course.id ? '#2A2A3B' : '#1e1e2d',
                  borderColor: '#2A2A3B',
                  color: '#E4E4E7',
                  opacity: 1,
                }}
                onMouseEnter={(e) => {
                  if (currentCourseId !== course.id) {
                    e.currentTarget.style.backgroundColor = '#2A2A3B';
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentCourseId !== course.id) {
                    e.currentTarget.style.backgroundColor = '#1e1e2d';
                  }
                }}
              >
                <div className="flex-1 min-w-0">
                  <div 
                    className="font-medium text-sm truncate" 
                    style={{ 
                      color: '#E4E4E7',
                      opacity: 1,
                    }}
                  >
                    {course.code} - {course.name}
                  </div>
                  {course.instructor && (
                    <div 
                      className="text-xs mt-1" 
                      style={{ 
                        color: '#E4E4E7',
                        opacity: 1,
                      }}
                    >
                      {course.instructor}
                    </div>
                  )}
                </div>
                {currentCourseId === course.id && (
                  <svg
                    className="w-5 h-5 flex-shrink-0"
                    style={{ color: '#0046FF', opacity: 1 }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 20, left: 0, bottom: 0 }}
          barCategoryGap="20%"
        >
          <defs>
            <linearGradient id={barGradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0046FF" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#001BB7" stopOpacity={0.7} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={gridColor}
            vertical={false}
          />
          <XAxis
            dataKey="name"
            tick={{
              fill: textColor,
              fontSize: 12,
              fontWeight: 500,
            }}
            axisLine={{ stroke: gridColor }}
            tickLine={{ stroke: gridColor }}
          />
          <YAxis
            tick={{
              fill: textColor,
              fontSize: 12,
              fontWeight: 500,
            }}
            axisLine={{ stroke: gridColor }}
            tickLine={{ stroke: gridColor }}
            width={40}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0, 70, 255, 0.1)' }} />
          <Bar
            dataKey="attendance"
            fill={`url(#${barGradientId})`}
            radius={[8, 8, 0, 0]}
            animationDuration={1000}
            animationBegin={0}
            animationEasing="ease-out"
          />
        </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

