export const testCase = {
  id: 'CASE-043',
  module: 'Data Export and Audit Trail Module',
  screen: 'Export Data Page',
  description:
    'Validate by selecting one or more database tables and choosing PDF, CSV, or JSON format on the Export Data Page.',
  expectedResult:
    'Able to export selected data as a PDF report, single CSV or JSON file, or ZIP archive when multiple raw data tables are selected.',
}

export function verifySpecification() {
  return (
    testCase.screen === 'Export Data Page' &&
    testCase.description.includes('PDF, CSV, or JSON') &&
    testCase.expectedResult.includes('PDF report') &&
    testCase.expectedResult.includes('ZIP archive')
  )
}

export default testCase
