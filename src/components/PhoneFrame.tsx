import type { AppScreen } from '../types';
import HomeScreen from './screens/HomeScreen';
import AboutApp from './screens/AboutApp';
import ExperienceApp from './screens/ExperienceApp';
import ProjectsApp from './screens/ProjectsApp';

interface Props {
  screen: AppScreen;
  enableSheen: boolean;
  appAnim: string;
  onOpen: (screen: AppScreen) => void;
  onGoHome: () => void;
}

export default function PhoneFrame({ screen, enableSheen, appAnim, onOpen, onGoHome }: Props) {
  const inApp = !!screen;
  const indicatorColor = inApp ? '#1d1d1f' : '#ffffff';

  return (
    <div className="pf-phonecol">
      <div style={{ animation: 'pf-rise 1.1s cubic-bezier(.16,.84,.3,1) both' }}>
        <div style={{ animation: 'pf-float 6s ease-in-out infinite', animationDelay: '1.1s', position: 'relative', width: 320, height: 660 }}>

          {/* Breathing shadow */}
          <div style={{
            position: 'absolute', left: '50%', bottom: -26, width: 230, height: 46,
            borderRadius: '50%',
            background: 'radial-gradient(ellipse at center,rgba(0,0,0,.42),rgba(0,0,0,0) 70%)',
            filter: 'blur(9px)',
            animation: 'pf-breathe 6s ease-in-out infinite', animationDelay: '1.1s',
            zIndex: 0,
          }} />

          {/* Titanium frame */}
          <div style={{
            position: 'absolute', inset: 0, borderRadius: 58,
            background: 'linear-gradient(150deg,#6c6c70 0%,#37373a 26%,#202022 55%,#3b3b3e 80%,#5a5a5e 100%)',
            boxShadow: '0 1px 1px rgba(255,255,255,.4) inset,0 0 0 1px rgba(255,255,255,.18) inset,0 26px 60px -22px rgba(0,0,0,.55)',
            zIndex: 1,
          }}>
            {/* Side buttons */}
            <div style={{ position: 'absolute', left: -2, top: 150, width: 3, height: 30, borderRadius: 3, background: 'linear-gradient(90deg,#2a2a2c,#56565a)' }} />
            <div style={{ position: 'absolute', left: -2, top: 200, width: 3, height: 52, borderRadius: 3, background: 'linear-gradient(90deg,#2a2a2c,#56565a)' }} />
            <div style={{ position: 'absolute', left: -2, top: 268, width: 3, height: 52, borderRadius: 3, background: 'linear-gradient(90deg,#2a2a2c,#56565a)' }} />
            <div style={{ position: 'absolute', right: -2, top: 212, width: 3, height: 74, borderRadius: 3, background: 'linear-gradient(270deg,#2a2a2c,#56565a)' }} />

            {/* Black bezel */}
            <div style={{ position: 'absolute', inset: 5, borderRadius: 53, background: '#050505' }}>
              {/* Display */}
              <div style={{ position: 'absolute', inset: 4, borderRadius: 49, overflow: 'hidden', background: 'linear-gradient(180deg,#fcfcfe,#eef0f4)' }}>

                {/* Wallpaper */}
                {!screen && (
                  <img
                    src="/uploads/22266861.jpg"
                    alt=""
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0, animation: 'pf-fade .8s ease both', animationDelay: '.1s' }}
                  />
                )}

                {/* Glass sheen */}
                {enableSheen && (
                  <div style={{ position: 'absolute', top: '-50%', left: 0, width: 64, height: '200%', background: 'linear-gradient(90deg,transparent,rgba(255,255,255,.6),transparent)', animation: 'pf-sheen 8s ease-in-out infinite', animationDelay: '2s', pointerEvents: 'none', zIndex: 9 }} />
                )}

                {/* Dynamic island */}
                <div style={{ position: 'absolute', top: 13, left: '50%', transform: 'translateX(-50%)', width: 98, height: 29, background: '#000', borderRadius: 16, zIndex: 8, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 11 }}>
                  <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#1b1b22', boxShadow: '0 0 0 1px rgba(255,255,255,.06) inset' }} />
                </div>

                {/* Status bar */}
                {!inApp ? (
                  <StatusBar dark={false} />
                ) : (
                  <StatusBar dark={true} />
                )}

                {/* Screen body */}
                <div style={{ position: 'absolute', top: 50, left: 0, right: 0, bottom: 0, zIndex: 5 }}>
                  {!screen && <HomeScreen onOpen={onOpen} />}
                  {screen === 'about' && <AboutApp appAnim={appAnim} onGoHome={onGoHome} />}
                  {screen === 'experience' && <ExperienceApp appAnim={appAnim} onGoHome={onGoHome} />}
                  {screen === 'projects' && <ProjectsApp appAnim={appAnim} onGoHome={onGoHome} />}
                </div>

                {/* Home indicator */}
                <div
                  onClick={onGoHome}
                  style={{ position: 'absolute', bottom: 9, left: '50%', transform: 'translateX(-50%)', width: 122, height: 5, borderRadius: 3, background: indicatorColor, opacity: .85, zIndex: 7, cursor: 'pointer' }}
                />

              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function StatusBar({ dark }: { dark: boolean }) {
  const c = dark ? '#1d1d1f' : '#fff';
  const borderC = dark ? 'rgba(29,29,31,.45)' : 'rgba(255,255,255,.6)';
  const shadow = dark ? undefined : '0 1px 2px rgba(0,0,0,.25)';

  return (
    <div style={{ position: 'relative', zIndex: 6, height: 50, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 26px 0', animation: 'pf-fade .5s ease both', animationDelay: '.15s' }}>
      <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-.01em', color: c, textShadow: shadow }}>9:41</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2 }}>
          {[5, 7, 9, 11].map((h) => (
            <span key={h} style={{ width: 3, height: h, borderRadius: 1, background: c }} />
          ))}
        </div>
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 20h.01" /><path d="M2 8.82a15 15 0 0 1 20 0" />
          <path d="M5 12.86a10 10 0 0 1 14 0" /><path d="M8.5 16.43a5 5 0 0 1 7 0" />
        </svg>
        <div style={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <div style={{ width: 23, height: 12, borderRadius: 3, border: `1px solid ${borderC}`, padding: 1.5 }}>
            <div style={{ width: '72%', height: '100%', borderRadius: 1, background: c }} />
          </div>
          <div style={{ width: 1.5, height: 4, borderRadius: '0 1px 1px 0', background: borderC }} />
        </div>
      </div>
    </div>
  );
}
