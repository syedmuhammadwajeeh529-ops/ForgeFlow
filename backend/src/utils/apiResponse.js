
export function successResponse(
  res,
  data = null,
  message = 'Request completed successfully.',
  statusCode = 200
) {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
}

export function errorResponse(
  res,
  message = 'Something went wrong.',
  statusCode = 500,
  errors = null
) {
  const response = {
    success: false,
    message
  };

  if (errors !== null) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
}

export function paginatedResponse(
  res,
  data,
  pagination,
  message = 'Data retrieved successfully.'
) {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      totalPages: Math.ceil(pagination.total / pagination.limit)
    }
  });
}
