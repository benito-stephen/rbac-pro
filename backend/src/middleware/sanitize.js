import mongoSanitize from '../utils/mongoSanitize.js';

/**
 * Request sanitization — prevents NoSQL injection and basic XSS in body/query/params.
 */
export const sanitizeRequest = (req, res, next) => {
  if (req.body) req.body = mongoSanitize(req.body);
  if (req.query) req.query = mongoSanitize(req.query);
  if (req.params) req.params = mongoSanitize(req.params);
  next();
};

export const stripHtml = (str) => {
  if (typeof str !== 'string') return str;
  return str.replace(/<[^>]*>/g, '').trim();
};
