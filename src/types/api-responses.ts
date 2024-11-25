export interface BaseResponse {
  success: boolean;
  error?: string;
}

export interface TokenCreationResponse extends BaseResponse {
  success: true;
  tokenId: number;
}

export interface ErrorResponse extends BaseResponse {
  success: false;
  error: string;
}
