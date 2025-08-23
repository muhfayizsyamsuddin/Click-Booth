export interface UserType {
  fullName: string;
  username: string;
  email: string;
  phoneNumber: string;
  password: string;
  tokens: number;
  role: "user" | "admin";
  createdAt: Date;
  updatedAt: Date;
}
