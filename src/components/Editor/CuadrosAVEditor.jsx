import { Field } from '../UI/Field';
import { Input } from '../UI/Input';
import { Textarea } from '../UI/Textarea';
import { Button } from '../UI/Button';
import { compressImage } from '../../utils/imageUtils';

export const CuadrosAVEditor = ({ data, setData, imageInputRefs }) => {
  return (
    <div>
      <h2 className="font-semibold text-neutral-800 mb-4">Cuadros (Eléctrico / AV / Doc)</h2>
      <div className="grid grid-cols-1 gap-3">
        {data.cuadrosAV.items.map((c, i) => (
          <div key={i} className="p-4 bg-neutral-50 rounded-lg border">
            <div className="grid grid-cols-1 gap-2 md:grid-cols-6 mb-3">
              <Field className="md:col-span-2" label="Título">
                <Input
                  value={c.titulo}
                  onChange={(e) => {
                    const v = e.target.value;
                    setData((d) => {
                      const copy = structuredClone(d);
                      copy.cuadrosAV.items[i].titulo = v;
                      return copy;
                    });
                  }}
                />
              </Field>
              <Field className="md:col-span-3" label="Detalle">
                <Textarea
                  rows={3}
                  value={c.detalle}
                  onChange={(e) => {
                    const v = e.target.value;
                    setData((d) => {
                      const copy = structuredClone(d);
                      copy.cuadrosAV.items[i].detalle = v;
                      return copy;
                    });
                  }}
                />
              </Field>
              <div className="md:col-span-1 flex items-end">
                <Button onClick={() => {
                  setData((d) => {
                    const copy = structuredClone(d);
                    copy.cuadrosAV.items.splice(i, 1);
                    return copy;
                  });
                }}>
                  Borrar
                </Button>
              </div>
            </div>
            <Field label="Observaciones (opcional)" className="mb-3">
              <Textarea
                rows={2}
                value={c.observaciones || ''}
                onChange={(e) => {
                  const v = e.target.value;
                  setData((d) => {
                    const copy = structuredClone(d);
                    copy.cuadrosAV.items[i].observaciones = v;
                    return copy;
                  });
                }}
              />
            </Field>
            <div className="mt-3">
              <h3 className="font-semibold mb-2">Fotografías</h3>
              {(c.fotos || []).map((foto, idx) => (
                <div key={idx} className="mb-3 p-3 bg-white rounded border">
                  <div className="flex gap-2 mb-2">
                    <Button onClick={() => imageInputRefs.current[`cuadro_${i}_${idx}`]?.click()}>
                      Subir foto {idx + 1}
                    </Button>
                    <input
                      ref={el => imageInputRefs.current[`cuadro_${i}_${idx}`] = el}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        if (e.target.files?.[0]) {
                          const base64 = await compressImage(e.target.files[0], { maxDim: 1600, quality: 0.85 });
                          setData((d) => {
                            const copy = structuredClone(d);
                            if (!copy.cuadrosAV.items[i].fotos) copy.cuadrosAV.items[i].fotos = [];
                            if (!copy.cuadrosAV.items[i].fotos[idx]) copy.cuadrosAV.items[i].fotos[idx] = {};
                            copy.cuadrosAV.items[i].fotos[idx].url = base64;
                            copy.cuadrosAV.items[i].fotos[idx].fileName = e.target.files[0].name;
                            copy.cuadrosAV.items[i].fotos[idx].fileSize = e.target.files[0].size;
                            return copy;
                          });
                        }
                      }}
                    />
                    {foto.url && (
                      <Button onClick={() => {
                        setData((d) => {
                          const copy = structuredClone(d);
                          copy.cuadrosAV.items[i].fotos[idx] = { url: '' };
                          return copy;
                        });
                      }}>
                        Limpiar
                      </Button>
                    )}
                    <Button onClick={() => {
                      setData((d) => {
                        const copy = structuredClone(d);
                        if (!copy.cuadrosAV.items[i].fotos) copy.cuadrosAV.items[i].fotos = [];
                        copy.cuadrosAV.items[i].fotos.push({ url: '', descripcion: '' });
                        return copy;
                      });
                    }}>
                      + Añadir foto
                    </Button>
                  </div>
                  {foto.url && (
                    <div className="mb-2">
                      <img loading="lazy" src={foto.url} alt="Vista previa" className="max-h-32 rounded border" />
                    </div>
                  )}
                  <Input
                    placeholder="Descripción de la foto (opcional)"
                    value={foto.descripcion || ''}
                    onChange={(e) => {
                      const v = e.target.value;
                      setData((d) => {
                        const copy = structuredClone(d);
                        copy.cuadrosAV.items[i].fotos[idx].descripcion = v;
                        return copy;
                      });
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
        <div>
          <Button onClick={() => {
            setData((d) => {
              const copy = structuredClone(d);
              copy.cuadrosAV.items.push({ titulo: "", detalle: "", fotos: [{ url: '', descripcion: '' }], observaciones: "" });
              return copy;
            });
          }}>
            Añadir cuadro
          </Button>
        </div>
      </div>
    </div>
  );
};

