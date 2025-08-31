const API_BASE_URL = 'http://localhost:3000/api/v1';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.isRefreshing = false;
    this.failedQueue = [];
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
      
      // Handle 401 Unauthorized - token expired
      if (response.status === 401) {
        await this.handleUnauthorized();
        throw new Error('Authentication expired. Please login again.');
      }
      
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    // Handle 204 No Content responses
    if (response.status === 204) {
      return null;
    }
    
    return response.json();
  }

  // Handle 401 Unauthorized responses
  async handleUnauthorized() {
    // Clear tokens
    this.clearTokens();
    
    // Redirect to login page
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }

  // Check if token is expired
  isTokenExpired(token) {
    if (!token) return true;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      return true;
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    const token = localStorage.getItem('accessToken');
    return !!token && !this.isTokenExpired(token);
  }

  // Test backend connection
  async testConnection() {
    try {
      const response = await fetch(`${this.baseURL}/health`, {
        method: 'GET',
        headers: this.getHeaders(false),
      });
      
      if (response.ok) {
        return { success: true, status: response.status };
      } else {
        return { success: false, status: response.status, error: 'Backend responded with error' };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Get token with automatic refresh
  async getValidToken() {
    let token = localStorage.getItem('accessToken');
    
    // Check if token is expired
    if (this.isTokenExpired(token)) {
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (refreshToken) {
        try {
          // Try to refresh the token
          const response = await this.refreshToken(refreshToken);
          if (response.accessToken) {
            this.setTokens(response.accessToken, response.refreshToken || refreshToken);
            token = response.accessToken;
          } else {
            // Refresh failed, redirect to login
            await this.handleUnauthorized();
            return null;
          }
        } catch (error) {
          // Refresh failed, redirect to login
          await this.handleUnauthorized();
          return null;
        }
      } else {
        // No refresh token, redirect to login
        await this.handleUnauthorized();
        return null;
      }
    }
    
    return token;
  }

  // Enhanced headers method with token refresh
  async getAuthHeaders() {
    const token = await this.getValidToken();
    if (!token) {
      throw new Error('No valid token available');
    }
    
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
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
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseURL}/auth/logout`, {
        method: 'POST',
        headers,
      });
      return this.handleResponse(response);
    } catch (error) {
      // Even if logout API fails, clear local tokens
      this.clearTokens();
      throw error;
    }
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
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseURL}/auth/profile`, {
      method: 'GET',
      headers,
    });
    return this.handleResponse(response);
  }

  // Expert profile endpoints
  async getExpertProfile() {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseURL}/expert-profiles/profile`, {
      method: 'GET',
      headers,
    });
    return this.handleResponse(response);
  }

  async updateExpertProfile(profileData) {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseURL}/expert-profiles/profile`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(profileData),
    });
    return this.handleResponse(response);
  }

  async getExpertDashboardStats() {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseURL}/expert-profiles/dashboard/stats`, {
      method: 'GET',
      headers,
    });
    return this.handleResponse(response);
  }

  async addExpertSkill(skillData) {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseURL}/expert-profiles/skills`, {
      method: 'POST',
      headers,
      body: JSON.stringify(skillData),
    });
    return this.handleResponse(response);
  }

  async updateExpertSkill(skillId, skillData) {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseURL}/expert-profiles/skills/${skillId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(skillData),
    });
    return this.handleResponse(response);
  }

  async removeExpertSkill(skillId) {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseURL}/expert-profiles/skills/${skillId}`, {
      method: 'DELETE',
      headers,
    });
    return this.handleResponse(response);
  }

  async searchExperts(filters = {}) {
    try {
      console.log('API: searchExperts called with filters:', filters);
      
      // Handle array parameters properly
      const queryParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          // For array values, append each item with the same key
          value.forEach(item => queryParams.append(key, item));
        } else if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value);
        }
      });
      
      const queryString = queryParams.toString();
      console.log('API: Query params:', queryString);
      
      const headers = await this.getAuthHeaders();
      console.log('API: Auth headers:', headers);
      
      const response = await fetch(`${this.baseURL}/expert-profiles/search?${queryString}`, {
        method: 'GET',
        headers,
      });
      
      console.log('API: Response status:', response.status);
      console.log('API: Response ok:', response.ok);
      
      return this.handleResponse(response);
    } catch (error) {
      console.error('API: searchExperts error:', error);
      throw error;
    }
  }

  // College profile endpoints
  async getCollegeProfile() {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseURL}/college-profiles/profile`, {
      method: 'GET',
      headers,
    });
    return this.handleResponse(response);
  }

  async updateCollegeProfile(profileData) {
    const headers = await this.getAuthHeaders();
    
    // Always send as JSON for consistency with expert profile updates
    const response = await fetch(`${this.baseURL}/college-profiles/profile`, {
      method: 'PUT',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData),
    });
    return this.handleResponse(response);
  }

  async uploadCollegeLogo(file) {
    const formData = new FormData();
    formData.append('logo', file);
    
    const token = await this.getValidToken();
    if (!token) {
      throw new Error('No valid token available');
    }
    
    const headers = {
      'Authorization': `Bearer ${token}`
    };
    
    const response = await fetch(`${this.baseURL}/college-profiles/profile/logo-upload`, {
      method: 'POST',
      headers,
      body: formData,
    });
    return this.handleResponse(response);
  }

  async removeCollegeLogo() {
    console.log('=== API: removeCollegeLogo STARTED ===');
    
    try {
      const headers = await this.getAuthHeaders();
      console.log('Headers:', headers);
      
      const response = await fetch(`${this.baseURL}/college-profiles/profile/logo`, {
        method: 'DELETE',
        headers,
      });
      
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      console.log('Response headers:', response.headers);
      
      const result = await this.handleResponse(response);
      console.log('Final result from handleResponse:', result);
      
      return result;
    } catch (error) {
      console.error('❌ API removeCollegeLogo error:', error);
      throw error;
    }
  }

  async getCollegeDashboardStats() {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseURL}/college-profiles/dashboard/stats`, {
      method: 'GET',
      headers,
    });
    return this.handleResponse(response);
  }

  async getCollegeRecentRequirements(limit = 5) {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseURL}/college-profiles/requirements/recent?limit=${limit}`, {
      method: 'GET',
      headers,
    });
    return this.handleResponse(response);
  }

  async getCollegeRequirementsSummary() {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseURL}/college-profiles/requirements/summary`, {
      method: 'GET',
      headers,
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

    const token = await this.getValidToken();
    if (!token) {
      throw new Error('No valid token available');
    }
    
    const headers = {
      'Authorization': `Bearer ${token}`
    };
    
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

    const token = await this.getValidToken();
    if (!token) {
      throw new Error('No valid token available');
    }
    
    const headers = {
      'Authorization': `Bearer ${token}`
    };

    const response = await fetch(`${this.baseURL}/expert-profiles/upload/resume`, {
      method: 'POST',
      headers,
      body: formData,
    });
    return this.handleResponse(response);
  }

  async removeProfilePicture() {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseURL}/expert-profiles/upload/profile-picture`, {
      method: 'DELETE',
      headers,
    });
    return this.handleResponse(response);
  }

  async removeResume() {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseURL}/expert-profiles/upload/resume`, {
      method: 'DELETE',
      headers,
    });
    return this.handleResponse(response);
  }

  // Work Experience endpoints
  async getWorkExperiences() {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseURL}/expert-profiles/work-experience`, {
      method: 'GET',
      headers,
    });
    return this.handleResponse(response);
  }

  async addWorkExperience(experienceData) {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseURL}/expert-profiles/work-experience`, {
      method: 'POST',
      headers,
      body: JSON.stringify(experienceData),
    });
    return this.handleResponse(response);
  }

  async updateWorkExperience(experienceId, experienceData) {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseURL}/expert-profiles/work-experience/${experienceId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(experienceData),
    });
    return this.handleResponse(response);
  }

  async removeWorkExperience(experienceId) {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseURL}/expert-profiles/work-experience/${experienceId}`, {
      method: 'DELETE',
      headers,
    });
    return this.handleResponse(response);
  }

  // Utility methods
  getToken() {
    return localStorage.getItem('accessToken');
  }

  // ============ SERVICE METHODS ============
  
  async getServices() {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseURL}/expert-profiles/services`, {
      method: 'GET',
      headers,
    });
    return this.handleResponse(response);
  }

  async createService(serviceData) {
    console.log('API: Creating service with data:', serviceData);
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseURL}/expert-profiles/services`, {
      method: 'POST',
      headers,
      body: JSON.stringify(serviceData),
    });
    return this.handleResponse(response);
  }

  async updateService(serviceId, serviceData) {
    console.log('API: Updating service:', serviceId, 'with data:', serviceData);
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseURL}/expert-profiles/services/${serviceId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(serviceData),
    });
    return this.handleResponse(response);
  }

  async deleteService(serviceId) {
    console.log('API: Deleting service:', serviceId);
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseURL}/expert-profiles/services/${serviceId}`, {
      method: 'DELETE',
      headers,
    });
    return this.handleResponse(response);
  }

  async toggleServiceStatus(serviceId) {
    console.log('API: Toggling service status:', serviceId);
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseURL}/expert-profiles/services/${serviceId}/toggle-status`, {
      method: 'PUT',
      headers,
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