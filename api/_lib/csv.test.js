import { describe, expect, it } from 'vitest'
import { escapeCsv, rowsToCsv } from './csv.js'

describe('spreadsheet-safe CSV export', () => {
  it.each(['=1+1', '+SUM(A1:A2)', '-1+2', '@SUM(A1)', '  =1+1', '\t=1+1', '\r=1+1'])('neutralizes formula-like input %j', (value) => {
    expect(escapeCsv(value)).toBe(`"'${value}"`)
  })
  it('escapes quotes, commas and multiline fields without adding columns', () => {
    expect(escapeCsv('A, "quoted"\nmessage')).toBe('"A, ""quoted""\nmessage"')
  })
  it('exports only explicitly selected columns and handles nulls', () => {
    expect(rowsToCsv([{ name: 'Visitor', note: null, secret: 'excluded' }], ['name', 'note']))
      .toBe('"name","note"\r\n"Visitor",""')
  })
})
