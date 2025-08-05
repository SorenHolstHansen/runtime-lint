export type DomSizeConfig = {
  /**
   * Callback to run whenever we detect a DOM that is too big
   */
  cb: (
    largeDomSize?: number,
    largeDomDepth?: number,
    manyChildren?: { element: Element; count: number }[],
  ) => void;
};

export const DEFAULT_DOM_SIZE_CONFIG: DomSizeConfig = {
  cb: (totalDomElements, domDepth, childNodes) => {
    if (totalDomElements) {
      console.warn(
        `We detected a very large DOM. The total number of dom elements is ${totalDomElements}.`,
      );
    }
    if (domDepth) {
      console.warn(
        `We detected a very large DOM depth. The depth is ${domDepth}.`,
      );
    }
    if (childNodes) {
      console.warn(
        `We detected a parent node with a large amount of children. The number of children is ${childNodes}.`,
      );
    }
  },
};

function getDOMDepth(node: Element) {
  let depth = 0;
  if (node.children.length > 0) {
    for (let i = 0; i < node.children.length; i++) {
      depth = Math.max(depth, getDOMDepth(node.children[i]));
    }
  }
  return depth + 1;
}

function getParentsWithManyChildrenInner(
  node: Element,
  limit: number,
  breaching: { element: Element; count: number }[],
) {
  if (node.children.length > limit) {
    breaching.push({ element: node, count: node.children.length });
    for (let i = 0; i < node.children.length; i++) {
      getParentsWithManyChildrenInner(node.children[i], limit, breaching);
    }
  }
}
function getParentsWithManyChildren(
  node: Element,
  limit: number,
): { element: Element; count: number }[] {
  const breaching: { element: Element; count: number }[] = [];
  getParentsWithManyChildrenInner(node, limit, breaching);
  return breaching;
}

export function initDomSizeMetrics(config: DomSizeConfig) {
  const targetNode = document.body;

  const observer = new MutationObserver(() => {
    const totalElements = document.querySelectorAll("*").length;
    const maxDOMDepth = getDOMDepth(document.body);
    const childNodes = getParentsWithManyChildren(document.body, 6);
    if (totalElements > 1500 || maxDOMDepth > 32 || childNodes.length > 0) {
      config.cb(
        totalElements > 1500 ? totalElements : undefined,
        maxDOMDepth > 32 ? maxDOMDepth : undefined,
        childNodes.length > 0 ? childNodes : undefined,
      );
    }
  });

  // Start observing the target node for configured mutations
  observer.observe(targetNode, { subtree: true, childList: true });
}
