import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiResponse } from './../utils/apiResponse.js';
import { apiError } from './../utils/apiError.js';


const healthcheck = asyncHandler(async (req, res) => {
    //TODO: build a healthcheck response that simply returns the OK status as json with a message
})

export {
    healthcheck
}
