import { TaskQueryOptions } from "../types/taskQueryOptions";

export const parseTaskQuery = (input: any): TaskQueryOptions => {
    let searchText = '';
    if (typeof input?.search === 'string') {
        searchText = input.search;
    }

    let sort: 'asc' | 'desc' = 'asc';
    if (input?.sort === 'desc') {
        sort = 'desc';
    }

    let delFlg: 0 | 1 = 0;
    if (input?.['task-status'] === '1') {
        delFlg = 1;
    }

    return { searchText, sort, delFlg };
};
