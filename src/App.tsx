import { useState } from 'react';
import type { AppScreen, AppTransition } from './types';
import PhoneFrame from './components/PhoneFrame';
import LeftPanel from './components/panels/LeftPanel';
import RightPanel from './components/panels/RightPanel';

const transitionConfig: Record<AppTransition, { ease: string; dur: string }> = {
  Spring: { ease: 'cubic-bezier(.34,1.32,.45,1)', dur: '.5s' },
  Smooth: { ease: 'cubic-bezier(.4,0,.2,1)', dur: '.45s' },
  Snappy: { ease: 'cubic-bezier(.2,.85,.25,1)', dur: '.32s' },
};

export default function App() {
  const [screen, setScreen] = useState<AppScreen>(null);
  const transition: AppTransition = 'Spring';

  const { ease, dur } = transitionConfig[transition];
  const appAnim = `pf-appin ${dur} ${ease} both`;
  const panelAnim = `pf-panel .5s ${ease} both`;

  const goHome = () => setScreen(null);

  return (
    <div
      className="pf-stage"
      style={{ minHeight: '100vh', width: '100%', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '56px 40px', overflowX: 'hidden' }}
    >
      <div className="pf-layout">
        <div className="pf-panel scrollarea" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
          <LeftPanel screen={screen} panelAnim={panelAnim} onGoHome={goHome} />
        </div>

        <PhoneFrame
          screen={screen}
          enableSheen={true}
          appAnim={appAnim}
          onOpen={setScreen}
          onGoHome={goHome}
        />

        <div className="pf-panel scrollarea" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
          <RightPanel screen={screen} panelAnim={panelAnim} onOpen={setScreen} />
        </div>
      </div>
    </div>
  );
}
