import { BattleArenaUI } from './components/ui/BattleArenaUI';
import { DialogueBox } from './components/ui/DialogueBox';
import { InteractionToast } from './components/ui/InteractionToast';
import { OverworldHud } from './components/ui/OverworldHud';
import { TastingDeductionUI } from './components/ui/TastingDeductionUI';
import { TitleCardOverlay } from './components/ui/TitleCardOverlay';
import { TitleScreen } from './components/ui/TitleScreen';
import { useGameState } from './core/GameState';
import { OverworldCanvas } from './engine/OverworldCanvas';

export default function App() {
  const snapshot = useGameState();

  if (snapshot.screenMode === 'title') {
    return <TitleScreen />;
  }

  const actLabel =
    snapshot.currentAct === 'Act0_Ixia'
      ? 'Act 0: Castle Ixia'
      : 'Act I: Sitia';
  const partyLabel = snapshot.activeParty
    .map((id) => id.charAt(0).toUpperCase() + id.slice(1))
    .join(', ');

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-[#0b0d11] text-slate-200">
      <OverworldHud />

      <main className="relative min-h-0 flex-1 overflow-hidden">
        <OverworldCanvas />
        <InteractionToast />
        <DialogueBox />
        <TastingDeductionUI />
        <BattleArenaUI />
        <TitleCardOverlay />
      </main>

      <footer className="z-20 flex w-full shrink-0 items-center justify-between gap-4 border-t border-slate-800/75 bg-[#0f131a] px-5 py-2 text-[11px] text-slate-400">
        <div className="flex items-center gap-2.5 truncate">
          <span className="font-medium text-slate-300 whitespace-nowrap">
            {actLabel}
          </span>
          <span aria-hidden="true" className="text-slate-700">
            ·
          </span>
          <span className="whitespace-nowrap">Party: {partyLabel}</span>
        </div>

        <div className="flex shrink-0 items-center gap-3 font-mono text-[11px] text-slate-400">
          <span className="whitespace-nowrap">
            <strong className="font-semibold text-slate-200">
              WASD / Arrows
            </strong>{' '}
            Move
          </span>
          <span aria-hidden="true" className="text-slate-700">
            ·
          </span>
          <span className="whitespace-nowrap">
            <strong className="font-semibold text-slate-200">E / Space</strong>{' '}
            Interact
          </span>
          <span aria-hidden="true" className="text-slate-700">
            ·
          </span>
          <span className="whitespace-nowrap">
            <strong className="font-semibold text-slate-200">Tab</strong> Cycle
          </span>
          <span aria-hidden="true" className="text-slate-700">
            ·
          </span>
          <span className="whitespace-nowrap">
            <strong className="font-semibold text-slate-200">Q</strong> Cast
          </span>
        </div>
      </footer>
    </div>
  );
}
