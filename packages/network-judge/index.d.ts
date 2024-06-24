type NetworkJudgeOptions = {
  onDuplicateResponseDetected: (url: string) => void,
  onQueriesInLoopsDetected: (urls: string[]) => void,
  queryInLoopThreshold: number
}

export function networkJudge(options?: NetworkJudgeOptions): void;
