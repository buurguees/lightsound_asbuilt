import { Card } from '../UI/Card';
import { Field } from '../UI/Field';
import { Input } from '../UI/Input';
import { Textarea } from '../UI/Textarea';
import { Button } from '../UI/Button';

export const ElementosInstaladosEditor = ({ data, setData }) => {
  return (
    <Card title="Elementos Instalados">
      <div className="space-y-4">
        {/* Botón Añadir dentro del contenido */}
        <div className="mb-4">
          <Button 
            onClick={() => {
              setData((d) => {
                const c = structuredClone(d);
                c.equipamiento.push({ nombre: "", cantidad: "", nota: "" });
                return c;
              });
            }}
            className="w-full bg-blue-50 border-blue-200 hover:bg-blue-100 text-blue-700"
          >
            + Añadir elemento
          </Button>
        </div>

        {/* Tabla de elementos */}
        {data.equipamiento.length === 0 ? (
          <div className="text-center py-8 text-neutral-400 text-sm">
            No hay elementos instalados. Haz clic en "Añadir elemento" para comenzar.
          </div>
        ) : (
          <div className="space-y-3">
            {data.equipamiento.map((equipo, i) => (
              <div key={i} className="rounded-lg border border-neutral-200 p-4 bg-neutral-50">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-12 items-end">
                  <Field className="md:col-span-4" label="Tipo de equipo">
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
                      placeholder="Ej: Pantallas LED, Altavoces, etc."
                      className="font-semibold"
                    />
                  </Field>
                  
                  <Field className="md:col-span-2" label="Cantidad">
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
                      placeholder="Ej: 10"
                    />
                  </Field>
                  
                  <Field className="md:col-span-5" label="Nota (opcional)">
                    <Textarea
                      rows={1}
                      value={equipo.nota}
                      onChange={(e) => {
                        const v = e.target.value;
                        setData((d) => {
                          const c = structuredClone(d);
                          c.equipamiento[i].nota = v;
                          return c;
                        });
                      }}
                      placeholder="Detalles adicionales"
                    />
                  </Field>
                  
                  <Field className="md:col-span-1" label=" ">
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
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};

