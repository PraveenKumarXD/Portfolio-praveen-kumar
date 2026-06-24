import { projects } from '../../data/portfolio';

interface Props {
  appAnim: string;
  onGoHome: () => void;
}

export default function ProjectsApp({ appAnim, onGoHome }: Props) {
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
        <span style={{ flex: 1, textAlign: 'center', fontSize: 15, fontWeight: 600 }}>Projects</span>
      </div>

      <div style={{ padding: '18px 18px', display: 'flex', flexDirection: 'column', gap: 11 }}>
        {projects.map((proj) => (
          <div
            key={proj.name}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 15px', border: '1px solid #ececee', borderRadius: 15, background: '#fff' }}
          >
            <div>
              <div style={{ fontSize: 14, fontWeight: 650, color: '#1d1d1f' }}>{proj.name}</div>
              <div style={{ fontSize: 11, color: '#9a9aa0', marginTop: 2 }}>{proj.tag}</div>
            </div>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#c7c7cc" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </div>
        ))}
        <div style={{ fontSize: 12, color: '#9a9aa0', textAlign: 'center', lineHeight: 1.5, marginTop: 4 }}>
          Full case studies →
        </div>
      </div>
    </div>
  );
}
