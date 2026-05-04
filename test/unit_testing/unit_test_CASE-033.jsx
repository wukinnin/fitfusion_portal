export const testCase = {
  id: 'CASE-033',
  module: 'View Performance Module',
  screen: 'Achievement Integrity Page',
  description: 'Validate by opening the Admin Portal Achievement Integrity Page.',
  expectedResult:
    'Able to display all achievement definitions and user unlock counts.',
}

export function verifySpecification() {
  return (
    testCase.screen.includes('Achievement') &&
    testCase.expectedResult.includes('unlock counts')
  )
}

export default testCase
