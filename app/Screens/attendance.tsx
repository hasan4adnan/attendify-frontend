'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import AnimatedText from '../components/AnimatedText';
import { getCourses, Course } from '../utils/courseData';

type SessionState = 'idle' | 'precheck' | 'camera' | 'confirmEnd' | 'ending' | 'success';

type PreCheckItem = {
  id: string;
  label: string;
  completed: boolean;
  loading: boolean;
};

type EndSessionItem = {
  id: string;
  label: string;
  completed: boolean;
  loading: boolean;
};

type PreviousSession = {
  id: number;
  courseName: string;
  courseCode: string;
  date: string;
  studentsPresent: number;
  studentsAbsent: number;
  duration: string;
};

const Attendance = () => {
  const { t } = useLanguage();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [courseDropdownOpen, setCourseDropdownOpen] = useState(false);
  const [sessionState, setSessionState] = useState<SessionState>('idle');
  const [preCheckItems, setPreCheckItems] = useState<PreCheckItem[]>([]);
  const [endSessionItems, setEndSessionItems] = useState<EndSessionItem[]>([]);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [sessionDuration, setSessionDuration] = useState<string>('0:00');
  const [studentsMarked, setStudentsMarked] = useState<number>(0);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const courseDropdownRef = useRef<HTMLDivElement>(null);
  const sessionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);

  // Mock previous sessions data
  const previousSessions: PreviousSession[] = [
    {
      id: 1,
      courseName: 'Introduction to Computer Science',
      courseCode: 'CS101',
      date: '2024-01-15',
      studentsPresent: 42,
      studentsAbsent: 8,
      duration: '15:30',
    },
    {
      id: 2,
      courseName: 'Data Structures',
      courseCode: 'CS201',
      date: '2024-01-14',
      studentsPresent: 38,
      studentsAbsent: 12,
      duration: '12:45',
    },
  ];

  // Load courses on mount
  useEffect(() => {
    const loadedCourses = getCourses();
    setCourses(loadedCourses);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (courseDropdownRef.current && !courseDropdownRef.current.contains(event.target as Node)) {
        setCourseDropdownOpen(false);
      }
    };

    if (courseDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [courseDropdownOpen]);

  // Initialize pre-check items
  useEffect(() => {
    if (sessionState === 'precheck') {
      setPreCheckItems([
        { id: 'course', label: t.attendance.courseSelected, completed: false, loading: true },
        { id: 'camera', label: t.attendance.cameraDetected, completed: false, loading: false },
        { id: 'system', label: t.attendance.systemReady, completed: false, loading: false },
        { id: 'init', label: t.attendance.initializingSession, completed: false, loading: false },
      ]);

      // Start sequential animation
      let currentIndex = 0;
      const animatePreCheck = () => {
        if (currentIndex < 4) {
          setTimeout(() => {
            setPreCheckItems((prev) => {
              const updated = [...prev];
              if (currentIndex > 0) {
                updated[currentIndex - 1].loading = false;
                updated[currentIndex - 1].completed = true;
              }
              if (currentIndex < 4) {
                updated[currentIndex].loading = true;
              }
              return updated;
            });
            currentIndex++;
            if (currentIndex <= 4) {
              animatePreCheck();
            }
          }, 2000);
        } else {
          // All items completed, transition to camera
          setTimeout(() => {
            setSessionState('camera');
            setSessionStartTime(new Date());
            startSessionTimer();
          }, 1000);
        }
      };

      animatePreCheck();
    }
  }, [sessionState, t]);

  // Initialize end session items
  useEffect(() => {
    if (sessionState === 'ending') {
      setEndSessionItems([
        { id: 'saving', label: t.attendance.savingFaces, completed: false, loading: true },
        { id: 'analyzing', label: t.attendance.analyzingData, completed: false, loading: false },
        { id: 'generating', label: t.attendance.generatingReport, completed: false, loading: false },
        { id: 'finalizing', label: t.attendance.finalizingSession, completed: false, loading: false },
        { id: 'completed', label: t.attendance.completed, completed: false, loading: false },
      ]);

      // Start sequential animation
      let currentIndex = 0;
      const animateEndSession = () => {
        if (currentIndex < 5) {
          setTimeout(() => {
            setEndSessionItems((prev) => {
              const updated = [...prev];
              if (currentIndex > 0) {
                updated[currentIndex - 1].loading = false;
                updated[currentIndex - 1].completed = true;
              }
              if (currentIndex < 5) {
                updated[currentIndex].loading = true;
              }
              return updated;
            });
            currentIndex++;
            if (currentIndex <= 5) {
              animateEndSession();
            }
          }, 2000);
        } else {
          // All items completed, transition to success
          setTimeout(() => {
            setSessionState('success');
            if (sessionTimerRef.current) {
              clearInterval(sessionTimerRef.current);
            }
            // Mock students marked count
            setStudentsMarked(selectedCourse?.students.length || 0);
          }, 1000);
        }
      };

      animateEndSession();
    }
  }, [sessionState, t, selectedCourse]);

  // Session timer
  const startSessionTimer = () => {
    if (sessionTimerRef.current) {
      clearInterval(sessionTimerRef.current);
    }

    sessionTimerRef.current = setInterval(() => {
      if (sessionStartTime) {
        const now = new Date();
        const diff = Math.floor((now.getTime() - sessionStartTime.getTime()) / 1000);
        const minutes = Math.floor(diff / 60);
        const seconds = diff % 60;
        setSessionDuration(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      }
    }, 1000);
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (sessionTimerRef.current) {
        clearInterval(sessionTimerRef.current);
      }
    };
  }, []);

  // Handle camera stream when entering camera state
  useEffect(() => {
    if (sessionState === 'camera') {
      // Request camera access
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          cameraStreamRef.current = stream;
          setCameraStream(stream);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch((error) => {
              console.error('Error playing video:', error);
            });
          }
        })
        .catch((error) => {
          console.error('Error accessing camera:', error);
          // You could show an error message to the user here
        });
    } else {
      // Stop camera stream when leaving camera state
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach((track) => {
          track.stop();
        });
        cameraStreamRef.current = null;
        setCameraStream(null);
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }

    // Cleanup on unmount or state change
    return () => {
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach((track) => {
          track.stop();
        });
        cameraStreamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, [sessionState]);

  const handleStartSession = () => {
    if (!selectedCourse) {
      // Show error notification (you can add a toast/notification system)
      return;
    }
    setSessionState('precheck');
  };

  const handleEndSession = () => {
    setSessionState('confirmEnd');
  };

  const handleConfirmEndSession = () => {
    if (sessionTimerRef.current) {
      clearInterval(sessionTimerRef.current);
    }
    // Stop camera stream
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      cameraStreamRef.current = null;
      setCameraStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setSessionState('ending');
  };

  const handleCancelEndSession = () => {
    setSessionState('camera');
  };

  const handleCloseModal = () => {
    // Stop camera stream if active
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      cameraStreamRef.current = null;
      setCameraStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setSessionState('idle');
    setPreCheckItems([]);
    setEndSessionItems([]);
    setSessionStartTime(null);
    setSessionDuration('0:00');
    setStudentsMarked(0);
  };

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
              {t.attendance.title}
            </AnimatedText>
          </h2>
          <p 
            className="text-lg"
            style={{ color: 'var(--text-tertiary)' }}
          >
            <AnimatedText speed={40}>
              {t.attendance.subtitle}
            </AnimatedText>
          </p>
          <div className="h-1 w-20 bg-gradient-to-r from-[#0046FF] to-[#FF8040] rounded-full" />
        </div>

        {/* Course Selection Section */}
        <div className="relative" ref={courseDropdownRef}>
            <button
              onClick={() => setCourseDropdownOpen(!courseDropdownOpen)}
              className="w-full px-6 py-4 rounded-2xl transition-all duration-300 text-left flex items-center justify-between group"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                border: `2px solid ${courseDropdownOpen ? '#0046FF' : 'var(--border-primary)'}`,
                color: 'var(--text-primary)',
              }}
            >
              <div className="flex items-center gap-4">
                <div 
                  className="p-2.5 rounded-xl bg-gradient-to-br from-[#0046FF] to-[#001BB7] shadow-lg shadow-[#0046FF]/25"
                >
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div>
                  {selectedCourse ? (
                    <>
                      <div className="font-semibold text-lg">
                        {selectedCourse.code} - {selectedCourse.name}
                      </div>
                      <div 
                        className="text-sm"
                        style={{ color: 'var(--text-tertiary)' }}
                      >
                        {selectedCourse.students.length} {selectedCourse.students.length === 1 ? 'student' : 'students'} enrolled
                      </div>
                    </>
                  ) : (
                    <div 
                      className="font-medium"
                      style={{ color: 'var(--text-tertiary)' }}
                    >
                      {t.attendance.selectCoursePlaceholder}
                    </div>
                  )}
                </div>
              </div>
              <svg
                className={`w-5 h-5 transition-transform duration-300 ${courseDropdownOpen ? 'rotate-180' : ''}`}
                style={{ color: 'var(--text-secondary)' }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu - Fully Opaque */}
            {courseDropdownOpen && (
              <div
                className="absolute z-50 w-full mt-2 rounded-2xl border shadow-2xl max-h-80 overflow-y-auto"
                style={{
                  backgroundColor: '#1e1e2d',
                  borderColor: '#2A2A3B',
                  opacity: 1,
                }}
              >
                {courses.length === 0 ? (
                  <div 
                    className="p-4 text-center"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    {t.attendance.noCourseSelected}
                  </div>
                ) : (
                  <div className="p-2 space-y-1">
                    {courses.map((course) => (
                      <button
                        key={course.id}
                        onClick={() => {
                          setSelectedCourse(course);
                          setCourseDropdownOpen(false);
                        }}
                        className="w-full px-4 py-3 rounded-xl text-left transition-all duration-200 hover:scale-[1.02]"
                        style={{
                          backgroundColor: selectedCourse?.id === course.id ? 'rgba(0, 70, 255, 0.15)' : '#1e1e2d',
                          color: '#E4E4E7',
                          border: selectedCourse?.id === course.id ? '1px solid rgba(0, 70, 255, 0.3)' : '1px solid transparent',
                        }}
                        onMouseEnter={(e) => {
                          if (selectedCourse?.id !== course.id) {
                            e.currentTarget.style.backgroundColor = '#2A2A3B';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (selectedCourse?.id !== course.id) {
                            e.currentTarget.style.backgroundColor = '#1e1e2d';
                          }
                        }}
                      >
                        <div className="font-semibold">{course.code} - {course.name}</div>
                        <div 
                          className="text-sm mt-1"
                          style={{ color: 'rgba(255, 255, 255, 0.6)' }}
                        >
                          {course.students.length} {course.students.length === 1 ? 'student' : 'students'}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Start Attendance Card */}
          <div 
            className="lg:col-span-2 backdrop-blur-2xl rounded-3xl border shadow-2xl p-8 space-y-6 transition-all duration-300 hover:shadow-[#0046FF]/20 group relative overflow-hidden"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderColor: 'var(--border-primary)',
            }}
          >
            {/* Gradient border effect on hover */}
            <div 
              className="absolute inset-0 rounded-3xl bg-gradient-to-r from-[#0046FF] via-[#FF8040] to-[#0046FF] opacity-0 group-hover:opacity-20 transition-opacity duration-500"
              style={{ padding: '2px' }}
            />
            <div 
              className="absolute inset-[2px] rounded-3xl"
              style={{ backgroundColor: 'var(--bg-secondary)' }}
            />

            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <div 
                  className="p-4 rounded-2xl bg-gradient-to-br from-[#0046FF] to-[#001BB7] shadow-lg shadow-[#0046FF]/25 group-hover:scale-110 transition-transform duration-300"
                >
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 
                    className="text-2xl font-bold"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {t.attendance.startAttendanceSession}
                  </h3>
                  <p 
                    className="text-base mt-1"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    {t.attendance.startAttendanceSubtitle}
                  </p>
                </div>
              </div>

              <button
                onClick={handleStartSession}
                disabled={!selectedCourse || sessionState !== 'idle'}
                className="w-full px-8 py-5 bg-gradient-to-r from-[#0046FF] to-[#001BB7] text-white font-semibold rounded-2xl shadow-lg shadow-[#0046FF]/30 hover:shadow-[#0046FF]/50 focus:outline-none focus:ring-2 focus:ring-[#0046FF] focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden group/btn disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3"
              >
                <span className="relative z-10 text-lg">
                  {t.attendance.startSession}
                </span>
                <svg
                  className="w-6 h-6 transform group-hover/btn:translate-x-1 transition-transform duration-300 relative z-10"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                {/* Shine effect */}
                <div className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              </button>
            </div>
          </div>

          {/* Previous Records Card */}
          <div 
            className="backdrop-blur-2xl rounded-3xl border shadow-2xl p-6 space-y-4 transition-all duration-300 hover:shadow-[#0046FF]/20"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderColor: 'var(--border-primary)',
            }}
          >
            <h3 
              className="text-lg font-semibold"
              style={{ color: 'var(--text-primary)' }}
            >
              {t.attendance.previousRecords}
            </h3>
            {previousSessions.length === 0 ? (
              <p 
                className="text-sm"
                style={{ color: 'var(--text-tertiary)' }}
              >
                {t.attendance.noPreviousRecords}
              </p>
            ) : (
              <div className="space-y-3">
                {previousSessions.slice(0, 2).map((session) => (
                  <div
                    key={session.id}
                    className="p-4 rounded-xl border transition-all duration-200 hover:scale-[1.02]"
                    style={{
                      backgroundColor: 'var(--bg-tertiary)',
                      borderColor: 'var(--border-primary)',
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                        {session.courseCode}
                      </div>
                      <div 
                        className="text-xs"
                        style={{ color: 'var(--text-quaternary)' }}
                      >
                        {session.date}
                      </div>
                    </div>
                    <div 
                      className="text-xs mb-2"
                      style={{ color: 'var(--text-tertiary)' }}
                    >
                      {session.courseName}
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span style={{ color: 'var(--text-tertiary)' }}>
                          {session.studentsPresent} {t.attendance.studentsPresent}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-red-500" />
                        <span style={{ color: 'var(--text-tertiary)' }}>
                          {session.studentsAbsent} {t.attendance.studentsAbsent}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Pre-Check Popup */}
        {sessionState === 'precheck' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <div
              className="w-full max-w-2xl rounded-3xl border shadow-2xl p-8 space-y-8 animate-in scale-in"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border-primary)',
              }}
            >
              <div className="text-center space-y-2">
                <h3 
                  className="text-2xl font-bold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {t.attendance.preCheckTitle}
                </h3>
                <p 
                  className="text-base"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  {t.attendance.preCheckSubtitle}
                </p>
              </div>

              <div className="space-y-4">
                {preCheckItems.map((item, index) => (
                  <div
                    key={item.id}
                    className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-500 ${
                      item.completed ? 'border-green-500/50 bg-green-500/5' : ''
                    }`}
                    style={{
                      backgroundColor: item.completed ? 'rgba(34, 197, 94, 0.05)' : 'var(--bg-tertiary)',
                      borderColor: item.completed ? 'rgba(34, 197, 94, 0.3)' : 'var(--border-primary)',
                    }}
                  >
                    <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center">
                      {item.completed ? (
                        <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center animate-in fade-in scale-in">
                          <svg
                            className="w-6 h-6 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      ) : item.loading ? (
                        <div className="relative w-10 h-10">
                          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#0046FF] animate-spin" />
                          <div className="absolute inset-2 rounded-full bg-gray-600/20" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-600/30 flex items-center justify-center">
                          <div className="w-3 h-3 rounded-full bg-gray-500" />
                        </div>
                      )}
                    </div>
                    <div 
                      className="flex-1 text-lg font-medium"
                      style={{ color: item.completed ? '#22c55e' : 'var(--text-primary)' }}
                    >
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Camera Session Popup */}
        {sessionState === 'camera' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <div
              className="w-full max-w-4xl rounded-3xl border shadow-2xl p-8 space-y-6 animate-in scale-in"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border-primary)',
              }}
            >
              <div className="text-center space-y-2">
                <h3 
                  className="text-2xl font-bold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {t.attendance.liveSessionTitle}
                </h3>
                <p 
                  className="text-base"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  {t.attendance.liveSessionSubtitle}
                </p>
              </div>

              {/* Camera Preview Box */}
              <div 
                className="relative w-full aspect-video rounded-2xl border-2 overflow-hidden"
                style={{
                  backgroundColor: '#0a0a0f',
                  borderColor: 'var(--border-secondary)',
                }}
              >
                {/* Real video feed */}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                
                {/* Loading overlay when camera is not ready */}
                {!cameraStream && (
                  <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a0f]">
                    <div className="text-center space-y-4">
                      <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-[#0046FF] to-[#FF8040] flex items-center justify-center animate-pulse">
                        <svg
                          className="w-12 h-12 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p 
                        className="text-sm"
                        style={{ color: 'var(--text-tertiary)' }}
                      >
                        Initializing camera...
                      </p>
                    </div>
                  </div>
                )}

                {/* Session timer overlay */}
                <div 
                  className="absolute top-4 right-4 px-4 py-2 rounded-lg backdrop-blur-sm"
                  style={{
                    backgroundColor: 'rgba(0, 70, 255, 0.2)',
                    border: '1px solid rgba(0, 70, 255, 0.3)',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span 
                      className="text-sm font-semibold"
                      style={{ color: '#0046FF' }}
                    >
                      {t.attendance.sessionActive} • {sessionDuration}
                    </span>
                  </div>
                </div>
              </div>

              {/* Control Buttons */}
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={handleEndSession}
                  className="px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-xl shadow-lg shadow-red-500/25 hover:shadow-red-500/40 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center gap-3"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                  </svg>
                  {t.attendance.endSession}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* End Session Confirmation Dialog */}
        {sessionState === 'confirmEnd' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <div
              className="w-full max-w-md rounded-3xl border shadow-2xl p-8 space-y-6 animate-in scale-in"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border-primary)',
              }}
            >
              <div className="text-center space-y-2">
                <h3 
                  className="text-2xl font-bold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {t.attendance.endSessionConfirmTitle}
                </h3>
                <p 
                  className="text-base"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  {t.attendance.endSessionConfirmText}
                </p>
              </div>

              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={handleCancelEndSession}
                  className="px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    backgroundColor: 'var(--bg-tertiary)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-primary)',
                  }}
                >
                  {t.common.cancel}
                </button>
                <button
                  onClick={handleConfirmEndSession}
                  className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-xl shadow-lg shadow-red-500/25 hover:shadow-red-500/40 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {t.attendance.endSession}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* End Session Popup */}
        {sessionState === 'ending' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <div
              className="w-full max-w-2xl rounded-3xl border shadow-2xl p-8 space-y-8 animate-in scale-in"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border-primary)',
              }}
            >
              <div className="text-center space-y-2">
                <h3 
                  className="text-2xl font-bold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {t.attendance.endingSession}
                </h3>
                <p 
                  className="text-base"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  {t.attendance.preCheckSubtitle}
                </p>
              </div>

              <div className="space-y-4">
                {endSessionItems.map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-500 ${
                      item.completed ? 'border-green-500/50 bg-green-500/5' : ''
                    }`}
                    style={{
                      backgroundColor: item.completed ? 'rgba(34, 197, 94, 0.05)' : 'var(--bg-tertiary)',
                      borderColor: item.completed ? 'rgba(34, 197, 94, 0.3)' : 'var(--border-primary)',
                    }}
                  >
                    <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center">
                      {item.completed ? (
                        <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center animate-in fade-in scale-in">
                          <svg
                            className="w-6 h-6 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      ) : item.loading ? (
                        <div className="relative w-10 h-10">
                          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#0046FF] animate-spin" />
                          <div className="absolute inset-2 rounded-full bg-gray-600/20" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-600/30 flex items-center justify-center">
                          <div className="w-3 h-3 rounded-full bg-gray-500" />
                        </div>
                      )}
                    </div>
                    <div 
                      className="flex-1 text-lg font-medium"
                      style={{ color: item.completed ? '#22c55e' : 'var(--text-primary)' }}
                    >
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Success Screen */}
        {sessionState === 'success' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <div
              className="w-full max-w-2xl rounded-3xl border shadow-2xl p-8 space-y-8 animate-in scale-in text-center"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border-primary)',
              }}
            >
              {/* Success Icon */}
              <div className="flex justify-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/25 animate-in scale-in">
                  <svg
                    className="w-12 h-12 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>

              {/* Success Message */}
              <div className="space-y-2">
                <h3 
                  className="text-3xl font-bold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {t.attendance.sessionCompleted}
                </h3>
                <p 
                  className="text-base"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  {t.attendance.sessionCompletedSubtitle}
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div 
                  className="p-6 rounded-2xl border"
                  style={{
                    backgroundColor: 'var(--bg-tertiary)',
                    borderColor: 'var(--border-primary)',
                  }}
                >
                  <div 
                    className="text-3xl font-bold mb-2 bg-gradient-to-r from-[#0046FF] to-[#FF8040] bg-clip-text text-transparent"
                  >
                    {studentsMarked}
                  </div>
                  <div 
                    className="text-sm"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    {t.attendance.studentsMarked}
                  </div>
                </div>
                <div 
                  className="p-6 rounded-2xl border"
                  style={{
                    backgroundColor: 'var(--bg-tertiary)',
                    borderColor: 'var(--border-primary)',
                  }}
                >
                  <div 
                    className="text-3xl font-bold mb-2 bg-gradient-to-r from-[#0046FF] to-[#FF8040] bg-clip-text text-transparent"
                  >
                    {sessionDuration}
                  </div>
                  <div 
                    className="text-sm"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    {t.attendance.sessionDuration}
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={handleCloseModal}
                className="w-full px-8 py-4 bg-gradient-to-r from-[#0046FF] to-[#001BB7] text-white font-semibold rounded-xl shadow-lg shadow-[#0046FF]/30 hover:shadow-[#0046FF]/50 focus:outline-none focus:ring-2 focus:ring-[#0046FF] focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {t.attendance.close}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Attendance;

