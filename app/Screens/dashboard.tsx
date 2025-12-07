'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useUser } from '../context/UserContext';
import AnimatedText from '../components/AnimatedText';
import AttendanceOverviewChart from '../components/charts/AttendanceOverviewChart';
import AttendanceDistributionChart from '../components/charts/AttendanceDistributionChart';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// API Response Types for Students
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
  coursesFull: any[];
  attendance: any;
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

export default function DashboardPage() {
  const { t } = useLanguage();
  const { user, token } = useUser();
  const [isGenerating, setIsGenerating] = useState(false);
  const [totalStudents, setTotalStudents] = useState<number>(0);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const chart1Ref = useRef<HTMLDivElement>(null);
  const chart2Ref = useRef<HTMLDivElement>(null);
  const dashboardRef = useRef<HTMLDivElement>(null);

  // Fetch total students count
  const fetchTotalStudents = useCallback(async () => {
    if (!token) {
      return;
    }

    setIsLoadingStudents(true);
    try {
      // Fetch first page with limit 1 to get total count from pagination
      const response = await fetch('http://localhost:3001/api/students?page=1&limit=1', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      // Handle 401 Unauthorized
      if (response.status === 401) {
        console.error('Authentication failed when fetching students count');
        setIsLoadingStudents(false);
        return;
      }

      const data: APIStudentsResponse = await response.json();

      if (response.ok && data.success) {
        // Use pagination total if available, otherwise use data length
        if (data.pagination && data.pagination.total) {
          setTotalStudents(data.pagination.total);
        } else {
          // If no pagination info, fetch all students (with a high limit)
          const allStudentsResponse = await fetch('http://localhost:3001/api/students?page=1&limit=1000', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
          
          // Handle 401 for the second request
          if (allStudentsResponse.status === 401) {
            console.error('Authentication failed when fetching all students');
            setIsLoadingStudents(false);
            return;
          }
          
          const allStudentsData: APIStudentsResponse = await allStudentsResponse.json();
          if (allStudentsResponse.ok && allStudentsData.success) {
            setTotalStudents(allStudentsData.data.length);
          }
        }
      }
    } catch (error) {
      console.error('Fetch total students error:', error);
    } finally {
      setIsLoadingStudents(false);
    }
  }, [token]);

  // Fetch students count on mount
  useEffect(() => {
    if (token) {
      fetchTotalStudents();
    }
  }, [token, fetchTotalStudents]);

  // Format number with commas
  const formatNumber = (num: number): string => {
    return num.toLocaleString('en-US');
  };

  const summaryCards = [
    { title: t.dashboard.todayAttendance, value: '245', change: '+12%', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', gradient: 'from-[#0046FF] to-[#001BB7]' },
    { title: t.dashboard.totalStudents, value: isLoadingStudents ? '...' : formatNumber(totalStudents), change: '+5%', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', gradient: 'from-[#FF8040] to-[#FF6B35]' },
    { title: t.dashboard.activeSessions, value: '18', change: '+3', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', gradient: 'from-[#001BB7] to-[#0046FF]' },
    { title: t.dashboard.attendanceRate, value: '94.2%', change: '+2.1%', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', gradient: 'from-[#0046FF] via-[#FF8040] to-[#FF6B35]' },
  ];

  const generatePDF = async () => {
    setIsGenerating(true);
    try {
      if (!dashboardRef.current) {
        throw new Error('Dashboard element not found');
      }

      // Capture the entire dashboard as a high-quality image
      // Workaround for oklab color parsing issue in html2canvas
      let canvas: HTMLCanvasElement;
      
      try {
        canvas = await html2canvas(dashboardRef.current, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#0a0a15',
          windowWidth: dashboardRef.current.scrollWidth,
          windowHeight: dashboardRef.current.scrollHeight,
          onclone: (clonedDoc) => {
            // Remove all stylesheets to prevent oklab parsing
            try {
              const head = clonedDoc.head;
              if (head) {
                const children = Array.from(head.children);
                children.forEach((child) => {
                  if (child.tagName === 'STYLE' || 
                      (child.tagName === 'LINK' && child.getAttribute('rel') === 'stylesheet')) {
                    child.remove();
                  }
                });
              }
              
              // Remove style tags from body
              const styleTags = clonedDoc.querySelectorAll('style');
              styleTags.forEach((tag) => tag.remove());
            } catch (e) {
              // Ignore errors
            }
          },
        });
      } catch (error: any) {
        // If html2canvas fails due to CSS parsing, try with minimal options
        if (error.message && error.message.includes('oklab')) {
          console.warn('Retrying with minimal CSS...');
          canvas = await html2canvas(dashboardRef.current, {
            scale: 1.5,
            useCORS: false,
            logging: false,
            backgroundColor: '#0a0a15',
            ignoreElements: () => false,
            onclone: (clonedDoc) => {
              // Aggressively remove all CSS
              const allStyleSheets = Array.from(clonedDoc.styleSheets);
              allStyleSheets.forEach((sheet: any) => {
                try {
                  if (sheet.ownerNode) {
                    sheet.ownerNode.remove();
                  }
                } catch (e) {
                  // Ignore
                }
              });
              
              // Remove all style and link tags
              clonedDoc.querySelectorAll('style, link[rel="stylesheet"]').forEach((el) => el.remove());
            },
          });
        } else {
          throw error;
        }
      }

      const imgData = canvas.toDataURL('image/png', 1.0);
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;

      // Calculate PDF dimensions
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const contentWidth = pageWidth - (margin * 2);
      
      // Convert pixels to mm (96 DPI standard)
      const pxToMm = 0.264583;
      const imgWidthMm = imgWidth * pxToMm;
      const imgHeightMm = imgHeight * pxToMm;
      
      // Scale to fit content width
      const scale = contentWidth / imgWidthMm;
      const scaledWidth = imgWidthMm * scale;
      const scaledHeight = imgHeightMm * scale;

      // Add header to first page
      pdf.setFillColor(10, 15, 40);
      pdf.rect(0, 0, pageWidth, 40, 'F');
      
      // Brand name
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(22);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Attendify', margin, 16);
      
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(200, 200, 255);
      pdf.text('Intelligent Attendance Management System', margin, 22);
      
      // Report info
      const now = new Date();
      const dateStr = now.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric'
      });
      const timeStr = now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      
      pdf.setFontSize(7);
      pdf.setTextColor(255, 255, 255);
      pdf.text('Attendance Dashboard Report', pageWidth - margin, 16, { align: 'right' });
      pdf.setFontSize(6);
      pdf.setTextColor(220, 220, 255);
      pdf.text(`Generated: ${dateStr} at ${timeStr}`, pageWidth - margin, 22, { align: 'right' });
      
      if (user) {
        pdf.text(`${user.firstName} ${user.lastName} (${user.role})`, pageWidth - margin, 28, { align: 'right' });
      }

      // Add the dashboard image, splitting across pages if needed
      let yPos = 45;
      let remainingHeight = scaledHeight;
      const pageContentHeight = pageHeight - yPos - 10; // Space for footer

      // Load image first
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = imgData;
      });

      // Split image across pages
      let sourceY = 0;
      while (remainingHeight > 0) {
        const availableHeight = pageContentHeight;
        const heightToAdd = Math.min(remainingHeight, availableHeight);
        const sourceHeightRatio = heightToAdd / scaledHeight;
        const sourceHeightPx = Math.ceil(imgHeight * sourceHeightRatio);

        // Create canvas for this portion
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = imgWidth;
        tempCanvas.height = sourceHeightPx;
        const ctx = tempCanvas.getContext('2d');
        
        if (!ctx) {
          throw new Error('Failed to get canvas context');
        }

        // Draw portion of image
        ctx.drawImage(img, 0, sourceY, imgWidth, sourceHeightPx, 0, 0, imgWidth, sourceHeightPx);
        const portionData = tempCanvas.toDataURL('image/png', 1.0);
        
        // Add to PDF
        pdf.addImage(
          portionData,
          'PNG',
          margin,
          yPos,
          scaledWidth,
          heightToAdd
        );

        remainingHeight -= heightToAdd;
        sourceY += sourceHeightPx;

        if (remainingHeight > 0) {
          pdf.addPage();
          yPos = margin;
        }
      }

      // Add footer to all pages
      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        const footerY = pageHeight - 6;
        
        pdf.setDrawColor(0, 70, 255);
        pdf.setLineWidth(0.2);
        pdf.line(margin, footerY, pageWidth - margin, footerY);
        
        pdf.setFontSize(6);
        pdf.setTextColor(100, 100, 120);
        pdf.setFont('helvetica', 'normal');
        pdf.text('Attendify - Intelligent Attendance Management System', margin, footerY + 4);
        pdf.text(`Page ${i} of ${totalPages}`, pageWidth - margin, footerY + 4, { align: 'right' });
      }

      // Save PDF
      const fileName = `Attendify_Report_${now.toISOString().split('T')[0]}_${now.getTime()}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert(`An error occurred while generating the PDF: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-4 lg:p-6" ref={dashboardRef} data-dashboard-pdf>
      <div className="max-w-7xl mx-auto space-y-6 lg:space-y-8">
        {/* Page Title */}
        <div className="mt-6">
          <h2 
            className="text-3xl lg:text-4xl font-bold"
            style={{ color: 'var(--text-primary)' }}
          >
            <AnimatedText speed={35}>
              {t.dashboard.title}
            </AnimatedText>
          </h2>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {summaryCards.map((card, index) => (
            <div
              key={index}
              className="backdrop-blur-2xl rounded-3xl border shadow-2xl p-6 space-y-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-[#0046FF]/20 group relative overflow-hidden"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border-primary)'
              }}
            >
              {/* Gradient overlay on hover */}
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
                    backgroundColor: 'rgba(0, 70, 255, 0.15)',
                    color: '#0046FF',
                    border: '1px solid rgba(0, 70, 255, 0.2)'
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
                  <AnimatedText speed={50}>
                    {card.title}
                  </AnimatedText>
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

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          {/* Attendance Overview Chart */}
          <div 
            className="lg:col-span-2 backdrop-blur-2xl rounded-3xl border shadow-2xl p-6 lg:p-8 transition-all duration-300 hover:shadow-[#0046FF]/20"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderColor: 'var(--border-primary)'
            }}
          >
            <div className="mb-6">
              <h3 
                className="text-xl font-bold mb-1"
                style={{ color: 'var(--text-primary)' }}
              >
                <AnimatedText speed={40}>
                  {t.dashboard.attendanceOverview}
                </AnimatedText>
              </h3>
              <p 
                className="text-sm"
                style={{ color: 'var(--text-quaternary)' }}
              >
                Last 7 days
              </p>
            </div>
            {/* Attendance Overview Chart */}
            <div 
              ref={chart1Ref}
              className="h-[380px] rounded-xl relative overflow-hidden p-4"
              style={{
                backgroundColor: 'var(--bg-tertiary)',
              }}
            >
              <AttendanceOverviewChart />
            </div>
          </div>

          {/* Attendance Distribution Chart */}
          <div 
            className="backdrop-blur-2xl rounded-3xl border shadow-2xl p-6 lg:p-8 transition-all duration-300 hover:shadow-[#0046FF]/20"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderColor: 'var(--border-primary)'
            }}
          >
            <div className="mb-6">
              <h3 
                className="text-xl font-bold mb-1"
                style={{ color: 'var(--text-primary)' }}
              >
                <AnimatedText speed={40}>
                  {t.dashboard.attendanceDistribution}
                </AnimatedText>
              </h3>
              <p 
                className="text-sm"
                style={{ color: 'var(--text-quaternary)' }}
              >
                This month
              </p>
            </div>
            {/* Attendance Distribution Pie Chart */}
            <div 
              ref={chart2Ref}
              className="h-[380px] rounded-xl relative overflow-hidden p-4"
              style={{
                backgroundColor: 'var(--bg-tertiary)',
              }}
            >
              <AttendanceDistributionChart />
            </div>
          </div>
        </div>

        {/* Generate Report Button */}
        <div className="flex justify-end pt-2">
          <button
            onClick={generatePDF}
            disabled={isGenerating}
            className="px-8 py-4 bg-gradient-to-r from-[#0046FF] to-[#001BB7] text-white font-semibold rounded-xl shadow-lg shadow-[#0046FF]/25 hover:shadow-[#0046FF]/40 focus:outline-none focus:ring-2 focus:ring-[#0046FF] focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden group hover:from-[#0055FF] hover:to-[#0025CC] flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isGenerating ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin relative z-10" />
                <span className="relative z-10">Generating PDF...</span>
              </>
            ) : (
              <>
                <span className="relative z-10">
                  <AnimatedText speed={40}>
                    {t.dashboard.generateReport}
                  </AnimatedText>
                </span>
                <svg
                  className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300 relative z-10"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {/* Shine effect */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
