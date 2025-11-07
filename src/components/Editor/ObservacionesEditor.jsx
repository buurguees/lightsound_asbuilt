import { Card } from '../UI/Card';
import { Textarea } from '../UI/Textarea';

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

export const ObservacionesEditor = ({ data, setData }) => {
  return (
    <Card title="Observaciones">
      <Textarea rows={3} value={data.observaciones} onChange={(e) => upd(setData, "observaciones", e.target.value)} />
    </Card>
  );
};

