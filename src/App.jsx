import { memo, useEffect, useMemo } from "react";
import parse, { attributesToProps, domToReact } from "html-react-parser";
import "./styles.css";
import markup from "./markup.html?raw";

/** A single presentation slide. Its source copy and inner markup stay untouched. */
const Slide = memo(function Slide(props) {
  return <section {...props}>{props.children}</section>;
});

const parserOptions = {
  replace(node) {
    if (
      node.type === "tag" &&
      node.name === "section" &&
      node.attribs?.class?.split(/\s+/).includes("slide")
    ) {
      const props = attributesToProps(node.attribs);
      return (
        <Slide key={props.id} {...props}>
          {domToReact(node.children, parserOptions)}
        </Slide>
      );
    }
    return undefined;
  },
};

/**
 * React owns the slide tree and page lifecycle. The legacy animation engine
 * remains isolated because it choreographs the existing DOM directly.
 */
export default function App() {
  const presentation = useMemo(() => parse(markup, parserOptions), []);

  useEffect(() => {
    let cancelled = false;
    let script;

    const frame = requestAnimationFrame(() => {
      if (cancelled) return;
      script = document.createElement("script");
      script.src = "/presentation-engine.js";
      script.async = true;
      script.dataset.presentationEngine = "true";
      document.body.appendChild(script);
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      window.__presentationDestroy?.();
      script?.remove();
    };
  }, []);

  return <main className="presentation-root">{presentation}</main>;
}
