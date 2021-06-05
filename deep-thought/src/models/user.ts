import Role from "./roles";

export default interface User {
  email: string;
  role?: Role;
  subject?: string;
}
