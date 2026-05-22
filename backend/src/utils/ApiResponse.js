export class ApiResponse {
  static success(res, { message = 'Success', data = null, meta = null, statusCode = 200 } = {}) {
    const response = { success: true, message };
    if (data !== null) response.data = data;
    if (meta !== null) response.meta = meta;
    return res.status(statusCode).json(response);
  }

  static created(res, { message = 'Created successfully', data = null } = {}) {
    return ApiResponse.success(res, { message, data, statusCode: 201 });
  }

  static error(res, { message = 'An error occurred', statusCode = 500, errors = null } = {}) {
    const response = { success: false, message };
    if (errors) response.errors = errors;
    return res.status(statusCode).json(response);
  }

  static paginated(res, { message = 'Success', data, page, limit, total }) {
    return ApiResponse.success(res, {
      message,
      data,
      meta: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  }
}
