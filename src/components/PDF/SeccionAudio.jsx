import React from 'react';
import { PAGE } from '../../utils/constants';
import { PageHeader } from '../Page/PageHeader';
import { PageFooter } from '../Page/PageFooter';

export const SeccionAudio = ({ audio }) => {
  // Si no hay contenido, no mostrar la sección
  if (!audio) return null;

  return (
    <section className={PAGE}>
      <PageHeader title="AUDIO" />
      <div className="page-content">
        <div className="bg-white rounded-lg border p-4">
          <p className="text-neutral-600 text-sm">
            Sección de Audio - En desarrollo
          </p>
        </div>
      </div>
      <PageFooter />
    </section>
  );
};

