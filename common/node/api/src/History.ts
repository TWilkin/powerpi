interface History {
  type: string;
  entity: string;
  action: string;
  timestamp?: Date;
  message?: object;
}
export default History;
