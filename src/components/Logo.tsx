import React from 'react';
import { Users } from 'lucide-react';

const Logo: React.FC = () => {
  return (
    <div className="flex items-center mb-6">
      <div className="text-indigo-500 p-2 rounded-lg mr-2">
        <Users className="h-6 w-6 " />
      </div>
      <h1 className="text-2xl font-semibold  text-indigo-500">
        AlumUnity
      </h1>
    </div>
  );
};

export default Logo;