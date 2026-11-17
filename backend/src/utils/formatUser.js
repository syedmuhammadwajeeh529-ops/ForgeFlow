
export function formatUser(user) {
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    created_date: user.created_date || user.created_at || null,
    updated_date: user.updated_date || user.updated_at || null
  };
}
