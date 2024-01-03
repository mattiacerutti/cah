export interface SocketResponse<T> {
    success: boolean;
    data?: T;
    error?: SocketError;
  }

  export interface SocketError {
    code: string;
    message: string;
    details?: any;
  }