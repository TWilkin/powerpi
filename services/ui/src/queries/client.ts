import { PowerPiApi } from "@powerpi/common-api";
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient();

export const api = new PowerPiApi(`${window.location.origin}/api`);
