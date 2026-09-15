"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import type { WorkCategory, WorkItem } from "@/content/site";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpRightIcon,
  CloseIcon,
} from "@/components/icons";

const categories: readonly ("All" | WorkCategory)[] = [
  "All",
  "Live & events",
  "Brands",
  "Portrait moments",
  "Real estate",
];

export function WorkGallery({ items }: { items: readonly WorkItem[] }) {
  const [filter, setFilter] = useState<(typeof categories)[number]>("All");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [closing, setClosing] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const pointerStartX = useRef<number | null>(null);

  const filtered = useMemo(
    () =>
      filter === "All" ? items : items.filter((item) => item.category === filter),
    [filter, items],
  );

  const activeIndex = activeId
    ? items.findIndex((item) => item.id === activeId)
    : -1;
  const activeItem = activeIndex >= 0 ? items[activeIndex] : undefined;

  const showAt = useCallback(
    (index: number) => {
      const normalized = (index + items.length) % items.length;
      setActiveId(items[normalized]?.id ?? null);
    },
    [items],
  );

  const close = () => {
    setClosing(true);
    window.setTimeout(() => {
      setActiveId(null);
      setClosing(false);
      window.setTimeout(() => triggerRef.current?.focus(), 0);
    }, 180);
  };

  useEffect(() => {
    if (!activeItem) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "ArrowRight") showAt(activeIndex + 1);
      if (event.key === "ArrowLeft") showAt(activeIndex - 1);
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [activeIndex, activeItem, showAt]);

  return (
    <>
      <div
        className="work-filters"
        aria-label="Filter by category"
        role="group"
      >
        {categories.map((category) => (
          <button
            type="button"
            key={category}
            className={filter === category ? "is-active" : ""}
            aria-pressed={filter === category}
            onClick={() => setFilter(category)}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="work-grid">
        {filtered.map((item, index) => (
          <article
            key={item.id}
            className={`work-card work-card--${(index % 6) + 1}`}
            data-reveal
          >
            <button
              type="button"
              className="work-card__button"
              onClick={(event) => {
                triggerRef.current = event.currentTarget;
                setActiveId(item.id);
              }}
              aria-label={`View ${item.title}`}
            >
              <Image
                src={item.image}
                alt={item.alt}
                fill
                sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 34vw"
                className="work-card__image"
              />
              <span className="work-card__shade" />
              <span className="work-card__meta">
                <span>
                  <small>{item.category}</small>
                  <strong>{item.title}</strong>
                </span>
                <span className="work-card__arrow">
                  <ArrowUpRightIcon size={22} />
                </span>
              </span>
            </button>
          </article>
        ))}
      </div>

      {activeItem ? (
        <div
          className={`lightbox${closing ? " lightbox--closing" : ""}`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="lightbox-title"
          onPointerDown={(event) => {
            pointerStartX.current = event.clientX;
          }}
          onPointerUp={(event) => {
            if (pointerStartX.current === null) return;
            const delta = event.clientX - pointerStartX.current;
            pointerStartX.current = null;
            if (Math.abs(delta) < 55) return;
            showAt(activeIndex + (delta < 0 ? 1 : -1));
          }}
        >
          <button
            type="button"
            className="lightbox__backdrop"
            aria-label="Close work viewer"
            onClick={close}
          />
          <div className="lightbox__top">
            <span>
              {String(activeIndex + 1).padStart(2, "0")} /{" "}
              {String(items.length).padStart(2, "0")}
            </span>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={close}
              aria-label="Close work viewer"
            >
              <CloseIcon size={25} />
            </button>
          </div>
          <div className="lightbox__content">
            <div className="lightbox__media">
              <Image
                src={activeItem.image}
                alt={activeItem.alt}
                fill
                sizes="(max-width: 800px) 90vw, 55vw"
                priority
              />
            </div>
            <div className="lightbox__details">
              <p>{activeItem.category}</p>
              <h3 id="lightbox-title">{activeItem.title}</h3>
              <a
                href={activeItem.instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="text-link text-link--light"
              >
                View original reel
                <ArrowUpRightIcon size={18} />
              </a>
            </div>
          </div>
          <div className="lightbox__nav">
            <button
              type="button"
              aria-label="Previous work"
              onClick={() => showAt(activeIndex - 1)}
            >
              <ArrowLeftIcon size={24} />
            </button>
            <button
              type="button"
              aria-label="Next work"
              onClick={() => showAt(activeIndex + 1)}
            >
              <ArrowRightIcon size={24} />
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
