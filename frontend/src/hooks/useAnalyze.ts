import { useState, useCallback } from 'react';
import type { AnalyzeResponse } from '../api/generated.js';
import { analyzeRoute, analyzeTerrain } from '../api/client.js';
import type { AnalyzeRequest } from '../api/generated.js';

type AnalyzeStatus = 'idle' | 'loading' | 'success' | 'error';

interface UseAnalyzeResult {
  status: AnalyzeStatus;
  result: AnalyzeResponse | null;
  error: string | null;
  errorType: 'network' | 'api' | 'unknown' | null;
  analyze: (file: File | null, riderInput: AnalyzeRequest) => Promise<void>;
  reset: () => void;
}

export function useAnalyze(): UseAnalyzeResult {
  const [status, setStatus] = useState<AnalyzeStatus>('idle');
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<'network' | 'api' | 'unknown' | null>(null);

  const analyze = useCallback(async (file: File | null, riderInput: AnalyzeRequest) => {
    setStatus('loading');
    setError(null);
    setErrorType(null);
    setResult(null);

    try {
      let response: AnalyzeResponse;
      
      if (file) {
        response = await analyzeRoute(file, riderInput);
      } else {
        response = await analyzeTerrain(riderInput);
      }
      
      setResult(response);
      setStatus('success');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred during analysis';
      
      if (errorMessage.includes('fetch') || errorMessage.includes('network') || errorMessage.includes('ECONNREFUSED')) {
        setError('Unable to connect to the server. Please check your connection.');
        setErrorType('network');
      } else {
        setError(errorMessage);
        setErrorType('api');
      }
      setStatus('error');
    }
  }, []);

  const reset = useCallback(() => {
    setStatus('idle');
    setResult(null);
    setError(null);
    setErrorType(null);
  }, []);

  return {
    status,
    result,
    error,
    errorType,
    analyze,
    reset,
  };
}