export default interface PaginationResponse<TRecord> {
    records: number;
    data: TRecord[] | undefined;
}
