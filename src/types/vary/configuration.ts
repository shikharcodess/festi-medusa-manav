export interface VarySyncConfiguration {
  id: string;
  active: boolean;
  trigger_duration: number;
  trigger_unit: string;
  metadata?: Record<string, any>;
}
