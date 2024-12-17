import { jwtDecode, JwtPayload } from "jwt-decode";
import { useCookies } from "react-cookie";

type JWTCookie = {
    email: string | undefined;
} & JwtPayload;

/** Hook to retrieve the id of the currently logged in user (if any).
 * @return The currently logged in user.
 */
export default function useUser() {
    const [cookies] = useCookies(["jwt"]);

    if (cookies.jwt) {
        try {
            const decoded = jwtDecode<JWTCookie>(cookies.jwt);

            return decoded.email;
        } catch {
            return undefined;
        }
    }

    return undefined;
}
