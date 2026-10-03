// Role landing page after login. Each role gets its own home:
// jobseeker/admin → job board, employer → hiring dashboard.
export function roleHome(user) {
  if (user?.role === 'employer') return '/dashboard';
  return '/jobs'; // jobseeker + admin
}
