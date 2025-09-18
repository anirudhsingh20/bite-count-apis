export interface QuantityUnit {
  _id?: string;
  name: string;
  shortName: string;
  defaultValue: number;
  incrementValue: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateQuantityUnitRequest {
  name: string;
  shortName: string;
  defaultValue: number;
  incrementValue: number;
}

export interface UpdateQuantityUnitRequest {
  name?: string;
  shortName?: string;
  defaultValue?: number;
  incrementValue?: number;
}

export interface QuantityUnitSearchParams {
  name?: string;
  shortName?: string;
  page?: number;
  limit?: number;
}
