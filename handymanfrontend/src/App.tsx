import { Route, Routes, Navigate } from "react-router-dom";
import "./App.css";
import { MainLayout } from "./components/layout/MainLayout";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";
import { LoginPage } from "./features/auth/LoginPage";
import { RegisterPage } from "./features/auth/RegisterPage";
import { RegisterCustomerPage } from "./features/auth/RegisterCustomerPage";
import { RegisterWorkerPage } from "./features/auth/RegisterWorkerPage";
import { BookingHistoryPage } from "./features/booking/BookingHistoryPage";
import { HandymanDetailPage } from "./features/handyman/HandymanDetailPage";
import { HandymanListPage } from "./features/handyman/HandymanListPage";
import { HomePage } from "./pages/HomePage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { ProfilePage } from "./pages/ProfilePage";
import { WorkerProfilePage } from "./pages/WorkerProfilePage";
import { WorkerJobsPage } from "./pages/WorkerJobsPage";
import { WorkerEarningsPage } from "./pages/WorkerEarningsPage";
import { WorkerProfileSettingsPage } from "./pages/WorkerProfileSettingsPage";
import { WorkerReviewsPage } from "./pages/WorkerReviewsPage";
import { CustomerGigsPage } from "./pages/CustomerGigsPage";
import { JobBoardPage } from "./pages/JobBoardPage";
import { AdminDashboardPage } from "./pages/AdminDashboardPage";
import { AdminWorkersPage } from "./pages/AdminWorkersPage";
import { AdminServicesPage } from "./pages/AdminServicesPage";
import { AdminCustomersPage } from "./pages/AdminCustomersPage";

function App() {
  return (
    <div className="app">
      <Routes>
        {/* Public Routes with Navbar and Footer */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/handymen" element={<HandymanListPage />} />
          <Route path="/handymen/:id" element={<HandymanDetailPage />} />
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/register" element={<RegisterPage />} />
          <Route path="/auth/register/customer" element={<RegisterCustomerPage />} />
          <Route path="/auth/register/worker" element={<RegisterWorkerPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/bookings" element={<BookingHistoryPage />} />
          </Route>
        </Route>

        {/* Dashboards - No Global Navbar/Footer */}
        <Route element={<ProtectedRoute allowedRoles={["Customer"]} />}>
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/customer/gigs" element={<CustomerGigsPage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["Worker"]} />}>
          <Route path="/profile/worker" element={<WorkerProfilePage />} />
          <Route path="/worker/jobs" element={<WorkerJobsPage />} />
          <Route path="/worker/earnings" element={<WorkerEarningsPage />} />
          <Route path="/worker/settings" element={<WorkerProfileSettingsPage />} />
          <Route path="/worker/reviews" element={<WorkerReviewsPage />} />
          <Route path="/worker/job-board" element={<JobBoardPage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["Admin"]} />}>
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/workers" element={<AdminWorkersPage />} />
          <Route path="/admin/services" element={<AdminServicesPage />} />
          <Route path="/admin/customers" element={<AdminCustomersPage />} />
        </Route>

        {/* 404 - Ideally with Navbar but we can just use MainLayout wrapper */}
        <Route element={<MainLayout />}>
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
