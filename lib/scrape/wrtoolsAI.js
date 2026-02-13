import { v4 as uuidv4 } from 'uuid';

export async function wrtoolsAI(instructions) {
  const clientHash = '9c8d4c3959694ca';
  const clientUserId = uuidv4();

  const query = `
    mutation BrainToolsHomeworkHelperFirst(
      $clientHash: String!
      $clientUserId: String!
      $sessionSourceUrl: String!
      $gaCid: String!
      $requestType: String!
      $subject: String
      $instructions: String!
      $instructionsFromFiles: [String]
    ) {
      brainToolsHomeworkHelperFirst(
        clientHash: $clientHash
        clientUserId: $clientUserId
        sessionSourceUrl: $sessionSourceUrl
        gaCid: $gaCid
        requestType: $requestType
        subject: $subject
        instructions: $instructions
        instructionsFromFiles: $instructionsFromFiles
      ) {
        status { code message }
        generatedText
        responseGenIdHash
        chatIdHash
      }
    }
  `;

  const variables = {
    clientHash,
    clientUserId,
    sessionSourceUrl: 'https://edubrain.ai/',
    gaCid: '',
    requestType: 'smart',
    subject: 'Biology',
    instructions,
    instructionsFromFiles: []
  };

  try {
    const response = await fetch('https://wrtools-api.es-tech.co/graphql/ai_call', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'accept-language': 'id-ID',
        'content-type': 'application/json',
        'referer': 'https://my.edubrain.ai/'
      },
      body: JSON.stringify({ query, variables, operationName: 'BrainToolsHomeworkHelperFirst' })
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json();
    return data.data.brainToolsHomeworkHelperFirst;
  } catch (error) {
    console.error('Error:', error.message);
    throw error;
  }
}