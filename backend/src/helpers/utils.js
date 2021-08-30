const initStatus = {
    status_code: 404,
    success: false,
    data: null,
    error: null,
    timestamp: null
};

export const makeResponseJson = (data, success = true) => {
    return {
        ...initStatus,
        status_code: 200,
        success,
        data,
        timestamp: new Date()
    };
};