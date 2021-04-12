import render from "./render";
import mount from "./mount";

const diffAttrs = (oldAttrs, newAttrs) => {
  const patches = [];

  for (const key in newAttrs) {
    patches.push($node => {
      $node.setAttribute(key, newAttrs[key]);
      return $node;
    });
  }

  for (const key in oldAttrs) {
    if (!(key in newAttrs)) {
      patches.push($node => {
        $node.removeAttribute(key);
        return $node;
      });
    }
  }

  return $node => {
    patches.forEach(patch => {
      patch($node);
    });
  };
};

const diffChildren = (oldVChildren, newVChildren) => {
  const childPatches = [];
  oldVChildren.forEach((oldVChild, i) => {
    childPatches.push(diff(oldVChild, newVChildren[i]));
  });

  const additionalPatches = [];
  newVChildren.slice(oldVChildren.length).forEach(additionalVChild => {
    additionalPatches.push($node => {
      $node.appendChild(render(additionalVChild));
      return $node;
    });
  });

  return $node => {
    for (let i = childPatches.length - 1; i >= 0; i--) {
      const $child = $node.childNodes[i];
      const patch = childPatches[i];
      patch($child);
    }

    additionalPatches.forEach(patch => {
      patch($node);
    });

    return $node;
  };
};

const diff = (vOldNode, vNewNode) => {
  if (vNewNode === undefined) {
    return $node => {
      $node.remove();
      return undefined;
    };
  }

  if (typeof vOldNode === "string" || typeof vNewNode === "string") {
    if (vOldNode !== vNewNode) {
      return $node => {
        const $newNode = render(vNewNode);
        return mount($newNode, $node);
      };
    } else {
      return $node => $node;
    }
  }

  if (vOldNode.tagName !== vNewNode.tagName) {
    return $node => {
      const $newNode = render(vNewNode);
      return mount($newNode, $node);
    };
  }

  const patchAttrs = diffAttrs(vOldNode.attrs, vNewNode.attrs);
  const patchChildren = diffChildren(vOldNode.children, vNewNode.children);

  return $node => {
    patchAttrs($node);
    patchChildren($node);
    return $node;
  };
};

export default diff;
