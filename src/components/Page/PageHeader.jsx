export const PageHeader = ({ title, subtitle, meta, left }) => (
  <div className="page-header">
    <div className="flex items-start justify-between mb-4 pb-3 border-b-2 border-neutral-800">
      <div className="flex-1">
        {left ? (
          left
        ) : (
          <>
            <h2 className="section-title">{title}</h2>
            {subtitle && <p className="section-subtitle mt-1">{subtitle}</p>}
          </>
        )}
      </div>
      {/* Cliente/Código fija a la derecha en todas las páginas */}
      {meta?.cliente || meta?.codigo ? (
        <div className="text-right ml-4 meta-top-right">
          {meta?.cliente && <p className="meta-cliente">{meta.cliente}</p>}
          {meta?.codigo && <p className="meta-codigo">Código: {meta.codigo}</p>}
        </div>
      ) : null}
    </div>
  </div>
);

