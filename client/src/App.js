import React, { useEffect, useState } from 'react';
import { w3cwebsocket as W3CWebSocket } from "websocket";
import Identicon from 'react-identicons';
import {
  UncontrolledTooltip
} from 'reactstrap';
import Editor from 'react-medium-editor';
import 'medium-editor/dist/css/medium-editor.css';
import 'medium-editor/dist/css/themes/default.css';
import './App.css';
import Header from "./components/header";
import Login from "./components/login";

const contentDefaultMessage = "Start writing your document here";

const App = () => {
  const [currentUsers, setCurrentUsers] = useState([]);
  const [userActivity, setUserActivity] = useState([]);
  const [username, setUserName] = useState();
  const [text, setText] = useState();
  const [client, setClient] = useState(undefined);

  const logInUser = (loginUserName) => {
    setUserName(loginUserName);
    const data = JSON.stringify({
      data: {
        type: 'userevent',
        username: loginUserName
      }
    });
    client.send(data);
  };

  useEffect(() => {
    if (!client) return;

    client.onopen = () => {
      console.log('WebSocket Client Connected');
    };

    client.onmessage = (message) => {
      const dataFromServer = JSON.parse(message.data);
      if (dataFromServer.type === "userevent") {
        const { users } = dataFromServer;
        const editedUsers = users.map((user, index) => ({
          ...user,
          id: `id_${index}`
        }));
        setCurrentUsers(editedUsers);
      } else if (dataFromServer.type === 'contentchange') {
        setText(dataFromServer.content || contentDefaultMessage);
      }

      setUserActivity(dataFromServer.userActivity || []);
    };
  }, [client]);

  useEffect(() => {
    const getWSSUri = async () => {
      const response = await fetch('./wss-uri.txt');
      const wssUrl = await response.text();
      setClient(new W3CWebSocket(wssUrl));
    };

    getWSSUri();
  }, []);

  const onEditorStateChange = (editorText) => {
    if (editorText !== '') {
      client.send(JSON.stringify({
        data: {
          type: "contentchange",
          username,
          content: editorText
        }
      }));
    }
  };

  const showEditorSection = () => (
    <div className="main-content">
      <div className="document-holder">
        <div className="currentusers">
          {currentUsers.map((user) => (
            <>
              <span id={user.id} className="userInfo" key={user.id}>
                <Identicon className="account__avatar" style={{ backgroundColor: user.randomColor }} size={40} string={user.username} />
              </span>
              <UncontrolledTooltip placement="top" target={user.id}>
                {user.username}
              </UncontrolledTooltip>
            </>
          ))}
        </div>
        <Editor
          options={{
            placeholder: {
              text: text ? contentDefaultMessage : ""
            }
          }}
          className="body-editor"
          text={text}
          onChange={onEditorStateChange}
        />
      </div>
      <div className="history-holder">
        <ul>
          {/* eslint-disable-next-line react/no-array-index-key */}
          {userActivity.map((activity, index) => <li key={`activity-${index}`}>{activity}</li>)}
        </ul>
      </div>
    </div>
  );

  const renderContent = () => (
    <>
      <Header />
      <div className="container-fluid">
        {username ? showEditorSection() : <Login onLoginFn={logInUser} />}
      </div>
    </>
  );

  return client ? renderContent() : (<></>);
};

export default App;
