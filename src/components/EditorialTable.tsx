type EditorialTableProps = {
  caption?: string
  columns: string[]
  rows: string[][]
  variant?: 'default' | 'vozes'
}

export function EditorialTable({ caption = '', columns, rows, variant = 'default' }: EditorialTableProps) {
  if (columns.length === 0) {
    throw new Error(`EditorialTable "${caption}" needs columns`)
  }

  rows.forEach((row, index) => {
    if (row.length !== columns.length) {
      throw new Error(
        `EditorialTable "${caption}" row ${index + 1} has ${row.length} cells; expected ${columns.length}`,
      )
    }
  })

  return (
    <figure className={`editorial-table${variant === 'vozes' ? ' editorial-table-vozes' : ''}`}>
      <table>
        {caption.trim() ? <caption>{caption}</caption> : null}
        <thead>
          <tr>
            {columns.map((column, index) => (
              <th key={`${column}-${index}`} scope="col">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  )
}
