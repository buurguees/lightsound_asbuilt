/**
 * Función helper para actualizar datos anidados usando path string
 */
export const updateData = (setData, path, value) => {
  setData((d) => {
    const copy = structuredClone(d);
    const seg = path.split(".");
    let ptr = copy;
    for (let i = 0; i < seg.length - 1; i++) ptr = ptr[seg[i]];
    ptr[seg.at(-1)] = value;
    return copy;
  });
};

