import { useRef } from 'react';
import { Button } from '../UI/Button';
import { compressImage } from '../../utils/imageUtils';

export const AudioEditor = ({ data, setData, imageInputRefs }) => {
  return (
    <div>
      <h2 className="font-semibold text-neutral-800 mb-4">Audio</h2>
      
      <div className="bg-white rounded-lg border p-4">
        <p className="text-neutral-600 text-sm mb-4">
          Módulo de Audio - En desarrollo
        </p>
      </div>
    </div>
  );
};

