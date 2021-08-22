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
const client = new W3CWebSocket('wss://9ftdj3fh5l.execute-api.ap-southeast-1.amazonaws.com/dev');

const App = () => {
  const [currentUsers, setCurrentUsers] = useState([]);
  const [userActivity, setUserActivity] = useState([]);
  const [username, setUserName] = useState();
  const [text, setText] = useState(undefined);

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
    console.log("use effect");
    client.onopen = () => {
      console.log('WebSocket Client Connected');
    };

    client.onmessage = (message) => {
      console.log("on message ", message);
      const dataFromServer = JSON.parse(message.data);
      console.log("dataFromServer ", dataFromServer);

      if (dataFromServer.type === "userevent") {
        const { users } = dataFromServer;
        setCurrentUsers(users);
      } else if (dataFromServer.type === 'contentchange') {
        setText(dataFromServer.content || contentDefaultMessage);
      }

      setUserActivity(dataFromServer.userActivity || []);
    };
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
              <span id={user.username} className="userInfo" key={user.username}>
                <Identicon className="account__avatar" style={{ backgroundColor: user.randomColor }} size={40} string={user.username} />
              </span>
              <UncontrolledTooltip placement="top" target={user.username}>
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

  return (
    <>
      <Header />
      <div className="container-fluid">
        {username ? showEditorSection() : <Login onLoginFn={logInUser} />}
      </div>
    </>
  );
};

export default App;
