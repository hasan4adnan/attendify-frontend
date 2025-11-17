'use client';

import { useLanguage } from '../context/LanguageContext';
import AnimatedText from '../components/AnimatedText';

export default function DashboardPage() {
  const { t } = useLanguage();

  const summaryCards = [
    { title: t.dashboard.todayAttendance, value: '245', change: '+12%', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', gradient: 'from-[#0046FF] to-[#001BB7]' },
    { title: t.dashboard.totalStudents, value: '1,234', change: '+5%', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', gradient: 'from-[#FF8040] to-[#FF6B35]' },
    { title: t.dashboard.activeSessions, value: '18', change: '+3', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', gradient: 'from-[#001BB7] to-[#0046FF]' },
    { title: t.dashboard.attendanceRate, value: '94.2%', change: '+2.1%', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', gradient: 'from-[#0046FF] via-[#FF8040] to-[#FF6B35]' },
  ];

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
              {t.dashboard.title}
            </AnimatedText>
          </h2>
          <div className="h-1 w-20 bg-gradient-to-r from-[#0046FF] to-[#FF8040] rounded-full" />
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
            <div className="flex items-center justify-between mb-6">
              <div>
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
              <button
                className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg group relative overflow-hidden"
                style={{
                  backgroundColor: 'var(--bg-tertiary)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-primary)'
                }}
              >
                <div 
                  className="absolute inset-0 bg-gradient-to-r from-[#0046FF] to-[#001BB7] opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-xl"
                />
                <span className="relative z-10">View All</span>
              </button>
            </div>
            {/* Chart Placeholder */}
            <div 
              className="h-64 lg:h-80 rounded-xl flex items-center justify-center relative overflow-hidden"
              style={{
                backgroundColor: 'var(--bg-tertiary)',
                border: '2px dashed var(--border-primary)'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#0046FF]/5 to-[#001BB7]/5" />
              <div className="text-center space-y-3 relative z-10">
                <svg
                  className="w-20 h-20 mx-auto"
                  style={{ color: 'var(--text-quaternary)' }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <p 
                  className="text-sm font-medium"
                  style={{ color: 'var(--text-quaternary)' }}
                >
                  Chart Placeholder
                </p>
              </div>
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
            {/* Pie Chart Placeholder */}
            <div 
              className="h-64 lg:h-80 rounded-xl flex items-center justify-center relative overflow-hidden"
              style={{
                backgroundColor: 'var(--bg-tertiary)',
                border: '2px dashed var(--border-primary)'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#FF8040]/5 to-[#FF6B35]/5" />
              <div className="text-center space-y-3 relative z-10">
                <svg
                  className="w-20 h-20 mx-auto"
                  style={{ color: 'var(--text-quaternary)' }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                </svg>
                <p 
                  className="text-sm font-medium"
                  style={{ color: 'var(--text-quaternary)' }}
                >
                  Pie Chart Placeholder
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Generate Report Button */}
        <div className="flex justify-end pt-2">
          <button
            className="px-8 py-4 bg-gradient-to-r from-[#0046FF] to-[#001BB7] text-white font-semibold rounded-xl shadow-lg shadow-[#0046FF]/25 hover:shadow-[#0046FF]/40 focus:outline-none focus:ring-2 focus:ring-[#0046FF] focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden group hover:from-[#0055FF] hover:to-[#0025CC] flex items-center gap-3"
          >
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
          </button>
        </div>
      </div>
    </div>
  );
}
