export const PageHeader = ({ title, subtitle }) => (
  <div className="page-header">
    <div className="border-b-2 border-neutral-800 pb-3">
      <h2 className="text-xl font-bold text-neutral-800">{title}</h2>
      {subtitle && <p className="text-sm text-neutral-600 mt-1">{subtitle}</p>}
    </div>
  </div>
);

