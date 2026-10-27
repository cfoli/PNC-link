import {
  getUser,
  login,
  signup,
  logout,
  requestPasswordRecovery,
  confirmEmail,
  acceptInvite,
  recoverPassword,
  refreshSession,
  verifyRequestOrigin,
  AuthError,
} from "@netlify/identity";
import { text, email } from "../../shared/domain.mjs";
export default async (req: Request) => {
  try {
    if (req.method === "GET") {
      try {
        if (await refreshSession()) return Response.json({ refreshed: true });
      } catch {}
      const user = await getUser();
      return Response.json({
        user: user
          ? {
              id: user.id,
              email: user.email,
              name: user.name,
              roles: user.roles ?? [],
            }
          : null,
      });
    }
    if (req.method !== "POST")
      return new Response("Method not allowed", { status: 405 });
    verifyRequestOrigin(req);
    const p = await req.json();
    let user;
    const password = () => {
      if (typeof p.password !== "string" || p.password.length > 256)
        throw new Error("Invalid password.");
      return p.password;
    };
    if (p.action === "login") user = await login(email(p.email), password());
    else if (p.action === "signup") {
      const pass = password();
      if (pass.length < 12)
        return Response.json(
          { error: "Use a password with at least 12 characters." },
          { status: 400 },
        );
      user = await signup(email(p.email), pass, {
        full_name: text(p.name, 200),
      });
      if (!user.confirmedAt)
        return Response.json({
          message: "Check your email to confirm your account, then sign in.",
        });
    } else if (p.action === "logout") {
      await logout();
      return Response.json({ ok: true });
    } else if (p.action === "recover") {
      await requestPasswordRecovery(email(p.email));
      return Response.json({
        message:
          "If the account is eligible, a password reset email is on its way.",
      });
    } else if (p.action === "confirm")
      user = await confirmEmail(text(p.token, 3000));
    else if (["invite", "reset"].includes(p.action)) {
      const pass = password();
      if (pass.length < 12)
        return Response.json(
          { error: "Use at least 12 characters." },
          { status: 400 },
        );
      user =
        p.action === "invite"
          ? await acceptInvite(text(p.token, 3000), pass)
          : await recoverPassword(text(p.token, 3000), pass);
    } else
      return Response.json(
        { error: "Unknown authentication action." },
        { status: 400 },
      );
    return Response.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        roles: user.roles ?? [],
      },
    });
  } catch (e: any) {
    return Response.json(
      {
        error:
          e instanceof AuthError
            ? "Authentication could not complete. Check your details, confirmation email, or request a new link."
            : "Authentication is unavailable. Please try again.",
      },
      { status: e instanceof AuthError ? 400 : 503 },
    );
  }
};
export const config = { path: "/api/auth" };
