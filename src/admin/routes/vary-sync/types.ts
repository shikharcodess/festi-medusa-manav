export interface VarySyncConfiguration {
  id: string;
  active: boolean;
  trigger_duration: number;
  trigger_unit: string;
  metadata?: Record<string, any>;
}

export interface VarySyncLogs {
  id: string;
  start_time: Date;
  end_time: Date;
  modified_actions: number;
  count_on_vary: number;
  count_on_medusa: number;
  metadata?: Record<string, any>;
}
