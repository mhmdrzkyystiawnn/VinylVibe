export const Icons = {
  Music: ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M2 4h20v16H2V4zm2 2v12h16V6H4z" /><path d="M6 8h12v6H6V8z" />
      <path d="M8 10h2v2H8v-2z" fill="rgba(0,0,0,0.5)" /><path d="M14 10h2v2h-2v-2z" fill="rgba(0,0,0,0.5)" />
      <path d="M6 18h12v2H6v-2z" /><path d="M3 5h1v1H3V5zm17 0h1v1h-1V5zm0 13h1v1h-1v-1zM3 18h1v1H3v-1z" />
    </svg>
  ),
  Coin: ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M8 2h8v2h4v4h2v8h-2v4h-4v2H8v-2H4v-4H2V8h2V4h4V2zm0 2H4v4H2v8h2v4h4v2h8v-2h4v-4h2V8h-2V4h-4V2H8v2zm3 2h2v2h2v2h-4v2h4v2h-2v2h-2v-2h-2v-2h4v-2h-4V8h2V6z" />
    </svg>
  ),
  Dice: ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M4 2h16v20H4V2zm2 2v16h12V4H6zm3 3h2v2H9V7zm6 0h2v2h-2V7zm-3 3.5h2v2h-2v-2zM9 14h2v2H9v-2zm6 0h2v2h-2v-2z" />
    </svg>
  ),
  Play: ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M6 4v16h2v-2h2v-2h2v-2h2v-2h2v-2h-2V8h-2V6h-2V4H6z" />
    </svg>
  ),
  Plus: ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M10 4h4v6h6v4h-6v6h-4v-6H4v-4h6V4z" />
    </svg>
  ),
  Warning: ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M10 2h4v10h-4V2zm0 14h4v4h-4v-4z M2 20h20v2H2v-2z" />
    </svg>
  ),
  Star: ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M10 2h4v4h4v4h4v4h-4v4h-4v4h-4v-4H6v-4H2v-4h4V6h4V2z" />
    </svg>
  ),
  Gear: ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M10 2h4v2h4v4h2v2h2v4h-2v2h-2v4h-4v2h-4v-2H6v-4H4v-2H2v-4h2V8h2V4h4V2zm2 6a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />
    </svg>
  ),
  // ICONS BARU UNTUK PRINTER
  Receipt: ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M3 2h18v20l-3-3-3 3-3-3-3 3-3-3-3 3V2zm2 2v14l1-1 3 3 3-3 3 3 3-3 1 1V4H5zm4 4h6v2H9V8zm0 4h6v2H9v-2z"/>
    </svg>
  ),
  Download: ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M5 20h14v-2H5v2zM19 9h-4V3H9v6H5l7 7 7-7z"/>
    </svg>
  ),
  Close: ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
    </svg>
  )
};