export const getApiErrorMessage = (err, fallback = 'Something went wrong') => {
  if (!err?.response) {
    if (err?.code === 'ECONNABORTED') {
      return import.meta.env.PROD
        ? 'API is waking up (Render free tier). Wait a moment and try again.'
        : 'Request timed out. Is the backend running on port 5000?';
    }
    if (err?.message === 'Network Error') {
      return import.meta.env.PROD
        ? 'Cannot reach the API. If the app was idle, wait 60s and retry, or open /api/health first.'
        : 'Cannot reach server. Start the backend on port 5000.';
    }
    return err?.message || fallback;
  }

  const { data } = err.response;
  if (data?.errors?.length) {
    return data.errors.map((e) => e.message || e.msg).join('. ');
  }
  return data?.message || fallback;
};
