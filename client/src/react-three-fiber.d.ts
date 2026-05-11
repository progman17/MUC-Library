/// <reference types="@react-three/fiber" />

/**
 * Bridge @react-three/fiber's `ThreeElements` into `React.JSX.IntrinsicElements`.
 *
 * With `"jsx": "react-jsx"` TypeScript uses `React.JSX` (not the global `JSX`
 * namespace), so R3F's `declare global { namespace JSX { ... } }` is ignored.
 * This file re-augments the correct namespace so that JSX tags like <mesh />,
 * <group />, <ambientLight />, etc. are recognised without type errors.
 */
import type { ThreeElements } from '@react-three/fiber';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}
