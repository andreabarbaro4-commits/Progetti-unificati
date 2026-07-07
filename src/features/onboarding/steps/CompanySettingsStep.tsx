interface CompanySettingsStepProps {
  onSave: () => void
}

/** Step 12 — company settings modal shown after onboarding completes. */
export function CompanySettingsStep({ onSave }: CompanySettingsStepProps) {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '800px',
          height: '800px',
          background:
            'radial-gradient(circle, rgba(255, 107, 107, 1.7) 0%, rgba(66, 63, 133, 1.7) 60%, transparent 80%)',
          filter: 'blur(120px)',
          mixBlendMode: 'screen',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      {/* Contenitore Modale */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          backgroundColor: '#fff',
          padding: '40px',
          borderRadius: '24px',
          width: '850px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
        }}
      >
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#000', margin: 0 }}>
          Impostazioni azienda
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: '220px 180px 1fr', gap: '40px' }}>
          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              style={{
                backgroundColor: '#000',
                color: '#fff',
                border: 'none',
                padding: '12px',
                borderRadius: '10px',
                textAlign: 'left',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              Dettagli dell'azienda
            </button>
            <button
              style={{
                backgroundColor: 'transparent',
                border: '1px solid #e5e5e5',
                padding: '12px',
                borderRadius: '10px',
                textAlign: 'left',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              Modifica amministratori
            </button>
            <button
              style={{
                backgroundColor: 'transparent',
                border: '1px solid #e5e5e5',
                padding: '12px',
                borderRadius: '10px',
                textAlign: 'left',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              Contatti aziendali
            </button>
            <button
              style={{
                backgroundColor: 'transparent',
                border: '1px solid #e5e5e5',
                padding: '12px',
                borderRadius: '10px',
                textAlign: 'left',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              Fatturazione e pagamento
            </button>
            <button
              style={{
                backgroundColor: 'transparent',
                border: '1px solid #e5e5e5',
                padding: '12px',
                borderRadius: '10px',
                textAlign: 'left',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              Modello e orario di lavoro
            </button>
          </div>

          {/* Logo box */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: '600', color: '#000' }}>Logo</span>
            <div
              style={{
                width: '180px',
                height: '180px',
                border: '1px solid #e5e5e5',
                borderRadius: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#fafafa',
              }}
            >
              <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#ccc' }}>LOGO</span>
            </div>
          </div>

          {/* Form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label
                style={{
                  color: 'black',
                  fontSize: '13px',
                  marginBottom: '4px',
                  display: 'block',
                }}
              >
                Nome dell'azienda
              </label>
              <input
                style={{ width: '100%', padding: '12px', borderRadius: '10px' }}
                placeholder="Company Srl"
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
              <div style={{ flex: 1 }}>
                <label
                  style={{
                    fontSize: '13px',
                    marginBottom: '4px',
                    display: 'block',
                    color: 'black',
                  }}
                >
                  Grandezza team
                </label>
                <select
                  style={{
                    width: '100%',
                    height: '46px',
                    padding: '0 12px',
                    borderRadius: '10px',
                    boxSizing: 'border-box',
                  }}
                >
                  <option>30-50 persone</option>
                </select>
              </div>
              <div
                style={{
                  width: '120px',
                  height: '46px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid #e5e5e5',
                  borderRadius: '10px',
                  backgroundColor: '#f9f9f9',
                  fontSize: '13px',
                  boxSizing: 'border-box',
                }}
              >
                €200/mese
              </div>
            </div>

            <div>
              <label
                style={{
                  color: 'black',
                  fontSize: '13px',
                  marginBottom: '4px',
                  display: 'block',
                }}
              >
                Descrizione
              </label>
              <input
                type="text"
                style={{ width: '100%', padding: '12px', borderRadius: '10px' }}
                placeholder="Company Srl"
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                style={{
                  backgroundColor: '#000',
                  color: '#fff',
                  padding: '10px 20px',
                  borderRadius: '10px',
                }}
                onClick={onSave}
              >
                Salva
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
