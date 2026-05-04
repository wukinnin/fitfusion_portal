export const testCase = {
  id: 'CASE-010',
  module: 'Login Module',
  scope: 'FitFusion Admin Portal',
  description: 'Validate by accessing protected portal pages after authentication.',
  expectedResult:
    'Able to route authenticated users to allowed portal pages and restrict unauthenticated access.',
}

export function verifySpecification() {
  return (
    testCase.scope.includes('Portal') &&
    testCase.expectedResult.includes('restrict unauthenticated access')
  )
}

export default testCase
