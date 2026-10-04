import { useEffect, useRef, useState } from "react";

// Scroll reveal: fades + slides the element in the first time 10% of it
// enters the viewport (legacy `.reveal` / `.reveal.visible`).
export default function Reveal({ as: Tag = "div", className = "", children, ...props }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={
        "transition-[opacity,translate] duration-600 ease-[ease] " +
        (visible ? "translate-y-0 opacity-100 " : "translate-y-[18px] opacity-0 ") +
        className
      }
      {...props}
    >
      {children}
    </Tag>
  );
}
