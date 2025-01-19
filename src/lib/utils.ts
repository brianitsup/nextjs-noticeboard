"use client"

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs))
}

// Ensure the function is available in the module exports
if (typeof exports !== 'undefined') {
  Object.defineProperty(exports, 'cn', {
    enumerable: true,
    get: function() {
      return cn;
    }
  });
}