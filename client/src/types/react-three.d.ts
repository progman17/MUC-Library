import * as THREE from 'three'

declare global {
  namespace JSX {
    interface IntrinsicElements {
      mesh: any
      group: any
      boxGeometry: any
      meshStandardMaterial: any
      planeGeometry: any
    }
  }
}