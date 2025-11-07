const cls = (...c) => c.filter(Boolean).join(" ");

export const Field = ({ label, children, className }) => (
  <label className={cls("flex flex-col gap-1", className)}>
    <span className="text-xs font-medium text-neutral-600">{label}</span>
    {children}
  </label>
);

