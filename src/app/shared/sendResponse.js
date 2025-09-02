const sendResponse = (res, { statusCode, success, message, data }) => {
  res.status(statusCode).json({
    success,
    message,
    data: data ?? null, // ensure `null` if undefined
  });
};

export default sendResponse;
