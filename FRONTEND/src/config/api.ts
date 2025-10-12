const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('accessToken');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('accessToken', token);
    } else {
      localStorage.removeItem('accessToken');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth endpoints
  // async register(userData: {
  //   name: string;
  //   email: string;
  //   password: string;
  //   role?: string;
  //   experienceLevel?: string;
  //   preferredRole?: string;
  //   phone?: string;
  // }) {
  //   return this.request('/auth/register', {
  //     method: 'POST',
  //     body: JSON.stringify(userData),
  //   });
  // }
  async register(userData: {
  name: string;
  email: string;
  password: string;
  role?: string;
  experienceLevel?: string;
  preferredRole?: string;
  phone?: string;
}) {
  console.log('🔧 API Client - Registering user:', userData.email);
  console.log('🔧 Using base URL:', this.baseURL);
  
  try {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    console.log('✅ Register response:', response);
    return response;
  } catch (error) {
    console.error('❌ API Client - Register error:', error);
    throw error;
  }
}

  async login(credentials: { email: string; password: string }) {
    const response = await this.request<{
      success: boolean;
      data: {
        user: any;
        accessToken: string;
        refreshToken: string;
      };
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (response.success) {
      this.setToken(response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
    }

    return response;
  }

  async refreshToken() {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await this.request<{
      success: boolean;
      data: {
        accessToken: string;
        refreshToken: string;
      };
    }>('/auth/refresh-token', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });

    if (response.success) {
      this.setToken(response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
    }

    return response;
  }

  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } finally {
      this.setToken(null);
      localStorage.removeItem('refreshToken');
    }
  }

  async forgotPassword(email: string) {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token: string, password: string) {
    return this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    });
  }

  // User endpoints
  async getProfile() {
    return this.request('/users/profile');
  }

  async updateProfile(profileData: {
    name?: string;
    phone?: string;
    experienceLevel?: string;
    preferredRole?: string;
  }) {
    return this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async changePassword(passwordData: {
    currentPassword: string;
    newPassword: string;
  }) {
    return this.request('/users/change-password', {
      method: 'POST',
      body: JSON.stringify(passwordData),
    });
  }

  // Assessment endpoints
  async getAssessments() {
    return this.request('/assessments');
  }

  async getAssessment(id: string) {
    return this.request(`/assessments/${id}`);
  }

  async startAssessment(id: string) {
    return this.request(`/assessments/${id}/start`, {
      method: 'POST',
    });
  }

  async submitAssessment(id: string, answers: any) {
    return this.request(`/assessments/${id}/submit`, {
      method: 'PUT',
      body: JSON.stringify({ answers }),
    });
  }

  // Question endpoints
  async getQuestions(type?: string, difficulty?: string) {
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    if (difficulty) params.append('difficulty', difficulty);
    
    const queryString = params.toString();
    return this.request(`/questions${queryString ? `?${queryString}` : ''}`);
  }

  async getQuestion(id: string) {
    return this.request(`/questions/${id}`);
  }

  // Code execution endpoints
  async executeCode(codeData: {
    language: string;
    code: string;
    questionId: string;
    testCases?: any[];
  }) {
    return this.request('/submissions/execute', {
      method: 'POST',
      body: JSON.stringify(codeData),
    });
  }

  async getSubmission(id: string) {
    return this.request(`/submissions/${id}`);
  }

  // Analytics endpoints
  async getDashboardData() {
    return this.request('/analytics/dashboard');
  }

  async getPerformanceAnalytics() {
    return this.request('/analytics/performance');
  }

  async getCandidateAnalytics() {
    return this.request('/analytics/candidates');
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export default apiClient;
