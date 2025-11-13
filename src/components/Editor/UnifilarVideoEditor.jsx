import { Field } from '../UI/Field';
import { Textarea } from '../UI/Textarea';
import { Input } from '../UI/Input';
import { Button } from '../UI/Button';
import { compressImage } from '../../utils/imageUtils';
import { updateData } from '../../utils/dataUtils';

export const UnifilarVideoEditor = ({ data, setData, imageInputRefs }) => {
  return (
    <div>
      <h2 className="font-semibold text-neutral-800 mb-4">Unifilar vídeo</h2>
      <Field label="Detalle">
        <Textarea rows={4} value={data.unifilarVideo.detalle} onChange={(e) => updateData(setData, "unifilarVideo.detalle", e.target.value)} />
      </Field>
      <Field label="Observaciones (opcional)" className="mt-3">
        <Textarea rows={2} value={data.unifilarVideo.observaciones} onChange={(e) => updateData(setData, "unifilarVideo.observaciones", e.target.value)} />
      </Field>
      <div className="mt-4">
        <h3 className="font-semibold mb-2">Fotografías</h3>
        {data.unifilarVideo.fotos.map((foto, idx) => (
          <div key={idx} className="mb-3 p-3 bg-neutral-50 rounded-lg border">
            <div className="flex gap-2 mb-2">
              <Button onClick={() => imageInputRefs.current[`unifilar_${idx}`]?.click()}>
                Subir foto {idx + 1}
              </Button>
              <input
                ref={el => imageInputRefs.current[`unifilar_${idx}`] = el}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  if (e.target.files?.[0]) {
                    const base64 = await compressImage(e.target.files[0], { maxDim: 1000, quality: 0.65 });
                    setData((d) => {
                      const c = structuredClone(d);
                      if (!c.unifilarVideo.fotos[idx]) c.unifilarVideo.fotos[idx] = {};
                      c.unifilarVideo.fotos[idx].url = base64;
                      c.unifilarVideo.fotos[idx].fileName = e.target.files[0].name;
                      c.unifilarVideo.fotos[idx].fileSize = e.target.files[0].size;
                      return c;
                    });
                  }
                }}
              />
              {foto.url && (
                <Button onClick={() => {
                  setData((d) => {
                    const c = structuredClone(d);
                    c.unifilarVideo.fotos[idx] = { url: '' };
                    return c;
                  });
                }}>
                  Limpiar
                </Button>
              )}
              <Button onClick={() => {
                setData((d) => {
                  const c = structuredClone(d);
                  c.unifilarVideo.fotos.push({ url: '', descripcion: '' });
                  return c;
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
                  const c = structuredClone(d);
                  c.unifilarVideo.fotos[idx].descripcion = v;
                  return c;
                });
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

