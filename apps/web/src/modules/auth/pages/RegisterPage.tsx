import React from 'react';
import { Link } from 'react-router-dom';

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Create Account</h1>
        <p className="text-gray-600 mb-6">
          Registration is handled through the Login page.
        </p>
        <Link to="/login" className="btn-primary">
          Go to Login
        </Link>
      </div>
    </div>
  );
}
