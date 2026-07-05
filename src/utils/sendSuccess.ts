export const sendSuccessResponse = (
    statusCode: number,
    message: string,
    data: any = null
    
) => {
    return {
        statusCode,
        message,
        data,
        success: statusCode < 400
    }
}