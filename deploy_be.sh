#!/bin/bash
set -e
USAGE="Usage: $0 {PACKAGES_BUCKET} {AWS_PROFILE}"

PACKAGES_BUCKET=${1?$USAGE}
AWS_PROFILE=${2?$USAGE}
STACK_NAME='real-time-editor'
REGION='ap-southeast-1'

function build_project() {
  echo "Start Build Backend";
  sam build;
  sam package --output-template-file packaged.yaml --profile $AWS_PROFILE --region $REGION --s3-bucket $PACKAGES_BUCKET;
}

function deploy_backend() {
  echo "Start deploy backend";
  sam deploy --template-file packaged.yaml --region $REGION --stack-name $STACK_NAME --capabilities CAPABILITY_IAM --profile $AWS_PROFILE --no-fail-on-empty-changeset;
  WSS_URI=$(aws cloudformation describe-stacks --region $REGION --profile $AWS_PROFILE --stack-name $STACK_NAME --query 'Stacks[0].Outputs[?OutputKey==`WebSocketURI`]'.OutputValue --output text)
  echo "WSS URL ${WSS_URI}";
  rm -f ./client/public/wss-uri.txt && echo $WSS_URI >> ./client/public/wss-uri.txt;
}

build_project
deploy_backend
