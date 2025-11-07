import { Card } from '../UI/Card';
import { Field } from '../UI/Field';
import { Input } from '../UI/Input';
import { Textarea } from '../UI/Textarea';
import { Button } from '../UI/Button';
import { compressImage } from '../../utils/imageUtils';

export const EquipamientoEditor = ({ data, setData, imageInputRefs }) => {
  return (
    <Card 
      title="Equipamiento instalado" 
      right={
        <Button onClick={() => {
          setData((d) => {
            const c = structuredClone(d);
            c.equipamiento.push({ nombre: "", cantidad: "0", modelo: "", ubicacion: "", url: "", nota: "" });
            return c;
          });
        }}>
          + Añadir
        </Button>
      }
    >
      <div className="space-y-4">
        {data.equipamiento.map((equipo, i) => (
          <div key={i} className="rounded-lg border border-neutral-200 p-4 bg-neutral-50">
            <div className="mb-4 pb-3 border-b border-neutral-300">
              <Field label="Tipo de equipo" className="mb-2">
                <Input
                  value={equipo.nombre}
                  onChange={(e) => {
                    const v = e.target.value;
                    setData((d) => {
                      const c = structuredClone(d);
                      c.equipamiento[i].nombre = v;
                      return c;
                    });
                  }}
                  placeholder="Ej: Altavoces tienda"
                  className="font-semibold"
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-6 mb-4">
              <Field className="md:col-span-2" label="Modelo">
                <Input
                  value={equipo.modelo}
                  onChange={(e) => {
                    const v = e.target.value;
                    setData((d) => {
                      const c = structuredClone(d);
                      c.equipamiento[i].modelo = v;
                      return c;
                    });
                  }}
                />
              </Field>
              <Field className="md:col-span-1" label="Cantidad">
                <Input
                  value={equipo.cantidad}
                  onChange={(e) => {
                    const v = e.target.value;
                    setData((d) => {
                      const c = structuredClone(d);
                      c.equipamiento[i].cantidad = v;
                      return c;
                    });
                  }}
                />
              </Field>
              <Field className="md:col-span-2" label="Ubicación">
                <Input
                  value={equipo.ubicacion}
                  onChange={(e) => {
                    const v = e.target.value;
                    setData((d) => {
                      const c = structuredClone(d);
                      c.equipamiento[i].ubicacion = v;
                      return c;
                    });
                  }}
                />
              </Field>
              <Field className="md:col-span-1 flex items-end" label=" ">
                <Button
                  onClick={() => {
                    setData((d) => {
                      const c = structuredClone(d);
                      c.equipamiento.splice(i, 1);
                      return c;
                    });
                  }}
                  className="w-full bg-red-50 border-red-200 hover:bg-red-100 text-red-700"
                >
                  Borrar
                </Button>
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <Field className="md:col-span-2" label="Subir imagen del equipo">
                <div className="flex gap-2">
                  <Button onClick={() => imageInputRefs.current[`equip_${i}`]?.click()}>
                    Subir foto
                  </Button>
                  <input
                    ref={el => imageInputRefs.current[`equip_${i}`] = el}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        compressImage(e.target.files[0], { maxDim: 1600, quality: 0.85 }).then(base64 => {
                          setData((d) => {
                            const c = structuredClone(d);
                            c.equipamiento[i].url = base64;
                            return c;
                          });
                        });
                      }
                    }}
                  />
                  {equipo.url && (
                    <Button onClick={() => {
                      setData((d) => {
                        const c = structuredClone(d);
                        c.equipamiento[i].url = '';
                        return c;
                      });
                    }}>
                      Limpiar
                    </Button>
                  )}
                </div>
              </Field>
              <Field label="Nota (opcional)">
                <Textarea
                  rows={2}
                  value={equipo.nota}
                  onChange={(e) => {
                    const v = e.target.value;
                    setData((d) => {
                      const c = structuredClone(d);
                      c.equipamiento[i].nota = v;
                      return c;
                    });
                  }}
                  placeholder="Ej: Ubicación específica o detalles adicionales"
                />
              </Field>
            </div>

            {equipo.url && (
              <div className="mt-4 pt-4 border-t border-neutral-300">
                <div className="text-xs text-neutral-600 mb-2 font-semibold">Vista previa de imagen</div>
                <div className="flex justify-start">
                  <img
                    loading="lazy"
                    src={equipo.url}
                    alt={equipo.nombre || 'Vista previa'}
                    className="max-h-40 max-w-xs rounded-lg border shadow-sm"
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
};

