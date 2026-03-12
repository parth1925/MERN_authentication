const TryCatch = (handler) => {
    return async (req, resp, next) => {
        try {
            await handler(req, resp, next);
        } catch (error) {
            resp.status(500).json({
                message: error.message,
            });
        };
    };
};
export default TryCatch;