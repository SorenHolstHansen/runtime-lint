import { useEffect, useMemo, useState } from "preact/hooks";
import { runtimeLint } from "../core/index.js";
import { Logo, XIcon } from "./icons.js";
import type { ComponentChildren } from "preact";

export function Widget() {
  const [queriesInLoop, setQueriesInLoop] = useState<string[]>([]);
  const [duplicateResponses, setDuplicateResponses] = useState<string[]>([]);
  const [overFetching, setOverFetching] = useState<string[]>([]);
  const [showWidgetScreen, setShowWidgetScreen] = useState(false);
  const numErrors = useMemo(() => {
    return (
      queriesInLoop.length + duplicateResponses.length + overFetching.length
    );
  }, [queriesInLoop, duplicateResponses, overFetching]);

  useEffect(() => {
    runtimeLint({
      queryInLoop: {
        cb: (urls) => setQueriesInLoop(urls),
      },
      duplicateResponses: {
        cb: (url) => setDuplicateResponses((c) => [...c, url]),
      },
      overFetching: {
        cb: (url) => setOverFetching((c) => [...c, url]),
      },
    });
  }, []);
  return (
    <div class="absolute bottom-5 right-5 z-50">
      <div class="h-9 relative">
        <WidgetFloat
          numErrors={numErrors}
          onClick={() => setShowWidgetScreen((c) => !c)}
        />
        {numErrors > 0 && showWidgetScreen && (
          <WidgetScreen
            queriesInLoop={queriesInLoop}
            duplicateResponses={duplicateResponses}
            overFetching={overFetching}
            onClose={() => setShowWidgetScreen(false)}
          />
        )}
      </div>
    </div>
  );
}

function WidgetScreen({
  queriesInLoop,
  duplicateResponses,
  overFetching,
  onClose,
}: {
  queriesInLoop: string[];
  duplicateResponses: string[];
  overFetching: string[];
  onClose: () => void;
}) {
  return (
    <div class="absolute bottom-10 right-0 bg-background rounded-lg w-96 h-96 overflow-hidden flex flex-col">
      <div class="border-b px-2 py-1 flex justify-between items-center">
        <div class="flex gap-2 text-xs">
          <div class="rounded p-1 border border-transparent">Lints</div>
        </div>
        <button type="button" class="cursor-pointer" onClick={() => onClose()}>
          <XIcon size={12} />
        </button>
      </div>
      <div class="flex-1 overflow-hidden">
        <div class="p-2 pb-6 overflow-y-auto w-full space-y-2 h-full">
          {queriesInLoop.length > 0 && (
            <LintCard
              title="Queries in Loop detected"
              description="Detected queries that were run in a loop."
              details={`We detected multiple calls to similar urls, e.g. /user/1, /user/2, /user/3 and so on.
                    This might suggest that a fetch-call is made in a loop, or a query is made for each row in a table or similar.`}
              numCases={queriesInLoop.length}
            >
              <ul>
                {queriesInLoop.map((url) => (
                  <li key={url}>{url}</li>
                ))}
              </ul>
            </LintCard>
          )}
          {overFetching.length > 0 && (
            <LintCard
              title="Over fetching"
              description="Detected under-used json responses"
              details={`We detected json responses from a fetch call that was under-utilized. For instance it could be a json object with 10 fields but only, say, 3 fields were ever used. This could suggest over-fetching.
                    At the moment, the rule reports underuse if less than half the top-level keys of a response has been used.`}
              numCases={overFetching.length}
            >
              <ul>
                {overFetching.map((url) => (
                  <li key={url}>{url}</li>
                ))}
              </ul>
            </LintCard>
          )}
          {duplicateResponses.length > 0 && (
            <LintCard
              title="Duplicate responses"
              description="Detected duplicate responses"
              details={`We detected fetch calls to the same url two or more times with the exact same response.
                    This might suggest a bad caching solution or a refetch policy that is too aggressive.`}
              numCases={duplicateResponses.length}
            >
              <ul>
                {duplicateResponses.map((url) => (
                  <li key={url}>{url}</li>
                ))}
              </ul>
            </LintCard>
          )}
        </div>
      </div>
    </div>
  );
}

function WidgetFloat({
  numErrors,
  onClick,
}: { numErrors: number; onClick: () => void }) {
  return (
    <button
      class="cursor-pointer hover:bg-background/90 transition-colors rounded-full bg-background flex items-center"
      onClick={onClick}
      type="button"
    >
      <div class="h-9 w-9 flex items-center justify-center">
        <Logo size={24} />
      </div>
      {numErrors > 0 && (
        <div class="flex items-center gap-2 pr-2">
          <p class="bg-destructive-foreground rounded text-xs px-1">
            {numErrors}
          </p>
        </div>
      )}
    </button>
  );
}

function LintCard({
  title,
  description,
  details,
  numCases,
  children,
}: {
  title: string;
  description: string;
  details: string;
  numCases: number;
  children: ComponentChildren;
}) {
  const [expanded, setExpanded] = useState(false);
  return (
    <button
      class="border border-ring p-2 rounded w-full text-left cursor-pointer"
      type="button"
      onClick={() => setExpanded(true)}
    >
      <p>{title}</p>
      <p class="text-sm text-muted-foreground" title={details}>
        {description}
      </p>
      <div class="text-xs text-muted-foreground">
        <p>
          {numCases} case
          {numCases !== 1 ? "s" : ""}
        </p>
      </div>

      {expanded && (
        <div>
          <hr class="h-px w-full bg-ring my-1" />
          <div class="text-xs p-2">{children}</div>
        </div>
      )}
    </button>
  );
}
