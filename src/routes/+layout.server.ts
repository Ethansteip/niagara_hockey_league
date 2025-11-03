export const load = async ({ locals: { getSession, getProfile }, cookies }) => {
  return {
    session: await getSession(),
    profile: await getProfile(),
    cookies: cookies.getAll(),
  };
};
