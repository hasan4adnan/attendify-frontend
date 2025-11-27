# Attendify Frontend

<img width="1707" height="922" alt="Ekran Resmi 2025-11-23 19 20 21" src="https://github.com/user-attachments/assets/8185bec0-ffe6-4302-9c54-960f078b4b80" />

A modern, responsive web application for managing student attendance using face verification technology. Built with Next.js, React, and TypeScript, Attendify provides an intuitive interface for educators to track attendance, manage students and courses, generate reports, and analyze attendance data.

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Development](#development)
- [Build & Deployment](#build--deployment)
- [Environment Variables](#environment-variables)
- [State Management](#state-management)
- [Internationalization](#internationalization)
- [Theming](#theming)
- [Dependencies](#dependencies)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Project Overview

Attendify is a comprehensive attendance management system designed for educational institutions. The frontend application provides a user-friendly interface for:

- **User Authentication**: Secure login and signup flows with email verification
- **Dashboard**: Real-time attendance overview with visual analytics
- **Student Management**: Add, edit, and manage student information with face verification status
- **Course Management**: Create and manage courses with scheduling and student enrollment
- **Attendance Tracking**: Face verification-based attendance sessions with live camera feed
- **Reports & Analytics**: Comprehensive attendance reports with charts and insights
- **Settings**: User profile management, security settings, and application preferences
- **Profile Management**: Update personal information, change password, and manage profile photo

The application features a modern, glassmorphic UI design with smooth animations, dark/light theme support, and bilingual support (English/Turkish).

## 🛠 Tech Stack

### Core Framework
- **Next.js** `16.0.1` - React framework with App Router
- **React** `19.2.0` - UI library
- **TypeScript** `^5` - Type safety

### Styling
- **Tailwind CSS** `^4` - Utility-first CSS framework
- **PostCSS** `@tailwindcss/postcss` - CSS processing

### Data Visualization
- **Recharts** `^3.4.1` - Chart library for attendance analytics

### Development Tools
- **ESLint** `^9` - Code linting with Next.js config
- **Node.js** `20+` - Runtime environment (recommended)

### Fonts
- **Geist Sans** & **Geist Mono** - Via `next/font/google`

## ✨ Features

### Authentication
- **Login Page**: Email and password authentication
- **Signup Flow**: Multi-step registration process with:
  - University selection
  - Educational email verification
  - Personal information collection
  - Password creation
  - Email verification code

### Dashboard
- Real-time attendance metrics
- Today's attendance overview
- Total students count
- Active sessions tracking
- Attendance rate visualization
- Interactive charts:
  - Attendance Overview Chart (Bar chart by day)
  - Attendance Distribution Chart (Pie chart)

### Student Management

<img width="1707" height="925" alt="Ekran Resmi 2025-11-23 19 21 46" src="https://github.com/user-attachments/assets/98068c10-3964-4635-ad88-f5eb44c447fc" />


- Add, edit, and delete students
- Student search functionality
- Face verification status tracking:
  - Verified
  - Pending
  - Not Verified
- Manual face scan initiation
- Verification email sending
- Course assignment to students
- Attendance history per student
- Attendance override capabilities

### Course Management

<img width="1709" height="921" alt="Ekran Resmi 2025-11-23 19 24 27" src="https://github.com/user-attachments/assets/b09faf70-9a33-45a4-8ac3-fec1f96a1ba6" />


- Create and manage courses
- Course details:
  - Course name and code
  - Description
  - Weekly hours
  - Schedule (days and times)
  - Classroom/room number
  - Semester and academic year
  - Course category (Theoretical, Applied, Lab)
  - Instructor name
- Student enrollment management
- Course search and filtering

### Attendance Sessions

<img width="1708" height="920" alt="Ekran Resmi 2025-11-23 19 25 06" src="https://github.com/user-attachments/assets/41ae325f-717a-4561-9f20-10f57167f23f" />


- Course selection for attendance
- Pre-session system checks:
  - Course validation
  - Camera detection
  - System readiness
- Live attendance session with camera feed
- Session controls:
  - Pause/Resume session
  - End session with confirmation
- Real-time face recognition
- Session completion with data analysis
- Attendance report generation

### Reports & Analytics

<img width="1709" height="927" alt="Ekran Resmi 2025-11-23 19 25 42" src="https://github.com/user-attachments/assets/3f564bbb-1dc0-4660-865b-def42e16a45f" />


- Comprehensive attendance reports
- Filtering options:
  - By course
  - By date range (This Week, This Month, Last 3 Months)
  - By session type
- Metrics display:
  - Overall attendance rate
  - Average attendance per session
  - Total sessions
  - Students at risk
- Visual analytics:
  - Attendance overview charts
  - Attendance by session/week/month
- Student-specific reports
- Session details with student lists
- Export functionality

### Settings

<img width="1709" height="924" alt="Ekran Resmi 2025-11-23 19 26 11" src="https://github.com/user-attachments/assets/c098a56f-7f50-4fd5-83ed-f077a8b251c1" />


- **Profile Settings**:
  - Update personal information
  - Change profile photo
  - School/institution information
- **Security Settings**:
  - Password management
  - Two-factor authentication (UI ready)
  - Recovery codes
- **Application Preferences**:
  - Language selection (English/Turkish)
  - Theme selection (Light/Dark/System)
- **Notification Preferences**:
  - Attendance session updates
  - System updates
  - New student notifications
  - Report ready notifications
  - Weekly summary emails
- **Danger Zone**:
  - Account deletion with password confirmation

### Profile Page
- Personal information display and editing
- Profile photo management
- Password change functionality
- Role and account information

### UI/UX Features

https://github.com/user-attachments/assets/ffe2bc36-db70-4409-8843-6a36f327c633


- **Responsive Design**: Mobile-first approach with collapsible sidebar
- **Theme Support**: Dark, Light, and System theme modes with smooth transitions
- **Internationalization**: English and Turkish language support with animated text transitions
- **Animations**: Smooth page transitions, hover effects, and loading states
- **Accessibility**: Semantic HTML and ARIA labels
- **Glassmorphic Design**: Modern UI with backdrop blur effects

## 📁 Project Structure

```
attendify-frontend/
├── app/
│   ├── (dashboard)/              # Dashboard route group
│   │   ├── attendance/
│   │   │   └── page.tsx           # Attendance page
│   │   ├── courses/
│   │   │   └── page.tsx           # Courses page
│   │   ├── dashboard/
│   │   │   └── page.tsx           # Dashboard page
│   │   ├── layout.tsx              # Dashboard layout
│   │   ├── profile/
│   │   │   └── page.tsx           # Profile page
│   │   ├── reports/
│   │   │   └── page.tsx           # Reports page
│   │   ├── settings/
│   │   │   └── page.tsx           # Settings page
│   │   └── students/
│   │       └── page.tsx           # Students page
│   ├── components/
│   │   ├── charts/
│   │   │   ├── AttendanceDistributionChart.tsx
│   │   │   └── AttendanceOverviewChart.tsx
│   │   ├── layout/
│   │   │   └── MainLayout.tsx     # Main layout wrapper
│   │   ├── ActionMenu.tsx
│   │   ├── AnimatedText.tsx       # Animated text for i18n
│   │   ├── LanguageToggle.tsx
│   │   ├── Sidebar.tsx            # Navigation sidebar
│   │   ├── TermsPrivacyModal.tsx
│   │   ├── ThemeToggle.tsx
│   │   └── TopBar.tsx             # Top navigation bar
│   ├── context/
│   │   ├── LanguageContext.tsx    # i18n context
│   │   ├── ThemeContext.tsx       # Theme context
│   │   └── UserContext.tsx        # User state context
│   ├── Screens/                   # Screen components
│   │   ├── attendance.tsx
│   │   ├── courses.tsx
│   │   ├── dashboard.tsx
│   │   ├── login.tsx
│   │   ├── profile.tsx
│   │   ├── reports.tsx
│   │   ├── settings.tsx
│   │   ├── signup.tsx
│   │   └── students.tsx
│   ├── translations/              # i18n translations
│   │   ├── en.ts                  # English translations
│   │   └── tr.ts                  # Turkish translations
│   ├── utils/
│   │   └── courseData.ts          # Course data utilities
│   ├── favicon.ico
│   ├── globals.css                # Global styles and theme
│   ├── layout.tsx                 # Root layout
│   ├── page.tsx                   # Home/login page
│   └── signup/
│       └── page.tsx               # Signup page
├── public/                        # Static assets
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
├── eslint.config.mjs              # ESLint configuration
├── next.config.ts                 # Next.js configuration
├── next-env.d.ts                  # Next.js type definitions
├── package.json                   # Dependencies and scripts
├── package-lock.json              # Lock file
├── postcss.config.mjs             # PostCSS configuration
├── tsconfig.json                  # TypeScript configuration
└── README.md                      # This file
```

## 🚀 Installation

### Prerequisites

- **Node.js** `20.x` or higher (recommended: use `nvm` to manage versions)
- **npm** or **yarn** or **pnpm** package manager

### Setup Node.js Version

If using `nvm` (Node Version Manager):

```bash
# Install Node.js 20
nvm install 20

# Use Node.js 20 for this session
nvm use 20

# Or set as default
nvm alias default 20
```

### Install Dependencies

```bash
# Using npm
npm install

# Using yarn
yarn install

# Using pnpm
pnpm install
```

## 💻 Development

### Start Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build production bundle
- `npm run start` - Start production server (after build)
- `npm run lint` - Run ESLint

### Development Notes

- The app uses **Next.js App Router** with React Server Components
- Hot Module Replacement (HMR) is enabled for fast development
- TypeScript strict mode is enabled
- ESLint runs automatically in development

## 🏗 Build & Deployment

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `.next` directory.

### Start Production Server

```bash
npm run start
```

### Deploy to Vercel

The easiest way to deploy is using [Vercel](https://vercel.com):

1. Push your code to GitHub/GitLab/Bitbucket
2. Import your repository in Vercel
3. Vercel will automatically detect Next.js and configure the build

Or use Vercel CLI:

```bash
npm i -g vercel
vercel
```

### Other Deployment Options

- **Docker**: Create a Dockerfile and deploy to any container platform
- **Static Export**: Configure `next.config.ts` for static site generation
- **Custom Server**: Deploy to Node.js hosting services

## 🔐 Environment Variables

Currently, the application uses localStorage for data persistence. For production, you'll need to configure environment variables for API integration.

Create a `.env.local` file in the root directory:

```env
# API Configuration (when backend is ready)
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_API_TIMEOUT=30000

# Feature Flags (optional)
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_ERROR_TRACKING=false
```

**Note**: Environment variables prefixed with `NEXT_PUBLIC_` are exposed to the browser. Keep sensitive keys server-side only.

## 📊 State Management

The application uses **React Context API** for state management:

### ThemeContext
- Manages theme state (dark/light/system)
- Persists theme preference in localStorage
- Handles system theme detection
- Provides smooth theme transitions

### LanguageContext
- Manages language state (English/Turkish)
- Persists language preference in localStorage
- Provides translation function `t()`
- Handles animated text transitions

### UserContext
- Manages user profile state
- Handles user data persistence
- Provides user update functions
- Currently uses localStorage (ready for API integration)

### Data Persistence

Currently, the app uses **localStorage** for:
- User profile data
- Course data
- Theme preferences
- Language preferences

**Note**: In production, this should be replaced with API calls to a backend service.

## 🌍 Internationalization

The application supports **English** and **Turkish** languages.

### Translation Files
- `app/translations/en.ts` - English translations
- `app/translations/tr.ts` - Turkish translations

### Usage

```tsx
import { useLanguage } from '@/app/context/LanguageContext';

function MyComponent() {
  const { t, language, setLanguage } = useLanguage();
  
  return (
    <div>
      <h1>{t.dashboard.title}</h1>
      <button onClick={() => setLanguage('tr')}>Türkçe</button>
    </div>
  );
}
```

### Adding New Translations

1. Add the key-value pair to both `en.ts` and `tr.ts`
2. Use the key in components via `t.path.to.key`

## 🎨 Theming

The application supports three theme modes:

- **Dark** - Default dark theme
- **Light** - Light theme
- **System** - Follows OS preference

### Theme Implementation

Themes are implemented using CSS custom properties in `globals.css`:

```css
:root,
[data-theme="dark"] {
  --bg-primary: #060128;
  --text-primary: #ffffff;
  /* ... */
}

[data-theme="light"] {
  --bg-primary: #f5f1dc;
  --text-primary: #0a0a0f;
  /* ... */
}
```

### Usage

```tsx
import { useTheme } from '@/app/context/ThemeContext';

function MyComponent() {
  const { theme, setTheme, toggleTheme, actualTheme } = useTheme();
  
  return (
    <div style={{ backgroundColor: 'var(--bg-primary)' }}>
      <button onClick={toggleTheme}>Toggle Theme</button>
    </div>
  );
}
```

## 📦 Dependencies

### Production Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `next` | `16.0.1` | React framework |
| `react` | `19.2.0` | UI library |
| `react-dom` | `19.2.0` | React DOM renderer |
| `recharts` | `^3.4.1` | Chart library |

### Development Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `@tailwindcss/postcss` | `^4` | Tailwind CSS PostCSS plugin |
| `@types/node` | `^20` | Node.js type definitions |
| `@types/react` | `^19` | React type definitions |
| `@types/react-dom` | `^19` | React DOM type definitions |
| `eslint` | `^9` | Linter |
| `eslint-config-next` | `16.0.1` | Next.js ESLint config |
| `tailwindcss` | `^4` | CSS framework |
| `typescript` | `^5` | TypeScript compiler |

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** following the code style:
   - Use TypeScript for all new files
   - Follow existing component patterns
   - Add translations for new UI text
   - Ensure responsive design
4. **Test your changes**:
   - Run `npm run lint` to check for errors
   - Test in both light and dark themes
   - Test in both English and Turkish
   - Test on mobile and desktop
5. **Commit your changes**: `git commit -m 'Add amazing feature'`
6. **Push to the branch**: `git push origin feature/amazing-feature`
7. **Open a Pull Request**

### Code Style Guidelines

- Use functional components with hooks
- Prefer TypeScript interfaces over types for props
- Use meaningful variable and function names
- Add comments for complex logic
- Follow the existing file structure
- Use CSS variables for theming
- Ensure accessibility (ARIA labels, semantic HTML)

## 📄 License

This project is part of the **SE 342 Software Validation and Testing** course project at **Maltepe University**.

### Team Members

-  **Hasan Muayad Adnan Al-Saedi** - Student ID: 220706802
-  **Mert Temiz** - Student ID: 220706003
-  **Mürsel Yıldırım** - Student ID: 23070603
-  **Erden Dinç** - Student ID: 220706045

**Note**: This is an academic project. For license information, please refer to the LICENSE file in the repository root or contact the project maintainers.

---

## 📸 Screenshots

*Screenshots will be added here. Place your screenshots in a `docs/screenshots/` directory and reference them:*

- `docs/screenshots/dashboard.png` - Dashboard overview
- `docs/screenshots/attendance-session.png` - Live attendance session
- `docs/screenshots/reports.png` - Reports and analytics
- `docs/screenshots/students.png` - Student management
- `docs/screenshots/settings.png` - Settings page

---

**Built with ❤️ using Next.js and React**
