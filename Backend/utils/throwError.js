const throwError = (code, msg) => {
    const error = new Error(msg);
    error.code = code;
    return error;
};

export default throwError;
