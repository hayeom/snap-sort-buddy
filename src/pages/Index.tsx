const Index = () => {
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f0f9ff', 
      padding: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        textAlign: 'center'
      }}>
        <h1 style={{ 
          fontSize: '24px', 
          fontWeight: 'bold', 
          marginBottom: '20px',
          color: '#1f2937'
        }}>
          Snap Sort Buddy
        </h1>
        <p style={{ color: '#6b7280' }}>
          앱이 성공적으로 실행되었습니다!
        </p>
      </div>
    </div>
  );
};

export default Index;