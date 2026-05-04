export const testCase = {
  id: 'CASE-009',
  module: 'Login Module',
  screen: 'Portal Forgot Password / Set New Password Page',
  description:
    'Validate by entering and confirming a new password in the Admin Portal recovery flow.',
  expectedResult: 'Able to update the administrator password successfully.',
}

export function verifySpecification() {
  return (
    testCase.module === 'Login Module' &&
    testCase.expectedResult.includes('administrator password')
  )
}

export default testCase
