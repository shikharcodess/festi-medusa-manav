export interface VaryServiceOptions {
  varyApiUrl: string;
  varyUser: string;
  varyPassword: string;
}

export interface MedusaProductAssoc {
  id: string;
  name: string;
  metadata: Record<string, unknown>;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date;
}
