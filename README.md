# Collaborative Realtime Text Editor

This project is a collaborative realtime text editor where multiple users can join and work together in real time. It’s designed to test and demonstrate the capabilities of API Gateway with WebSocket support for real-time communication. Built with a modern stack, this project aims to showcase scalable, cloud-native collaboration features, including the deployment simplicity offered by AWS SAM.

## Project Overview

**Purpose**: Test and explore the ability of AWS API Gateway to support WebSocket communication for real-time applications.
**Features**:
- Realtime text editing with multiple users
- Collaborative editing, where changes are instantly reflected across users
- WebSocket-based communication for seamless real-time updates

**Tech Stack**
- Frontend: React
- Backend: Node.js
- Hosting and Deployment: AWS (API Gateway, Lambda, DynamoDB), deployed via AWS SAM (Serverless Application Model)

**Project Architecture**
- React Frontend: Handles the user interface, with hooks and WebSocket connections for real-time updates.
- Node.js Backend: Manages WebSocket connections, handles user sessions, and processes collaborative events.
- AWS API Gateway: Manages WebSocket connections to support real-time updates and collaboration.
- AWS SAM: Simplifies deployment and resource management, packaging Lambda functions, API Gateway configurations, and other AWS resources.

**Key Components**
- WebSocket Communication: Enables live, bi-directional communication for real-time collaboration.
- State Management: Maintains the current document state across multiple users.
- Data Storage: DynamoDB (or another persistent data layer) to store document history and user sessions.
- Deployment Automation: AWS SAM to automate resource creation and deployment.

**Getting Started**

1. Prerequisites:
   - Node.js (>=14.x)
   - AWS CLI
   - AWS SAM CLI
2. Setup:
   - Clone the repository:

```
git clone https://github.com/yourusername/realtime-text-editor.git
cd realtime-text-editor
```

3. Deployment:
   - Configure AWS credentials using the AWS CLI.
   - Deploy the application using SAM:

```
./deploy.sh
```

Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page for open issues or start a new discussion.

License

This project is licensed under the MIT License.

Happy coding and collaborating! 🚀
