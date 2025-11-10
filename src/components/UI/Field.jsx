const cls = (...c) => c.filter(Boolean).join(" ");

export const Field = ({ label, children, className }) => (
  <label className={cls("flex flex-col gap-1", className)}>
    <small className="font-medium text-neutral-600 block">{label}</small>
    {children}
  </label>
);

