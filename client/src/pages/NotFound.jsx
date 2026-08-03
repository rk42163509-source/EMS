import { Link } from "react-router-dom";

const NotFound = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6">
    <h1 className="text-8xl font-bold text-indigo-600">404</h1>
    <p className="text-xl text-slate-600 mt-4">Page not found</p>
    <p className="text-slate-400 mt-2">The page you're looking for doesn't exist.</p>
    <Link to="/dashboard" className="btn-primary mt-8">Back to Dashboard</Link>
  </div>
);

export default NotFound;
