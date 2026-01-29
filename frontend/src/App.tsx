import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { LandingPage } from '@/pages/LandingPage'
import { SignUp } from '@/pages/SignUp'
import { VerifyCode } from '@/pages/VerifyCode'
import { ChooseService } from '@/pages/ChooseService'
import { ChooseSchedule } from '@/pages/ChooseSchedule'
import { PatientDetails } from '@/pages/PatientDetails'
import { Payment } from '@/pages/Payment'
import { Confirmation } from '@/pages/Confirmation'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/verify-code" element={<VerifyCode />} />
        <Route path="/choose-service" element={<ChooseService />} />
        <Route path="/choose-schedule" element={<ChooseSchedule />} />
        <Route path="/patient-details" element={<PatientDetails />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/confirmation" element={<Confirmation />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
