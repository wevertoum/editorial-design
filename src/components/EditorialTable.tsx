import { renderInlineText } from '../content/renderRuns'

type EditorialTableProps = {
  caption?: string
  columns: string[]
  rows: string[][]
  variant?: 'default' | 'vozes'
}

function renderCellText(cell: string) {
  return renderInlineText(cell)
}

function renderVozesStackedCell(cell: string) {
  const lines = cell.split('\n').map((line) => line.trim()).filter(Boolean)
  if (lines.length <= 1) {
    return renderCellText(cell)
  }
  const [title, ...rest] = lines
  return (
  <>
    <span className="editorial-table-stacked-title">{renderInlineText(title)}</span>
    {rest.map((line, index) => (
      <span className="editorial-table-stacked-subtitle" key={index}>
        {renderInlineText(line)}
      </span>
    ))}
  </>
  )
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
        {caption.trim() ? <caption>{renderCellText(caption)}</caption> : null}
        <thead>
          <tr>
            {columns.map((column, index) => (
              <th key={`${column}-${index}`} scope="col">
                {variant === 'vozes' ? renderVozesStackedCell(column) : renderCellText(column)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex}>
                  {variant === 'vozes' ? renderVozesStackedCell(cell) : renderCellText(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  )
}
