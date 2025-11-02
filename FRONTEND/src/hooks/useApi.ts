import { useState, useEffect } from 'react';
import { apiClient } from '../config/api';

interface UseApiOptions {
  immediate?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

export const useApi = <T = any>(
  apiCall: () => Promise<T>,
  options: UseApiOptions = {}
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { immediate = false, onSuccess, onError } = options;

  const execute = async (...args: any[]) => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiCall();
      setData(result);
      onSuccess?.(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      onError?.(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate]);

  return {
    data,
    loading,
    error,
    execute,
    reset: () => {
      setData(null);
      setError(null);
      setLoading(false);
    }
  };
};

// Specific API hooks
export const useAssessments = () => {
  return useApi(() => apiClient.getAssessments(), { immediate: true });
};

export const useQuestions = (type?: string, difficulty?: string) => {
  return useApi(() => apiClient.getQuestions(type, difficulty), { immediate: true });
};

export const useDashboardData = () => {
  return useApi(() => apiClient.getDashboardData(), { immediate: true });
};

export const usePerformanceAnalytics = () => {
  return useApi(() => apiClient.getPerformanceAnalytics());
};

export const useCodeExecution = () => {
  const [executing, setExecuting] = useState(false);

  const executeCode = async (codeData: {
    language: string;
    code: string;
    questionId: string;
    testCases?: any[];
  }) => {
    setExecuting(true);
    try {
      const result = await apiClient.executeCode(codeData);
      return result;
    } finally {
      setExecuting(false);
    }
  };

  return {
    executeCode,
    executing
  };
};