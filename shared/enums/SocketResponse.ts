export interface SocketResponse<T> {
    requestId?: string;
    success: boolean;
    data?: T;
    error?: SocketError;
  }

  export const errorOccured: string = 'error-occured';

  export interface SocketError {
    code: string;
    message: string;
    details?: any;
  }