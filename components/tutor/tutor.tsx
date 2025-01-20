import React from 'react';
import Image from 'next/image';
import { FaCheck } from 'react-icons/fa';

export const TutorCard: React.FC<{ name: string; subject: string; rate: string; rating: number }> = ({
    name,
    subject,
    rate,
    rating,
  }) => (
    <div className="border rounded p-4 shadow hover:shadow-lg transition mb-4 bg-gray-100">
      <div className="flex items-center mb-2">
        <Image
          src="/avatar-placeholder.png"
          alt={name}
          width={50}
          height={50}
          className="rounded-full"
        />
        <div className="ml-4">
          <h3 className="font-bold text-lg">{name}</h3>
          <p className="text-sm text-gray-600">{subject}</p>
        </div>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-700">Rate: {rate}</span>
        <div className="flex items-center">
          <span className="text-sm text-gray-700 mr-1">{rating}</span>
          <FaCheck className="text-green-500" />
        </div>
      </div>
      <button className="mt-2 w-full bg-purple-500 text-white py-2 rounded hover:bg-purple-600">
        Contact
      </button>
    </div>
  );