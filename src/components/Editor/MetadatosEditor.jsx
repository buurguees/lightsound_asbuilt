import { useRef } from 'react';
import { Field } from '../UI/Field';
import { Input } from '../UI/Input';
import { Button } from '../UI/Button';
import { compressImage } from '../../utils/imageUtils';

const upd = (setData, path, value) => {
  setData((d) => {
    const copy = structuredClone(d);
    const seg = path.split(".");
    let ptr = copy;
    for (let i = 0; i < seg.length - 1; i++) ptr = ptr[seg[i]];
    ptr[seg.at(-1)] = value;
    return copy;
  });
};

export const MetadatosEditor = ({ data, setData, imageInputRefs }) => {
  return (
    <div>
      <h2 className="font-semibold text-neutral-800 mb-4">Metadatos del informe</h2>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Título">
          <Input value="Informe Fin de Obra" disabled className="bg-neutral-100 cursor-not-allowed" />
        </Field>
        <Field label="Cliente">
          <Input value={data.meta.cliente} onChange={(e) => upd(setData, "meta.cliente", e.target.value)} />
        </Field>
        <Field label="Proyecto">
          <Input value={data.meta.proyecto} onChange={(e) => upd(setData, "meta.proyecto", e.target.value)} />
        </Field>
        <Field label="Código">
          <Input value={data.meta.codigo} onChange={(e) => upd(setData, "meta.codigo", e.target.value)} />
        </Field>
        <Field label="Project Manager">
          <Input value={data.meta.pm} onChange={(e) => upd(setData, "meta.pm", e.target.value)} />
        </Field>
        <Field label="Dirección">
          <Input value={data.meta.direccion} onChange={(e) => upd(setData, "meta.direccion", e.target.value)} />
        </Field>
        <Field label="Versión de plano">
          <Input value={data.meta.versionPlano} onChange={(e) => upd(setData, "meta.versionPlano", e.target.value)} />
        </Field>
        <Field label="Fecha">
          <Input 
            value={data.meta.fecha} 
            onChange={(e) => upd(setData, "meta.fecha", e.target.value)}
            placeholder="DD-MM-AAAA"
            pattern="\d{2}-\d{2}-\d{4}"
            title="Formato: DD-MM-AAAA (ejemplo: 25-12-2024)"
          />
        </Field>
      </div>
      <div className="mt-4 pt-4 border-t">
        <Field label="Foto de entrada de la tienda">
          <div className="flex gap-2">
            <Button onClick={() => imageInputRefs.current['fotoEntrada']?.click()}>
              Subir foto
            </Button>
            <input
              ref={el => imageInputRefs.current['fotoEntrada'] = el}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                if (e.target.files?.[0]) {
                  const base64 = await compressImage(e.target.files[0], { maxDim: 1600, quality: 0.85 });
                  setData((d) => {
                    const c = structuredClone(d);
                    c.meta.fotoEntrada = {
                      url: base64,
                      fileName: e.target.files[0].name,
                      fileSize: e.target.files[0].size
                    };
                    return c;
                  });
                }
              }}
            />
            {data.meta.fotoEntrada?.url && (
              <Button onClick={() => {
                setData((d) => {
                  const c = structuredClone(d);
                  c.meta.fotoEntrada = { url: '' };
                  return c;
                });
              }}>
                Limpiar
              </Button>
            )}
          </div>
          {data.meta.fotoEntrada?.url && (
            <div className="mt-3">
              <small className="text-neutral-600 mb-2 block">Vista previa</small>
              <div className="flex justify-center">
                <img
                  loading="lazy"
                  src={data.meta.fotoEntrada.url}
                  alt="Foto entrada"
                  className="max-h-32 max-w-full rounded-lg border shadow-sm"
                />
              </div>
            </div>
          )}
        </Field>
      </div>
    </div>
  );
};

