const cls = (...c) => c.filter(Boolean).join(" ");

export const Button = ({ className = "", ...props }) => {
  // Si la className incluye colores personalizados, no aplicar estilos por defecto
  const hasCustomBg = className.includes('bg-');
  const hasTextColor = className.includes('text-white') || className.includes('text-black') || className.includes('text-neutral');
  
  // Estilos por defecto solo si no hay estilos personalizados
  const defaultStyles = hasCustomBg ? '' : "bg-white/70 hover:bg-white border-neutral-300";
  const defaultTextColor = hasTextColor ? '' : 'text-neutral-800';
  const defaultBorder = hasCustomBg ? '' : 'border';
  
  // Si hay estilos personalizados, ponerlos al final para que tengan prioridad
  return (
    <button
      className={cls(
        "px-3 py-2 rounded-xl text-sm shadow-sm",
        !hasCustomBg && defaultBorder,
        !hasCustomBg && defaultStyles,
        !hasTextColor && defaultTextColor,
        className
      )}
      {...props}
    />
  );
};

