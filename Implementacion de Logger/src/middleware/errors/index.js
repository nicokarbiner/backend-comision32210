import EErrors from "../../services/errors/enums.js";

export default (error, req, res, next) => {
    console.log(error.cause)
    switch (error.code) {
        case EErrors.INVALID_PARAMS:
            res.json({ status: "error", error: error.name });
            break;
        case EErrors.INVALID_TYPES_ERROR:
            res.json({ status: "error", error: error.name });
            break;
        case EErrors.DUPLICATED_ERROR:
            res.json({ status: "error", error: error.name });
            break;
        default:
            res.send({ status: "error", error: "Unhandled error" })
    }
}