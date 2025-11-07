const cls = (...c) => c.filter(Boolean).join(" ");

export const Input = (props) => (
  <input
    {...props}
    className={cls(
      "w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm",
      "focus:outline-none focus:ring-2 focus:ring-neutral-300",
      props.className
    )}
  />
);

