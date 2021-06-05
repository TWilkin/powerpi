import Role from "./roles";

interface User {
  email: string;
  role?: Role;
  subject?: string;
}
export default User;
