export interface ActionState {
  ok?: boolean;
  message?: string;
  warning?: string;
  error?: string;
  fieldErrors?: Record<string, string>;
}

export const INITIAL_ACTION_STATE: ActionState = {};
