'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useUser } from '../context/UserContext';
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
  enrolledStudentsCount?: number; // Count from API (GET returns count, not full list)
  room?: string;
  semester?: string;
  year?: string;
  category?: string;
  instructor?: string;
};

// API Response Types for Students
type APIStudentCourse = {
  course_id: number;
  course_name: string;
  course_code: string;
  description?: string;
  weekly_hours: number;
  academic_year?: string;
  course_category?: string;
  instructor_id: number;
  created_at?: string;
};

type APIStudentAttendance = {
  status: string;
  message: string;
  markedAt?: string;
  sessionId?: number;
};

type APIStudent = {
  studentId: number;
  name: string;
  surname: string;
  studentNumber: string;
  department?: string | null;
  faceEmbedding?: string | null;
  photoPath?: string | null;
  faceScanStatus: 'Verified' | 'Not Verified';
  courses: string;
  coursesFull: APIStudentCourse[];
  attendance: APIStudentAttendance;
  createdBy?: number | null;
  createdAt: string;
};

type APIStudentsResponse = {
  success: boolean;
  data: APIStudent[];
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

// Map API student to component Student type
const mapAPIStudentToStudent = (apiStudent: APIStudent): Student => {
  // Generate email from name and surname if not available
  const email = `${apiStudent.name.toLowerCase()}.${apiStudent.surname.toLowerCase()}@example.com`;
  
  return {
    id: apiStudent.studentId,
    firstName: apiStudent.name,
    lastName: apiStudent.surname,
    studentNumber: apiStudent.studentNumber,
    email: email,
  };
};

// initialCourses removed - courses are now fetched from API

// API Response Types
type APIScheduleEntry = {
  schedule_id?: number;
  course_id?: number;
  day: string;
  start_time: string;
  end_time: string;
  created_at?: string;
};

type APIEnrolledStudent = {
  studentId: number;
  name: string;
  surname: string;
  studentNumber: string;
  department?: string;
  enrolledAt?: string;
};

type APICourse = {
  courseId: number;
  courseName: string;
  courseCode: string;
  description?: string;
  weeklyHours: number;
  academicYear?: string;
  courseCategory?: string;
  instructorId?: number;
  instructor?: {
    instructorId: number;
    name: string;
    surname: string;
    email: string;
  };
  roomNumber?: string;
  semester?: string;
  schedule?: APIScheduleEntry[];
  enrolledStudents?: APIEnrolledStudent[];
  enrolledStudentsCount?: number;
};

type APICoursesResponse = {
  success: boolean;
  data: APICourse[];
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

type APICreateCourseResponse = {
  success: boolean;
  message: string;
  data: APICourse;
};

type APIUpdateCourseResponse = {
  success: boolean;
  message: string;
  data: APICourse;
};

// Helper functions to map between API and component formats
const mapDayToAPI = (day: Day): string => {
  const dayMap: Record<Day, string> = {
    Mon: 'Monday',
    Tue: 'Tuesday',
    Wed: 'Wednesday',
    Thu: 'Thursday',
    Fri: 'Friday',
    Sat: 'Saturday',
    Sun: 'Sunday',
  };
  return dayMap[day];
};

const mapDayFromAPI = (day: string): Day => {
  const dayMap: Record<string, Day> = {
    Monday: 'Mon',
    Tuesday: 'Tue',
    Wednesday: 'Wed',
    Thursday: 'Thu',
    Friday: 'Fri',
    Saturday: 'Sat',
    Sunday: 'Sun',
  };
  return dayMap[day] || 'Mon';
};

const mapAPICourseToCourse = (apiCourse: APICourse): Course => {
  const schedule: ScheduleEntry[] = (apiCourse.schedule || []).map((s) => ({
    day: mapDayFromAPI(s.day),
    startTime: s.start_time,
    endTime: s.end_time,
  }));

  // GET /api/courses returns enrolledStudentsCount, not enrolledStudents array
  // POST /api/courses returns enrolledStudents array
  const students: Student[] = (apiCourse.enrolledStudents || []).map((s) => ({
    id: s.studentId,
    firstName: s.name,
    lastName: s.surname,
    studentNumber: s.studentNumber,
    email: `${s.name.toLowerCase()}.${s.surname.toLowerCase()}@example.com`, // Fallback email
  }));

  return {
    id: apiCourse.courseId,
    name: apiCourse.courseName,
    code: apiCourse.courseCode,
    description: apiCourse.description,
    weeklyHours: apiCourse.weeklyHours,
    schedule,
    students,
    enrolledStudentsCount: apiCourse.enrolledStudentsCount || 0, // Use count from API
    room: apiCourse.roomNumber,
    semester: apiCourse.semester,
    year: apiCourse.academicYear,
    category: apiCourse.courseCategory,
    instructor: apiCourse.instructor ? `${apiCourse.instructor.name} ${apiCourse.instructor.surname}` : undefined,
  };
};

const Courses = () => {
  const { t } = useLanguage();
  const { token, user } = useUser();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [activeTab, setActiveTab] = useState<'list' | 'add'>('list');
  const [search, setSearch] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [editModal, setEditModal] = useState<{ open: boolean; course?: Course }>({ open: false });
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; course?: Course }>({ open: false });
  const [notification, setNotification] = useState<{ show: boolean; message: string; type?: 'success' | 'error' }>({ show: false, message: '' });
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [filters, setFilters] = useState({ academicYear: null as string | null, courseCategory: null as string | null });
  const buttonRefs = useRef<{ [key: number]: HTMLButtonElement | null }>({});
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [studentsPagination, setStudentsPagination] = useState({ page: 1, limit: 100, total: 0, totalPages: 0 });
  const studentDropdownRef = useRef<HTMLDivElement>(null);
  const studentsSearchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch courses from API
  const fetchCourses = useCallback(async (searchTerm: string = '', page: number = 1, currentFilters = filters, currentLimit = pagination.limit) => {
    if (!token) {
      setNotification({ show: true, message: 'Authentication required. Please log in.', type: 'error' });
      return;
    }

    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: currentLimit.toString(),
      });

      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim());
      }
      // Note: instructorId filter removed - API automatically filters by authenticated user
      if (currentFilters.academicYear) {
        params.append('academicYear', currentFilters.academicYear);
      }
      if (currentFilters.courseCategory) {
        params.append('courseCategory', currentFilters.courseCategory);
      }

      const response = await fetch(`http://localhost:3001/api/courses?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      // Handle 401 Unauthorized
      if (response.status === 401) {
        setNotification({ show: true, message: 'Authentication failed. Please log in again.', type: 'error' });
        setIsLoading(false);
        return;
      }

      const data: APICoursesResponse = await response.json();

      if (response.ok && data.success) {
        const mappedCourses = data.data.map(mapAPICourseToCourse);
        setCourses(mappedCourses);
        if (data.pagination) {
          setPagination(data.pagination);
        }
        // Save to localStorage for Students component access
        saveCourses(mappedCourses);
      } else {
        setNotification({ show: true, message: data.message || 'Failed to fetch courses', type: 'error' });
      }
    } catch (error) {
      console.error('Fetch courses error:', error);
      setNotification({ show: true, message: 'Network error. Please try again.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  // Fetch students from API
  const fetchStudents = useCallback(async (searchTerm: string = '', page: number = 1, limit: number = 100) => {
    if (!token) {
      return;
    }

    setIsLoadingStudents(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim());
      }

      const response = await fetch(`http://localhost:3001/api/students?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      // Handle 401 Unauthorized
      if (response.status === 401) {
        console.error('Authentication failed when fetching students');
        setIsLoadingStudents(false);
        return;
      }

      const data: APIStudentsResponse = await response.json();

      if (response.ok && data.success) {
        // Filter students by instructor: Only show students created by the current user
        // Admins can see all students, instructors can only see their own
        const currentUserId = user ? parseInt(user.id, 10) : null;
        const isAdmin = user?.role?.toLowerCase() === 'admin';
        
        const filteredApiStudents = isAdmin 
          ? data.data 
          : data.data.filter(apiStudent => apiStudent.createdBy === currentUserId);
        
        const mappedStudents = filteredApiStudents.map(mapAPIStudentToStudent);
        setStudents(mappedStudents);
        if (data.pagination) {
          setStudentsPagination(data.pagination);
        }
      } else {
        console.error('Failed to fetch students:', data.message || 'Unknown error');
      }
    } catch (error) {
      console.error('Fetch students error:', error);
    } finally {
      setIsLoadingStudents(false);
    }
  }, [token, user]);

  // Fetch students on mount
  useEffect(() => {
    if (token) {
      fetchStudents('', 1, 100); // Fetch first 100 students
    }
  }, [token, fetchStudents]);

  // Debounced student search
  useEffect(() => {
    if (studentsSearchTimeoutRef.current) {
      clearTimeout(studentsSearchTimeoutRef.current);
    }

    studentsSearchTimeoutRef.current = setTimeout(() => {
      if (token) {
        setStudentsPagination(prev => ({ ...prev, page: 1 }));
        fetchStudents(studentSearch, 1, 100);
      }
    }, 500);

    return () => {
      if (studentsSearchTimeoutRef.current) {
        clearTimeout(studentsSearchTimeoutRef.current);
      }
    };
  }, [studentSearch, token, fetchStudents]);

  // Fetch courses on mount and when filters/pagination change
  useEffect(() => {
    if (token) {
      fetchCourses(search, pagination.page, filters, pagination.limit);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, pagination.page, filters.academicYear, filters.courseCategory, pagination.limit]);

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      if (token) {
        setPagination(prev => ({ ...prev, page: 1 }));
        fetchCourses(search, 1, filters, pagination.limit);
      }
    }, 500);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

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

  // Filter courses (now handled by API, but keep for local filtering if needed)
  const filteredCourses = courses;

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
    return students.filter((s) => selectedStudents.includes(s.id));
  };

  // Filter students for dropdown (already filtered by API, but can add local filtering if needed)
  const filteredStudents = students.filter(
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

  // Validate form (matching API validation rules)
  const validateForm = (): boolean => {
    const trimmedCourseName = courseName.trim();
    const trimmedCourseCode = courseCode.trim();
    
    // Course name validation: 2-255 characters
    if (!trimmedCourseName) {
      setNotification({ show: true, message: 'Course name is required', type: 'error' });
      setTimeout(() => setNotification({ show: false, message: '' }), 3000);
      return false;
    }
    if (trimmedCourseName.length < 2 || trimmedCourseName.length > 255) {
      setNotification({ show: true, message: 'Course name must be between 2 and 255 characters', type: 'error' });
      setTimeout(() => setNotification({ show: false, message: '' }), 3000);
      return false;
    }
    
    // Course code validation: 2-50 characters
    if (!trimmedCourseCode) {
      setNotification({ show: true, message: 'Course code is required', type: 'error' });
      setTimeout(() => setNotification({ show: false, message: '' }), 3000);
      return false;
    }
    if (trimmedCourseCode.length < 2 || trimmedCourseCode.length > 50) {
      setNotification({ show: true, message: 'Course code must be between 2 and 50 characters', type: 'error' });
      setTimeout(() => setNotification({ show: false, message: '' }), 3000);
      return false;
    }
    
    // Weekly hours validation: 0-168 (float)
    if (!weeklyHours || isNaN(Number(weeklyHours))) {
      setNotification({ show: true, message: 'Weekly hours is required', type: 'error' });
      setTimeout(() => setNotification({ show: false, message: '' }), 3000);
      return false;
    }
    const hours = Number(weeklyHours);
    if (hours < 0 || hours > 168) {
      setNotification({ show: true, message: 'Weekly hours must be between 0 and 168', type: 'error' });
      setTimeout(() => setNotification({ show: false, message: '' }), 3000);
      return false;
    }
    
    // Description validation: max 2000 characters (optional)
    if (description.trim().length > 2000) {
      setNotification({ show: true, message: 'Description must be less than 2000 characters', type: 'error' });
      setTimeout(() => setNotification({ show: false, message: '' }), 3000);
      return false;
    }
    
    // Schedule validation (optional but if provided, must be valid)
    if (schedule.length > 0) {
    for (const entry of schedule) {
        if (!entry.day) {
          setNotification({ show: true, message: 'Schedule day is required', type: 'error' });
          setTimeout(() => setNotification({ show: false, message: '' }), 3000);
          return false;
        }
        if (!entry.startTime || !entry.endTime) {
          setNotification({ show: true, message: 'Schedule start and end times are required', type: 'error' });
          setTimeout(() => setNotification({ show: false, message: '' }), 3000);
          return false;
        }
        // Validate time format (HH:MM)
        const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(entry.startTime) || !timeRegex.test(entry.endTime)) {
          setNotification({ show: true, message: 'Schedule times must be in HH:MM format', type: 'error' });
          setTimeout(() => setNotification({ show: false, message: '' }), 3000);
          return false;
        }
        // Validate end time is after start time
      if (entry.startTime >= entry.endTime) {
          setNotification({ show: true, message: 'End time must be after start time', type: 'error' });
        setTimeout(() => setNotification({ show: false, message: '' }), 3000);
        return false;
      }
    }
    }
    
    return true;
  };

  // Handle save course
  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (!token || !user) {
      setNotification({ show: true, message: 'Authentication required. Please log in.', type: 'error' });
      setTimeout(() => setNotification({ show: false, message: '' }), 3000);
      return;
    }

    if (editModal.course) {
      // Update existing course
      setIsCreating(true);
      try {
        // Build request body - all fields are optional for update
        const requestBody: any = {};

        if (courseName.trim()) {
          requestBody.courseName = courseName.trim();
        }
        if (courseCode.trim()) {
          requestBody.courseCode = courseCode.trim();
        }
        if (weeklyHours) {
          requestBody.weeklyHours = Number(weeklyHours);
        }
        if (description.trim()) {
          requestBody.description = description.trim();
        }
        if (room.trim()) {
          requestBody.roomNumber = room.trim();
        }
        if (semester) {
          requestBody.semester = semester;
        }
        if (year) {
          requestBody.academicYear = year;
        }
        if (category) {
          requestBody.courseCategory = category;
        }
        if (schedule.length > 0) {
          requestBody.schedule = schedule.map((s) => ({
            day: mapDayToAPI(s.day),
            start_time: s.startTime,
            end_time: s.endTime,
          }));
        }

        const response = await fetch(`http://localhost:3001/api/courses/${editModal.course.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });

        // Handle different error status codes
        if (response.status === 401) {
          setNotification({ show: true, message: 'Authentication failed. Please log in again.', type: 'error' });
          setIsCreating(false);
          setTimeout(() => setNotification({ show: false, message: '' }), 3000);
          return;
        }

        if (response.status === 403) {
          setNotification({ show: true, message: 'You do not have permission to update this course. Only the course owner can update.', type: 'error' });
          setIsCreating(false);
          setTimeout(() => setNotification({ show: false, message: '' }), 3000);
          return;
        }

        const data: APIUpdateCourseResponse = await response.json();

        if (response.ok && data.success) {
          setNotification({ show: true, message: data.message || t.courses.courseUpdated || 'Course updated successfully', type: 'success' });
          resetForm();
          setEditModal({ open: false });
          setActiveTab('list');
          // Refresh courses list
          await fetchCourses(search, pagination.page, filters, pagination.limit);
        } else {
          // Handle specific error status codes
          let errorMessage = 'Failed to update course. Please try again.';
          
          if (response.status === 400) {
            errorMessage = data.message || 'Validation error. Please check your input and try again.';
          } else if (response.status === 404) {
            errorMessage = 'Course not found. Please refresh and try again.';
          } else if (response.status === 409) {
            errorMessage = data.message || 'A course with this code already exists in your university. Please use a different course code.';
          } else if (data.message) {
            errorMessage = data.message;
          }
          
          setNotification({ show: true, message: errorMessage, type: 'error' });
        }
      } catch (error) {
        console.error('Update course error:', error);
        setNotification({ show: true, message: 'Network error. Please try again.', type: 'error' });
      } finally {
        setIsCreating(false);
        setTimeout(() => setNotification({ show: false, message: '' }), 3000);
      }
      return;
    }

    // Create new course
    setIsCreating(true);
    try {
      // Build request body - instructorId is not included (API ignores it, uses authenticated user)
      const requestBody: any = {
        courseName: courseName.trim(),
        courseCode: courseCode.trim(),
        weeklyHours: Number(weeklyHours),
      };

      if (description.trim()) {
        requestBody.description = description.trim();
      }
      if (room.trim()) {
        requestBody.roomNumber = room.trim();
      }
      if (semester) {
        requestBody.semester = semester;
      }
      if (year) {
        requestBody.academicYear = year;
      }
      if (category) {
        requestBody.courseCategory = category;
      }
      if (selectedStudents.length > 0) {
        requestBody.studentIds = selectedStudents;
      }
      if (schedule.length > 0) {
        requestBody.schedule = schedule.map((s) => ({
          day: mapDayToAPI(s.day),
          start_time: s.startTime,
          end_time: s.endTime,
        }));
      }

      const response = await fetch('http://localhost:3001/api/courses', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      // Handle different error status codes
      if (response.status === 401) {
        setNotification({ show: true, message: 'Authentication failed. Please log in again.', type: 'error' });
        setIsCreating(false);
        setTimeout(() => setNotification({ show: false, message: '' }), 3000);
        return;
      }

      if (response.status === 403) {
        setNotification({ show: true, message: 'You do not have permission to create courses. Only instructors and admins can create courses.', type: 'error' });
        setIsCreating(false);
        setTimeout(() => setNotification({ show: false, message: '' }), 3000);
        return;
      }

      const data: APICreateCourseResponse = await response.json();

      if (response.status === 201 && data.success) {
        setNotification({ show: true, message: data.message || t.courses.courseAdded, type: 'success' });
        resetForm();
        setActiveTab('list');
        // Refresh courses list
        await fetchCourses(search, pagination.page, filters, pagination.limit);
      } else {
        // Handle specific error status codes
        let errorMessage = 'Failed to create course. Please try again.';
        
        if (response.status === 400) {
          errorMessage = data.message || 'Validation error. Please check your input and try again.';
        } else if (response.status === 404) {
          errorMessage = 'One or more selected students were not found. Please refresh and try again.';
        } else if (response.status === 409) {
          errorMessage = data.message || 'A course with this code already exists in your university. Please use a different course code.';
        } else if (data.message) {
          errorMessage = data.message;
        }
        
        setNotification({ show: true, message: errorMessage, type: 'error' });
      }
    } catch (error) {
      console.error('Create course error:', error);
      setNotification({ show: true, message: 'Network error. Please try again.', type: 'error' });
    } finally {
      setIsCreating(false);
      setTimeout(() => setNotification({ show: false, message: '' }), 3000);
    }
  };

  // Handle delete course
  const handleDeleteCourse = async () => {
    if (!deleteModal.course) return;

    if (!token) {
      setNotification({ show: true, message: 'Authentication required. Please log in.', type: 'error' });
      setTimeout(() => setNotification({ show: false, message: '' }), 3000);
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/api/courses/${deleteModal.course.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      // Handle different error status codes
      if (response.status === 401) {
        setNotification({ show: true, message: 'Authentication failed. Please log in again.', type: 'error' });
        setDeleteModal({ open: false });
        setTimeout(() => setNotification({ show: false, message: '' }), 3000);
        return;
      }

      if (response.status === 403) {
        setNotification({ show: true, message: 'You do not have permission to delete this course. Only the course owner can delete.', type: 'error' });
        setDeleteModal({ open: false });
        setTimeout(() => setNotification({ show: false, message: '' }), 3000);
        return;
      }

      if (response.status === 400) {
        setNotification({ show: true, message: 'Invalid course ID format.', type: 'error' });
        setDeleteModal({ open: false });
        setTimeout(() => setNotification({ show: false, message: '' }), 3000);
        return;
      }

      const data = await response.json();

      if (response.ok && data.success) {
        setNotification({ show: true, message: data.message || t.courses.courseDeleted || 'Course deleted successfully', type: 'success' });
        setDeleteModal({ open: false });
        
        // Refresh courses list
        await fetchCourses(search, pagination.page, filters, pagination.limit);
      } else {
        // Handle specific error status codes
        let errorMessage = 'Failed to delete course. Please try again.';
        
        if (response.status === 404) {
          errorMessage = data.message || 'Course not found. Please refresh and try again.';
        } else if (data.message) {
          errorMessage = data.message;
        }
        
        setNotification({ show: true, message: errorMessage, type: 'error' });
      }
    } catch (error) {
      console.error('Delete course error:', error);
      setNotification({ show: true, message: 'Network error. Please try again.', type: 'error' });
    } finally {
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
        <div className="mt-6 space-y-2">
          <h2 className="text-3xl lg:text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>
            <AnimatedText speed={35}>{t.courses.title}</AnimatedText>
          </h2>
          <p className="text-lg" style={{ color: 'var(--text-tertiary)' }}>
            <AnimatedText speed={40}>{t.courses.subtitle}</AnimatedText>
          </p>
        </div>

        {/* Notification */}
        {notification.show && (
          <div
            className={`p-4 rounded-xl backdrop-blur-xl border transition-all duration-300 animate-in slide-in-from-top-2 ${
              notification.type === 'error'
                ? 'bg-red-500/10 border-red-500/30 text-red-400'
                : 'bg-green-500/10 border-green-500/30 text-green-400'
            }`}
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
              {isLoading ? (
                <div className="p-12 text-center" style={{ color: 'var(--text-tertiary)' }}>
                  <svg className="animate-spin h-8 w-8 mx-auto mb-4" style={{ color: 'var(--text-primary)' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p>Loading courses...</p>
                </div>
              ) : (
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
                            {course.enrolledStudentsCount !== undefined ? course.enrolledStudentsCount : course.students.length}
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
              )}
            </div>

            {/* Pagination */}
            {!isLoading && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between pt-4">
                <div style={{ color: 'var(--text-tertiary)' }}>
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} courses
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (pagination.page > 1) {
                        setPagination(prev => ({ ...prev, page: prev.page - 1 }));
                      }
                    }}
                    disabled={pagination.page === 1}
                    className="px-4 py-2 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: pagination.page === 1 ? 'var(--bg-tertiary)' : 'var(--bg-secondary)',
                      border: '1px solid var(--border-primary)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => {
                      if (pagination.page < pagination.totalPages) {
                        setPagination(prev => ({ ...prev, page: prev.page + 1 }));
                      }
                    }}
                    disabled={pagination.page === pagination.totalPages}
                    className="px-4 py-2 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: pagination.page === pagination.totalPages ? 'var(--bg-tertiary)' : 'var(--bg-secondary)',
                      border: '1px solid var(--border-primary)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
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
                    min="0"
                    max="168"
                    step="0.5"
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
                        {isLoadingStudents ? (
                          <div className="p-4 text-center" style={{ color: '#E4E4E7' }}>
                            <svg className="animate-spin h-5 w-5 mx-auto mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <p className="text-sm">Loading students...</p>
                          </div>
                        ) : filteredStudents.length === 0 ? (
                          <div className="p-4 text-center" style={{ color: '#E4E4E7' }}>
                            <p className="text-sm">No students found</p>
                          </div>
                        ) : (
                          filteredStudents.map((student) => (
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
                          ))
                        )}
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
                  disabled={isCreating}
                  className="px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 active:scale-95 bg-gradient-to-r from-[#0046FF] to-[#001BB7] text-white shadow-lg shadow-[#0046FF]/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isCreating ? (
                    <>
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating...
                    </>
                  ) : (
                    t.courses.save
                  )}
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

