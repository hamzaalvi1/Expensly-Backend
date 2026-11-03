import { FilterByType, SortOrder } from "../constants/pagination";

export interface GetAllCategoriesParams {
    page: number;
    limit: number;
    sortBy: SortOrder;
    search: string;
    userId: string;
    filterBy?: FilterByType;
}

export interface GetAllTransactionsParams  {
    page: number;
    limit: number;
    sortBy: SortOrder;
    search: string;
    startDate?: string;
    endDate?: string;
    categoryId?: string;
    type?: FilterByType;
}

export interface GetAllBudgetsParams {
    page: number;
    limit: number;
    sortBy: SortOrder;
    search: string;
    userId: string;
    categoryId?: string;
}