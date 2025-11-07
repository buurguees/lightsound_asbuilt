const cls = (...c) => c.filter(Boolean).join(" ");

export const Button = ({ className, ...props }) => (
  <button
    className={cls(
      "px-3 py-2 rounded-xl border text-sm shadow-sm",
      "bg-white/70 hover:bg-white border-neutral-300",
      className
    )}
    {...props}
  />
);

