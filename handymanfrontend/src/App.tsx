import { Route, Routes } from "react-router-dom";
import "./App.css";
import { Navbar } from "./components/layout/Navbar";
import { Footer } from "./components/layout/Footer";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";
import { LoginPage } from "./features/auth/LoginPage";
import { RegisterPage } from "./features/auth/RegisterPage";
import { RegisterCustomerPage } from "./features/auth/RegisterCustomerPage";
import { RegisterWorkerPage } from "./features/auth/RegisterWorkerPage";
import { BookingHistoryPage } from "./features/booking/BookingHistoryPage";
import { HandymanDetailPage } from "./features/handyman/HandymanDetailPage";
import { HandymanListPage } from "./features/handyman/HandymanListPage";
import { HomePage } from "./pages/HomePage";
import { AdminPage } from "./pages/AdminPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { ProfilePage } from "./pages/ProfilePage";
import { WorkerProfilePage } from "./pages/WorkerProfilePage";
import { WorkerJobsPage } from "./pages/WorkerJobsPage";
import { WorkerEarningsPage } from "./pages/WorkerEarningsPage";
import { WorkerProfileSettingsPage } from "./pages/WorkerProfileSettingsPage";
import { WorkerReviewsPage } from "./pages/WorkerReviewsPage";

function App() {
  return (
    <div className="app">
      <Navbar />
      <main className="main">
        <Routes>
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
          <Route element={<ProtectedRoute allowedRoles={["Customer"]} />}>
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={["Worker"]} />}>
            <Route path="/profile/worker" element={<WorkerProfilePage />} />
            <Route path="/worker/jobs" element={<WorkerJobsPage />} />
            <Route path="/worker/earnings" element={<WorkerEarningsPage />} />
            <Route path="/worker/settings" element={<WorkerProfileSettingsPage />} />
            <Route path="/worker/reviews" element={<WorkerReviewsPage />} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={["Admin"]} />}>
            <Route path="/admin" element={<AdminPage />} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
