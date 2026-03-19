import React from 'react';

const Navbar: React.FC = () => {
  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6">
      <h2 className="text-xl font-semibold text-gray-800">Finly Dashboard</h2>
      <div className="flex items-center space-x-4">
        <div className="w-8 h-8 rounded-full bg-primary-100 flex justify-center items-center text-primary-700 font-bold">
          U
        </div>
      </div>
    </header>
  );
};

export default Navbar;
