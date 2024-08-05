export interface ResponseApi<T> {
  ack: number;
  data: T[] | T;
  message?: string;
}
