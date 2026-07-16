export interface TableItem {
  id: number;

  name: string;

  style?: string;
  material?: string;
  color?: string;
  shape?: string;

  width?: number;
  depth?: number;
  height?: number;

  diameter?: number; // 👈 AGREGAR ESTA LÍNEA

  price?: number;
  description?: string;

  image_url: string;

  is_active: boolean;
}


export interface ApiResponse<T> {
  data: T;
  message?: string;
}