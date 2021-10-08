export default interface PaginationResponse<TRecord> {
  page: number;
  records: number;
  data: TRecord[] | undefined;
}
