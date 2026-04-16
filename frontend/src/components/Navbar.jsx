import React from 'react';

function Navbar({ user, onLogout }) {
  return (
    <nav className="bg-white shadow-md p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">Welcome back, {user?.username}!</h1>
        <button 
          onClick={onLogout} 
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;