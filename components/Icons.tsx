"use client";

import React from "react";

type IconProps = React.SVGProps<SVGSVGElement>;

export function IconMic(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      {...props}
    >
      <rect
        x="9"
        y="4"
        width="6"
        height="10"
        rx="3"
        className="fill-none stroke-current"
        strokeWidth="1.8"
      />
      <path
        d="M6 10v1a6 6 0 0 0 12 0v-1"
        className="fill-none stroke-current"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M12 18v3"
        className="fill-none stroke-current"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconBook(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M6 4h8a3 3 0 0 1 3 3v13H9a3 3 0 0 0-3 3V4Z"
        className="fill-none stroke-current"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M9 4h8a3 3 0 0 1 3 3v13"
        className="fill-none stroke-current"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconSettings(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      {...props}
    >
      <circle
        cx="12"
        cy="12"
        r="3"
        className="fill-none stroke-current"
        strokeWidth="1.8"
      />
      <path
        d="M4.9 7.5 6 6l2 1M4.9 16.5 6 18l2-1M17.1 7.5 16 6l-2 1M17.1 16.5 16 18l-2-1"
        className="fill-none stroke-current"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconLogout(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M10 5H7a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h3"
        className="fill-none stroke-current"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M14 9l3 3-3 3"
        className="fill-none stroke-current"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 12h8"
        className="fill-none stroke-current"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconSun(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      {...props}
    >
      <circle
        cx="12"
        cy="12"
        r="3.5"
        className="fill-none stroke-current"
        strokeWidth="1.8"
      />
      <path
        d="M12 3v2.5M12 18.5V21M4.22 4.22 5.9 5.9M18.1 18.1l1.68 1.68M3 12h2.5M18.5 12H21M4.22 19.78 5.9 18.1M18.1 5.9 19.78 4.22"
        className="fill-none stroke-current"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconMoon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M20 14.5A7.5 7.5 0 0 1 11.5 6 6 6 0 1 0 20 14.5Z"
        className="fill-none stroke-current"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}



