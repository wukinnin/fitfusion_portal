export const testCase = {
  id: 'CASE-043',
  module: 'Data Export and Audit Trail Module',
  screen: 'Export Data Page',
  description:
    'Validate by selecting one or more database tables and choosing CSV or JSON format on the Export Data Page.',
  expectedResult:
    'Able to export selected data as a single file or ZIP archive when multiple tables are selected.',
}

export function verifySpecification() {
  return (
    testCase.screen === 'Export Data Page' &&
    testCase.expectedResult.includes('ZIP archive')
  )
}

export default testCase
