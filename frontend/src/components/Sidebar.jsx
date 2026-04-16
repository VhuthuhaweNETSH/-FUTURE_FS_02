import React from 'react';

function Sidebar({ activePage, setActivePage }) {
  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: '📊' },
    { id: 'leads', name: 'Leads Management', icon: '👥' },
  ];

  return (
    <div className="w-64 bg-gray-900 text-white min-h-screen p-4">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-center">Mini CRM</h1>
        <p className="text-center text-gray-400 text-sm mt-1">Lead Management</p>
      </div>
      
      <nav>
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActivePage(item.id)}
            className={`w-full text-left px-4 py-3 rounded-lg mb-2 transition flex items-center gap-3 ${
              activePage === item.id 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            <span>{item.icon}</span>
            <span>{item.name}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

export default Sidebar;