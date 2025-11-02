import { ResumeAnalysis } from '../types';

const API_BASE_URL = '/api/v1';

export const resumeApi = {
  async analyzeResume(file: File): Promise<ResumeAnalysis> {
    const formData = new FormData();
    formData.append('resume', file);

    try {
      const response = await fetch(`${API_BASE_URL}/resume/analyze`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to analyze resume');
      }

      return result.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error. Please check if the server is running.');
    }
  },

  async getAnalyses(): Promise<ResumeAnalysis[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/resume/analyses`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch analyses');
      }

      return result.data.analyses;
    } catch (error) {
      console.error('API Error:', error);
      // Return empty array if there's an error (e.g., server not running)
      return [];
    }
  },

  async getAnalysis(id: string): Promise<ResumeAnalysis> {
    const response = await fetch(`${API_BASE_URL}/resume/analyses/${id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      }
    });

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch analysis');
    }

    return result.data.analysis;
  },

  async deleteAnalysis(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/resume/analyses/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      }
    });

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to delete analysis');
    }
  }
};