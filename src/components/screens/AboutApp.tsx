interface Props {
  appAnim: string;
  onGoHome: () => void;
}

export default function AboutApp({ appAnim, onGoHome }: Props) {
  return (
    <div style={{ height: '100%', animation: appAnim, transformOrigin: '50% 30%' }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '8px 16px 14px', position: 'relative', borderBottom: '1px solid #eef0f3' }}>
        <button
          onClick={onGoHome}
          style={{ position: 'absolute', left: 12, background: 'none', border: 'none', cursor: 'pointer', color: '#1d1d1f', display: 'flex', padding: 0 }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
        <span style={{ flex: 1, textAlign: 'center', fontSize: 15, fontWeight: 600 }}>About</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '34px 24px', textAlign: 'center' }}>
        <div style={{
          width: 86, height: 86, borderRadius: '50%',
          background: 'linear-gradient(150deg,#3c3c40,#1c1c1e)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 1px 0 rgba(255,255,255,.2) inset,0 10px 22px -8px rgba(0,0,0,.4)',
        }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>

        <div style={{ fontSize: 20, fontWeight: 680, marginTop: 18 }}>Praveen Kumar</div>
        <div style={{ fontSize: 13, color: '#86868b', marginTop: 4 }}>AI Engineer · Agentic Systems Builder</div>

        <div style={{ display: 'flex', gap: 7, marginTop: 22, flexWrap: 'wrap', justifyContent: 'center' }}>
          {['AI Systems', 'Agentic', 'LLMs'].map(tag => (
            <span key={tag} style={{ fontSize: 11, fontWeight: 600, color: '#515154', background: '#f3f3f5', border: '1px solid #ececee', padding: '5px 10px', borderRadius: 14 }}>
              {tag}
            </span>
          ))}
        </div>

        <div style={{ fontSize: 12, color: '#9a9aa0', marginTop: 26, lineHeight: 1.5 }}>
          Full bio &amp; skills<br />shown beside the device →
        </div>
      </div>
    </div>
  );
}
