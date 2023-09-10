export const responseHandler = (res, { data, message, status, token, rows }) => {
    return res.status(200).json({
        message: message,
        status: status,
        data: data,
        token: token,
        count_rows: rows
    })
}