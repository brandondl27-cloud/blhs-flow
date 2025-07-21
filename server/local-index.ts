import express, { type Request, Response, NextFunction } from "express";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Basic API routes for local development
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'BLHS Flow local server running' });
});

// Placeholder API routes that return empty data
app.get('/api/auth/user', (req, res) => {
  res.status(401).json({ message: 'No authentication configured for local development' });
});

app.get('/api/tasks', (req, res) => {
  res.json([]);
});

app.get('/api/users', (req, res) => {
  res.json([]);
});

app.get('/api/dashboard/stats', (req, res) => {
  res.json({
    totalTasks: 0,
    inProgress: 0,
    completed: 0,
    overdue: 0
  });
});

app.get('/api/dashboard/activity', (req, res) => {
  res.json([]);
});

app.get('/api/suggestions', (req, res) => {
  res.json([]);
});

app.get('/api/team/members', (req, res) => {
  res.json([]);
});

app.get('/api/team/stats', (req, res) => {
  res.json({
    totalMembers: 0,
    activeMembers: 0,
    departments: {}
  });
});

app.get('/api/calendar/events', (req, res) => {
  res.json([]);
});

// Catch-all for other API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ message: 'API endpoint not implemented in local mode' });
});

(async () => {
  const server = app.listen(5000, "0.0.0.0", () => {
    log(`Server running on port 5000`);
  });

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // Always setup vite in development for local server
  await setupVite(app, server);

  console.log("BLHS Flow Local Server started successfully!");
  console.log("Frontend: http://localhost:5173");
  console.log("API: http://localhost:5000");
})();