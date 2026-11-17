# Authentication

ForgeFlow uses email/password authentication backed by the MySQL users table.

1. Register through `POST /api/auth/register` or the frontend account form.
2. The backend hashes passwords with bcryptjs and returns a signed JWT.
3. The frontend stores the token in localStorage under `forgeflow_token`.
4. Authenticated API requests send the token in the Authorization Bearer header.
5. The API verifies the JWT and reloads the user record for each protected request.

Use HTTPS in production. Set a unique, randomly generated JWT_SECRET of at least 32 characters. Never expose it to the frontend. Password reset, email verification, OAuth and refresh-token rotation are not implemented yet and should be added before public production launch.

New accounts receive the `user` role. To grant an administrator role, use a trusted database administration session:

```sql
UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';
```
