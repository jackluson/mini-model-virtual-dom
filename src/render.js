const renderElement = ({ tagName, attrs, children }) => {
  const $el = document.createElement(tagName);

  for (const key in attrs) {
    $el.setAttribute(key, attrs[key]);
  }

  children.forEach(child => {
    const $child = render(child);
    $el.appendChild($child);
  });

  return $el;
};

const render = vNode => {
  if (typeof vNode === "string") {
    return document.createTextNode(vNode);
  }

  return renderElement(vNode);
};

export default render;
