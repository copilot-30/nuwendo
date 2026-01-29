const API_URL = 'http://localhost:5000/api';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

// Step 1: Send verification code to email
export const sendVerificationCode = async (email: string) => {
  const response = await fetch(`${API_URL}/auth/send-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Failed to send verification code');
  }

  return data;
};

// Step 2: Verify the code
export const verifyCode = async (email: string, code: string) => {
  const response = await fetch(`${API_URL}/auth/verify-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code })
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Invalid verification code');
  }

  return data;
};

// Step 3: Complete registration with password
export const completeRegistration = async (
  email: string, 
  code: string, 
  password: string, 
  firstName: string, 
  lastName: string
) => {
  const response = await fetch(`${API_URL}/auth/complete-registration`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code, password, firstName, lastName })
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Registration failed');
  }

  // Save token to localStorage
  if (data.data?.token) {
    localStorage.setItem('authToken', data.data.token);
  }

  return data;
};

// Old register function (kept for backward compatibility, but won't be used)
export const register = async (email: string, password: string, firstName: string, lastName: string) => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, firstName, lastName })
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Registration failed');
  }

  // Save token to localStorage
  if (data.data?.token) {
    localStorage.setItem('authToken', data.data.token);
  }

  return data;
};

// Login user
export const login = async (email: string, password: string) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Login failed');
  }

  // Save token to localStorage
  if (data.data?.token) {
    localStorage.setItem('authToken', data.data.token);
  }

  return data;
};

// Get user profile
export const getProfile = async () => {
  const response = await fetch(`${API_URL}/auth/profile`, {
    method: 'GET',
    headers: getAuthHeaders()
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch profile');
  }

  return data;
};

// Update user profile
export const updateProfile = async (firstName: string, lastName: string) => {
  const response = await fetch(`${API_URL}/auth/profile`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ firstName, lastName })
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Failed to update profile');
  }

  return data;
};

// Logout user
export const logout = () => {
  localStorage.removeItem('authToken');
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!localStorage.getItem('authToken');
};

// Get dashboard stats
export const getDashboardStats = async () => {
  const response = await fetch(`${API_URL}/patient/dashboard/stats`, {
    method: 'GET',
    headers: getAuthHeaders()
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch dashboard stats');
  }

  return data;
};

// Get appointments
export const getAppointments = async () => {
  const response = await fetch(`${API_URL}/patient/appointments`, {
    method: 'GET',
    headers: getAuthHeaders()
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch appointments');
  }

  return data;
};

// Get medications
export const getMedications = async () => {
  const response = await fetch(`${API_URL}/patient/medications`, {
    method: 'GET',
    headers: getAuthHeaders()
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch medications');
  }

  return data;
};

// Get medical records
export const getMedicalRecords = async () => {
  const response = await fetch(`${API_URL}/patient/medical-records`, {
    method: 'GET',
    headers: getAuthHeaders()
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch medical records');
  }

  return data;
};
