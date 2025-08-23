const API_BASE_URL = 'http://localhost:3000/api/v1';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Helper method to get headers
  getHeaders(includeAuth = false) {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = localStorage.getItem('accessToken');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  // Helper method to handle responses
  async handleResponse(response) {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    // Handle 204 No Content responses
    if (response.status === 204) {
      return null;
    }
    
    return response.json();
  }

  // Authentication endpoints
  async register(userData) {
    const response = await fetch(`${this.baseURL}/auth/register`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(userData),
    });
    return this.handleResponse(response);
  }

  async login(credentials) {
    const response = await fetch(`${this.baseURL}/auth/login`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(credentials),
    });
    return this.handleResponse(response);
  }

  async logout() {
    const response = await fetch(`${this.baseURL}/auth/logout`, {
      method: 'POST',
      headers: this.getHeaders(true),
    });
    return this.handleResponse(response);
  }

  async refreshToken(refreshToken) {
    const response = await fetch(`${this.baseURL}/auth/refresh`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ refreshToken }),
    });
    return this.handleResponse(response);
  }

  async forgotPassword(email) {
    const response = await fetch(`${this.baseURL}/auth/forgot-password`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ email }),
    });
    return this.handleResponse(response);
  }

  async verifyPasswordResetOtp(email, otp) {
    const response = await fetch(`${this.baseURL}/auth/verify-password-reset-otp`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ email, otp }),
    });
    return this.handleResponse(response);
  }

  async resetPassword(token, newPassword) {
    const response = await fetch(`${this.baseURL}/auth/reset-password`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ token, newPassword }),
    });
    return this.handleResponse(response);
  }

  async verifyEmail(email, otp) {
    const response = await fetch(`${this.baseURL}/auth/verify-email`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ email, otp }),
    });
    return this.handleResponse(response);
  }

  async verifyPhone(phone, otp) {
    const response = await fetch(`${this.baseURL}/auth/verify-phone`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ phone, otp }),
    });
    return this.handleResponse(response);
  }

  // User profile endpoints
  async getProfile() {
    const response = await fetch(`${this.baseURL}/auth/profile`, {
      method: 'GET',
      headers: this.getHeaders(true),
    });
    return this.handleResponse(response);
  }

  // Expert profile endpoints
  async getExpertProfile() {
    const response = await fetch(`${this.baseURL}/expert-profiles/profile`, {
      method: 'GET',
      headers: this.getHeaders(true),
    });
    return this.handleResponse(response);
  }

  async updateExpertProfile(profileData) {
    const response = await fetch(`${this.baseURL}/expert-profiles/profile`, {
      method: 'PUT',
      headers: this.getHeaders(true),
      body: JSON.stringify(profileData),
    });
    return this.handleResponse(response);
  }

  async getExpertDashboardStats() {
    const response = await fetch(`${this.baseURL}/expert-profiles/dashboard/stats`, {
      method: 'GET',
      headers: this.getHeaders(true),
    });
    return this.handleResponse(response);
  }

  async addExpertSkill(skillData) {
    const response = await fetch(`${this.baseURL}/expert-profiles/skills`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify(skillData),
    });
    return this.handleResponse(response);
  }

  async updateExpertSkill(skillId, skillData) {
    const response = await fetch(`${this.baseURL}/expert-profiles/skills/${skillId}`, {
      method: 'PUT',
      headers: this.getHeaders(true),
      body: JSON.stringify(skillData),
    });
    return this.handleResponse(response);
  }

  async removeExpertSkill(skillId) {
    const response = await fetch(`${this.baseURL}/expert-profiles/skills/${skillId}`, {
      method: 'DELETE',
      headers: this.getHeaders(true),
    });
    return this.handleResponse(response);
  }

  async searchExperts(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await fetch(`${this.baseURL}/expert-profiles/search?${queryParams}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  // College profile endpoints
  async getCollegeProfile() {
    const response = await fetch(`${this.baseURL}/college-profiles/profile`, {
      method: 'GET',
      headers: this.getHeaders(true),
    });
    return this.handleResponse(response);
  }

  async updateCollegeProfile(profileData) {
    const response = await fetch(`${this.baseURL}/college-profiles/profile`, {
      method: 'PUT',
      headers: this.getHeaders(true),
      body: JSON.stringify(profileData),
    });
    return this.handleResponse(response);
  }

  async getCollegeDashboardStats() {
    const response = await fetch(`${this.baseURL}/college-profiles/dashboard/stats`, {
      method: 'GET',
      headers: this.getHeaders(true),
    });
    return this.handleResponse(response);
  }

  async getCollegeRecentRequirements(limit = 5) {
    const response = await fetch(`${this.baseURL}/college-profiles/requirements/recent?limit=${limit}`, {
      method: 'GET',
      headers: this.getHeaders(true),
    });
    return this.handleResponse(response);
  }

  async getCollegeRequirementsSummary() {
    const response = await fetch(`${this.baseURL}/college-profiles/requirements/summary`, {
      method: 'GET',
      headers: this.getHeaders(true),
    });
    return this.handleResponse(response);
  }

  async searchColleges(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await fetch(`${this.baseURL}/college-profiles/search?${queryParams}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  // File Upload endpoints
  async uploadProfilePicture(file) {
    console.log('=== FRONTEND UPLOAD PROFILE PICTURE ===');
    console.log('File to upload:', file);
    console.log('File details:', {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified
    });
    
    const formData = new FormData();
    formData.append('profilePicture', file);
    
    console.log('FormData created, entries:');
    for (let pair of formData.entries()) {
      console.log(pair[0] + ':', pair[1]);
    }

    const token = localStorage.getItem('accessToken');
    console.log('Token exists:', !!token);
    
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    console.log('Request headers:', headers);
    console.log('Request URL:', `${this.baseURL}/expert-profiles/upload/profile-picture`);

    const response = await fetch(`${this.baseURL}/expert-profiles/upload/profile-picture`, {
      method: 'POST',
      headers,
      body: formData,
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    
    return this.handleResponse(response);
  }

  async uploadResume(file) {
    const formData = new FormData();
    formData.append('resume', file);

    const token = localStorage.getItem('accessToken');
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseURL}/expert-profiles/upload/resume`, {
      method: 'POST',
      headers,
      body: formData,
    });
    return this.handleResponse(response);
  }

  async removeProfilePicture() {
    const response = await fetch(`${this.baseURL}/expert-profiles/upload/profile-picture`, {
      method: 'DELETE',
      headers: this.getHeaders(true),
    });
    return this.handleResponse(response);
  }

  async removeResume() {
    const response = await fetch(`${this.baseURL}/expert-profiles/upload/resume`, {
      method: 'DELETE',
      headers: this.getHeaders(true),
    });
    return this.handleResponse(response);
  }

  // Work Experience endpoints
  async getWorkExperiences() {
    const response = await fetch(`${this.baseURL}/expert-profiles/work-experience`, {
      method: 'GET',
      headers: this.getHeaders(true),
    });
    return this.handleResponse(response);
  }

  async addWorkExperience(experienceData) {
    const response = await fetch(`${this.baseURL}/expert-profiles/work-experience`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify(experienceData),
    });
    return this.handleResponse(response);
  }

  async updateWorkExperience(experienceId, experienceData) {
    const response = await fetch(`${this.baseURL}/expert-profiles/work-experience/${experienceId}`, {
      method: 'PUT',
      headers: this.getHeaders(true),
      body: JSON.stringify(experienceData),
    });
    return this.handleResponse(response);
  }

  async removeWorkExperience(experienceId) {
    const response = await fetch(`${this.baseURL}/expert-profiles/work-experience/${experienceId}`, {
      method: 'DELETE',
      headers: this.getHeaders(true),
    });
    return this.handleResponse(response);
  }

  // Utility methods
  isAuthenticated() {
    const token = localStorage.getItem('accessToken');
    return !!token;
  }

  getToken() {
    return localStorage.getItem('accessToken');
  }

  // ============ SERVICE METHODS ============
  
  async getServices() {
    const response = await fetch(`${this.baseURL}/expert-profiles/services`, {
      method: 'GET',
      headers: this.getHeaders(true),
    });
    return this.handleResponse(response);
  }

  async createService(serviceData) {
    console.log('API: Creating service with data:', serviceData);
    const response = await fetch(`${this.baseURL}/expert-profiles/services`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify(serviceData),
    });
    return this.handleResponse(response);
  }

  async updateService(serviceId, serviceData) {
    console.log('API: Updating service:', serviceId, 'with data:', serviceData);
    const response = await fetch(`${this.baseURL}/expert-profiles/services/${serviceId}`, {
      method: 'PUT',
      headers: this.getHeaders(true),
      body: JSON.stringify(serviceData),
    });
    return this.handleResponse(response);
  }

  async deleteService(serviceId) {
    console.log('API: Deleting service:', serviceId);
    const response = await fetch(`${this.baseURL}/expert-profiles/services/${serviceId}`, {
      method: 'DELETE',
      headers: this.getHeaders(true),
    });
    return this.handleResponse(response);
  }

  async toggleServiceStatus(serviceId) {
    console.log('API: Toggling service status:', serviceId);
    const response = await fetch(`${this.baseURL}/expert-profiles/services/${serviceId}/toggle-status`, {
      method: 'PUT',
      headers: this.getHeaders(true),
    });
    return this.handleResponse(response);
  }

  setTokens(accessToken, refreshToken) {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  clearTokens() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
}

// Create and export a single instance
const apiService = new ApiService();
export default apiService; 