import {
  DEFAULT_OVERFETCHING_CONFIG,
  type OverFetchingConfig,
  detectOverfetching,
} from "./rules/overFetching/overFetching.js";
import {
  DEFAULT_QUERY_IN_LOOP_CONFIG,
  type QueryInLoopConfig,
  detectQueriesInLoops,
} from "./rules/queriesInLoops/queriesInLoops.js";
import { deepEqual } from "./utils/deepEqual.js";

type StoreValue = {
  lastCalledAt: Date;
  // biome-ignore lint/suspicious/noExplicitAny: Don't really care about the type here
  response?: any;
};

const store: Record<string, StoreValue> = {};

/**
 * A wrapper around a config that allows users to specify the config in a variety of ways e.g.
 * - Partial<T> allow users to specify parts of the config, and leave the rest of it as default
 * - "on" means use the default config
 * - "off" | null | undefined means not to use the rule
 */
type RuleConfig<T> = Partial<T> | "on" | "off" | null | undefined;

function setConfig<T>(cfg: RuleConfig<T>, dflt: T): T | undefined {
  if (cfg === "on") {
    return dflt;
  }
  if (cfg == null || cfg === "off") {
    return undefined;
  }

  return { ...dflt, ...cfg };
}

type DuplicateResponseConfig = {
  /**
   * Callback to run when we detect multiple calls to the same endpoint with the exact same response. Defaults to a console.warn log
   */
  cb: (url: string) => void;
};

const DEFAULT_DUPLICATE_RESPONSE_CONFIG: DuplicateResponseConfig = {
  cb: (url) => {
    console.warn(
      `You have previously made the same call (url: ${url}) that got the exact same response. Perhaps consider a (better) cache solution, or remove the duplicate calls.`,
    );
  },
};

type Config = {
  duplicateResponses?: DuplicateResponseConfig;
  queryInLoop?: QueryInLoopConfig;
  /**
   * Detect overfetching of request (that is, underuse of json responses).
   * This is currently not supported for non-fetch uses (i.e. XMLHttpRequest, Axios, ...)
   */
  overFetching?: OverFetchingConfig;
};
function runtimeLint({
  duplicateResponses,
  queryInLoop,
  overFetching,
}: { [Key in keyof Config]: RuleConfig<Config[Key]> }) {
  const config: Config = {
    duplicateResponses: setConfig(
      duplicateResponses,
      DEFAULT_DUPLICATE_RESPONSE_CONFIG,
    ),
    queryInLoop: setConfig(queryInLoop, DEFAULT_QUERY_IN_LOOP_CONFIG),
    overFetching: setConfig(overFetching, DEFAULT_OVERFETCHING_CONFIG),
  };
  const origFetch = fetch;

  // @ts-ignore
  // biome-ignore lint/suspicious/noGlobalAssign: This is sort of the whole point
  fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const res = await origFetch(input, init);
    const urlString = input instanceof Request ? input.url : input;
    let url: URL;
    try {
      if (urlString instanceof URL) {
        url = urlString;
      } else if (!urlString.startsWith("http")) {
        url = new URL(window.location.origin + urlString);
      } else {
        url = new URL(urlString);
      }
    } catch (e) {
      return;
    }

    if (config.queryInLoop) {
      detectQueriesInLoops(url, config.queryInLoop);
    }
    store[url.toString()] = {
      ...store[url.toString()],
      lastCalledAt: new Date(),
    };

    res.json = new Proxy(res.json, {
      async apply(target, thisArg, argumentsList) {
        const res: unknown = await Reflect.apply(
          target,
          thisArg,
          argumentsList,
        );
        if (
          store[url.toString()] &&
          deepEqual(store[url.toString()].response, res)
        ) {
          config.duplicateResponses?.cb(url.toString());
        } else {
          store[url.toString()] = {
            ...store[url.toString()],
            response: res,
          };
        }

        if (config.overFetching && typeof res === "object" && res != null) {
          return detectOverfetching(res, url, config.overFetching);
        }
        return res;
      },
    });

    return res;
  };

  if (typeof window !== "undefined") {
    const origXHROpen = XMLHttpRequest.prototype.open;
    // @ts-ignore
    XMLHttpRequest.prototype.open = function (
      _method,
      _url,
      _async,
      _user,
      _password,
    ) {
      let url: URL;
      try {
        if (_url instanceof URL) {
          url = _url;
        } else if (!_url.startsWith("http")) {
          url = new URL(window.location.origin + _url);
        } else {
          url = new URL(_url);
        }
      } catch (e) {
        return;
      }
      if (config.queryInLoop) {
        detectQueriesInLoops(url, config.queryInLoop);
      }
      this.addEventListener("load", function () {
        const responseText = this.responseText;
        // TODO: the response text might not be equal for identical requests, because objects might not be sorted in the same way.
        // However for now we just do like this
        if (
          store[url.toString()] &&
          store[url.toString()].response === responseText
        ) {
          config.duplicateResponses?.cb(url.toString());
        } else {
          store[url.toString()] = {
            ...store[url.toString()],
            response: responseText,
          };
        }

        // Can't detect overfetching here, since there is no .json (or similar) functionality on XMLHttpRequest's
        // TODO: Add axios as an "adaptor".
      });

      return origXHROpen.apply(
        this,
        // biome-ignore lint/style/noArguments:
        // biome-ignore lint/suspicious/noExplicitAny:
        arguments as any,
      );
    };
  }
}

export { runtimeLint };
