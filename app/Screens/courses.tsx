'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import AnimatedText from '../components/AnimatedText';
import ActionMenu, { ActionMenuItem } from '../components/ActionMenu';
import { saveCourses } from '../utils/courseData';

type Day = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';

type ScheduleEntry = {
  day: Day;
  startTime: string;
  endTime: string;
};

type Student = {
  id: number;
  firstName: string;
  lastName: string;
  studentNumber: string;
  email: string;
};

type Course = {
  id: number;
  name: string;
  code: string;
  description?: string;
  weeklyHours: number;
  schedule: ScheduleEntry[];
  students: Student[];
  room?: string;
  semester?: string;
  year?: string;
  category?: string;
  instructor?: string;
};

// Mock students - in a real app, this would come from a shared context or API
const mockStudents: Student[] = [
  { id: 1, firstName: 'Ahmet', lastName: 'Yılmaz', studentNumber: '1001', email: 'ahmet.yilmaz@example.com' },
  { id: 2, firstName: 'Ayşe', lastName: 'Demir', studentNumber: '1002', email: 'ayse.demir@example.com' },
  { id: 3, firstName: 'Mehmet', lastName: 'Kaya', studentNumber: '1003', email: 'mehmet.kaya@example.com' },
  { id: 4, firstName: 'Fatma', lastName: 'Şahin', studentNumber: '1004', email: 'fatma.sahin@example.com' },
  { id: 5, firstName: 'Ali', lastName: 'Öztürk', studentNumber: '1005', email: 'ali.ozturk@example.com' },
];

const initialCourses: Course[] = [
  {
    id: 1,
    name: 'Introduction to Computer Science',
    code: 'CS101',
    description: 'Fundamental concepts of computer science',
    weeklyHours: 4,
    schedule: [
      { day: 'Mon', startTime: '09:00', endTime: '11:00' },
      { day: 'Wed', startTime: '14:00', endTime: '15:00' },
    ],
    students: [mockStudents[0], mockStudents[1]],
    room: 'A101',
    semester: 'Fall',
    year: '2024',
    category: 'Theoretical',
    instructor: 'Dr. John Doe',
  },
];

const Courses = () => {
  const { t } = useLanguage();
  const [courses, setCourses] = useState<Course[]>(() => {
    // Load from localStorage or use initial
    const stored = typeof window !== 'undefined' ? localStorage.getItem('courses') : null;
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        saveCourses(initialCourses);
        return initialCourses;
      }
    }
    saveCourses(initialCourses);
    return initialCourses;
  });
  const [activeTab, setActiveTab] = useState<'list' | 'add'>('list');
  const [search, setSearch] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [editModal, setEditModal] = useState<{ open: boolean; course?: Course }>({ open: false });
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; course?: Course }>({ open: false });
  const [notification, setNotification] = useState<{ show: boolean; message: string }>({ show: false, message: '' });
  const buttonRefs = useRef<{ [key: number]: HTMLButtonElement | null }>({});

  // Form state
  const [courseName, setCourseName] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [description, setDescription] = useState('');
  const [weeklyHours, setWeeklyHours] = useState('');
  const [schedule, setSchedule] = useState<ScheduleEntry[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [room, setRoom] = useState('');
  const [semester, setSemester] = useState('');
  const [year, setYear] = useState('');
  const [category, setCategory] = useState('');
  const [instructor, setInstructor] = useState('');
  const [focused, setFocused] = useState<string | null>(null);
  const [studentDropdownOpen, setStudentDropdownOpen] = useState(false);
  const [studentSearch, setStudentSearch] = useState('');
  const studentDropdownRef = useRef<HTMLDivElement>(null);

  // Close student dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (studentDropdownRef.current && !studentDropdownRef.current.contains(event.target as Node)) {
        setStudentDropdownOpen(false);
      }
    };

    if (studentDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [studentDropdownOpen]);

  // Format schedule summary
  const formatScheduleSummary = (schedule: ScheduleEntry[]): string => {
    if (schedule.length === 0) return '-';
    return schedule
      .map((s) => {
        const dayMap: Record<Day, string> = {
          Mon: t.courses.mon,
          Tue: t.courses.tue,
          Wed: t.courses.wed,
          Thu: t.courses.thu,
          Fri: t.courses.fri,
          Sat: t.courses.sat,
          Sun: t.courses.sun,
        };
        return `${dayMap[s.day]} ${s.startTime}–${s.endTime}`;
      })
      .join(', ');
  };

  // Filter courses
  const filteredCourses = courses.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.description?.toLowerCase().includes(search.toLowerCase())
  );

  // Handle add schedule entry
  const addScheduleEntry = () => {
    setSchedule([...schedule, { day: 'Mon', startTime: '09:00', endTime: '10:00' }]);
  };

  // Handle remove schedule entry
  const removeScheduleEntry = (index: number) => {
    setSchedule(schedule.filter((_, i) => i !== index));
  };

  // Handle update schedule entry
  const updateScheduleEntry = (index: number, field: keyof ScheduleEntry, value: string) => {
    const updated = [...schedule];
    updated[index] = { ...updated[index], [field]: value };
    setSchedule(updated);
  };

  // Handle student selection
  const toggleStudent = (studentId: number) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId]
    );
  };

  // Get selected student objects
  const getSelectedStudentObjects = (): Student[] => {
    return mockStudents.filter((s) => selectedStudents.includes(s.id));
  };

  // Filter students for dropdown
  const filteredStudents = mockStudents.filter(
    (s) =>
      `${s.firstName} ${s.lastName}`.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.studentNumber.includes(studentSearch) ||
      s.email.toLowerCase().includes(studentSearch.toLowerCase())
  );

  // Reset form
  const resetForm = () => {
    setCourseName('');
    setCourseCode('');
    setDescription('');
    setWeeklyHours('');
    setSchedule([]);
    setSelectedStudents([]);
    setRoom('');
    setSemester('');
    setYear('');
    setCategory('');
    setInstructor('');
    setStudentSearch('');
  };

  // Open edit modal
  const openEditModal = (course: Course) => {
    setCourseName(course.name);
    setCourseCode(course.code);
    setDescription(course.description || '');
    setWeeklyHours(course.weeklyHours.toString());
    setSchedule([...course.schedule]);
    setSelectedStudents(course.students.map((s) => s.id));
    setRoom(course.room || '');
    setSemester(course.semester || '');
    setYear(course.year || '');
    setCategory(course.category || '');
    setInstructor(course.instructor || '');
    setEditModal({ open: true, course });
    setActiveTab('add');
    setOpenMenuId(null);
  };

  // Validate form
  const validateForm = (): boolean => {
    if (!courseName.trim()) {
      setNotification({ show: true, message: t.courses.courseNameRequired });
      setTimeout(() => setNotification({ show: false, message: '' }), 3000);
      return false;
    }
    if (!courseCode.trim()) {
      setNotification({ show: true, message: t.courses.courseCodeRequired });
      setTimeout(() => setNotification({ show: false, message: '' }), 3000);
      return false;
    }
    if (!weeklyHours || isNaN(Number(weeklyHours)) || Number(weeklyHours) <= 0) {
      setNotification({ show: true, message: t.courses.weeklyHoursRequired });
      setTimeout(() => setNotification({ show: false, message: '' }), 3000);
      return false;
    }
    if (schedule.length === 0) {
      setNotification({ show: true, message: t.courses.scheduleRequired });
      setTimeout(() => setNotification({ show: false, message: '' }), 3000);
      return false;
    }
    // Validate time ranges
    for (const entry of schedule) {
      if (entry.startTime >= entry.endTime) {
        setNotification({ show: true, message: t.courses.invalidTimeRange });
        setTimeout(() => setNotification({ show: false, message: '' }), 3000);
        return false;
      }
    }
    return true;
  };

  // Handle save course
  const handleSaveCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const enrolledStudents = getSelectedStudentObjects();

    if (editModal.course) {
      // Update existing course
      const updatedCourses = courses.map((c) =>
        c.id === editModal.course!.id
          ? {
              ...c,
              name: courseName.trim(),
              code: courseCode.trim(),
              description: description.trim() || undefined,
              weeklyHours: Number(weeklyHours),
              schedule,
              students: enrolledStudents,
              room: room.trim() || undefined,
              semester: semester || undefined,
              year: year || undefined,
              category: category || undefined,
              instructor: instructor.trim() || undefined,
            }
          : c
      );
      setCourses(updatedCourses);
      
      // Save to localStorage for Students component access
      saveCourses(updatedCourses);
      
      setNotification({ show: true, message: t.courses.courseUpdated });
      setEditModal({ open: false });
    } else {
      // Add new course
      const newCourse: Course = {
        id: courses.length > 0 ? Math.max(...courses.map((c) => c.id)) + 1 : 1,
        name: courseName.trim(),
        code: courseCode.trim(),
        description: description.trim() || undefined,
        weeklyHours: Number(weeklyHours),
        schedule,
        students: enrolledStudents,
        room: room.trim() || undefined,
        semester: semester || undefined,
        year: year || undefined,
        category: category || undefined,
        instructor: instructor.trim() || undefined,
      };
      setCourses([...courses, newCourse]);
      setNotification({ show: true, message: t.courses.courseAdded });
      
      // Save to localStorage for Students component access
      saveCourses([...courses, newCourse]);
    }

    resetForm();
    setActiveTab('list');
    setTimeout(() => setNotification({ show: false, message: '' }), 3000);
  };

  // Handle delete course
  const handleDeleteCourse = () => {
    if (deleteModal.course) {
      const updatedCourses = courses.filter((c) => c.id !== deleteModal.course!.id);
      setCourses(updatedCourses);
      
      // Save to localStorage for Students component access
      saveCourses(updatedCourses);
      
      setNotification({ show: true, message: t.courses.courseDeleted });
      setDeleteModal({ open: false });
      setTimeout(() => setNotification({ show: false, message: '' }), 3000);
    }
  };

  // Get action menu items
  const getActionMenuItems = (course: Course): ActionMenuItem[] => [
    {
      id: `edit-${course.id}`,
      label: t.courses.edit,
      onClick: () => openEditModal(course),
      icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
    },
    {
      id: `delete-${course.id}`,
      label: t.courses.delete,
      onClick: () => {
        setDeleteModal({ open: true, course });
        setOpenMenuId(null);
      },
      icon: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
      variant: 'danger',
    },
  ];

  const dayOptions: { value: Day; label: string }[] = [
    { value: 'Mon', label: t.courses.monday },
    { value: 'Tue', label: t.courses.tuesday },
    { value: 'Wed', label: t.courses.wednesday },
    { value: 'Thu', label: t.courses.thursday },
    { value: 'Fri', label: t.courses.friday },
    { value: 'Sat', label: t.courses.saturday },
    { value: 'Sun', label: t.courses.sunday },
  ];

  return (
    <div className="p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-6 lg:space-y-8">
        {/* Page Title */}
        <div className="space-y-2">
          <h2 className="text-3xl lg:text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>
            <AnimatedText speed={35}>{t.courses.title}</AnimatedText>
          </h2>
          <p className="text-lg" style={{ color: 'var(--text-tertiary)' }}>
            <AnimatedText speed={40}>{t.courses.subtitle}</AnimatedText>
          </p>
          <div className="h-1 w-20 bg-gradient-to-r from-[#0046FF] to-[#FF8040] rounded-full" />
        </div>

        {/* Notification */}
        {notification.show && (
          <div
            className="p-4 rounded-xl backdrop-blur-xl border bg-green-500/10 border-green-500/30 text-green-400 transition-all duration-300 animate-in slide-in-from-top-2"
          >
            {notification.message}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 border-b" style={{ borderColor: 'var(--border-primary)' }}>
          <button
            onClick={() => {
              setActiveTab('list');
              resetForm();
              setEditModal({ open: false });
            }}
            className={`px-6 py-3 font-medium transition-all duration-300 relative ${
              activeTab === 'list' ? '' : 'opacity-60 hover:opacity-100'
            }`}
            style={{
              color: activeTab === 'list' ? 'var(--text-primary)' : 'var(--text-tertiary)',
            }}
          >
            {t.courses.courseList}
            {activeTab === 'list' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#0046FF] to-[#FF8040]" />
            )}
          </button>
          <button
            onClick={() => {
              setActiveTab('add');
              resetForm();
              setEditModal({ open: false });
            }}
            className={`px-6 py-3 font-medium transition-all duration-300 relative ${
              activeTab === 'add' ? '' : 'opacity-60 hover:opacity-100'
            }`}
            style={{
              color: activeTab === 'add' ? 'var(--text-primary)' : 'var(--text-tertiary)',
            }}
          >
            {editModal.course ? t.courses.editCourse : t.courses.addCourse}
            {activeTab === 'add' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#0046FF] to-[#FF8040]" />
            )}
          </button>
        </div>

        {/* Course List Tab */}
        {activeTab === 'list' && (
          <div className="space-y-6">
            {/* Search Bar */}
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                placeholder={t.courses.searchPlaceholder}
                className="w-full px-4 py-3 pl-12 rounded-xl transition-all duration-300"
                style={{
                  backgroundColor: searchFocused ? 'var(--bg-tertiary)' : 'var(--bg-secondary)',
                  border: `1px solid ${searchFocused ? 'var(--border-secondary)' : 'var(--border-primary)'}`,
                  color: 'var(--text-primary)',
                  outline: 'none',
                }}
              />
              <svg
                className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5"
                style={{ color: 'var(--text-quaternary)' }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Course Table */}
            <div
              className="rounded-2xl backdrop-blur-xl border overflow-hidden"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border-primary)',
              }}
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ borderColor: 'var(--border-primary)' }}>
                      <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
                        {t.courses.courseName}
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
                        {t.courses.courseCode}
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
                        {t.courses.weeklyHours}
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
                        {t.courses.weeklyScheduleSummary}
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
                        {t.courses.totalStudents}
                      </th>
                      <th className="px-6 py-4 text-right text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
                        {t.courses.actions}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCourses.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center" style={{ color: 'var(--text-tertiary)' }}>
                          {t.courses.noCoursesFound}
                        </td>
                      </tr>
                    ) : (
                      filteredCourses.map((course) => (
                        <tr
                          key={course.id}
                          className="border-t hover:bg-opacity-50 transition-colors duration-200"
                          style={{ borderColor: 'var(--border-primary)' }}
                        >
                          <td className="px-6 py-4" style={{ color: 'var(--text-primary)' }}>
                            {course.name}
                          </td>
                          <td className="px-6 py-4" style={{ color: 'var(--text-primary)' }}>
                            {course.code}
                          </td>
                          <td className="px-6 py-4" style={{ color: 'var(--text-primary)' }}>
                            {course.weeklyHours}
                          </td>
                          <td className="px-6 py-4" style={{ color: 'var(--text-primary)' }}>
                            <span className="text-sm">{formatScheduleSummary(course.schedule)}</span>
                          </td>
                          <td className="px-6 py-4" style={{ color: 'var(--text-primary)' }}>
                            {course.students.length}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="relative inline-block">
                              <button
                                ref={(el) => {
                                  if (el) buttonRefs.current[course.id] = el;
                                }}
                                onClick={() => setOpenMenuId(openMenuId === course.id ? null : course.id)}
                                className="p-2 rounded-lg hover:bg-opacity-50 transition-all duration-200"
                                style={{ backgroundColor: 'var(--bg-tertiary)' }}
                              >
                                <svg
                                  className="w-5 h-5"
                                  style={{ color: 'var(--text-primary)' }}
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                </svg>
                              </button>
                              <ActionMenu
                                isOpen={openMenuId === course.id}
                                onClose={() => setOpenMenuId(null)}
                                anchorRef={buttonRefs.current[course.id]}
                                position="right"
                                items={getActionMenuItems(course)}
                              />
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Add/Edit Course Tab */}
        {activeTab === 'add' && (
          <form onSubmit={handleSaveCourse} className="space-y-6">
            <div
              className="p-6 rounded-2xl backdrop-blur-xl border space-y-6"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border-primary)',
              }}
            >
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {t.courses.courseName}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                      {t.courses.courseName} *
                    </label>
                    <input
                      type="text"
                      value={courseName}
                      onChange={(e) => setCourseName(e.target.value)}
                      onFocus={() => setFocused('courseName')}
                      onBlur={() => setFocused(null)}
                      placeholder={t.courses.courseNamePlaceholder}
                      className="w-full px-4 py-3 rounded-xl transition-all duration-300"
                      style={{
                        backgroundColor: focused === 'courseName' ? 'var(--bg-tertiary)' : 'var(--bg-primary)',
                        border: `1px solid ${focused === 'courseName' ? 'var(--border-secondary)' : 'var(--border-primary)'}`,
                        color: 'var(--text-primary)',
                        outline: 'none',
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                      {t.courses.courseCode} *
                    </label>
                    <input
                      type="text"
                      value={courseCode}
                      onChange={(e) => setCourseCode(e.target.value)}
                      onFocus={() => setFocused('courseCode')}
                      onBlur={() => setFocused(null)}
                      placeholder={t.courses.courseCodePlaceholder}
                      className="w-full px-4 py-3 rounded-xl transition-all duration-300"
                      style={{
                        backgroundColor: focused === 'courseCode' ? 'var(--bg-tertiary)' : 'var(--bg-primary)',
                        border: `1px solid ${focused === 'courseCode' ? 'var(--border-secondary)' : 'var(--border-primary)'}`,
                        color: 'var(--text-primary)',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                    {t.courses.description}
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    onFocus={() => setFocused('description')}
                    onBlur={() => setFocused(null)}
                    placeholder={t.courses.descriptionPlaceholder}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl transition-all duration-300 resize-none"
                    style={{
                      backgroundColor: focused === 'description' ? 'var(--bg-tertiary)' : 'var(--bg-primary)',
                      border: `1px solid ${focused === 'description' ? 'var(--border-secondary)' : 'var(--border-primary)'}`,
                      color: 'var(--text-primary)',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              {/* Schedule Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {t.courses.schedule} *
                  </h3>
                  <button
                    type="button"
                    onClick={addScheduleEntry}
                    className="px-4 py-2 rounded-xl font-medium transition-all duration-300 hover:scale-105 active:scale-95"
                    style={{
                      backgroundColor: 'var(--bg-tertiary)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border-primary)',
                    }}
                  >
                    {t.courses.addSchedule}
                  </button>
                </div>
                {schedule.map((entry, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                        {t.courses.selectDays}
                      </label>
                      <select
                        value={entry.day}
                        onChange={(e) => updateScheduleEntry(index, 'day', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl transition-all duration-300"
                        style={{
                          backgroundColor: 'var(--bg-primary)',
                          border: '1px solid var(--border-primary)',
                          color: 'var(--text-primary)',
                          outline: 'none',
                        }}
                      >
                        {dayOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                        {t.courses.startTime}
                      </label>
                      <input
                        type="time"
                        value={entry.startTime}
                        onChange={(e) => updateScheduleEntry(index, 'startTime', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl transition-all duration-300"
                        style={{
                          backgroundColor: 'var(--bg-primary)',
                          border: '1px solid var(--border-primary)',
                          color: 'var(--text-primary)',
                          outline: 'none',
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                        {t.courses.endTime}
                      </label>
                      <input
                        type="time"
                        value={entry.endTime}
                        onChange={(e) => updateScheduleEntry(index, 'endTime', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl transition-all duration-300"
                        style={{
                          backgroundColor: 'var(--bg-primary)',
                          border: '1px solid var(--border-primary)',
                          color: 'var(--text-primary)',
                          outline: 'none',
                        }}
                      />
                    </div>
                    <div>
                      <button
                        type="button"
                        onClick={() => removeScheduleEntry(index)}
                        className="w-full px-4 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 active:scale-95 text-red-400"
                        style={{
                          backgroundColor: 'rgba(239, 68, 68, 0.1)',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                        }}
                      >
                        {t.courses.removeSchedule}
                      </button>
                    </div>
                  </div>
                ))}
                {schedule.length === 0 && (
                  <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                    {t.courses.scheduleRequired}
                  </p>
                )}
              </div>

              {/* Additional Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                    {t.courses.weeklyHours} *
                  </label>
                  <input
                    type="number"
                    value={weeklyHours}
                    onChange={(e) => setWeeklyHours(e.target.value)}
                    onFocus={() => setFocused('weeklyHours')}
                    onBlur={() => setFocused(null)}
                    min="1"
                    className="w-full px-4 py-3 rounded-xl transition-all duration-300"
                    style={{
                      backgroundColor: focused === 'weeklyHours' ? 'var(--bg-tertiary)' : 'var(--bg-primary)',
                      border: `1px solid ${focused === 'weeklyHours' ? 'var(--border-secondary)' : 'var(--border-primary)'}`,
                      color: 'var(--text-primary)',
                      outline: 'none',
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                    {t.courses.room}
                  </label>
                  <input
                    type="text"
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    onFocus={() => setFocused('room')}
                    onBlur={() => setFocused(null)}
                    placeholder={t.courses.roomPlaceholder}
                    className="w-full px-4 py-3 rounded-xl transition-all duration-300"
                    style={{
                      backgroundColor: focused === 'room' ? 'var(--bg-tertiary)' : 'var(--bg-primary)',
                      border: `1px solid ${focused === 'room' ? 'var(--border-secondary)' : 'var(--border-primary)'}`,
                      color: 'var(--text-primary)',
                      outline: 'none',
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                    {t.courses.semester}
                  </label>
                  <select
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl transition-all duration-300"
                    style={{
                      backgroundColor: 'var(--bg-primary)',
                      border: '1px solid var(--border-primary)',
                      color: 'var(--text-primary)',
                      outline: 'none',
                    }}
                  >
                    <option value="">-</option>
                    <option value="Fall">{t.courses.fall}</option>
                    <option value="Spring">{t.courses.spring}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                    {t.courses.year}
                  </label>
                  <input
                    type="text"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    onFocus={() => setFocused('year')}
                    onBlur={() => setFocused(null)}
                    placeholder="2024"
                    className="w-full px-4 py-3 rounded-xl transition-all duration-300"
                    style={{
                      backgroundColor: focused === 'year' ? 'var(--bg-tertiary)' : 'var(--bg-primary)',
                      border: `1px solid ${focused === 'year' ? 'var(--border-secondary)' : 'var(--border-primary)'}`,
                      color: 'var(--text-primary)',
                      outline: 'none',
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                    {t.courses.category}
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl transition-all duration-300"
                    style={{
                      backgroundColor: 'var(--bg-primary)',
                      border: '1px solid var(--border-primary)',
                      color: 'var(--text-primary)',
                      outline: 'none',
                    }}
                  >
                    <option value="">-</option>
                    <option value="Theoretical">{t.courses.theoretical}</option>
                    <option value="Applied">{t.courses.applied}</option>
                    <option value="Lab">{t.courses.lab}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                    {t.courses.instructor}
                  </label>
                  <input
                    type="text"
                    value={instructor}
                    onChange={(e) => setInstructor(e.target.value)}
                    onFocus={() => setFocused('instructor')}
                    onBlur={() => setFocused(null)}
                    placeholder={t.courses.instructorPlaceholder}
                    className="w-full px-4 py-3 rounded-xl transition-all duration-300"
                    style={{
                      backgroundColor: focused === 'instructor' ? 'var(--bg-tertiary)' : 'var(--bg-primary)',
                      border: `1px solid ${focused === 'instructor' ? 'var(--border-secondary)' : 'var(--border-primary)'}`,
                      color: 'var(--text-primary)',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              {/* Enrolled Students */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {t.courses.enrolledStudents}
                </h3>
                <div className="relative" ref={studentDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setStudentDropdownOpen(!studentDropdownOpen)}
                    className="w-full px-4 py-3 rounded-xl transition-all duration-300 text-left flex items-center justify-between"
                    style={{
                      backgroundColor: studentDropdownOpen ? 'var(--bg-tertiary)' : 'var(--bg-primary)',
                      border: `1px solid ${studentDropdownOpen ? 'var(--border-secondary)' : 'var(--border-primary)'}`,
                      color: 'var(--text-primary)',
                    }}
                  >
                    <span>
                      {selectedStudents.length === 0
                        ? t.courses.selectStudents
                        : `${selectedStudents.length} ${selectedStudents.length === 1 ? 'student' : 'students'} selected`}
                    </span>
                    <svg
                      className={`w-5 h-5 transition-transform duration-300 ${studentDropdownOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {studentDropdownOpen && (
                    <div
                      className="absolute z-50 w-full mt-2 rounded-xl border max-h-64 overflow-y-auto"
                      style={{
                        backgroundColor: '#1e1e2d',
                        borderColor: '#2A2A3B',
                        backdropFilter: 'none',
                        opacity: 1,
                      }}
                    >
                      <div className="p-2 border-b" style={{ borderColor: '#2A2A3B', opacity: 1 }}>
                        <input
                          type="text"
                          value={studentSearch}
                          onChange={(e) => setStudentSearch(e.target.value)}
                          placeholder="Search students..."
                          className="w-full px-3 py-2 rounded-lg"
                          style={{
                            backgroundColor: '#2A2A3B',
                            border: '1px solid #2A2A3B',
                            color: '#E4E4E7',
                            outline: 'none',
                            opacity: 1,
                          }}
                        />
                      </div>
                      <div className="p-2 space-y-1">
                        {filteredStudents.map((student) => (
                          <label
                            key={student.id}
                            className="flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors"
                            style={{ backgroundColor: '#1e1e2d', opacity: 1 }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#2A2A3B';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = '#1e1e2d';
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={selectedStudents.includes(student.id)}
                              onChange={() => toggleStudent(student.id)}
                              className="w-4 h-4 rounded"
                              style={{
                                accentColor: '#0046FF',
                              }}
                            />
                            <span style={{ color: '#E4E4E7', opacity: 1 }}>
                              {student.firstName} {student.lastName} ({student.studentNumber})
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                {/* Selected Students Chips */}
                {selectedStudents.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {getSelectedStudentObjects().map((student) => (
                      <div
                        key={student.id}
                        className="px-3 py-1 rounded-full flex items-center gap-2"
                        style={{
                          backgroundColor: 'var(--bg-tertiary)',
                          border: '1px solid var(--border-primary)',
                        }}
                      >
                        <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                          {student.firstName} {student.lastName}
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleStudent(student.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 active:scale-95 bg-gradient-to-r from-[#0046FF] to-[#001BB7] text-white shadow-lg shadow-[#0046FF]/30"
                >
                  {t.courses.save}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setActiveTab('list');
                    setEditModal({ open: false });
                  }}
                  className="px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 active:scale-95"
                  style={{
                    backgroundColor: 'var(--bg-tertiary)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-primary)',
                  }}
                >
                  {t.courses.cancel}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Delete Confirmation Modal */}
        {deleteModal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div
              className="p-6 rounded-2xl backdrop-blur-xl border max-w-md w-full"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border-primary)',
              }}
            >
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                {t.courses.deleteCourse}
              </h3>
              <p className="mb-6" style={{ color: 'var(--text-tertiary)' }}>
                {t.courses.deleteConfirm}
              </p>
              <div className="flex gap-4">
                <button
                  onClick={handleDeleteCourse}
                  className="px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 active:scale-95 text-white bg-red-500 hover:bg-red-600"
                >
                  {t.courses.delete}
                </button>
                <button
                  onClick={() => setDeleteModal({ open: false })}
                  className="px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 active:scale-95"
                  style={{
                    backgroundColor: 'var(--bg-tertiary)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-primary)',
                  }}
                >
                  {t.courses.cancel}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Courses;

