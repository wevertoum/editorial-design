type CountryOpeningProps = {
  code: string
  title: string
  lead: string
}

export function CountryOpening({ code, title, lead }: CountryOpeningProps) {
  return (
    <header className="country-opening">
      <p className="country-code">{code}</p>
      <h1>{title}</h1>
      <p className="country-lead">{lead}</p>
    </header>
  )
}
