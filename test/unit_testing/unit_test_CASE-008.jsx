export const testCase = {
  id: 'CASE-008',
  module: 'Login Module',
  screen: 'Portal Email OTP Page',
  description: 'Validate by entering the email OTP code on the portal Email OTP Page.',
  expectedResult: 'Able to validate the code and proceed to the set new password page.',
}

export function verifySpecification() {
  return (
    testCase.screen.includes('OTP') &&
    testCase.expectedResult.includes('set new password')
  )
}

export default testCase
