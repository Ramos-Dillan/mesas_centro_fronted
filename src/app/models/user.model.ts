export interface User {
  id: number;
  username: string;
  email: string;
}

export interface LoginResponse {
  data: {
    access_token: string;
    user: User;
  };
  message: string;
  status: string;
}

export interface RegisterResponse {
  data: User;
  message: string;
  status: string;
}