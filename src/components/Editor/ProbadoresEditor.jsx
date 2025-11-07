import { Card } from '../UI/Card';
import { Button } from '../UI/Button';
import { compressImage } from '../../utils/imageUtils';

export const ProbadoresEditor = ({ data, setData, imageInputRefs }) => {
  return (
    <Card title="Probadores">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={data.secciones.probadores}
            onChange={(e) => {
              setData((d) => {
                const c = structuredClone(d);
                c.probadores.activo = e.target.checked;
                c.secciones.probadores = e.target.checked;
                return c;
              });
            }}
            className="w-4 h-4"
          />
          <label className="text-sm font-semibold text-neutral-700">
            Incluir en PDF exportado
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Probador Ocupado */}
        <div className="bg-white rounded-lg border p-3">
          <div className="text-xs font-semibold text-neutral-700 mb-2">PROBADOR OCUPADO</div>
          <div className="flex gap-2 mb-2">
            <Button onClick={() => imageInputRefs.current['probadorOcupado']?.click()}>
              Subir
            </Button>
            <input
              ref={el => imageInputRefs.current['probadorOcupado'] = el}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                if (e.target.files?.[0]) {
                  const base64 = await compressImage(e.target.files[0], { maxDim: 1600, quality: 0.85 });
                  setData((d) => {
                    const c = structuredClone(d);
                    c.probadores.probadorOcupado = {
                      url: base64,
                      fileName: e.target.files[0].name,
                      fileSize: e.target.files[0].size
                    };
                    return c;
                  });
                }
              }}
            />
            {data.probadores.probadorOcupado?.url && (
              <Button onClick={() => {
                setData((d) => {
                  const c = structuredClone(d);
                  c.probadores.probadorOcupado = { url: '', fileName: undefined, fileSize: undefined };
                  return c;
                });
              }}>
                Limpiar
              </Button>
            )}
          </div>
          {data.probadores.probadorOcupado?.url && (
            <div>
              <img loading="lazy" src={data.probadores.probadorOcupado.url} alt="Probador ocupado" className="max-h-32 w-full object-contain rounded border" />
              <p className="text-xs text-neutral-600 mt-1">{data.probadores.probadorOcupado.fileName}</p>
            </div>
          )}
        </div>

        {/* Probador Liberado */}
        <div className="bg-white rounded-lg border p-3">
          <div className="text-xs font-semibold text-neutral-700 mb-2">PROBADOR LIBERADO</div>
          <div className="flex gap-2 mb-2">
            <Button onClick={() => imageInputRefs.current['probadorLiberado']?.click()}>
              Subir
            </Button>
            <input
              ref={el => imageInputRefs.current['probadorLiberado'] = el}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                if (e.target.files?.[0]) {
                  const base64 = await compressImage(e.target.files[0], { maxDim: 1600, quality: 0.85 });
                  setData((d) => {
                    const c = structuredClone(d);
                    c.probadores.probadorLiberado = {
                      url: base64,
                      fileName: e.target.files[0].name,
                      fileSize: e.target.files[0].size
                    };
                    return c;
                  });
                }
              }}
            />
            {data.probadores.probadorLiberado?.url && (
              <Button onClick={() => {
                setData((d) => {
                  const c = structuredClone(d);
                  c.probadores.probadorLiberado = { url: '', fileName: undefined, fileSize: undefined };
                  return c;
                });
              }}>
                Limpiar
              </Button>
            )}
          </div>
          {data.probadores.probadorLiberado?.url && (
            <div>
              <img loading="lazy" src={data.probadores.probadorLiberado.url} alt="Probador liberado" className="max-h-32 w-full object-contain rounded border" />
              <p className="text-xs text-neutral-600 mt-1">{data.probadores.probadorLiberado.fileName}</p>
            </div>
          )}
        </div>

        {/* Pasillo Probadores */}
        <div className="bg-white rounded-lg border p-3">
          <div className="text-xs font-semibold text-neutral-700 mb-2">PASILLO PROBADORES</div>
          <div className="flex gap-2 mb-2">
            <Button onClick={() => imageInputRefs.current['pasilloProbadores']?.click()}>
              Subir
            </Button>
            <input
              ref={el => imageInputRefs.current['pasilloProbadores'] = el}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                if (e.target.files?.[0]) {
                  const base64 = await compressImage(e.target.files[0], { maxDim: 1600, quality: 0.85 });
                  setData((d) => {
                    const c = structuredClone(d);
                    c.probadores.pasilloProbadores = {
                      url: base64,
                      fileName: e.target.files[0].name,
                      fileSize: e.target.files[0].size
                    };
                    return c;
                  });
                }
              }}
            />
            {data.probadores.pasilloProbadores?.url && (
              <Button onClick={() => {
                setData((d) => {
                  const c = structuredClone(d);
                  c.probadores.pasilloProbadores = { url: '', fileName: undefined, fileSize: undefined };
                  return c;
                });
              }}>
                Limpiar
              </Button>
            )}
          </div>
          {data.probadores.pasilloProbadores?.url && (
            <div>
              <img loading="lazy" src={data.probadores.pasilloProbadores.url} alt="Pasillo probadores" className="max-h-32 w-full object-contain rounded border" />
              <p className="text-xs text-neutral-600 mt-1">{data.probadores.pasilloProbadores.fileName}</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

