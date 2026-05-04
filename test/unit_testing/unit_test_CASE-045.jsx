export const testCase = {
  id: 'CASE-045',
  module: 'Data Export and Audit Trail Module',
  screen: 'Admin Logs Page',
  description:
    'Validate by searching the Admin Logs Page and exporting the filtered logs as TXT.',
  expectedResult:
    'Able to filter audit records and download the displayed log entries as a text file.',
}

export function verifySpecification() {
  return (
    testCase.screen === 'Admin Logs Page' &&
    testCase.expectedResult.includes('text file')
  )
}

export default testCase
