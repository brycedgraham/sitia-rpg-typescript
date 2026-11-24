import { AlertTriangle } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { eventBus } from '../../core/EventBus';
import { gameState } from '../../core/GameState';
import { soundFx } from '../../core/SoundFx';
import { DIALOGUES } from '../../data/dialogues';
import { resolveSpeakerPortrait } from '../../engine/PortraitAndBattleAtlas';
import type { DialogueScript } from '../../types';

interface ActiveDialogue {
  script: DialogueScript;
  lineIndex: number;
  isMindSpeak: boolean;
  isLying: boolean;
  speakerFallback?: string;
}

const CHAR_REVEAL_MS = 20;

export function DialogueBox() {
  const [active, setActive] = useState<ActiveDialogue | null>(null);
  const [visibleChars, setVisibleChars] = useState(0);

  const openDialogue = useCallback(
    (
      dialogueId: string,
      options: { isMindSpeak: boolean; isLying: boolean; speakerName?: string }
    ) => {
      const script = DIALOGUES[dialogueId];
      if (!script || script.lines.length === 0) return;

      gameState.setInputLocked(true);
      setVisibleChars(0);
      setActive({
        script,
        lineIndex: 0,
        isMindSpeak: options.isMindSpeak || Boolean(script.isMindSpeak),
        isLying: options.isLying,
        speakerFallback: options.speakerName,
      });

      const firstLine = script.lines[0];
      if (firstLine?.setFlag) {
        gameState.setStoryFlag(firstLine.setFlag.key, firstLine.setFlag.value);
      }
      if (firstLine?.addPartyMember) {
        gameState.addPartyMember(firstLine.addPartyMember);
      }
    },
    []
  );

  const closeDialogue = useCallback((script: DialogueScript) => {
    setActive(null);
    setVisibleChars(0);
    eventBus.emit('dialogueEnded', { dialogueId: script.dialogueId });
    if (script.onCompleteEncounterId) {
      eventBus.emit('combatInitiated', {
        encounterId: script.onCompleteEncounterId,
      });
    } else if (script.onCompleteTitleCard) {
      eventBus.emit('titleCardTriggered', {
        subtitle: 'Act I: Study of Magic — Crossing into Sitia',
      });
    } else {
      gameState.setInputLocked(false);
    }
  }, []);

  const handleAdvance = useCallback(() => {
    if (!active) return;

    const currentLine = active.script.lines[active.lineIndex];
    if (!currentLine) {
      closeDialogue(active.script);
      return;
    }

    // First press finishes typewriter immediately if still typing
    if (visibleChars < currentLine.text.length) {
      setVisibleChars(currentLine.text.length);
      return;
    }

    const nextIndex = active.lineIndex + 1;
    if (nextIndex < active.script.lines.length) {
      soundFx.playDialogueAdvance();
      const nextLine = active.script.lines[nextIndex];
      if (nextLine?.setFlag) {
        gameState.setStoryFlag(nextLine.setFlag.key, nextLine.setFlag.value);
      }
      if (nextLine?.addPartyMember) {
        gameState.addPartyMember(nextLine.addPartyMember);
      }
      setVisibleChars(0);
      setActive({
        ...active,
        lineIndex: nextIndex,
      });
    } else {
      soundFx.playDialogueAdvance();
      closeDialogue(active.script);
    }
  }, [active, closeDialogue, visibleChars]);

  // Listen to EventBus spoken dialogue and Mind-Speak triggers
  useEffect(() => {
    const unsubSpoken = eventBus.on('dialogueStarted', (payload) => {
      openDialogue(payload.dialogueId, {
        isMindSpeak: false,
        isLying: false,
        speakerName: payload.speakerName,
      });
    });

    const unsubMind = eventBus.on('mindSpeakTriggered', (payload) => {
      openDialogue(payload.dialogueId, {
        isMindSpeak: true,
        isLying: payload.isLying,
        speakerName: payload.actorName,
      });
    });

    return () => {
      unsubSpoken();
      unsubMind();
    };
  }, [openDialogue]);

  // Typewriter reveal interval
  useEffect(() => {
    if (!active) return;
    const currentLine = active.script.lines[active.lineIndex];
    if (!currentLine) return;

    const reducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
      setVisibleChars(currentLine.text.length);
      return;
    }

    if (visibleChars >= currentLine.text.length) return;

    const timer = window.setTimeout(() => {
      setVisibleChars((prev) => Math.min(currentLine.text.length, prev + 1));
    }, CHAR_REVEAL_MS);

    return () => window.clearTimeout(timer);
  }, [active, visibleChars]);

  // Keyboard advance / dismiss while DialogueBox is open
  useEffect(() => {
    if (!active) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) return;

      if (
        event.code === 'KeyE' ||
        event.code === 'Space' ||
        event.code === 'Enter'
      ) {
        event.preventDefault();
        event.stopPropagation();
        handleAdvance();
      } else if (event.code === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        closeDialogue(active.script);
      }
    };

    window.addEventListener('keydown', onKeyDown, true);
    return () => window.removeEventListener('keydown', onKeyDown, true);
  }, [active, closeDialogue, handleAdvance]);

  if (!active) return null;

  const line = active.script.lines[active.lineIndex];
  if (!line) return null;

  const isMindBubble = active.isMindSpeak || Boolean(line.isThoughtBubble);
  const showDeception = isMindBubble && (active.isLying || Boolean(line.isLying));
  const speaker = line.speaker || active.speakerFallback || 'Unknown';
  const portrait = resolveSpeakerPortrait(speaker);
  const totalLines = active.script.lines.length;
  const isTyping = visibleChars < line.text.length;
  const isLastLine = active.lineIndex === totalLines - 1;
  const displayedText = line.text.slice(0, visibleChars);

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label={isMindBubble ? `Mind-Speak: ${speaker}` : `Dialogue: ${speaker}`}
      className="pointer-events-none absolute inset-x-0 bottom-5 z-40 flex justify-center px-5"
    >
      <div
        onClick={handleAdvance}
        className={`pointer-events-auto flex w-full max-w-2xl cursor-pointer items-stretch gap-4 rounded-xl p-4 backdrop-blur-md transition-[opacity,transform] duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] sm:gap-5 sm:px-5 sm:py-4 ${
          isMindBubble
            ? 'border border-sky-400/65 bg-[#091a30]/94 shadow-[0_16px_44px_rgba(14,165,233,0.24)]'
            : 'border border-slate-700/90 bg-[#0d121b]/95 shadow-[0_18px_48px_rgba(0,0,0,0.75)]'
        }`}
      >
        {/* Left Column: Generated GBA-Style Pixel Bust Portrait with Resilient Fallback */}
        <div className="flex shrink-0 flex-col items-center justify-center">
          <div
            className={`relative h-20 w-20 overflow-hidden rounded-lg border-2 shadow-inner transition-colors duration-150 sm:h-24 sm:w-24 ${
              showDeception
                ? 'border-amber-400/90 shadow-[0_0_18px_rgba(245,158,11,0.35)]'
                : isMindBubble
                  ? 'border-sky-400/85 shadow-[0_0_18px_rgba(56,189,248,0.32)]'
                  : 'border-slate-600/90 bg-slate-900'
            }`}
          >
            <img
              key={portrait.key}
              src={portrait.imageUrl || portrait.fallbackDataUrl}
              alt={`${speaker} portrait`}
              referrerPolicy="no-referrer"
              onError={(e) => {
                if (
                  portrait.fallbackDataUrl &&
                  e.currentTarget.src !== portrait.fallbackDataUrl
                ) {
                  e.currentTarget.src = portrait.fallbackDataUrl;
                }
              }}
              className="h-full w-full object-cover"
            />

            {/* Subtle GBA corner frame bevel */}
            <div
              aria-hidden="true"
              className={`pointer-events-none absolute inset-0 rounded-[6px] ring-1 ring-inset ${
                showDeception
                  ? 'ring-amber-300/40'
                  : isMindBubble
                    ? 'ring-sky-300/40'
                    : 'ring-white/10'
              }`}
            />
          </div>
        </div>

        {/* Right Column: Speaker Header, Typewriter Body, and Footer Controls */}
        <div className="flex min-w-0 flex-1 flex-col justify-between">
          {/* Header Row: Speaker + Title/Mode + Deception Indicator */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-700/50 pb-2">
            <div className="flex flex-wrap items-baseline gap-2">
              <h2
                className={`font-[family-name:var(--font-display)] text-sm font-semibold tracking-wide ${
                  isMindBubble ? 'text-sky-200' : 'text-slate-100'
                }`}
              >
                {speaker}
              </h2>
              <span aria-hidden="true" className="text-xs text-slate-600">
                ·
              </span>
              <span
                className={`text-xs ${
                  isMindBubble
                    ? 'font-medium text-sky-300/90'
                    : 'text-slate-400'
                }`}
              >
                {isMindBubble ? 'Mind-Speak Surface Thought' : portrait.title}
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs">
              {showDeception && (
                <span className="flex items-center gap-1.5 font-medium text-amber-300">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                  <span>Deception Detected</span>
                </span>
              )}
              <span className="font-mono tabular-nums text-slate-400">
                {active.lineIndex + 1}/{totalLines}
              </span>
            </div>
          </div>

          {/* Body Text */}
          <p
            className={`mt-2.5 min-h-[3.5rem] text-sm leading-relaxed ${
              isMindBubble ? 'italic text-sky-100/95' : 'text-slate-200'
            }`}
          >
            {isMindBubble ? `“${displayedText}”` : displayedText}
          </p>

          {/* Footer Controls */}
          <div className="mt-2.5 flex items-center justify-between gap-4 text-xs">
            <span className="text-slate-500">
              {isMindBubble ? 'Esc to sever link' : 'Esc to close'}
            </span>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleAdvance();
              }}
              className={`cursor-pointer whitespace-nowrap rounded-md px-3 py-1 font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 ${
                isMindBubble
                  ? 'bg-sky-500/20 text-sky-200 hover:bg-sky-500/30 focus-visible:outline-sky-300'
                  : 'bg-slate-800 text-slate-200 hover:bg-slate-700 focus-visible:outline-amber-300'
              }`}
            >
              {isTyping
                ? 'Reveal [E]'
                : isLastLine
                  ? 'Close [E]'
                  : 'Continue [E]'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
