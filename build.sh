#!/bin/bash

# Set variables
IMAGE_NAME="duhblinn/suika-js-vibe"
VERSION=$(date +%Y%m%d_%H%M%S)

# Build the Docker image
echo "Building Docker image: $IMAGE_NAME:$VERSION"
docker build -t $IMAGE_NAME:$VERSION .
docker tag $IMAGE_NAME:$VERSION $IMAGE_NAME:latest

# Push to Docker Hub
echo "Pushing to Docker Hub..."
docker push $IMAGE_NAME:$VERSION
docker push $IMAGE_NAME:latest

echo "Done! Image pushed as:"
echo "$IMAGE_NAME:$VERSION"
echo "$IMAGE_NAME:latest"
