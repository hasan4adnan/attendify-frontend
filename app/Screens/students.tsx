'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import AnimatedText from '../components/AnimatedText';
import ActionMenu, { ActionMenuItem } from '../components/ActionMenu';
import { getCourses, Course } from '../utils/courseData';

type VerificationStatus = 'verified' | 'pending' | 'notVerified';
type AttendanceStatus = 'present' | 'absent';

type AttendanceRecord = {
  id: string;
  date: string; // YYYY-MM-DD
  courseId: number;
  courseName: string;
  courseCode: string;
  status: AttendanceStatus;
};

type Student = {
  id: number;
  firstName: string;
  lastName: string;
  studentNumber: string;
  email: string;
  verificationStatus: VerificationStatus;
  courseIds: number[]; // Array of course IDs
  attendance: AttendanceRecord[]; // Attendance history
};

const initialStudents: Student[] = [
  { 
    id: 1, 
    firstName: 'Ahmet', 
    lastName: 'Yılmaz', 
    studentNumber: '1001', 
    email: 'ahmet.yilmaz@example.com', 
    verificationStatus: 'verified',
    courseIds: [1],
    attendance: [
      { id: '1', date: '2024-01-15', courseId: 1, courseName: 'Introduction to Computer Science', courseCode: 'CS101', status: 'present' },
      { id: '2', date: '2024-01-17', courseId: 1, courseName: 'Introduction to Computer Science', courseCode: 'CS101', status: 'absent' },
    ],
  },
  { 
    id: 2, 
    firstName: 'Ayşe', 
    lastName: 'Demir', 
    studentNumber: '1002', 
    email: 'ayse.demir@example.com', 
    verificationStatus: 'pending',
    courseIds: [1],
    attendance: [
      { id: '3', date: '2024-01-15', courseId: 1, courseName: 'Introduction to Computer Science', courseCode: 'CS101', status: 'present' },
      { id: '4', date: '2024-01-17', courseId: 1, courseName: 'Introduction to Computer Science', courseCode: 'CS101', status: 'present' },
    ],
  },
  { 
    id: 3, 
    firstName: 'Mehmet', 
    lastName: 'Kaya', 
    studentNumber: '1003', 
    email: 'mehmet.kaya@example.com', 
    verificationStatus: 'notVerified',
    courseIds: [],
    attendance: [],
  },
];

const Students = () => {
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [courses, setCourses] = useState<Course[]>(getCourses());
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [studentNumber, setStudentNumber] = useState('');
  const [email, setEmail] = useState('');
  const [selectedCourseIds, setSelectedCourseIds] = useState<number[]>([]);
  const [focused, setFocused] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'add' | 'list'>('list');
  const [search, setSearch] = useState('');
  const [editModal, setEditModal] = useState<{ open: boolean, student?: Student }>({ open: false });
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editStudentNumber, setEditStudentNumber] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editCourseIds, setEditCourseIds] = useState<number[]>([]);
  const [notification, setNotification] = useState<{ show: boolean, message: string }>({ show: false, message: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [searchFocused, setSearchFocused] = useState(false);
  const [faceScanModal, setFaceScanModal] = useState<{ open: boolean, student?: Student }>({ open: false });
  const [scanning, setScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [attendanceModal, setAttendanceModal] = useState<{ open: boolean, student?: Student }>({ open: false });
  const [courseDropdownOpen, setCourseDropdownOpen] = useState(false);
  const [editCourseDropdownOpen, setEditCourseDropdownOpen] = useState(false);
  const [courseSearch, setCourseSearch] = useState('');
  const [editCourseSearch, setEditCourseSearch] = useState('');
  const [attendanceOverrideModal, setAttendanceOverrideModal] = useState<{ open: boolean, record?: AttendanceRecord, student?: Student }>({ open: false });
  const buttonRefs = useRef<{ [key: number]: HTMLButtonElement | null }>({});
  const courseDropdownRef = useRef<HTMLDivElement>(null);
  const editCourseDropdownRef = useRef<HTMLDivElement>(null);
  const studentsPerPage = 10;
  const { t } = useLanguage();

  // Sync courses from localStorage
  useEffect(() => {
    const interval = setInterval(() => {
      const updatedCourses = getCourses();
      setCourses(updatedCourses);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // NEW STATE: Delete modal
  const [deleteModal, setDeleteModal] = useState<{ open: boolean, student?: Student }>({
    open: false,
  });

  // NEW STATE: Detail modal
  const [detailModal, setDetailModal] = useState<{ open: boolean, student?: Student }>({
    open: false,
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (courseDropdownOpen && courseDropdownRef.current && !courseDropdownRef.current.contains(event.target as Node)) {
        setCourseDropdownOpen(false);
      }
      if (editCourseDropdownOpen && editCourseDropdownRef.current && !editCourseDropdownRef.current.contains(event.target as Node)) {
        setEditCourseDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [courseDropdownOpen, editCourseDropdownOpen]);

  // Get status badge styling
  const getStatusBadge = (status: VerificationStatus) => {
    switch (status) {
      case 'verified':
        return {
          bg: 'rgba(34, 197, 94, 0.15)',
          color: '#22c55e',
          border: 'rgba(34, 197, 94, 0.3)',
          text: t.students.verified
        };
      case 'pending':
        return {
          bg: 'rgba(255, 128, 64, 0.15)',
          color: '#FF8040',
          border: 'rgba(255, 128, 64, 0.3)',
          text: t.students.pending
        };
      case 'notVerified':
        return {
          bg: 'rgba(239, 68, 68, 0.15)',
          color: '#ef4444',
          border: 'rgba(239, 68, 68, 0.3)',
          text: t.students.notVerified
        };
    }
  };

  // Helper: Get today's day name
  const getTodayDay = (): 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun' => {
    const days: ('Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun')[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[new Date().getDay()];
  };

  // Helper: Get today's date string (YYYY-MM-DD)
  const getTodayDate = (): string => {
    return new Date().toISOString().split('T')[0];
  };

  // Helper: Get courses for a student
  const getStudentCourses = (student: Student): Course[] => {
    return courses.filter(c => student.courseIds.includes(c.id));
  };

  // Helper: Get today's classes for a student
  const getTodayClasses = (student: Student): Course[] => {
    const today = getTodayDay();
    return getStudentCourses(student).filter(c => 
      c.schedule.some(s => s.day === today)
    );
  };

  // Helper: Get today's attendance status
  const getTodayAttendanceStatus = (student: Student): { status: 'present' | 'absent' | 'noClass' | 'partial', count: number, total: number } => {
    const todayClasses = getTodayClasses(student);
    if (todayClasses.length === 0) {
      return { status: 'noClass', count: 0, total: 0 };
    }

    const today = getTodayDate();
    const todayRecords = student.attendance.filter(a => a.date === today);
    const presentCount = todayRecords.filter(a => a.status === 'present').length;
    const totalCount = todayClasses.length;

    if (presentCount === 0) {
      return { status: 'absent', count: 0, total: totalCount };
    } else if (presentCount === totalCount) {
      return { status: 'present', count: presentCount, total: totalCount };
    } else {
      return { status: 'partial', count: presentCount, total: totalCount };
    }
  };

  // Toggle course selection
  const toggleCourse = (courseId: number, isEdit: boolean = false) => {
    if (isEdit) {
      setEditCourseIds(prev => 
        prev.includes(courseId) 
          ? prev.filter(id => id !== courseId)
          : [...prev, courseId]
      );
    } else {
      setSelectedCourseIds(prev => 
        prev.includes(courseId) 
          ? prev.filter(id => id !== courseId)
          : [...prev, courseId]
      );
    }
  };

  // Filter courses for dropdown
  const getFilteredCourses = (searchTerm: string): Course[] => {
    return courses.filter(c =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.code.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Add Student
  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !studentNumber || !email) return;

    setStudents([
      ...students,
      {
        id: students.length > 0 ? Math.max(...students.map(s => s.id)) + 1 : 1,
        firstName,
        lastName,
        studentNumber,
        email,
        verificationStatus: 'notVerified',
        courseIds: selectedCourseIds,
        attendance: [],
      },
    ]);

    setFirstName('');
    setLastName('');
    setStudentNumber('');
    setEmail('');
    setSelectedCourseIds([]);

    setNotification({ show: true, message: t.students.studentAdded });
    setTimeout(() => setNotification({ show: false, message: '' }), 2000);
  };

  // Open Edit Modal
  const openEditModal = (student: Student) => {
    setEditFirstName(student.firstName);
    setEditLastName(student.lastName);
    setEditStudentNumber(student.studentNumber);
    setEditEmail(student.email);
    setEditCourseIds([...student.courseIds]);
    setEditModal({ open: true, student });
    setOpenMenuId(null);
  };

  // Save Edit
  const handleEditSave = () => {
    if (!editModal.student) return;

    setStudents(students.map(s =>
      s.id === editModal.student!.id
        ? { ...s, firstName: editFirstName, lastName: editLastName, studentNumber: editStudentNumber, email: editEmail, courseIds: editCourseIds }
        : s
    ));

    setEditModal({ open: false });

    setNotification({ show: true, message: t.students.studentUpdated });
    setTimeout(() => setNotification({ show: false, message: '' }), 2000);
  };

  // Handle attendance toggle for today
  const handleTodayAttendanceToggle = (student: Student, markAsPresent: boolean) => {
    const today = getTodayDate();
    const todayClasses = getTodayClasses(student);
    
    if (todayClasses.length === 0) return;

    const newRecords: AttendanceRecord[] = todayClasses.map(course => {
      const existingRecord = student.attendance.find(
        a => a.date === today && a.courseId === course.id
      );
      
      if (existingRecord) {
        return { ...existingRecord, status: markAsPresent ? 'present' : 'absent' };
      } else {
        return {
          id: `${student.id}-${course.id}-${today}`,
          date: today,
          courseId: course.id,
          courseName: course.name,
          courseCode: course.code,
          status: markAsPresent ? 'present' : 'absent',
        };
      }
    });

    // Merge with existing attendance records
    const updatedAttendance = [
      ...student.attendance.filter(a => !(a.date === today && todayClasses.some(c => c.id === a.courseId))),
      ...newRecords,
    ];

    const updatedStudents = students.map(s =>
      s.id === student.id
        ? { ...s, attendance: updatedAttendance }
        : s
    );

    setStudents(updatedStudents);

    // Update the attendance modal if it's open for this student
    if (attendanceModal.open && attendanceModal.student?.id === student.id) {
      const updatedStudent = updatedStudents.find(s => s.id === student.id);
      if (updatedStudent) {
        setAttendanceModal({ open: true, student: updatedStudent });
      }
    }

    setNotification({ show: true, message: t.students.attendanceUpdated });
    setTimeout(() => setNotification({ show: false, message: '' }), 2000);
  };

  // Handle attendance override
  const handleAttendanceOverride = (student: Student, record: AttendanceRecord, newStatus: AttendanceStatus) => {
    setAttendanceOverrideModal({ open: true, record, student });
    // Will be confirmed in modal
  };

  // Confirm attendance override
  const confirmAttendanceOverride = () => {
    if (!attendanceOverrideModal.record || !attendanceOverrideModal.student) return;

    const student = attendanceOverrideModal.student;
    const record = attendanceOverrideModal.record;
    const newStatus = record.status === 'present' ? 'absent' : 'present';

    const updatedStudents = students.map(s =>
      s.id === student.id
        ? {
            ...s,
            attendance: s.attendance.map(a =>
              a.id === record.id ? { ...a, status: newStatus } : a
            ),
          }
        : s
    );

    setStudents(updatedStudents);
    
    // Update the attendance modal if it's open for this student
    if (attendanceModal.open && attendanceModal.student?.id === student.id) {
      const updatedStudent = updatedStudents.find(s => s.id === student.id);
      if (updatedStudent) {
        setAttendanceModal({ open: true, student: updatedStudent });
      }
    }

    setAttendanceOverrideModal({ open: false });
    setNotification({ show: true, message: t.students.attendanceUpdated });
    setTimeout(() => setNotification({ show: false, message: '' }), 2000);
  };

  // Handle Manual Face Scan
  const handleManualFaceScan = (student: Student) => {
    setFaceScanModal({ open: true, student });
    setScanning(false);
    setScanComplete(false);
    setOpenMenuId(null);
  };

  // Start Face Scan
  const startFaceScan = () => {
    setScanning(true);
    setScanComplete(false);
    
    // Simulate face scan process
    setTimeout(() => {
      setScanning(false);
      setScanComplete(true);
      
      // Update student status to verified
      if (faceScanModal.student) {
        setStudents(students.map(s =>
          s.id === faceScanModal.student!.id
            ? { ...s, verificationStatus: 'verified' }
            : s
        ));
      }
      
      setNotification({ show: true, message: t.students.scanSuccess });
      setTimeout(() => {
        setNotification({ show: false, message: '' });
        setFaceScanModal({ open: false });
      }, 2000);
    }, 3000);
  };

  // Handle Send Verification Email
  const handleSendVerificationEmail = (student: Student) => {
    // Simulate email sending to student.email
    console.log(`Sending verification email to: ${student.email}`);
    setNotification({ show: true, message: t.students.emailSent });
    setTimeout(() => setNotification({ show: false, message: '' }), 2000);
    setOpenMenuId(null);
    
    // Update status to pending if not verified
    if (student.verificationStatus === 'notVerified') {
      setStudents(students.map(s =>
        s.id === student.id
          ? { ...s, verificationStatus: 'pending' }
          : s
      ));
    }
  };

  // Handle Resend Verification Email
  const handleResendVerificationEmail = (student: Student) => {
    // Simulate email resending to student.email
    console.log(`Resending verification email to: ${student.email}`);
    setNotification({ show: true, message: t.students.emailResent });
    setTimeout(() => setNotification({ show: false, message: '' }), 2000);
    setOpenMenuId(null);
  };

  // Search + Pagination
  const filteredStudents = students.filter(s =>
    s.firstName.toLowerCase().includes(search.toLowerCase()) ||
    s.lastName.toLowerCase().includes(search.toLowerCase()) ||
    s.studentNumber.includes(search) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);
  const paginatedStudents = filteredStudents.slice((currentPage - 1) * studentsPerPage, currentPage * studentsPerPage);

  return (
    <div className="p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-6 lg:space-y-8">
        {/* Page Title */}
        <div className="space-y-2">
          <h2 
            className="text-3xl lg:text-4xl font-bold"
            style={{ color: 'var(--text-primary)' }}
          >
            <AnimatedText speed={35}>
              {t.students.title}
            </AnimatedText>
          </h2>
          <p 
            className="text-lg"
            style={{ color: 'var(--text-tertiary)' }}
          >
            <AnimatedText speed={40}>
              {t.students.subtitle}
            </AnimatedText>
          </p>
          <div className="h-1 w-20 bg-gradient-to-r from-[#0046FF] to-[#FF8040] rounded-full" />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b" style={{ borderColor: 'var(--border-primary)' }}>
            <button
            className={`px-6 py-3 text-base font-semibold border-b-2 transition-all duration-300 relative ${
              activeTab === 'list' 
                ? 'border-[#0046FF] text-[#0046FF]' 
                : 'border-transparent text-[var(--text-secondary)] hover:text-[#0046FF]'
            }`}
              onClick={() => setActiveTab('list')}
            >
            <AnimatedText speed={40}>
              {t.students.studentList}
            </AnimatedText>
            </button>
            <button
            className={`px-6 py-3 text-base font-semibold border-b-2 transition-all duration-300 relative ${
              activeTab === 'add' 
                ? 'border-[#0046FF] text-[#0046FF]' 
                : 'border-transparent text-[var(--text-secondary)] hover:text-[#0046FF]'
            }`}
              onClick={() => setActiveTab('add')}
            >
            <AnimatedText speed={40}>
              {t.students.addStudent}
            </AnimatedText>
            </button>
      </div>

        {/* ADD TAB */}
        {activeTab === 'add' && (
          <div 
            className="backdrop-blur-2xl rounded-3xl border shadow-2xl p-8 lg:p-10 transition-all duration-300"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderColor: 'var(--border-primary)'
            }}
          >
            <form onSubmit={handleAddStudent} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                  <label 
                    className="block text-sm font-medium"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <AnimatedText speed={50}>
                      {t.students.firstName}
                    </AnimatedText>
                </label>
                  <div className="relative">
                <input
                  type="text"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  onFocus={() => setFocused('firstName')}
                  onBlur={() => setFocused(null)}
                  required
                      className="w-full px-4 py-3.5 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#0046FF]/50"
                  style={{
                    backgroundColor: 'var(--bg-tertiary)',
                    borderColor: focused === 'firstName' ? '#0046FF' : 'var(--border-primary)',
                    color: 'var(--text-primary)'
                  }}
                      placeholder={t.students.firstNamePlaceholder}
                    />
                    {focused === 'firstName' && (
                      <div 
                        className="absolute inset-0 rounded-xl pointer-events-none -z-10 blur-xl transition-opacity duration-300"
                        style={{
                          background: 'linear-gradient(to right, rgba(0, 70, 255, 0.2), rgba(0, 27, 183, 0.2))'
                        }}
                      />
                    )}
                  </div>
              </div>

              <div className="space-y-2">
                  <label 
                    className="block text-sm font-medium"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <AnimatedText speed={50}>
                      {t.students.lastName}
                    </AnimatedText>
                </label>
                  <div className="relative">
                <input
                  type="text"
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  onFocus={() => setFocused('lastName')}
                  onBlur={() => setFocused(null)}
                  required
                      className="w-full px-4 py-3.5 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#0046FF]/50"
                  style={{
                    backgroundColor: 'var(--bg-tertiary)',
                    borderColor: focused === 'lastName' ? '#0046FF' : 'var(--border-primary)',
                    color: 'var(--text-primary)'
                  }}
                      placeholder={t.students.lastNamePlaceholder}
                    />
                    {focused === 'lastName' && (
                      <div 
                        className="absolute inset-0 rounded-xl pointer-events-none -z-10 blur-xl transition-opacity duration-300"
                        style={{
                          background: 'linear-gradient(to right, rgba(0, 70, 255, 0.2), rgba(0, 27, 183, 0.2))'
                        }}
                      />
                    )}
                  </div>
              </div>

              <div className="space-y-2">
                  <label 
                    className="block text-sm font-medium"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <AnimatedText speed={50}>
                      {t.students.studentNumber}
                    </AnimatedText>
                </label>
                  <div className="relative">
                <input
                  type="text"
                  value={studentNumber}
                  onChange={e => setStudentNumber(e.target.value)}
                  onFocus={() => setFocused('studentNumber')}
                  onBlur={() => setFocused(null)}
                  required
                      className="w-full px-4 py-3.5 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#0046FF]/50"
                  style={{
                    backgroundColor: 'var(--bg-tertiary)',
                    borderColor: focused === 'studentNumber' ? '#0046FF' : 'var(--border-primary)',
                    color: 'var(--text-primary)'
                  }}
                      placeholder={t.students.studentNumberPlaceholder}
                    />
                    {focused === 'studentNumber' && (
                      <div 
                        className="absolute inset-0 rounded-xl pointer-events-none -z-10 blur-xl transition-opacity duration-300"
                        style={{
                          background: 'linear-gradient(to right, rgba(0, 70, 255, 0.2), rgba(0, 27, 183, 0.2))'
                        }}
                      />
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label 
                    className="block text-sm font-medium"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <AnimatedText speed={50}>
                      {t.students.email}
                    </AnimatedText>
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      onFocus={() => setFocused('email')}
                      onBlur={() => setFocused(null)}
                      required
                      className="w-full px-4 py-3.5 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#0046FF]/50"
                      style={{
                        backgroundColor: 'var(--bg-tertiary)',
                        borderColor: focused === 'email' ? '#0046FF' : 'var(--border-primary)',
                        color: 'var(--text-primary)'
                      }}
                      placeholder={t.students.emailPlaceholder}
                    />
                    {focused === 'email' && (
                      <div 
                        className="absolute inset-0 rounded-xl pointer-events-none -z-10 blur-xl transition-opacity duration-300"
                        style={{
                          background: 'linear-gradient(to right, rgba(0, 70, 255, 0.2), rgba(0, 27, 183, 0.2))'
                        }}
                      />
                    )}
                  </div>
              </div>
            </div>

            {/* Course Selection */}
            <div className="space-y-2">
              <label 
                className="block text-sm font-medium"
                style={{ color: 'var(--text-secondary)' }}
              >
                <AnimatedText speed={50}>
                  {t.students.courses}
                </AnimatedText>
              </label>
              <div className="relative" ref={courseDropdownRef}>
                <button
                  type="button"
                  onClick={() => setCourseDropdownOpen(!courseDropdownOpen)}
                  className="w-full px-4 py-3.5 rounded-xl border transition-all duration-300 text-left flex items-center justify-between"
                  style={{
                    backgroundColor: courseDropdownOpen ? 'var(--bg-tertiary)' : 'var(--bg-tertiary)',
                    borderColor: courseDropdownOpen ? '#0046FF' : 'var(--border-primary)',
                    color: 'var(--text-primary)',
                  }}
                >
                  <span>
                    {selectedCourseIds.length === 0
                      ? t.students.selectCourses
                      : `${selectedCourseIds.length} ${selectedCourseIds.length === 1 ? 'course' : 'courses'} selected`}
                  </span>
                  <svg
                    className={`w-5 h-5 transition-transform duration-300 ${courseDropdownOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {courseDropdownOpen && (
                  <div
                    className="absolute z-50 w-full mt-2 rounded-xl backdrop-blur-xl border max-h-64 overflow-y-auto"
                    style={{
                      backgroundColor: 'var(--bg-secondary)',
                      borderColor: 'var(--border-primary)',
                    }}
                  >
                    <div className="p-2 border-b" style={{ borderColor: 'var(--border-primary)' }}>
                      <input
                        type="text"
                        value={courseSearch}
                        onChange={(e) => setCourseSearch(e.target.value)}
                        placeholder="Search courses..."
                        className="w-full px-3 py-2 rounded-lg"
                        style={{
                          backgroundColor: 'var(--bg-primary)',
                          border: '1px solid var(--border-primary)',
                          color: 'var(--text-primary)',
                          outline: 'none',
                        }}
                      />
                    </div>
                    <div className="p-2 space-y-1">
                      {getFilteredCourses(courseSearch).map((course) => (
                        <label
                          key={course.id}
                          className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-opacity-50 transition-colors"
                          style={{ backgroundColor: 'var(--bg-tertiary)' }}
                        >
                          <input
                            type="checkbox"
                            checked={selectedCourseIds.includes(course.id)}
                            onChange={() => toggleCourse(course.id, false)}
                            className="w-4 h-4 rounded"
                            style={{
                              accentColor: '#0046FF',
                            }}
                          />
                          <span style={{ color: 'var(--text-primary)' }}>
                            {course.name} ({course.code})
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {/* Selected Courses Chips */}
              {selectedCourseIds.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {courses
                    .filter(c => selectedCourseIds.includes(c.id))
                    .map((course) => (
                      <div
                        key={course.id}
                        className="px-3 py-1 rounded-full flex items-center gap-2"
                        style={{
                          backgroundColor: 'var(--bg-tertiary)',
                          border: '1px solid var(--border-primary)',
                        }}
                      >
                        <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                          {course.code}
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleCourse(course.id, false)}
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

            <button
              type="submit"
                className="w-full py-4 px-6 bg-gradient-to-r from-[#0046FF] to-[#001BB7] text-white font-semibold rounded-xl shadow-lg shadow-[#0046FF]/25 hover:shadow-[#0046FF]/40 focus:outline-none focus:ring-2 focus:ring-[#0046FF] focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden group hover:from-[#0055FF] hover:to-[#0025CC]"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <AnimatedText speed={40}>
                    {t.students.addStudentButton}
                  </AnimatedText>
                  <svg
                    className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </span>
            </button>
          </form>
          </div>
        )}

        {/* LIST TAB */}
        {activeTab === 'list' && (
          <div 
            className="backdrop-blur-2xl rounded-3xl border shadow-2xl p-6 lg:p-8 transition-all duration-300"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderColor: 'var(--border-primary)'
            }}
          >
            {/* Search */}
            <div className="mb-6">
              <div className="relative max-w-md">
                <input
                  type="text"
                  value={search}
                  onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  placeholder={t.students.searchPlaceholder}
                  className="w-full px-4 py-3.5 pl-12 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#0046FF]/50"
                  style={{
                    backgroundColor: 'var(--bg-tertiary)',
                    borderColor: searchFocused ? '#0046FF' : 'var(--border-primary)',
                    color: 'var(--text-primary)'
                  }}
                />
                <svg 
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-300"
                  style={{ color: searchFocused ? '#0046FF' : 'var(--text-quaternary)' }}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {searchFocused && (
                  <div 
                    className="absolute inset-0 rounded-xl pointer-events-none -z-10 blur-xl transition-opacity duration-300"
                    style={{
                      background: 'linear-gradient(to right, rgba(0, 70, 255, 0.2), rgba(0, 27, 183, 0.2))'
                    }}
                  />
                )}
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-xl border" style={{ borderColor: 'var(--border-primary)' }}>
              <table className="min-w-full divide-y" style={{ borderColor: 'var(--border-primary)' }}>
                <thead>
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                      <AnimatedText speed={50}>
                        {t.students.firstName}
                      </AnimatedText>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                      <AnimatedText speed={50}>
                        {t.students.lastName}
                      </AnimatedText>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                      <AnimatedText speed={50}>
                        {t.students.studentNumber}
                      </AnimatedText>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                      <AnimatedText speed={50}>
                        {t.students.email}
                      </AnimatedText>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                      <AnimatedText speed={50}>
                        {t.students.courses}
                      </AnimatedText>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                      <AnimatedText speed={50}>
                        {t.students.attendance}
                      </AnimatedText>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                      <AnimatedText speed={50}>
                        {t.students.faceVerificationStatus}
                      </AnimatedText>
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                      <AnimatedText speed={50}>
                        {t.students.actions}
                      </AnimatedText>
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y" style={{ borderColor: 'var(--border-primary)' }}>
                  {paginatedStudents.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center" style={{ color: 'var(--text-tertiary)' }}>
                        <div className="flex flex-col items-center gap-3">
                          <svg
                            className="w-16 h-16"
                            style={{ color: 'var(--text-quaternary)' }}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                          <p className="text-base font-medium">
                            <AnimatedText speed={40}>
                              {t.students.noStudentsFound}
                            </AnimatedText>
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedStudents.map(student => {
                      const statusBadge = getStatusBadge(student.verificationStatus);
                      return (
                      <tr
                        key={student.id}
                          className="transition-colors duration-200"
                          style={{
                            backgroundColor: 'transparent'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                        >
                          <td className="px-6 py-4 whitespace-nowrap font-semibold cursor-pointer" style={{ color: 'var(--text-primary)' }} onClick={() => setDetailModal({ open: true, student })}>
                            {student.firstName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap cursor-pointer" style={{ color: 'var(--text-primary)' }} onClick={() => setDetailModal({ open: true, student })}>
                            {student.lastName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap cursor-pointer" style={{ color: 'var(--text-primary)' }} onClick={() => setDetailModal({ open: true, student })}>
                            {student.studentNumber}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap cursor-pointer" style={{ color: 'var(--text-primary)' }} onClick={() => setDetailModal({ open: true, student })}>
                            {student.email}
                          </td>
                          {/* Courses Column */}
                          <td className="px-6 py-4 cursor-pointer" onClick={() => setDetailModal({ open: true, student })}>
                            <div className="flex flex-wrap gap-1.5 items-center">
                              {(() => {
                                const studentCourses = getStudentCourses(student);
                                const displayCourses = studentCourses.slice(0, 2);
                                const remaining = studentCourses.length - 2;
                                return (
                                  <>
                                    {displayCourses.map(course => (
                                      <span
                                        key={course.id}
                                        className="px-2 py-1 rounded-md text-xs font-medium"
                                        style={{
                                          backgroundColor: 'var(--bg-tertiary)',
                                          border: '1px solid var(--border-primary)',
                                          color: 'var(--text-primary)',
                                        }}
                                        title={`${course.name} (${course.code})`}
                                      >
                                        {course.code}
                                      </span>
                                    ))}
                                    {remaining > 0 && (
                                      <span
                                        className="px-2 py-1 rounded-md text-xs font-medium"
                                        style={{
                                          backgroundColor: 'var(--bg-tertiary)',
                                          border: '1px solid var(--border-primary)',
                                          color: 'var(--text-tertiary)',
                                        }}
                                        title={studentCourses.slice(2).map(c => `${c.name} (${c.code})`).join(', ')}
                                      >
                                        +{remaining}
                                      </span>
                                    )}
                                    {studentCourses.length === 0 && (
                                      <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                                        {t.students.noCoursesSelected}
                                      </span>
                                    )}
                                  </>
                                );
                              })()}
                            </div>
                          </td>
                          {/* Attendance Column */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {(() => {
                                const attendanceStatus = getTodayAttendanceStatus(student);
                                const todayClasses = getTodayClasses(student);
                                
                                if (attendanceStatus.status === 'noClass') {
                                  return (
                                    <span
                                      className="px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5"
                                      style={{
                                        backgroundColor: 'rgba(156, 163, 175, 0.15)',
                                        color: '#9ca3af',
                                        border: '1px solid rgba(156, 163, 175, 0.3)',
                                      }}
                                    >
                                      {t.students.noClassToday}
                                    </span>
                                  );
                                }

                                const badgeStyle = attendanceStatus.status === 'present' 
                                  ? {
                                      bg: 'rgba(34, 197, 94, 0.15)',
                                      color: '#22c55e',
                                      border: 'rgba(34, 197, 94, 0.3)',
                                      text: t.students.presentToday,
                                    }
                                  : attendanceStatus.status === 'partial'
                                  ? {
                                      bg: 'rgba(255, 128, 64, 0.15)',
                                      color: '#FF8040',
                                      border: 'rgba(255, 128, 64, 0.3)',
                                      text: `${attendanceStatus.count}/${attendanceStatus.total} ${t.students.present}`,
                                    }
                                  : {
                                      bg: 'rgba(239, 68, 68, 0.15)',
                                      color: '#ef4444',
                                      border: 'rgba(239, 68, 68, 0.3)',
                                      text: t.students.absentToday,
                                    };

                                const isCurrentlyPresent = attendanceStatus.status === 'present' || attendanceStatus.status === 'partial';
                                
                                return (
                                  <>
                                    <span
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setAttendanceModal({ open: true, student });
                                      }}
                                      className="px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-all duration-200 hover:opacity-80"
                                      style={{
                                        backgroundColor: badgeStyle.bg,
                                        color: badgeStyle.color,
                                        border: `1px solid ${badgeStyle.border}`,
                                      }}
                                      title={t.students.viewFullHistory}
                                    >
                                      <div
                                        className="w-2 h-2 rounded-full"
                                        style={{ backgroundColor: badgeStyle.color }}
                                      />
                                      {badgeStyle.text}
                                    </span>
                                    {todayClasses.length > 0 && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleTodayAttendanceToggle(student, !isCurrentlyPresent);
                                        }}
                                        className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 hover:scale-105 active:scale-95 whitespace-nowrap"
                                        style={{
                                          backgroundColor: isCurrentlyPresent 
                                            ? 'rgba(239, 68, 68, 0.15)'
                                            : 'rgba(34, 197, 94, 0.15)',
                                          color: isCurrentlyPresent ? '#ef4444' : '#22c55e',
                                          border: `1px solid ${isCurrentlyPresent ? 'rgba(239, 68, 68, 0.3)' : 'rgba(34, 197, 94, 0.3)'}`,
                                        }}
                                        title={isCurrentlyPresent ? t.students.markAsAbsent : t.students.markAsPresent}
                                      >
                                        {isCurrentlyPresent ? t.students.markAsAbsent : t.students.markAsPresent}
                                      </button>
                                    )}
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setAttendanceModal({ open: true, student });
                                      }}
                                      className="p-1.5 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95"
                                      style={{
                                        backgroundColor: 'var(--bg-tertiary)',
                                        color: 'var(--text-primary)',
                                      }}
                                      title={t.students.viewFullHistory}
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                      </svg>
                                    </button>
                                  </>
                                );
                              })()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap cursor-pointer" onClick={() => setDetailModal({ open: true, student })}>
                            <span
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5"
                              style={{
                                backgroundColor: statusBadge.bg,
                                color: statusBadge.color,
                                border: `1px solid ${statusBadge.border}`
                              }}
                            >
                              <div
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: statusBadge.color }}
                              />
                              {statusBadge.text}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="relative flex justify-center">
                          <button
                                ref={el => buttonRefs.current[student.id] = el}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenMenuId(openMenuId === student.id ? null : student.id);
                                }}
                                className="p-2 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
                                style={{
                                  backgroundColor: openMenuId === student.id ? 'var(--bg-tertiary)' : 'transparent',
                                  color: 'var(--text-primary)'
                                }}
                                onMouseEnter={(e) => {
                                  if (openMenuId !== student.id) {
                                    e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (openMenuId !== student.id) {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                  }
                                }}
                              >
                                <svg
                                  className="w-5 h-5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                </svg>
                          </button>

                              {/* Action Menu */}
                              <ActionMenu
                                isOpen={openMenuId === student.id}
                                onClose={() => setOpenMenuId(null)}
                                anchorRef={buttonRefs.current[student.id]}
                                position="right"
                                items={(() => {
                                  const items: ActionMenuItem[] = [];
                                  
                                  // Manual Face Scan - Show for Pending and Not Verified
                                  if (student.verificationStatus !== 'verified') {
                                    items.push({
                                      id: 'manualFaceScan',
                                      label: t.students.manualFaceScan,
                                      icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z',
                                      onClick: () => handleManualFaceScan(student)
                                    });
                                  }
                                  
                                  // Send/Resend Email - Show for Pending and Not Verified
                                  if (student.verificationStatus === 'pending') {
                                    items.push({
                                      id: 'resendEmail',
                                      label: t.students.resendVerificationEmail,
                                      icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
                                      onClick: () => handleResendVerificationEmail(student)
                                    });
                                  }
                                  
                                  if (student.verificationStatus === 'notVerified') {
                                    items.push({
                                      id: 'sendEmail',
                                      label: t.students.sendVerificationEmail,
                                      icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
                                      onClick: () => handleSendVerificationEmail(student)
                                    });
                                  }
                                  
                                  // Edit Button - Always Available
                                  items.push({
                                    id: 'edit',
                                    label: t.students.edit,
                                    icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
                                    onClick: () => openEditModal(student)
                                  });
                                  
                                  // Delete Button - Always Available
                                  items.push({
                                    id: 'delete',
                                    label: t.students.delete,
                                    icon: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
                                    onClick: () => setDeleteModal({ open: true, student }),
                                    variant: 'danger'
                                  });
                                  
                                  return items;
                                })()}
                              />
                            </div>
                        </td>
                      </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    className={`w-10 h-10 flex items-center justify-center rounded-xl border text-base font-semibold transition-all duration-300 ${
                      currentPage === page
                        ? 'bg-gradient-to-r from-[#0046FF] to-[#001BB7] text-white border-transparent shadow-lg shadow-[#0046FF]/25 scale-110'
                        : 'bg-transparent text-[var(--text-secondary)] border-[var(--border-primary)] hover:bg-[#0046FF]/10 hover:text-[#0046FF] hover:border-[#0046FF]/30'
                      }`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* FACE SCAN MODAL */}
        {faceScanModal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div 
              className="backdrop-blur-2xl rounded-3xl border shadow-2xl p-8 w-full max-w-2xl"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border-primary)'
              }}
            >
              <h3 
                className="text-2xl font-bold mb-2 text-center"
                style={{ color: 'var(--text-primary)' }}
              >
                <AnimatedText speed={35}>
                  {t.students.faceScanTitle}
                </AnimatedText>
              </h3>
              <p 
                className="text-center mb-6 text-sm"
                style={{ color: 'var(--text-tertiary)' }}
              >
                <AnimatedText speed={40}>
                  {t.students.faceScanSubtitle}
                </AnimatedText>
              </p>

              {/* Face Scan Area */}
              <div 
                className="w-full h-64 rounded-xl border-2 border-dashed flex items-center justify-center mb-6 relative overflow-hidden"
                style={{
                  backgroundColor: 'var(--bg-tertiary)',
                  borderColor: scanning ? '#0046FF' : 'var(--border-primary)'
                }}
              >
                {!scanning && !scanComplete && (
                  <div className="text-center space-y-4">
                    <svg
                      className="w-20 h-20 mx-auto"
                      style={{ color: 'var(--text-quaternary)' }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <p style={{ color: 'var(--text-tertiary)' }}>
                      {faceScanModal.student?.firstName} {faceScanModal.student?.lastName}
                    </p>
                  </div>
                )}
                
                {scanning && (
                  <div className="text-center space-y-4">
                    <div className="w-20 h-20 mx-auto border-4 border-[#0046FF] border-t-transparent rounded-full animate-spin" />
                    <p style={{ color: 'var(--text-primary)' }} className="font-semibold">
                      <AnimatedText speed={40}>
                        {t.students.scanning}
                      </AnimatedText>
                    </p>
              </div>
            )}

                {scanComplete && (
                  <div className="text-center space-y-4">
                    <svg
                      className="w-20 h-20 mx-auto text-green-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p style={{ color: '#22c55e' }} className="font-semibold">
                      <AnimatedText speed={40}>
                        {t.students.scanComplete}
                      </AnimatedText>
                    </p>
          </div>
        )}
      </div>

              <div className="flex justify-end gap-3">
                <button
                  className="px-6 py-3 rounded-xl border font-semibold transition-all duration-300 hover:scale-105 active:scale-95"
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    borderColor: 'var(--border-primary)',
                    color: 'var(--text-secondary)'
                  }}
                  onClick={() => {
                    setFaceScanModal({ open: false });
                    setScanning(false);
                    setScanComplete(false);
                  }}
                >
                  <AnimatedText speed={40}>
                    {t.students.close}
                  </AnimatedText>
                </button>
                {!scanning && !scanComplete && (
                  <button
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#0046FF] to-[#001BB7] text-white font-semibold shadow-lg shadow-[#0046FF]/25 hover:shadow-[#0046FF]/40 transition-all duration-300 transform hover:scale-105 active:scale-95"
                    onClick={startFaceScan}
                  >
                    <AnimatedText speed={40}>
                      {t.students.startScan}
                    </AnimatedText>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

      {/* EDIT MODAL */}
      {editModal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div 
              className="backdrop-blur-2xl rounded-3xl border shadow-2xl p-8 w-full max-w-md"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border-primary)'
              }}
            >
              <h3 
                className="text-2xl font-bold mb-6 text-center"
                style={{ color: 'var(--text-primary)' }}
              >
                <AnimatedText speed={35}>
                  {t.students.editStudentTitle}
                </AnimatedText>
            </h3>

            <div className="space-y-4">
                <div className="space-y-2">
                  <label 
                    className="block text-sm font-medium"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <AnimatedText speed={50}>
                      {t.students.firstName}
                    </AnimatedText>
                  </label>
                <input
                  type="text"
                  value={editFirstName}
                  onChange={e => setEditFirstName(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#0046FF]/50"
                    style={{
                      backgroundColor: 'var(--bg-tertiary)',
                      borderColor: 'var(--border-primary)',
                      color: 'var(--text-primary)'
                    }}
                />
              </div>

                <div className="space-y-2">
                  <label 
                    className="block text-sm font-medium"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <AnimatedText speed={50}>
                      {t.students.lastName}
                    </AnimatedText>
                  </label>
                <input
                  type="text"
                  value={editLastName}
                  onChange={e => setEditLastName(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#0046FF]/50"
                    style={{
                      backgroundColor: 'var(--bg-tertiary)',
                      borderColor: 'var(--border-primary)',
                      color: 'var(--text-primary)'
                    }}
                />
              </div>

                <div className="space-y-2">
                  <label 
                    className="block text-sm font-medium"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <AnimatedText speed={50}>
                      {t.students.studentNumber}
                    </AnimatedText>
                  </label>
                <input
                  type="text"
                  value={editStudentNumber}
                  onChange={e => setEditStudentNumber(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#0046FF]/50"
                    style={{
                      backgroundColor: 'var(--bg-tertiary)',
                      borderColor: 'var(--border-primary)',
                      color: 'var(--text-primary)'
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <label 
                    className="block text-sm font-medium"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <AnimatedText speed={50}>
                      {t.students.email}
                    </AnimatedText>
                  </label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={e => setEditEmail(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#0046FF]/50"
                    style={{
                      backgroundColor: 'var(--bg-tertiary)',
                      borderColor: 'var(--border-primary)',
                      color: 'var(--text-primary)'
                    }}
                />
              </div>

              {/* Course Selection in Edit Modal */}
              <div className="space-y-2">
                <label 
                  className="block text-sm font-medium"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <AnimatedText speed={50}>
                    {t.students.courses}
                  </AnimatedText>
                </label>
                <div className="relative" ref={editCourseDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setEditCourseDropdownOpen(!editCourseDropdownOpen)}
                    className="w-full px-4 py-3.5 rounded-xl border transition-all duration-300 text-left flex items-center justify-between"
                    style={{
                      backgroundColor: editCourseDropdownOpen ? 'var(--bg-tertiary)' : 'var(--bg-tertiary)',
                      borderColor: editCourseDropdownOpen ? '#0046FF' : 'var(--border-primary)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    <span>
                      {editCourseIds.length === 0
                        ? t.students.selectCourses
                        : `${editCourseIds.length} ${editCourseIds.length === 1 ? 'course' : 'courses'} selected`}
                    </span>
                    <svg
                      className={`w-5 h-5 transition-transform duration-300 ${editCourseDropdownOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {editCourseDropdownOpen && (
                    <div
                      className="absolute z-50 w-full mt-2 rounded-xl backdrop-blur-xl border max-h-64 overflow-y-auto"
                      style={{
                        backgroundColor: 'var(--bg-secondary)',
                        borderColor: 'var(--border-primary)',
                      }}
                    >
                      <div className="p-2 border-b" style={{ borderColor: 'var(--border-primary)' }}>
                        <input
                          type="text"
                          value={editCourseSearch}
                          onChange={(e) => setEditCourseSearch(e.target.value)}
                          placeholder="Search courses..."
                          className="w-full px-3 py-2 rounded-lg"
                          style={{
                            backgroundColor: 'var(--bg-primary)',
                            border: '1px solid var(--border-primary)',
                            color: 'var(--text-primary)',
                            outline: 'none',
                          }}
                        />
                      </div>
                      <div className="p-2 space-y-1">
                        {getFilteredCourses(editCourseSearch).map((course) => (
                          <label
                            key={course.id}
                            className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-opacity-50 transition-colors"
                            style={{ backgroundColor: 'var(--bg-tertiary)' }}
                          >
                            <input
                              type="checkbox"
                              checked={editCourseIds.includes(course.id)}
                              onChange={() => toggleCourse(course.id, true)}
                              className="w-4 h-4 rounded"
                              style={{
                                accentColor: '#0046FF',
                              }}
                            />
                            <span style={{ color: 'var(--text-primary)' }}>
                              {course.name} ({course.code})
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                {/* Selected Courses Chips */}
                {editCourseIds.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {courses
                      .filter(c => editCourseIds.includes(c.id))
                      .map((course) => (
                        <div
                          key={course.id}
                          className="px-3 py-1 rounded-full flex items-center gap-2"
                          style={{
                            backgroundColor: 'var(--bg-tertiary)',
                            border: '1px solid var(--border-primary)',
                          }}
                        >
                          <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                            {course.code}
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleCourse(course.id, true)}
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
            </div>

              <div className="flex justify-end gap-3 mt-8">
              <button
                  className="px-6 py-3 rounded-xl border font-semibold transition-all duration-300 hover:scale-105 active:scale-95"
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    borderColor: 'var(--border-primary)',
                    color: 'var(--text-secondary)'
                  }}
                onClick={() => setEditModal({ open: false })}
              >
                  <AnimatedText speed={40}>
                    {t.students.cancel}
                  </AnimatedText>
              </button>
              <button
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#0046FF] to-[#001BB7] text-white font-semibold shadow-lg shadow-[#0046FF]/25 hover:shadow-[#0046FF]/40 transition-all duration-300 transform hover:scale-105 active:scale-95"
                onClick={handleEditSave}
              >
                  <AnimatedText speed={40}>
                    {t.students.save}
                  </AnimatedText>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deleteModal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div 
              className="backdrop-blur-2xl rounded-3xl border shadow-2xl p-8 w-full max-w-md"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border-primary)'
              }}
            >
              <h3 
                className="text-2xl font-bold mb-6 text-center"
                style={{ color: 'var(--text-primary)' }}
              >
                <AnimatedText speed={35}>
                  {t.students.deleteStudentTitle}
                </AnimatedText>
            </h3>

              <p 
                className="text-center mb-8 text-lg"
                style={{ color: 'var(--text-secondary)' }}
              >
              {deleteModal.student?.firstName} {deleteModal.student?.lastName} – {deleteModal.student?.studentNumber}
            </p>

            <div className="flex justify-end gap-3">
              <button
                  className="px-6 py-3 rounded-xl border font-semibold transition-all duration-300 hover:scale-105 active:scale-95"
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    borderColor: 'var(--border-primary)',
                    color: 'var(--text-secondary)'
                  }}
                onClick={() => setDeleteModal({ open: false })}
              >
                  <AnimatedText speed={40}>
                    {t.students.no}
                  </AnimatedText>
              </button>
              <button
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95"
                onClick={() => {
                  setStudents(students.filter(s => s.id !== deleteModal.student!.id));
                  setDeleteModal({ open: false });
                    setNotification({ show: true, message: t.students.studentDeleted });
                  setTimeout(() => setNotification({ show: false, message: '' }), 2000);
                }}
              >
                  <AnimatedText speed={40}>
                    {t.students.yes}
                  </AnimatedText>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {detailModal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div 
              className="backdrop-blur-2xl rounded-3xl border shadow-2xl p-8 w-full max-w-md"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border-primary)'
              }}
            >
              <h3
                className="text-2xl font-bold mb-6 text-center"
              style={{ color: 'var(--text-primary)' }}
            >
                <AnimatedText speed={35}>
                  {t.students.studentDetails}
                </AnimatedText>
            </h3>

            <div className="space-y-4">
                <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                  <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                    <AnimatedText speed={50}>
                      {t.students.name}
                    </AnimatedText>
                  </p>
                  <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                    {detailModal.student?.firstName} {detailModal.student?.lastName}
                  </p>
                </div>
                <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                  <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                    <AnimatedText speed={50}>
                      {t.students.studentNum}
                    </AnimatedText>
                  </p>
                  <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                    {detailModal.student?.studentNumber}
                  </p>
                </div>
                <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                  <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                    <AnimatedText speed={50}>
                      {t.students.email}
                    </AnimatedText>
                  </p>
                  <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                    {detailModal.student?.email}
                  </p>
                </div>
                {detailModal.student && (
                  <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                    <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                      <AnimatedText speed={50}>
                        {t.students.faceVerificationStatus}
                      </AnimatedText>
                    </p>
                    <span
                      className="px-3 py-1.5 rounded-lg text-sm font-semibold inline-flex items-center gap-1.5"
                      style={(() => {
                        const badge = getStatusBadge(detailModal.student!.verificationStatus);
                        return {
                          backgroundColor: badge.bg,
                          color: badge.color,
                          border: `1px solid ${badge.border}`
                        };
                      })()}
                    >
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: getStatusBadge(detailModal.student!.verificationStatus).color }}
                      />
                      {getStatusBadge(detailModal.student!.verificationStatus).text}
                    </span>
                  </div>
                )}
            </div>

            <div className="flex justify-center mt-8">
              <button
                  className="px-6 py-3 rounded-xl border font-semibold transition-all duration-300 hover:scale-105 active:scale-95"
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    borderColor: 'var(--border-primary)',
                    color: 'var(--text-secondary)'
                  }}
                onClick={() => setDetailModal({ open: false })}
              >
                  <AnimatedText speed={40}>
                    {t.students.close}
                  </AnimatedText>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ATTENDANCE HISTORY MODAL */}
      {attendanceModal.open && attendanceModal.student && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div 
            className="backdrop-blur-2xl rounded-3xl border shadow-2xl p-8 w-full max-w-3xl max-h-[80vh] overflow-y-auto"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderColor: 'var(--border-primary)'
            }}
          >
            <h3 
              className="text-2xl font-bold mb-6 text-center"
              style={{ color: 'var(--text-primary)' }}
            >
              <AnimatedText speed={35}>
                {t.students.attendanceHistory} - {attendanceModal.student.firstName} {attendanceModal.student.lastName}
              </AnimatedText>
            </h3>

            {attendanceModal.student.attendance.length === 0 ? (
              <div className="text-center py-12">
                <p style={{ color: 'var(--text-tertiary)' }}>
                  {t.students.noAttendanceRecords}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="grid grid-cols-4 gap-4 pb-2 border-b" style={{ borderColor: 'var(--border-primary)' }}>
                  <div className="font-semibold text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {t.students.date}
                  </div>
                  <div className="font-semibold text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {t.students.courseName}
                  </div>
                  <div className="font-semibold text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {t.students.attendanceStatus}
                  </div>
                  <div className="font-semibold text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {t.students.actions}
                  </div>
                </div>
                {attendanceModal.student.attendance
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((record) => (
                    <div
                      key={record.id}
                      className="grid grid-cols-4 gap-4 py-3 border-b items-center"
                      style={{ borderColor: 'var(--border-primary)' }}
                    >
                      <div style={{ color: 'var(--text-primary)' }}>
                        {new Date(record.date).toLocaleDateString()}
                      </div>
                      <div style={{ color: 'var(--text-primary)' }}>
                        {record.courseName} ({record.courseCode})
                      </div>
                      <div>
                        <span
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5"
                          style={{
                            backgroundColor: record.status === 'present' 
                              ? 'rgba(34, 197, 94, 0.15)'
                              : 'rgba(239, 68, 68, 0.15)',
                            color: record.status === 'present' ? '#22c55e' : '#ef4444',
                            border: `1px solid ${record.status === 'present' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                          }}
                        >
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: record.status === 'present' ? '#22c55e' : '#ef4444' }}
                          />
                          {record.status === 'present' ? t.students.present : t.students.absent}
                        </span>
                      </div>
                      <div>
                        <button
                          onClick={() => {
                            setAttendanceOverrideModal({ open: true, record, student: attendanceModal.student });
                          }}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 hover:scale-105 active:scale-95 flex items-center gap-2"
                          style={{
                            backgroundColor: 'var(--bg-tertiary)',
                            color: 'var(--text-primary)',
                            border: '1px solid var(--border-primary)',
                          }}
                          title={record.status === 'present' ? t.students.markAsAbsent : t.students.markAsPresent}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          {record.status === 'present' ? t.students.markAsAbsent : t.students.markAsPresent}
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}

            <div className="flex justify-center mt-8">
              <button
                className="px-6 py-3 rounded-xl border font-semibold transition-all duration-300 hover:scale-105 active:scale-95"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  borderColor: 'var(--border-primary)',
                  color: 'var(--text-secondary)'
                }}
                onClick={() => setAttendanceModal({ open: false })}
              >
                <AnimatedText speed={40}>
                  {t.students.close}
                </AnimatedText>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ATTENDANCE OVERRIDE CONFIRMATION MODAL */}
      {attendanceOverrideModal.open && attendanceOverrideModal.record && attendanceOverrideModal.student && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div 
            className="backdrop-blur-2xl rounded-3xl border shadow-2xl p-8 w-full max-w-md"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderColor: 'var(--border-primary)'
            }}
          >
            <h3 
              className="text-2xl font-bold mb-6 text-center"
              style={{ color: 'var(--text-primary)' }}
            >
              <AnimatedText speed={35}>
                {t.students.overrideAttendance}
              </AnimatedText>
            </h3>

            <p 
              className="text-center mb-6 text-lg"
              style={{ color: 'var(--text-secondary)' }}
            >
              {t.students.confirmAttendanceChange}
            </p>

            <div className="p-4 rounded-xl mb-6" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
              <div className="text-sm mb-2" style={{ color: 'var(--text-tertiary)' }}>
                {new Date(attendanceOverrideModal.record.date).toLocaleDateString()} - {attendanceOverrideModal.record.courseName}
              </div>
              <div className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
                {attendanceOverrideModal.record.status === 'present' 
                  ? `${t.students.present} → ${t.students.absent}`
                  : `${t.students.absent} → ${t.students.present}`}
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                className="px-6 py-3 rounded-xl border font-semibold transition-all duration-300 hover:scale-105 active:scale-95"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  borderColor: 'var(--border-primary)',
                  color: 'var(--text-secondary)'
                }}
                onClick={() => setAttendanceOverrideModal({ open: false })}
              >
                <AnimatedText speed={40}>
                  {t.students.cancel}
                </AnimatedText>
              </button>
              <button
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#0046FF] to-[#001BB7] text-white font-semibold shadow-lg shadow-[#0046FF]/25 hover:shadow-[#0046FF]/40 transition-all duration-300 transform hover:scale-105 active:scale-95"
                onClick={confirmAttendanceOverride}
              >
                <AnimatedText speed={40}>
                  {t.students.confirm}
                </AnimatedText>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NOTIFICATION */}
      {notification.show && (
          <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-2 duration-300">
            <div 
              className="px-6 py-4 rounded-xl shadow-2xl bg-gradient-to-r from-[#0046FF] to-[#001BB7] text-white font-semibold text-base backdrop-blur-md"
            >
            {notification.message}
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default Students;
