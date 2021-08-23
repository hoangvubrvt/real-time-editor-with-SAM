#!/bin/bash
set -e
USAGE="Usage: $0 {$AWS_PROFILE} {$WWW_BUCKET}"

REGION='ap-southeast-1'
WWW_BUCKET=${2?$USAGE}
AWS_PROFILE=${1?$USAGE}

function deploy_frontend() {
  echo "Start deploy frontend";
  npm i --prefix ./client && npm run --prefix ./client build;
  aws s3 cp --profile $AWS_PROFILE --region $REGION --recursive --acl public-read client/build s3://$WWW_BUCKET/
}

deploy_frontend
