import { Routes, Route, Outlet } from 'react-router-dom';
import Header from './components/Header';
import RequireAuth from './components/auth/RequireAuth';
import LoginPage from './pages/LoginPage';
import ScanPage from './pages/ScanPage';
import SearchPage from './pages/SearchPage';
import ImportPage from './pages/ImportPage';
import LogsPage from './pages/LogsPage';
import LogDetailPage from './pages/LogDetailPage';
import UnmatchedRecordsPage from './pages/UnmatchedRecordsPage';
import UsersPage from './pages/UsersPage';
import UserManualPage from './pages/UserManualPage';

const AppLayout = () => (
  <div className="min-h-screen bg-slate-50">
    <Header />
    <main className="mx-auto container px-4 py-6 sm:px-6 lg:px-8">
      <Outlet />
    </main>
  </div>
);

const App = () => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />

    <Route
      element={
        <RequireAuth>
          <AppLayout />
        </RequireAuth>
      }
    >
      <Route path="/" element={<ScanPage />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/import" element={<ImportPage />} />
      <Route path="/logs" element={<LogsPage />} />
      <Route path="/logs/:id" element={<LogDetailPage />} />
      <Route path="/unmatched" element={<UnmatchedRecordsPage />} />
      <Route path="/manual" element={<UserManualPage />} />
    </Route>

    <Route
      element={
        <RequireAuth adminOnly>
          <AppLayout />
        </RequireAuth>
      }
    >
      <Route path="/users" element={<UsersPage />} />
    </Route>
  </Routes>
);

export default App;
