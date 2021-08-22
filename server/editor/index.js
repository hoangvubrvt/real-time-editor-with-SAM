const AWS = require('aws-sdk');

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

async function sendMessagesToConnection(amazonGatewayManagementAPI, connectionId, data) {
  console.log('sendMessagesToConnection', connectionId, data);
  try {
    return amazonGatewayManagementAPI.postToConnection({
      ConnectionId: connectionId,
      Data: JSON.stringify(data),
    }).promise();
  } catch (err) {
    if (err.statusCode === 410) {
      return deleteConnection(connectionId);
    }

    throw err;
  }
}

function getUsersFromItems(items, currentUser = '') {
  const users = items.map(({ username }) => {
    return {
      username,
      randomColor: "navy"
    }
  });

  if(currentUser) {
    users.push({
      username: currentUser,
      randomColor: "navy"
    })
  }

  return users
}

async function sendMessageToRoom(amazonGatewayManagementAPI, sourceConnectionId, data) {
  console.log('sendMessageToRoom', sourceConnectionId, data);
  const connectionData = await docClient.scan({
    TableName: CONNECTIONS_TABLE,
    FilterExpression: 'connectionId <> :id',
    ExpressionAttributeValues: {
      ":id": sourceConnectionId
    }
  }).promise();

  await Promise.all(
    connectionData.Items.map(async ({ connectionId }) => sendMessagesToConnection(
        amazonGatewayManagementAPI,
        connectionId,
        data
    )),
  );
}

async function initConnection(connectionId, username) {
  console.log('initConnection', connectionId);
  await docClient.put({
    TableName: CONNECTIONS_TABLE,
    Item: {
      connectionId,
      username
    },
  }).promise();

  return await docClient.scan({
    TableName: CONNECTIONS_TABLE
  }).promise()
}

async function processMessage(amazonGatewayManagementAPI, connectionId, body) {
  console.log('processMessage', connectionId, body);

  const { data } = JSON.parse(body);
  const { username, type } = data;

  switch (type) {
    case 'contentchange':
      await sendMessageToRoom(amazonGatewayManagementAPI, connectionId, data);
      break;
    case 'userevent':
      const userItems = await initConnection(connectionId, username);
      const sendData = Object.assign({ ...data }, {
        users: getUsersFromItems(userItems.Items)
      });
      const sendDataFunc = userItems.Items.map( async ({ connectionId }) => sendMessagesToConnection(amazonGatewayManagementAPI, connectionId,sendData));
      await Promise.all(sendDataFunc)
      break;
    default:
      console.log(`Error: unknown action ${type}`);
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
      console.error(`Error: unknown event type ${eventType}`);
  }

  return { statusCode: 200, body: 'Connected.' };
};
