/// <reference types="vite/client" />

declare module '*.glb'
declare module '*.png'

declare module 'virtual:gallery-items' {
  const items: Array<{ image: string; title: string }>
  export default items
}
