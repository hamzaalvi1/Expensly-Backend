export const getOffset = (page: number, limit: number) => {
    return (page - 1) * limit;
}

export const getNextPage = (page: number, totalPages: number) => {
    return page < totalPages ? page + 1 : null;
}

export const getPreviousPage = (page: number, totalPages: number) => {
    return page > 1 ? page - 1 : null;
}
export const getTotalPages = (total: number, limit: number) => {
    return Math.ceil(total / limit);
}
