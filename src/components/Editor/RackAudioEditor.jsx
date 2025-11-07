import { Card } from '../UI/Card';
import { Field } from '../UI/Field';
import { Textarea } from '../UI/Textarea';
import { Input } from '../UI/Input';
import { Button } from '../UI/Button';
import { compressImage } from '../../utils/imageUtils';
import { updateData } from '../../utils/dataUtils';

export const RackAudioEditor = ({ data, setData, imageInputRefs }) => {
  return (
    <Card title="Rack de audio">
      <Field label="Descripción">
        <Textarea rows={4} value={data.rackAudio.descripcion} onChange={(e) => updateData(setData, "rackAudio.descripcion", e.target.value)} />
      </Field>
      <Field label="Observaciones (opcional)" className="mt-3">
        <Textarea rows={2} value={data.rackAudio.observaciones} onChange={(e) => updateData(setData, "rackAudio.observaciones", e.target.value)} />
      </Field>
      <div className="mt-4">
        <div className="text-sm font-semibold mb-2">Fotografías</div>
        {data.rackAudio.fotos.map((foto, idx) => (
          <div key={idx} className="mb-3 p-3 bg-neutral-50 rounded-lg border">
            <div className="flex gap-2 mb-2">
              <Button onClick={() => imageInputRefs.current[`rackAudio_${idx}`]?.click()}>
                Subir foto {idx + 1}
              </Button>
              <input
                ref={el => imageInputRefs.current[`rackAudio_${idx}`] = el}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  if (e.target.files?.[0]) {
                    const base64 = await compressImage(e.target.files[0], { maxDim: 1600, quality: 0.85 });
                    setData((d) => {
                      const c = structuredClone(d);
                      if (!c.rackAudio.fotos[idx]) c.rackAudio.fotos[idx] = {};
                      c.rackAudio.fotos[idx].url = base64;
                      c.rackAudio.fotos[idx].fileName = e.target.files[0].name;
                      c.rackAudio.fotos[idx].fileSize = e.target.files[0].size;
                      return c;
                    });
                  }
                }}
              />
              {foto.url && (
                <Button onClick={() => {
                  setData((d) => {
                    const c = structuredClone(d);
                    c.rackAudio.fotos[idx] = { url: '' };
                    return c;
                  });
                }}>
                  Limpiar
                </Button>
              )}
              <Button onClick={() => {
                setData((d) => {
                  const c = structuredClone(d);
                  c.rackAudio.fotos.push({ url: '', descripcion: '' });
                  return c;
                });
              }}>
                + Añadir foto
              </Button>
            </div>
            {foto.url && (
              <div className="mb-2">
                <img src={foto.url} alt="Vista previa" className="max-h-32 rounded border" />
              </div>
            )}
            <Input
              placeholder="Descripción de la foto (opcional)"
              value={foto.descripcion || ''}
              onChange={(e) => {
                const v = e.target.value;
                setData((d) => {
                  const c = structuredClone(d);
                  c.rackAudio.fotos[idx].descripcion = v;
                  return c;
                });
              }}
            />
          </div>
        ))}
      </div>
    </Card>
  );
};

