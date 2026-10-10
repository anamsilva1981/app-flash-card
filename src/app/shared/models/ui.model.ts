export interface AppNotice {
  type: "success" | "error" | "info";
  title: string;
  text: string;
}
