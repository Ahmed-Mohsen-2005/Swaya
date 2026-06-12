export const routePrefixForRole = { teacher:'/teacher', doctor:'/doctor', parent:'/parent' };
export const canAccess = (user, pathname) => {
  if(!user) return false;
  if(pathname === '/' || pathname.startsWith('/login') || pathname.startsWith('/not-authorized')) return true;
  if(pathname === '/profile' || pathname === '/notifications' || pathname.startsWith('/settings/')) return true;
  return pathname.startsWith(routePrefixForRole[user.role]);
};
