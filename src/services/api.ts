import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

console.log('API_URL:', API_URL); // Debug log

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 30000, // 30 second timeout for Render free tier cold starts
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  register: async (name: string, email: string, password: string, section: string, role?: string) => {
    const response = await api.post('/auth/register', { name, email, password, section, role });
    return response.data;
  },
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
};

// Users API
export const usersAPI = {
  getAllUsers: async () => {
    const response = await api.get('/users');
    return response.data;
  },
  getUserProfile: async (userId: string) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },
  updateProfile: async (updates: any) => {
    const response = await api.put('/users/profile', updates);
    return response.data;
  },
};

// Projects API
export const projectsAPI = {
  getFeedProjects: async () => {
    const response = await api.get('/projects/feed');
    return response.data;
  },
  getUserProjects: async (userId: string) => {
    const response = await api.get(`/projects/user/${userId}`);
    return response.data;
  },
  createProject: async (projectData: any) => {
    const response = await api.post('/projects', projectData);
    return response.data;
  },
  updateProject: async (projectId: string, updates: any) => {
    const response = await api.put(`/projects/${projectId}`, updates);
    return response.data;
  },
  deleteProject: async (projectId: string) => {
    const response = await api.delete(`/projects/${projectId}`);
    return response.data;
  },
  likeProject: async (projectId: string) => {
    const response = await api.post(`/projects/${projectId}/like`);
    return response.data;
  },
  addComment: async (projectId: string, text: string) => {
    const response = await api.post(`/projects/${projectId}/comment`, { text });
    return response.data;
  },
  getComments: async (projectId: string) => {
    const response = await api.get(`/projects/${projectId}/comments`);
    return response.data;
  },
  deleteComment: async (projectId: string, commentId: string) => {
    const response = await api.delete(`/projects/${projectId}/comment/${commentId}`);
    return response.data;
  },
  updateChallenges: async (projectId: string, challenges: { faced: string; learned: string; explored: string }) => {
    const response = await api.put(`/projects/${projectId}/challenges`, challenges);
    return response.data;
  },
};

// Social API
export const socialAPI = {
  sendFriendRequest: async (receiverId: string) => {
    const response = await api.post('/social/friend-request', { receiverId });
    return response.data;
  },
  getFriendRequests: async () => {
    const response = await api.get('/social/friend-requests');
    return response.data;
  },
  getSentFriendRequests: async () => {
    const response = await api.get('/social/friend-requests/sent');
    return response.data;
  },
  getFriendRequestStatus: async (userId: string) => {
    const response = await api.get(`/social/friend-request/status/${userId}`);
    return response.data;
  },
  cancelFriendRequest: async (requestId: string) => {
    const response = await api.delete(`/social/friend-request/${requestId}`);
    return response.data;
  },
  respondToFriendRequest: async (requestId: string, accept: boolean) => {
    const response = await api.post(`/social/friend-request/${requestId}/respond`, { accept });
    return response.data;
  },
  unfriend: async (friendId: string) => {
    const response = await api.delete(`/social/friend/${friendId}`);
    return response.data;
  },
  getNotifications: async () => {
    const response = await api.get('/social/notifications');
    return response.data;
  },
  markNotificationRead: async (notificationId: string) => {
    const response = await api.put(`/social/notifications/${notificationId}/read`);
    return response.data;
  },
  markAllNotificationsRead: async () => {
    const response = await api.put('/social/notifications/read-all');
    return response.data;
  },
  getFriends: async () => {
    const response = await api.get('/social/friends');
    return response.data;
  },
};

// Certificates API
export const certificatesAPI = {
  generateCertificate: async (projectId: string) => {
    const response = await api.post('/certificates/generate', { projectId });
    return response.data;
  },
  getMyCertificates: async () => {
    const response = await api.get('/certificates/my-certificates');
    return response.data;
  },
  downloadCertificate: async (certificateId: string) => {
    const response = await api.get(`/certificates/${certificateId}/download`, {
      responseType: 'blob'
    });
    return response.data;
  },
  checkCertificate: async (projectId: string) => {
    const response = await api.get(`/certificates/check/${projectId}`);
    return response.data;
  },
};

// Insights API
export const insightsAPI = {
  getUserInsights: async (userId: string) => {
    const response = await api.get(`/insights/${userId}`);
    return response.data;
  },
};

// Admin API
export const adminAPI = {
  getAllUsers: async () => {
    const response = await api.get('/admin/users');
    return response.data;
  },
  suspendUser: async (userId: string) => {
    const response = await api.put(`/admin/users/${userId}/suspend`);
    return response.data;
  },
  unsuspendUser: async (userId: string) => {
    const response = await api.put(`/admin/users/${userId}/unsuspend`);
    return response.data;
  },
  getAllProjects: async () => {
    const response = await api.get('/admin/projects');
    return response.data;
  },
  suggestProjectOfWeek: async () => {
    const response = await api.post('/admin/ai/suggest-weekly');
    return response.data;
  },
  approveProjectOfWeek: async (projectId: string, reason: string, score: number) => {
    const response = await api.post('/admin/project-of-week/approve', { projectId, reason, score });
    return response.data;
  },
  getCurrentProjectOfWeek: async () => {
    const response = await api.get('/admin/project-of-week/current');
    return response.data;
  },
  getStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  },
  getReports: async () => {
    const response = await api.get('/admin/reports');
    return response.data;
  },
  getPOWHistory: async () => {
    const response = await api.get('/admin/project-of-week/history');
    return response.data;
  },
  getUserAwards: async () => {
    const response = await api.get('/admin/awards/users');
    return response.data;
  },
  resolveReport: async (reportId: string, action: string) => {
    const response = await api.post(`/admin/reports/${reportId}/resolve`, { action });
    return response.data;
  },
};

// Project of the Week API (public)
export const projectOfWeekAPI = {
  getCurrent: async () => {
    const response = await api.get('/projects/project-of-week');
    return response.data;
  },
};

// Contest API
export const contestAPI = {
  registerProject: async (projectId: string) => {
    const response = await api.post(`/contest/register/${projectId}`);
    return response.data;
  },
  checkRegistration: async (projectId: string) => {
    const response = await api.get(`/contest/check-registration/${projectId}`);
    return response.data;
  },
  getContestants: async () => {
    const response = await api.get('/contest/contestants');
    return response.data;
  },
  removeContestant: async (contestantId: string) => {
    const response = await api.delete(`/contest/contestants/${contestantId}`);
    return response.data;
  },
  aiPick: async () => {
    const response = await api.post('/contest/ai-pick');
    return response.data;
  },
  approveWinner: async (projectId: string, reason: string, score: number) => {
    const response = await api.post('/contest/approve', { projectId, reason, score });
    return response.data;
  },
  getContestStatus: async () => {
    const response = await api.get('/contest/status');
    return response.data;
  },
  checkCertificateEligibility: async (projectId: string) => {
    const response = await api.get(`/contest/certificate-eligibility/${projectId}`);
    return response.data;
  },
  generateContestCertificate: async (projectId: string, certificateType: string, weekNumber: number, year: number) => {
    const response = await api.post('/certificates/generate-contest', { 
      projectId, 
      certificateType, 
      weekNumber, 
      year 
    });
    return response.data;
  },
};

// Technologies API
export const technologiesAPI = {
  getAllTechnologies: async () => {
    const response = await api.get('/technologies');
    return response.data;
  },
  getTrending: async () => {
    const response = await api.get('/technologies/trending');
    return response.data;
  },
  getTechnologyDetails: async (techName: string) => {
    const response = await api.get(`/technologies/${encodeURIComponent(techName)}`);
    return response.data;
  },
};

export default api;
