"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

let registered = false;

if (typeof window !== "undefined" && !registered) {
  registered = true;
  gsap.registerPlugin(ScrollTrigger, useGSAP);
  // Pinned sections must survive address-bar resize on mobile without
  // re-measuring on every pixel of chrome collapse.
  ScrollTrigger.config({ ignoreMobileResize: true });
  // No global `invalidateOnRefresh`: it re-records values on every refresh,
  // and this page refreshes often (each lazy image that lands). Entrance
  // tweens use fromTo + immediateRender:false instead, which pins both ends
  // of the animation and survives any number of refreshes. Only the pinned
  // horizontal track opts into invalidation, where re-measuring is the point.
}

export const EASE = "expo.out";
export const EASE_IO = "power4.inOut";

export const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export { gsap, ScrollTrigger, useGSAP };
