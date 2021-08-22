import AWS from 'aws-sdk';

const CONNECT_EVENT_TYPE = 'CONNECT';
const DISCONNECT_EVENT_TYPE = 'DISCONNECT';
const MESSAGE_EVENT_TYPE = 'MESSAGE';

const docClient = new AWS.DynamoDB.DocumentClient();

const { CONNECTIONS_TABLE } = process.env;

async function deleteConnection(connectionId) {
  console.log('deleteConnection', connectionId);
  await docClient.delete({
    TableName: CONNECTIONS_TABLE,
    Key: {
      connectionId,
    },
  }).promise();
}

async function sendMessagesToConnection(amazonGatewayManagementAPI, connectionId, message) {
  console.log('sendMessagesToConnection', connectionId, message);
  try {
    return amazonGatewayManagementAPI.postToConnection({
      ConnectionId: connectionId,
      Data: JSON.stringify(message),
    }).promise();
  } catch (err) {
    if (err.statusCode === 410) {
      return deleteConnection(connectionId);
    }

    throw err;
  }
}

async function sendMessageToRoom(amazonGatewayManagementAPI, sourceConnectionId, message) {
  console.log('sendMessageToRoom', sourceConnectionId, message);

  const connectionData = await docClient.get({
    TableName: CONNECTIONS_TABLE,
  }).promise();

  await Promise.all(
    connectionData.Items.map(async ({ connectionId }) => sendMessagesToConnection(amazonGatewayManagementAPI, connectionId, message)),
  );
}

async function initConnection(connectionId) {
  console.log('initConnection', connectionId);
  await docClient.put({
    TableName: CONNECTIONS_TABLE,
    Item: {
      connectionId,
    },
  }).promise();
}

async function processMessage(amazonGatewayManagementAPI, connectionId, body) {
  console.log('processMessage', connectionId, body);

  const message = JSON.parse(body);
  message.timestamp = Date.now();
  const { action } = message;
  delete message.action;

  switch (action) {
    case 'message':
      await sendMessageToRoom(amazonGatewayManagementAPI, connectionId, message);
      break;
    case 'init':
      await initConnection(connectionId);
      await sendMessagesToConnection(amazonGatewayManagementAPI, connectionId, '');
      break;
    default:
      console.log(`Error: unknown action ${action}`);
  }
}

// eslint-disable-next-line no-unused-vars
exports.lambdaHandler = async (event, context) => {
  console.log(event);

  const {
    eventType,
    connectionId,
    domainName,
    stage,
  } = event.requestContext;

  const amazonGatewayManagementApi = new AWS.ApiGatewayManagementApi({
    endpoint: `${domainName}/${stage}`,
  });

  switch (eventType) {
    case CONNECT_EVENT_TYPE:
      break;
    case DISCONNECT_EVENT_TYPE:
      await deleteConnection(connectionId);
      break;
    case MESSAGE_EVENT_TYPE:
      await processMessage(amazonGatewayManagementApi, connectionId, event.body);
      break;
    default:
      console.log(`Error: unknown event type ${eventType}`);
  }
};
