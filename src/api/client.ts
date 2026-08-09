import axios from 'axios';
import toast from 'react-hot-toast';

const BASE_URL = 'https://synaptecherp.runasp.net';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Request Interceptor ──────────────────────────────────────────────────────
// Attaches: Bearer token, Accept-Language (ar/en based on stored preference)
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;

  // Send Arabic error messages from backend when user language is Arabic
  const lang = localStorage.getItem('lang') || 'ar';
  config.headers['Accept-Language'] = lang;

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    // ── 403 Forbidden — global handler ──────────────────────────────────────
    if (error.response?.status === 403) {
      const lang = localStorage.getItem('lang') || 'ar';
      toast.error(
        lang === 'ar'
          ? 'ليس لديك صلاحية لتنفيذ هذا الإجراء.'
          : "You don't have permission to do that.",
        { id: 'forbidden', duration: 3000 }
      );
    }

    // ── 401 — try to refresh the token once ─────────────────────────────────
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const { data } = await axios.post(
            `${BASE_URL}/api/Auth/refresh-token`,
            { refreshToken },
            { headers: { 'Content-Type': 'application/json' } }
          );
          localStorage.setItem('accessToken', data.accessToken);
          localStorage.setItem('refreshToken', data.refreshToken);
          original.headers.Authorization = `Bearer ${data.accessToken}`;
          return apiClient(original);
        } catch {
          localStorage.clear();
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

// ─── Error Message Extractor ──────────────────────────────────────────────────
// Backend returns ProblemDetails with extensions.errors = [errorCode, errorMessage]
// GlobalExceptionHandler returns { title: "Internal Server Error" }
export function extractApiError(err: unknown): string {
  const e = err as any;
  const data = e?.response?.data;
  if (!data) return 'حدث خطأ في الاتصال بالخادم';

  // ResultExtensions format: { errors: [code, message] }
  const errors = data?.errors;
  if (Array.isArray(errors) && errors.length >= 2) return errors[1] as string;

  // Validation errors: { errors: { field: [messages] } }
  if (errors && typeof errors === 'object' && !Array.isArray(errors)) {
    const firstField = Object.values(errors)[0];
    if (Array.isArray(firstField) && firstField.length > 0) return firstField[0] as string;
  }

  // GlobalExceptionHandler: 500 with title
  if (data?.title) return data.title;
  if (data?.message) return data.message;
  if (typeof data === 'string') return data;

  return 'حدث خطأ غير متوقع';
}

export default apiClient;
