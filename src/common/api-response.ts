export class ApiResponse<T = any> {
  private data: T;
  private message: string;

  constructor(data: T = null, message = 'ok') {
    this.data = data;
    this.message = message;
  }
}
