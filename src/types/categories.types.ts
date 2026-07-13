import { FilterByType, SortOrder } from "../constants/pagination";

export interface GetAllCategoriesParams {
    page: number;
    limit: number;
    sortBy: SortOrder;
    search: string;
    userId: string;
    filterBy?: FilterByType;
}