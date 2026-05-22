/**
 * Recursively strip keys starting with $ or containing . (MongoDB operator injection).
 */
const sanitize = (obj) => {
  if (obj === null || typeof obj !== 'object') {
    if (typeof obj === 'string') {
      return obj.replace(/\0/g, '');
    }
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitize);
  }

  const clean = {};
  for (const [key, value] of Object.entries(obj)) {
    if (key.startsWith('$') || key.includes('.')) continue;
    clean[key] = sanitize(value);
  }
  return clean;
};

export default sanitize;
