import type { TaskType } from "./model-selector";

export interface UserMessage {
  role: "user";
  content: string;
}

export class UserMessageFormatter {
  formatMessage(data: any, task: TaskType): UserMessage {
    // Prosta serializacja danych do stringa
    return {
      role: "user",
      content: typeof data === "string" ? data : JSON.stringify(data),
    };
  }
}
