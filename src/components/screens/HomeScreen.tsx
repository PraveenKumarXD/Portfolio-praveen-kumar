import type { AppScreen } from '../../types';

interface Props {
  onOpen: (screen: AppScreen) => void;
}

export default function HomeScreen({ onOpen }: Props) {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '6px 26px 40px' }}>
      <div style={{ textAlign: 'center', animation: 'pf-fade .5s ease both', animationDelay: '.2s', textShadow: '0 1px 3px rgba(0,0,0,.28)' }}>
        <div style={{ fontSize: 10, letterSpacing: '.28em', fontWeight: 600, color: 'rgba(255,255,255,.78)' }}>PORTFOLIO</div>
        <div style={{ fontSize: 17, fontWeight: 650, letterSpacing: '-.01em', marginTop: 5, color: '#fff' }}>Praveen Kumar</div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,.72)', marginTop: 2 }}>AI Engineer · Agentic Systems</div>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', gap: 22 }}>
          <AppIcon src="/uploads/App Store.png" label="About"      delay=".28s" onClick={() => onOpen('about')}      />
          <AppIcon src="/uploads/Books.png"     label="Journey"    delay=".4s"  onClick={() => onOpen('experience')} />
          <AppIcon src="/uploads/Settings.png"  label="Projects"   delay=".52s" onClick={() => onOpen('projects')}   />
        </div>
      </div>
    </div>
  );
}

interface AppIconProps {
  src: string;
  label: string;
  delay: string;
  onClick: () => void;
}

function AppIcon({ src, label, delay, onClick }: AppIconProps) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 9,
        cursor: 'pointer',
        animation: 'pf-iconpop .55s cubic-bezier(.34,1.4,.5,1) both',
        animationDelay: delay,
      }}
    >
      <img
        src={src}
        alt={label}
        style={{ width: 62, height: 62, borderRadius: 14, boxShadow: '0 8px 18px -6px rgba(0,0,0,.45)', transition: 'transform .3s cubic-bezier(.34,1.4,.5,1)' }}
        onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.08)')}
        onMouseLeave={e => (e.currentTarget.style.transform = '')}
      />
      <span style={{ fontSize: 11, fontWeight: 500, color: '#fff', textShadow: '0 1px 3px rgba(0,0,0,.35)' }}>
        {label}
      </span>
    </div>
  );
}
