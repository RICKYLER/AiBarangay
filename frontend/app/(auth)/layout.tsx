/**
 * Auth pages (login / register / verify-account) render standalone —
 * no public nav shell around them.
 */
export default function AuthGroupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
