import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { LandingPage } from '@/pages/LandingPage'
import { SignUp } from '@/pages/SignUp'
import { VerifyCode } from '@/pages/VerifyCode'
import { SetupPassword } from '@/pages/SetupPassword'
import { Login } from '@/pages/Login'
import { PatientDashboard } from '@/pages/PatientDashboard'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/verify-code" element={<VerifyCode />} />
        <Route path="/setup-password" element={<SetupPassword />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<PatientDashboard />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
