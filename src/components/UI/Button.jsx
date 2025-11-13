const cls = (...c) => c.filter(Boolean).join(" ");

export const Button = ({ className, ...props }) => {
  // Si la className incluye text-white o text-black, no aplicar color por defecto
  const hasTextColor = className?.includes('text-white') || className?.includes('text-black') || className?.includes('text-neutral');
  const defaultTextColor = hasTextColor ? '' : 'text-neutral-800';
  
  return (
    <button
      className={cls(
        "px-3 py-2 rounded-xl border text-sm shadow-sm",
        "bg-white/70 hover:bg-white border-neutral-300",
        defaultTextColor,
        className
      )}
      {...props}
    />
  );
};

