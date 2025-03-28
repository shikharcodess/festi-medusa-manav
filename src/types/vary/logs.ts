export interface VarySyncLog {
  id: string; // 1 ,"2", "3" ,"4"
  start_time: Date;
  end_time: Date;
  modified_actions: number;
  count_on_vary: number;
  count_on_medusa: number;
  metadata?: Record<string, any>;
}
