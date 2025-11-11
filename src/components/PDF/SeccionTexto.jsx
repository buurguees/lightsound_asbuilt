import React from 'react';
import { PAGE } from '../../utils/constants';
import { PageHeader } from '../Page/PageHeader';
import { PageFooter } from '../Page/PageFooter';

export const SeccionTexto = ({ titulo, contenido, meta }) => {
  if (!contenido) return null;
  return (
    <section className={PAGE}>
      <PageHeader title={titulo} meta={meta} />
      <div className="page-content">
        <div className="flex-1 whitespace-pre-wrap rounded-xl border-2 border-neutral-300 bg-white p-6 text-sm leading-relaxed overflow-auto">
          {contenido}
        </div>
      </div>
      <PageFooter />
    </section>
  );
};


