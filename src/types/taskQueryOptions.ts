// 一覧ページの検索条件を保持する型
export type TaskQueryOptions = {
    searchText: string;
    sort: 'asc' | 'desc';
    delFlg: 0 | 1;
}