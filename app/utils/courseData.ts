// Shared course data utility
// In a real app, this would come from a context or API

export type Course = {
  id: number;
  name: string;
  code: string;
  description?: string;
  weeklyHours: number;
  schedule: Array<{
    day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';
    startTime: string;
    endTime: string;
  }>;
  students: Array<{
    id: number;
    firstName: string;
    lastName: string;
    studentNumber: string;
    email: string;
  }>;
  room?: string;
  semester?: string;
  year?: string;
  category?: string;
  instructor?: string;
};

// Get courses from localStorage or return default
export const getCourses = (): Course[] => {
  if (typeof window === 'undefined') return [];
  
  const stored = localStorage.getItem('courses');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }
  
  // Default courses
  return [
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
      students: [],
      room: 'A101',
      semester: 'Fall',
      year: '2024',
      category: 'Theoretical',
      instructor: 'Dr. John Doe',
    },
  ];
};

// Save courses to localStorage
export const saveCourses = (courses: Course[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('courses', JSON.stringify(courses));
  }
};




