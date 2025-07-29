import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createAuthClient } from "better-auth/react";
import { useEffect, useRef } from "react";

const {
  signIn: AuthSignIn,
  signUp: AuthSignUp,
  signOut: AuthSignOut,
  getSession,
} = createAuthClient({
  baseURL: "http://localhost:3000",
});

export default function useAuth() {
  const listeners = useRef<Record<string, () => void>>({});

  const queryClient = useQueryClient();

  const session = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const session = await getSession();

      if (session.error) {
        throw Error(session.error.message);
      }

      return session.data;
    },
  });

  const invalidate = async <T extends () => Promise<any>>(cb: T) => {
    const res = await cb();
    await queryClient.invalidateQueries({ queryKey: ["session"] });
    return res;
  };

  const signIn: typeof AuthSignIn = {
    email: (args) => invalidate(() => AuthSignIn.email(args)),
    social: (args) => invalidate(() => AuthSignIn.social(args)),
  };

  const signUp: typeof AuthSignUp = {
    email: (args) => invalidate(() => AuthSignUp.email(args)),
  };

  const signOut: typeof AuthSignOut = () => invalidate(() => AuthSignOut());

  const onAuthChange = (listener: () => void) => {
    const id = Object.keys(listeners.current).length;

    listeners.current[id] = listener;

    return () => {
      delete listeners.current[id];
    };
  };

  useEffect(() => {
    Object.values(listeners.current).forEach((listener) => listener());
  }, [session]);

  return { session, signIn, signUp, signOut, onAuthChange };
}
