"use client";

import { useState, useEffect } from "react";

export default function HeroTypewriter({
  prefix,
  highlight,
}: {
  prefix: string;
  highlight: string;
}) {
  const [currentPrefix, setCurrentPrefix] = useState("");
  const [currentHighlight, setCurrentHighlight] = useState("");
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    if (currentPrefix.length < prefix.length) {
      const timeout = setTimeout(() => {
        setCurrentPrefix(prefix.slice(0, currentPrefix.length + 1));
      }, 40);
      return () => clearTimeout(timeout);
    } else if (currentHighlight.length < highlight.length) {
      const timeout = setTimeout(() => {
        setCurrentHighlight(highlight.slice(0, currentHighlight.length + 1));
      }, 50);
      return () => clearTimeout(timeout);
    } else {
      const timeout = setTimeout(() => setIsDone(true), 2000);
      return () => clearTimeout(timeout);
    }
  }, [currentPrefix, currentHighlight, prefix, highlight]);

  return (
    <>
      {currentPrefix}{" "}
      <span className="relative inline-block bg-gradient-to-r from-orange-500 via-orange-600 to-red-500 bg-clip-text text-transparent">
        {currentHighlight}
      </span>
      {!isDone && (
        <span
          className="ml-1 inline-block w-[3px] h-[0.9em] bg-orange-500 animate-pulse"
          style={{ verticalAlign: "middle" }}
        />
      )}
    </>
  );
}
