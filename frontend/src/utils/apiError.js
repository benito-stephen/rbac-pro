export const getApiErrorMessage = (err, fallback = 'Something went wrong') => {
  if (!err?.response) {
    if (err?.code === 'ECONNABORTED') return 'Request timed out. Is the server running?';
    if (err?.message === 'Network Error') {
      return 'Cannot reach server. Start the backend on port 5000.';
    }
    return err?.message || fallback;
  }

  const { data } = err.response;
  if (data?.errors?.length) {
    return data.errors.map((e) => e.message || e.msg).join('. ');
  }
  return data?.message || fallback;
};
