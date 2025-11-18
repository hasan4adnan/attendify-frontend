'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import AnimatedText from '../components/AnimatedText';
import ActionMenu, { ActionMenuItem } from '../components/ActionMenu';

type VerificationStatus = 'verified' | 'pending' | 'notVerified';

type Student = {
  id: number;
  firstName: string;
  lastName: string;
  studentNumber: string;
  email: string;
  verificationStatus: VerificationStatus;
};

const initialStudents: Student[] = [
  { id: 1, firstName: 'Ahmet', lastName: 'Yılmaz', studentNumber: '1001', email: 'ahmet.yilmaz@example.com', verificationStatus: 'verified' },
  { id: 2, firstName: 'Ayşe', lastName: 'Demir', studentNumber: '1002', email: 'ayse.demir@example.com', verificationStatus: 'pending' },
  { id: 3, firstName: 'Mehmet', lastName: 'Kaya', studentNumber: '1003', email: 'mehmet.kaya@example.com', verificationStatus: 'notVerified' },
];

const Students = () => {
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [studentNumber, setStudentNumber] = useState('');
  const [email, setEmail] = useState('');
  const [focused, setFocused] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'add' | 'list'>('list');
  const [search, setSearch] = useState('');
  const [editModal, setEditModal] = useState<{ open: boolean, student?: Student }>({ open: false });
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editStudentNumber, setEditStudentNumber] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [notification, setNotification] = useState<{ show: boolean, message: string }>({ show: false, message: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [searchFocused, setSearchFocused] = useState(false);
  const [faceScanModal, setFaceScanModal] = useState<{ open: boolean, student?: Student }>({ open: false });
  const [scanning, setScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const buttonRefs = useRef<{ [key: number]: HTMLButtonElement | null }>({});
  const studentsPerPage = 10;
  const { t } = useLanguage();

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
      if (openMenuId !== null) {
        const menuElement = menuRefs.current[openMenuId];
        if (menuElement && !menuElement.contains(event.target as Node)) {
          setOpenMenuId(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openMenuId]);

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

  // Add Student
  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !studentNumber || !email) return;

    setStudents([
      ...students,
      {
        id: students.length + 1,
        firstName,
        lastName,
        studentNumber,
        email,
        verificationStatus: 'notVerified',
      },
    ]);

    setFirstName('');
    setLastName('');
    setStudentNumber('');
    setEmail('');

    setNotification({ show: true, message: t.students.studentAdded });
    setTimeout(() => setNotification({ show: false, message: '' }), 2000);
  };

  // Open Edit Modal
  const openEditModal = (student: Student) => {
    setEditFirstName(student.firstName);
    setEditLastName(student.lastName);
    setEditStudentNumber(student.studentNumber);
    setEditEmail(student.email);
    setEditModal({ open: true, student });
    setOpenMenuId(null);
  };

  // Save Edit
  const handleEditSave = () => {
    if (!editModal.student) return;

    setStudents(students.map(s =>
      s.id === editModal.student!.id
        ? { ...s, firstName: editFirstName, lastName: editLastName, studentNumber: editStudentNumber, email: editEmail }
        : s
    ));

    setEditModal({ open: false });

    setNotification({ show: true, message: t.students.studentUpdated });
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
                      <td colSpan={6} className="px-6 py-12 text-center" style={{ color: 'var(--text-tertiary)' }}>
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
