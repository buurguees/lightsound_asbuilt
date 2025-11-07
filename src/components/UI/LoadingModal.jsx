export const LoadingModal = ({ isVisible, fileName }) => {
  if (!isVisible) return null;
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '40px',
        textAlign: 'center',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
        minWidth: '300px'
      }}>
        <div style={{
          display: 'inline-block',
          width: '60px',
          height: '60px',
          border: '5px solid #e5e7eb',
          borderTop: '5px solid #0ea5e9',
          borderRight: '5px solid #0ea5e9',
          borderRadius: '50%',
          marginBottom: '20px',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', margin: '0 0 8px 0' }}>
          Procesando PDF...
        </p>
        <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>
          {fileName}
        </p>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
};

