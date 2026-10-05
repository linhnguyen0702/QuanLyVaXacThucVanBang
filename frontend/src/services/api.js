const API_BASE_URL = 'http://localhost:5000/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

export const api = {
  // Auth
  login: async (email, password, role) => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role })
    });
    return res.json();
  },

  register: async (userData) => {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return res.json();
  },

  getMe: async () => {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getHeaders()
    });
    return res.json();
  },

  // Certificates
  getCertificates: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE_URL}/certificates?${query}`, {
      headers: getHeaders()
    });
    return res.json();
  },

  getCertificateById: async (id) => {
    const res = await fetch(`${API_BASE_URL}/certificates/${id}`, {
      headers: getHeaders()
    });
    return res.json();
  },

  createCertificate: async (data) => {
    const res = await fetch(`${API_BASE_URL}/certificates`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  revokeCertificate: async (id, reason) => {
    const res = await fetch(`${API_BASE_URL}/certificates/${id}/revoke`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ reason })
    });
    return res.json();
  },

  getStatsSummary: async () => {
    const res = await fetch(`${API_BASE_URL}/certificates/stats/summary`);
    return res.json();
  },

  // Verification
  verifyCertificate: async (queryStr, method = 'certificate_code') => {
    const res = await fetch(`${API_BASE_URL}/verification/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: queryStr, method })
    });
    return res.json();
  },

  getVerificationLogs: async () => {
    const res = await fetch(`${API_BASE_URL}/verification/logs`, {
      headers: getHeaders()
    });
    return res.json();
  },

  // Schools
  getSchools: async (search = '') => {
    const res = await fetch(`${API_BASE_URL}/schools?search=${encodeURIComponent(search)}`);
    return res.json();
  },

  createSchool: async (data) => {
    const res = await fetch(`${API_BASE_URL}/schools`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // Students
  getStudents: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE_URL}/students?${query}`, {
      headers: getHeaders()
    });
    return res.json();
  },

  createStudent: async (data) => {
    const res = await fetch(`${API_BASE_URL}/students`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  updateStudent: async (id, data) => {
    const res = await fetch(`${API_BASE_URL}/students/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  deleteStudent: async (id) => {
    const res = await fetch(`${API_BASE_URL}/students/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return res.json();
  },

  // Certificates
  updateCertificate: async (id, data) => {
    const res = await fetch(`${API_BASE_URL}/certificates/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  deleteCertificate: async (id) => {
    const res = await fetch(`${API_BASE_URL}/certificates/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return res.json();
  },

  // Programs
  getPrograms: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE_URL}/programs?${query}`);
    return res.json();
  },

  createProgram: async (data) => {
    const res = await fetch(`${API_BASE_URL}/programs`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  updateProgram: async (id, data) => {
    const res = await fetch(`${API_BASE_URL}/programs/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  deleteProgram: async (id) => {
    const res = await fetch(`${API_BASE_URL}/programs/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return res.json();
  },

  // Users & Roles
  getUsers: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE_URL}/users?${query}`, {
      headers: getHeaders()
    });
    return res.json();
  },

  getRoles: async () => {
    const res = await fetch(`${API_BASE_URL}/users/roles`, {
      headers: getHeaders()
    });
    return res.json();
  },

  updateUser: async (id, data) => {
    const res = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  deleteUser: async (id) => {
    const res = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return res.json();
  },

  // Schools
  updateSchool: async (id, data) => {
    const res = await fetch(`${API_BASE_URL}/schools/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  deleteSchool: async (id) => {
    const res = await fetch(`${API_BASE_URL}/schools/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return res.json();
  },

  // Reports
  getReports: async () => {
    const res = await fetch(`${API_BASE_URL}/reports`, {
      headers: getHeaders()
    });
    return res.json();
  },

  // Audit Logs
  getAuditLogs: async () => {
    const res = await fetch(`${API_BASE_URL}/logs/audit`, {
      headers: getHeaders()
    });
    return res.json();
  }
};
