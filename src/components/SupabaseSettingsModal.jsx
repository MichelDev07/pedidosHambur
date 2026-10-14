import React, { useState, useEffect } from 'react';
import { X, Database, Check, AlertCircle, Copy, Terminal, ExternalLink, RefreshCw } from 'lucide-react';
import { getActiveCredentials, saveSupabaseCredentials, clearSupabaseCredentials, testSupabaseConnection } from '../supabase';
import { SQL_SCHEMA_SCRIPT } from '../data/initialData';

export const SupabaseSettingsModal = ({ isOpen, onClose, onConfigSaved }) => {
  if (!isOpen) return null;

  const currentCreds = getActiveCredentials();
  const [url, setUrl] = useState(currentCreds.url);
  const [key, setKey] = useState(currentCreds.key);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [activeTab, setActiveTab] = useState('credentials'); // 'credentials' | 'sql'

  useEffect(() => {
    const creds = getActiveCredentials();
    setUrl(creds.url);
    setKey(creds.key);
    setTestResult(null);
  }, [isOpen]);

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    // Guardar temporalmente para probar
    saveSupabaseCredentials(url, key);
    const res = await testSupabaseConnection();
    setTestResult(res);
    setIsTesting(false);
  };

  const handleSave = () => {
    saveSupabaseCredentials(url, key);
    if (onConfigSaved) onConfigSaved();
    onClose();
  };

  const handleClear = () => {
    if (window.confirm('¿Deseas desvincular las credenciales de Supabase? La app volverá al modo local offline.')) {
      clearSupabaseCredentials();
      setUrl('');
      setKey('');
      setTestResult(null);
      if (onConfigSaved) onConfigSaved();
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SQL_SCHEMA_SCRIPT);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '620px' }}>
        {/* Encabezado */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Database size={20} color="var(--amber-light)" />
            <h3 style={{ fontSize: '1.2rem' }}>Configuración de Base de Datos Supabase</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Pestañas */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', background: 'rgba(0, 0, 0, 0.2)' }}>
          <button
            onClick={() => setActiveTab('credentials')}
            style={{
              flex: 1,
              padding: '0.75rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'credentials' ? '2px solid var(--amber-primary)' : '2px solid transparent',
              color: activeTab === 'credentials' ? 'var(--amber-light)' : 'var(--text-muted)',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Credenciales de Conexión
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            style={{
              flex: 1,
              padding: '0.75rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'sql' ? '2px solid var(--amber-primary)' : '2px solid transparent',
              color: activeTab === 'sql' ? 'var(--amber-light)' : 'var(--text-muted)',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Script SQL (Tablas)
          </button>
        </div>

        <div className="modal-body">
          {activeTab === 'credentials' ? (
            <>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                Esta aplicación es <strong>100% estática</strong> (sin servidor backend). Se comunica directamente con tu proyecto Supabase usando la clave anónima pública (<code style={{ color: 'var(--amber-light)' }}>anon key</code>).
              </p>

              {/* Indicador de resultado de test */}
              {testResult && (
                <div 
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '1.25rem',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    background: testResult.ok ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                    border: `1px solid ${testResult.ok ? 'var(--green-solidario)' : 'var(--red-cancel)'}`,
                    color: testResult.ok ? '#6ee7b7' : '#fda4af'
                  }}
                >
                  {testResult.ok ? <Check size={18} /> : <AlertCircle size={18} />}
                  <span>{testResult.message}</span>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">
                  Project URL de Supabase <span className="req">*</span>
                </label>
                <input 
                  type="url" 
                  className="form-input" 
                  placeholder="https://xyzcompany.supabase.co" 
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.25rem', display: 'block' }}>
                  La encontrás en Supabase &gt; Project Settings &gt; Configuration &gt; API
                </span>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Anon Public API Key <span className="req">*</span>
                </label>
                <textarea 
                  className="form-textarea" 
                  style={{ minHeight: '65px', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.25rem', display: 'block' }}>
                  Es la clave pública anónima (segura para usar en el navegador).
                </span>
              </div>

              <div style={{ display: 'flex', gap: '0.6rem', marginTop: '1rem' }}>
                <button 
                  type="button" 
                  className="btn-secondary" 
                  onClick={handleTest}
                  disabled={isTesting || !url || !key}
                  style={{ fontSize: '0.85rem', padding: '0.6rem 1rem' }}
                >
                  <RefreshCw size={15} className={isTesting ? 'spinning' : ''} />
                  <span>{isTesting ? 'Probando...' : 'Probar Conexión'}</span>
                </button>

                <a 
                  href="https://supabase.com/dashboard" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="btn-secondary"
                  style={{ fontSize: '0.85rem', padding: '0.6rem 1rem', textDecoration: 'none' }}
                >
                  <ExternalLink size={15} />
                  <span>Ir a Supabase</span>
                </a>

                {currentCreds.isConfigured && (
                  <button 
                    type="button" 
                    className="btn-secondary"
                    onClick={handleClear}
                    style={{ fontSize: '0.85rem', padding: '0.6rem 1rem', marginLeft: 'auto', color: 'var(--red-cancel)' }}
                  >
                    Desvincular
                  </button>
                )}
              </div>
            </>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Ejecutá este script en el <strong>SQL Editor</strong> de Supabase para crear las tablas y permisos RLS:
                </span>
                <button 
                  className="btn-primary" 
                  onClick={handleCopySql} 
                  style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem' }}
                >
                  {copiedSql ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copiedSql ? '¡Copiado!' : 'Copiar Script'}</span>
                </button>
              </div>

              <div 
                style={{
                  background: 'rgba(0, 0, 0, 0.45)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  maxHeight: '300px',
                  overflowY: 'auto'
                }}
              >
                <pre style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--amber-light)', whiteSpace: 'pre-wrap' }}>
                  {SQL_SCHEMA_SCRIPT}
                </pre>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer" style={{ justifyContent: 'flex-end' }}>
          <button className="btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn-primary" onClick={handleSave}>
            <Check size={16} />
            <span>Guardar Configuración</span>
          </button>
        </div>
      </div>
    </div>
  );
};
