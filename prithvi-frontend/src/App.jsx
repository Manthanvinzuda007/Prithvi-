import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ToastProvider from './components/shared/Toast';

// Shared pages
import HomePage from './pages/shared/HomePage';
import LoginPage from './pages/shared/LoginPage';
import RegisterPage from './pages/shared/RegisterPage';

// Student pages
import StudentLayout from './pages/student/StudentLayout';
import StudentDashboard from './pages/student/StudentDashboard';
import StudentExplore from './pages/student/StudentExplore';
import StudentLessons from './pages/student/StudentLessons';
import LessonPlayer from './pages/student/LessonPlayer';
import StudentTasks from './pages/student/StudentTasks';
import StudentGames from './pages/student/StudentGames';
import StudentContests from './pages/student/StudentContests';
import StudentProfile from './pages/student/StudentProfile';

// Teacher pages
import TeacherLayout from './pages/teacher/TeacherLayout';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import TeacherTaskReview from './pages/teacher/TeacherTaskReview';
import TeacherAssignTask from './pages/teacher/TeacherAssignTask';
import TeacherLessons from './pages/teacher/TeacherLessons';
import TeacherStudents from './pages/teacher/TeacherStudents';
import TeacherAnalytics from './pages/teacher/TeacherAnalytics';

function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="full-loading">
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>🌍</div>
          <div className="spinner dark" />
        </div>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) {
    return <Navigate to={user.role === 'teacher' ? '/teacher' : '/student'} replace />;
  }
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <Routes>
          {/* Public */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Student Portal */}
          <Route path="/student" element={
            <ProtectedRoute role="student">
              <StudentLayout />
            </ProtectedRoute>
          }>
            <Route index element={<StudentDashboard />} />
            <Route path="explore" element={<StudentExplore />} />
            <Route path="lessons" element={<StudentLessons />} />
            <Route path="lessons/:id" element={<LessonPlayer />} />
            <Route path="tasks" element={<StudentTasks />} />
            <Route path="games" element={<StudentGames />} />
            <Route path="contests" element={<StudentContests />} />
            <Route path="profile" element={<StudentProfile />} />
          </Route>

          {/* Teacher Portal */}
          <Route path="/teacher" element={
            <ProtectedRoute role="teacher">
              <TeacherLayout />
            </ProtectedRoute>
          }>
            <Route index element={<TeacherDashboard />} />
            <Route path="task-review" element={<TeacherTaskReview />} />
            <Route path="assign-task" element={<TeacherAssignTask />} />
            <Route path="lessons" element={<TeacherLessons />} />
            <Route path="students" element={<TeacherStudents />} />
            <Route path="analytics" element={<TeacherAnalytics />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  );
}
