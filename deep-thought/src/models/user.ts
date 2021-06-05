import Role from "../roles";

interface User {
  name: string;
  role: Role | undefined;
}
export default User;
