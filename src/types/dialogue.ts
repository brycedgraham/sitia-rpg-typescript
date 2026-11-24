export interface DialogueLine {
  speaker: string;
  text: string;
  portraitId?: string;
  isThoughtBubble?: boolean;
  isLying?: boolean;
  setFlag?: {
    key: string;
    value: boolean | string | number;
  };
  addPartyMember?: string;
}

export interface DialogueScript {
  dialogueId: string;
  lines: DialogueLine[];
  isMindSpeak?: boolean;
  onCompleteEncounterId?: string;
  onCompleteTitleCard?: boolean;
}
