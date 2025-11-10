import { PDFUploader } from '../PDF/PDFUploader';

export const PlanosTiendaEditor = ({ 
  data, 
  setData, 
  imageInputRefs,
  loadingPDFs,
  setLoadingPDFs,
  setCurrentLoadingPDF,
  setPdfPagesRendering
}) => {
  return (
    <div>
      <h2 className="text-lg font-semibold text-neutral-800 mb-4">Planos de tienda</h2>
      <PDFUploader
        data={data}
        setData={setData}
        imageInputRefs={imageInputRefs}
        loadingPDFs={loadingPDFs}
        setLoadingPDFs={setLoadingPDFs}
        setCurrentLoadingPDF={setCurrentLoadingPDF}
        setPdfPagesRendering={setPdfPagesRendering}
      />
    </div>
  );
};

