export enum SortOrder {
    ASC = "asc",
    DESC = "desc",
}

export enum DEFAULT_PAGINATION {
    PAGE = 1,
    LIMIT = 25,
    SORT = "createdAt",
    ORDER = SortOrder.DESC,
    SEARCH = "",
    START_DATE = "",
    END_DATE = "",
};

export const PAGE = 'page';
export const LIMIT = 'limit';
export const SORT = 'sort';
export const ORDER = 'order';
export const SEARCH = 'search';
export const FILTER_BY = 'filterBy';
export const START_DATE = 'startDate';
export const END_DATE = 'endDate';

export enum FilterBy {
    EXPENSE = "EXPENSE",
    INCOME = "INCOME",
}

export type FilterByType = (typeof FilterBy)[keyof typeof FilterBy];
