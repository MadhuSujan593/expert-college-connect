import React from 'react';

const Login = () => {
  return (
    <div className="max-w-md mx-auto py-16 px-4">
      <h1 className="text-3xl font-heading font-bold mb-4 text-center">Sign In</h1>
      <p className="text-secondary-600 mb-8 text-center">
        Sign in to your account to access the Expert-College Connect platform.
      </p>
      <form className="space-y-6 bg-white p-6 rounded-lg shadow-md border border-border">
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="email">Email</label>
          <input type="email" id="email" className="input" placeholder="Enter your email" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="password">Password</label>
          <input type="password" id="password" className="input" placeholder="Enter your password" />
        </div>
        <button type="submit" className="btn btn-primary w-full">Sign In</button>
      </form>
    </div>
  );
};

export default Login;