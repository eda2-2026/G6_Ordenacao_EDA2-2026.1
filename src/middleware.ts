import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  matcher: ["/dashboard/:path*", "/lancamentos/:path*", "/comprovante/:path*", "/categorias/:path*", "/relatorios/:path*", "/grupo/:path*"],
};
