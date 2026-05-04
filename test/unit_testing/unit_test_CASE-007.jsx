export const testCase = {
  id: 'CASE-007',
  module: 'Login Module',
  screen: 'Portal Verification Request Page',
  description:
    'Validate by entering an administrator email on the portal verification request page.',
  expectedResult:
    'Able to send a verification code for administrator password recovery.',
}

export function verifySpecification() {
  return (
    testCase.screen.includes('Verification') &&
    testCase.expectedResult.includes('administrator password recovery')
  )
}

export default testCase
