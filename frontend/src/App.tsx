import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { LandingPage } from '@/pages/LandingPage'
import SignUp from '@/pages/SignUp'
import VerifyCode from '@/pages/VerifyCode'
import ChooseService from '@/pages/ChooseService'
import ChooseSchedule from '@/pages/ChooseSchedule'
import Payment from '@/pages/Payment'
import Confirmation from '@/pages/Confirmation'
import { AdminLogin } from '@/pages/AdminLogin'
import { AdminDashboard } from '@/pages/AdminDashboard'
import { AdminServices } from '@/pages/AdminServices'
import { AdminSchedule } from '@/pages/AdminSchedule'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Patient Booking Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/verify-code" element={<VerifyCode />} />
        <Route path="/choose-service" element={<ChooseService />} />
        <Route path="/choose-schedule" element={<ChooseSchedule />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/confirmation" element={<Confirmation />} />
        
        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/services" element={<AdminServices />} />
        <Route path="/admin/schedule" element={<AdminSchedule />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
