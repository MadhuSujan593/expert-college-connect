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
  async handleResponse(response, requestContext = {}) {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      console.log('❌ API Service - Response not OK:', {
        status: response.status,
        statusText: response.statusText,
        errorData,
        requestContext,
        currentPath: window.location.pathname
      });
      
      // Handle 401 Unauthorized - distinguish between invalid credentials and expired tokens
      if (response.status === 401) {
        // Check if this is a login attempt (invalid credentials) vs expired token
        const isLoginAttempt = requestContext.isLoginAttempt || 
                              window.location.pathname === '/login' || 
                              window.location.pathname === '/auth/login';
        
        console.log('🔐 API Service - 401 Unauthorized, isLoginAttempt:', isLoginAttempt);
        
        if (isLoginAttempt) {
          // This is likely invalid credentials during login
          console.log('🔐 API Service - Invalid credentials during login');
          throw new Error(errorData.message || 'Invalid credentials.');
        } else {
          // This is likely an expired token during authenticated requests
          console.log('🔐 API Service - Expired token during authenticated request');
          await this.handleUnauthorized();
          throw new Error('Authentication expired. Please login again.');
        }
      }
      
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    // Handle 204 No Content responses or empty bodies gracefully
    if (response.status === 204) {
      return null;
    }
    const contentLength = response.headers.get('content-length');
    if (contentLength === '0') {
      return null;
    }
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      // Try to read text; if empty, return null
      const text = await response.text();
      if (!text) return null;
      try { return JSON.parse(text); } catch { return { raw: text }; }
    }
    
    return response.json();
  }

  // Handle 401 Unauthorized responses
  async handleUnauthorized() {
    // Don't automatically logout on unauthorized errors - let user decide
    console.warn('🚨 Unauthorized error detected - user remains logged in');
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

  // Check if token will expire soon (within 5 minutes)
  isTokenExpiringSoon(token) {
    if (!token) return true;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      const fiveMinutesFromNow = currentTime + (5 * 60); // 5 minutes in seconds
      const willExpireSoon = payload.exp < fiveMinutesFromNow;
      
      if (willExpireSoon) {
        const timeLeft = Math.round(payload.exp - currentTime);
        console.log(`⏰ Token expires in ${timeLeft} seconds - will refresh soon`);
      }
      
      return willExpireSoon;
    } catch (error) {
      console.log('❌ Token parsing error:', error.message);
      return true;
    }
  }

  // TESTING: Force token refresh for testing purposes
  async forceTokenRefresh() {
    console.log('🧪 TESTING: Forcing token refresh...');
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (refreshToken) {
      try {
        console.log('🔄 TESTING: Manually refreshing token...');
        const response = await this.refreshToken(refreshToken);
        if (response.accessToken) {
          this.setTokens(response.accessToken, response.refreshToken || refreshToken);
          console.log('✅ TESTING: Manual refresh successful');
          console.log('🆕 New token expires at:', new Date(JSON.parse(atob(response.accessToken.split('.')[1])).exp * 1000).toLocaleTimeString());
          return true;
        }
      } catch (error) {
        console.log('❌ TESTING: Manual refresh failed:', error.message);
        return false;
      }
    }
    return false;
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

  // Basic HTTP methods
  async get(url, options = {}) {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseURL}${url}`, {
      method: 'GET',
      headers: { ...headers, ...options.headers },
      ...options
    });
    return this.handleResponse(response);
  }

  async post(url, data, options = {}) {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseURL}${url}`, {
      method: 'POST',
      headers: { ...headers, ...options.headers },
      body: JSON.stringify(data),
      ...options
    });
    return this.handleResponse(response);
  }

  async put(url, data, options = {}) {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseURL}${url}`, {
      method: 'PUT',
      headers: { ...headers, ...options.headers },
      body: JSON.stringify(data),
      ...options
    });
    return this.handleResponse(response);
  }

  async patch(url, data, options = {}) {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseURL}${url}`, {
      method: 'PATCH',
      headers: { ...headers, ...options.headers },
      body: JSON.stringify(data),
      ...options
    });
    return this.handleResponse(response);
  }

  async delete(url, options = {}) {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseURL}${url}`, {
      method: 'DELETE',
      headers: { ...headers, ...options.headers },
      ...options
    });
    return this.handleResponse(response);
  }

  // Get token with automatic refresh
  async getValidToken() {
    let token = localStorage.getItem('accessToken');
    
    // If no token, try to refresh
    if (!token) {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken && !this.isTokenExpired(refreshToken)) {
        try {
          const response = await this.refreshToken(refreshToken);
          if (response.accessToken) {
            this.setTokens(response.accessToken, response.refreshToken || refreshToken);
            return response.accessToken;
          }
        } catch (error) {
          // Refresh failed
        }
      }
      return null;
    }
    
    // If token is expired, try to refresh
    if (this.isTokenExpired(token)) {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken && !this.isTokenExpired(refreshToken)) {
        try {
          const response = await this.refreshToken(refreshToken);
          if (response.accessToken) {
            this.setTokens(response.accessToken, response.refreshToken || refreshToken);
            return response.accessToken;
          }
        } catch (error) {
          // Refresh failed
        }
      }
      return null;
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
    console.log('🔐 API Service - Login attempt for:', credentials.identifier);
    
    const response = await fetch(`${this.baseURL}/auth/login`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(credentials),
    });
    
    console.log('🔐 API Service - Login response status:', response.status);
    
    return this.handleResponse(response, { isLoginAttempt: true });
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
    const requestBody = { email, otp };
    console.log('API Service - verifyEmail request:', requestBody);
    
    const response = await fetch(`${this.baseURL}/auth/verify-email`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(requestBody),
    });
    return this.handleResponse(response);
  }

  async sendEmailOtp(email, userName) {
    const requestBody = { email, userName };
    console.log('API Service - sendEmailOtp request:', requestBody);
    
    const response = await fetch(`${this.baseURL}/auth/send-email-otp`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(requestBody),
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
    try {
      // Add timestamp for token isolation between browser sessions
      const tokenData = {
        accessToken,
        refreshToken,
        timestamp: Date.now(),
        sessionId: Math.random().toString(36).substr(2, 9)
      };
      
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('authSessionId', tokenData.sessionId);
      
      console.log('🔑 Tokens stored successfully with session ID:', tokenData.sessionId);
    } catch (error) {
      console.error('Failed to store tokens:', error);
    }
  }

  clearTokens() {
    try {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('authSessionId');
      localStorage.removeItem('user');
      console.log('🗑️ All auth data cleared');
    } catch (error) {
      console.error('Failed to clear tokens:', error);
    }
  }

  // Check if current session is valid (prevent cross-session conflicts)
  isValidSession() {
    try {
      const sessionId = localStorage.getItem('authSessionId');
      const token = localStorage.getItem('accessToken');
      
      // If no session or no token, session is invalid
      if (!sessionId || !token) {
        return false;
      }
      
      // Session is valid if both exist
      return true;
    } catch (error) {
      console.error('Failed to validate session:', error);
      return false;
    }
  }

  // ============ SUPER ADMIN METHODS ============
  
  async getSuperAdminDashboardStats() {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseURL}/super-admin/dashboard`, {
      method: 'GET',
      headers,
    });
    return this.handleResponse(response);
  }

  async getSuperAdminOverview() {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseURL}/super-admin/overview`, {
      method: 'GET',
      headers,
    });
    return this.handleResponse(response);
  }

  async getAllUsers(page = 1, limit = 10, role = null, search = '', isActive = null) {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (role) queryParams.append('role', role);
    if (search) queryParams.append('search', search);
    if (isActive !== null) queryParams.append('isActive', isActive.toString());

    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseURL}/super-admin/users?${queryParams}`, {
      method: 'GET',
      headers,
    });
    return this.handleResponse(response);
  }

  async getUserById(userId) {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseURL}/super-admin/users/${userId}`, {
      method: 'GET',
      headers,
    });
    return this.handleResponse(response);
  }

  async toggleUserStatus(userId) {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseURL}/super-admin/users/${userId}/toggle-status`, {
      method: 'PUT',
      headers,
    });
    return this.handleResponse(response);
  }

  async deleteUser(userId) {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseURL}/super-admin/users/${userId}`, {
      method: 'DELETE',
      headers,
    });
    return this.handleResponse(response);
  }

  async restoreUser(userId) {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseURL}/super-admin/users/${userId}/restore`, {
      method: 'PUT',
      headers,
    });
    return this.handleResponse(response);
  }

  async getUserActivity(userId, page = 1, limit = 20) {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseURL}/super-admin/users/${userId}/activity?${queryParams}`, {
      method: 'GET',
      headers,
    });
    return this.handleResponse(response);
  }

  async getUsersByRole() {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseURL}/super-admin/stats/users-by-role`, {
      method: 'GET',
      headers,
    });
    return this.handleResponse(response);
  }

  async getRecentActivity() {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseURL}/super-admin/recent-activity`, {
      method: 'GET',
      headers,
    });
    return this.handleResponse(response);
  }

  // ===== Super Admin: Plans & Subscriptions =====
  async adminListPlans() {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseURL}/super-admin/plans`, { method: 'GET', headers });
    return this.handleResponse(response);
  }

  async adminListActivePlans() {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseURL}/super-admin/plans/active`, { method: 'GET', headers });
    return this.handleResponse(response);
  }

  async adminCreatePlan(data) {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseURL}/super-admin/plans`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  async adminUpdatePlan(id, data) {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseURL}/super-admin/plans/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  async adminTogglePlan(id) {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseURL}/super-admin/plans/${id}/toggle`, {
      method: 'PUT',
      headers,
    });
    return this.handleResponse(response);
  }

  async adminDeletePlan(id) {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseURL}/super-admin/plans/${id}`, {
      method: 'DELETE',
      headers,
    });
    return this.handleResponse(response);
  }

  async adminListSubscriptions({ page = 1, limit = 10, userId, planId, status } = {}) {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (userId) params.append('userId', userId);
    if (planId) params.append('planId', planId);
    if (status) params.append('status', status);
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseURL}/super-admin/subscriptions?${params.toString()}`, {
      method: 'GET',
      headers,
    });
    return this.handleResponse(response);
  }

  async adminGetSubscription(id) {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseURL}/super-admin/subscriptions/${id}`, {
      method: 'GET',
      headers,
    });
    return this.handleResponse(response);
  }

  async adminCreateSubscription(data) {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseURL}/super-admin/subscriptions`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  async adminCancelSubscription(id) {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseURL}/super-admin/subscriptions/${id}/cancel`, {
      method: 'PUT',
      headers,
    });
    return this.handleResponse(response);
  }

  async adminListPlanSubscribers(planId, { page = 1, limit = 10 } = {}) {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseURL}/super-admin/plans/${planId}/subscribers?${params.toString()}`, {
      method: 'GET',
      headers,
    });
    return this.handleResponse(response);
  }

  async getInvoiceDetails(page = 1, limit = 20, status, planId, search, paymentStatus) {
    const headers = await this.getAuthHeaders();
    const params = new URLSearchParams({ 
      page: page.toString(), 
      limit: limit.toString() 
    });
    
    if (status) params.append('status', status);
    if (planId) params.append('planId', planId);
    if (search) params.append('search', search);
    if (paymentStatus) params.append('paymentStatus', paymentStatus);
    
    const response = await fetch(`${this.baseURL}/super-admin/invoices?${params.toString()}`, {
      method: 'GET',
      headers,
    });
    return this.handleResponse(response);
  }

  // ===== Admin Plan Management =====
  async adminListPlans() {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseURL}/super-admin/plans`, { method: 'GET', headers });
    return this.handleResponse(response);
  }

  async adminListActivePlans() {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseURL}/super-admin/plans/active`, { method: 'GET', headers });
    return this.handleResponse(response);
  }

  async adminCreatePlan(planData) {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseURL}/super-admin/plans`, {
      method: 'POST',
      headers,
      body: JSON.stringify(planData),
    });
    return this.handleResponse(response);
  }

  async adminUpdatePlan(planId, planData) {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseURL}/super-admin/plans/${planId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(planData),
    });
    return this.handleResponse(response);
  }

  async adminTogglePlan(planId) {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseURL}/super-admin/plans/${planId}/toggle`, {
      method: 'PUT',
      headers,
    });
    return this.handleResponse(response);
  }

  async adminDeletePlan(planId) {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseURL}/super-admin/plans/${planId}`, {
      method: 'DELETE',
      headers,
    });
    return this.handleResponse(response);
  }

  // ===== Subscribers Management =====
  async adminGetAllSubscribers({ page = 1, limit = 20, audience, planId, search } = {}) {
    const headers = await this.getAuthHeaders();
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    if (audience) params.append('audience', audience);
    if (planId) params.append('planId', planId);
    if (search) params.append('search', search);
    
    const response = await fetch(`${this.baseURL}/super-admin/subscribers?${params.toString()}`, {
      method: 'GET',
      headers,
    });
    return this.handleResponse(response);
  }

  async adminUpdateSubscriptionExpiration(subscriptionId, expirationDate) {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseURL}/super-admin/subscribers/${subscriptionId}/expiration`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ expirationDate }),
    });
    return this.handleResponse(response);
  }

  // ===== Self subscription & usage =====
  async getMySubscription() {
    const headers = await this.getAuthHeaders();
    // Add timestamp to prevent caching
    const timestamp = new Date().getTime();
    const response = await fetch(`${this.baseURL}/subscriptions/me?t=${timestamp}`, { method: 'GET', headers });
    return this.handleResponse(response);
  }

  async listActivePlans(audience) {
    const headers = await this.getAuthHeaders();
    const url = audience ? `${this.baseURL}/subscriptions/plans?audience=${encodeURIComponent(audience)}` : `${this.baseURL}/subscriptions/plans`;
    const response = await fetch(url, { method: 'GET', headers });
    return this.handleResponse(response);
  }

  async listPlansForUser(audience) {
    const headers = await this.getAuthHeaders();
    const url = audience ? `${this.baseURL}/subscriptions/plans/for-user?audience=${encodeURIComponent(audience)}` : `${this.baseURL}/subscriptions/plans/for-user`;
    const response = await fetch(url, { method: 'GET', headers });
    return this.handleResponse(response);
  }

  async getAvailablePlans(audience) {
    const headers = await this.getAuthHeaders();
    const url = audience ? `${this.baseURL}/subscriptions/plans?audience=${encodeURIComponent(audience)}` : `${this.baseURL}/subscriptions/plans`;
    const response = await fetch(url, { method: 'GET', headers });
    return this.handleResponse(response);
  }

  async revealExpertContact(expertId) {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseURL}/subscriptions/reveal-contact`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ expertId }),
    });
    return this.handleResponse(response);
  }

  async subscribeToPlan(planId) {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseURL}/subscriptions/subscribe`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ planId }),
    });
    return this.handleResponse(response);
  }

  async createRazorpayOrder(planId, billingPeriod = 'MONTHLY') {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseURL}/subscriptions/create-order`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ planId, billingPeriod }),
    });
    return this.handleResponse(response);
  }

  async confirmRazorpayPayment(planId, paymentData, billingPeriod = 'MONTHLY') {
    const headers = await this.getAuthHeaders();


    const response = await fetch(`${this.baseURL}/subscriptions/confirm-payment`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ planId, paymentData, billingPeriod }),
    });
    return this.handleResponse(response);
  }

  // === RECOMMENDATIONS API ===
  
  async getRecommendedOpportunities(page = 1, limit = 10, minScore = 20) {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      minScore: minScore.toString(),
    });

    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseURL}/recommendations/opportunities?${queryParams}`, {
      method: 'GET',
      headers,
    });
    return this.handleResponse(response);
  }

  async getRecommendationStats() {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseURL}/recommendations/stats`, {
      method: 'GET',
      headers,
    });
    return this.handleResponse(response);
  }

  async getCollegeRecommendations(page = 1, limit = 10, minScore = 10) {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseURL}/recommendations/college?page=${page}&limit=${limit}&minScore=${minScore}`, {
      method: 'GET',
      headers,
    });
    return this.handleResponse(response);
  }
}

// Create and export a single instance
const apiService = new ApiService();
export default apiService; 