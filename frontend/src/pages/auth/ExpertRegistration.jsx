import React from 'react';

const ExpertRegistration = () => {
  return (
    <div className="max-w-md mx-auto py-16 px-4">
      <h1 className="text-3xl font-heading font-bold mb-4 text-center">Expert Registration</h1>
      <p className="text-secondary-600 mb-8 text-center">
        Register as a domain expert to connect with colleges and universities for webinars, workshops, and more.
      </p>
      <form className="space-y-6 bg-white p-6 rounded-lg shadow-md border border-border">
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="name">Full Name</label>
          <input type="text" id="name" className="input" placeholder="Enter your full name" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="email">Email</label>
          <input type="email" id="email" className="input" placeholder="Enter your email" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="password">Password</label>
          <input type="password" id="password" className="input" placeholder="Create a password" />
        </div>
        <button type="submit" className="btn btn-primary w-full">Register</button>
      </form>
    </div>
  );
};

export default ExpertRegistration;