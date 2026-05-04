export const testCase = {
  id: 'INT-023',
  module1: 'Data Export and Audit Trail Module',
  module2: 'Data Export and Audit Trail Module',
  process:
    'Test integration when exporting multiple tables creates a bundled file and records the export action.',
  precondition: 'Admin selects two or more tables and an export format.',
  expectedResult:
    'System downloads a ZIP archive and creates an admin log entry for the export action.',
}

export function verifySpecification() {
  return (
    testCase.precondition.includes('two or more tables') &&
    testCase.expectedResult.includes('ZIP archive')
  )
}

export default testCase
