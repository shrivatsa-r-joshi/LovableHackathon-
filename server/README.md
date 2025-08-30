# BlogGate Express Server

Deploy this folder to a Node host (Render or Railway) and connect it to MongoDB Atlas.

Links:
- MongoDB Atlas: https://www.mongodb.com/atlas/database
- Render (Express deploy): https://render.com/docs/deploy-node-express-app
- Railway (Express deploy): https://docs.railway.app/guides/deploy-expressjs
- Vercel env vars (front end): https://vercel.com/docs/projects/environment-variables

Env vars:
- MONGODB_URI=your Atlas URI
- JWT_SECRET=strong random string
- CORS_ORIGIN=https://your-frontend-domain.vercel.app (or your v0 preview URL)
- PORT=optional; provider often sets it

Endpoints:
- POST /api/auth/register, POST /api/auth/login, GET /api/auth/me
- GET /api/blogs?search=&category=&sort=new|trending
- GET /api/blogs/:id (id or slug)
- POST /api/blogs (auth)
- PUT /api/blogs/:id (owner/admin)
- DELETE /api/blogs/:id (owner/admin)
- POST /api/blogs/:id/like (auth)
- PUT /api/blogs/:id/status (admin)
- GET /api/health
