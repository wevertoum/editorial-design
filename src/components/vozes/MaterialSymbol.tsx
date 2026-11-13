type MaterialSymbolProps = {
  /** Nome do glifo Material Symbols (ligatura), ex.: `edit_note`. */
  ligature: string
  className?: string
}

/** Ícone Material Symbols Outlined — fonte autohospedada para prévia e PDF. */
export function MaterialSymbol({ ligature, className }: MaterialSymbolProps) {
  const classes = ['material-symbols-outlined', className].filter(Boolean).join(' ')
  return (
    <span className={classes} aria-hidden="true">
      {ligature}
    </span>
  )
}
