#!/bin/bash

# AWS S3 Static Website Deployment Script
# Usage: ./scripts/deploy-s3.sh <bucket-name> [aws-profile]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if bucket name is provided
if [ -z "$1" ]; then
    echo -e "${RED}Error: Please provide S3 bucket name${NC}"
    echo "Usage: ./scripts/deploy-s3.sh <bucket-name> [aws-profile]"
    exit 1
fi

BUCKET_NAME=$1
AWS_PROFILE=${2:-default}
DISTRIBUTION_ID="" # Add your CloudFront distribution ID here if using CloudFront

echo -e "${YELLOW}Starting deployment to S3 bucket: ${BUCKET_NAME}${NC}"
echo -e "${YELLOW}Using AWS profile: ${AWS_PROFILE}${NC}"

# Build the project
echo -e "${GREEN}Building project...${NC}"
npm run build:static

# Check if build was successful
if [ ! -d "dist" ]; then
    echo -e "${RED}Build failed: dist directory not found${NC}"
    exit 1
fi

# Sync files to S3
echo -e "${GREEN}Uploading files to S3...${NC}"

# Upload all files except HTML
aws s3 sync dist/ s3://${BUCKET_NAME}/ \
    --profile ${AWS_PROFILE} \
    --exclude "*.html" \
    --cache-control "public, max-age=31536000, immutable" \
    --delete

# Upload HTML files with no-cache
aws s3 sync dist/ s3://${BUCKET_NAME}/ \
    --profile ${AWS_PROFILE} \
    --exclude "*" \
    --include "*.html" \
    --cache-control "no-cache, no-store, must-revalidate" \
    --content-type "text/html" \
    --delete

# Set bucket website configuration
echo -e "${GREEN}Configuring bucket website settings...${NC}"
aws s3api put-bucket-website \
    --profile ${AWS_PROFILE} \
    --bucket ${BUCKET_NAME} \
    --website-configuration '{
        "IndexDocument": {"Suffix": "index.html"},
        "ErrorDocument": {"Key": "index.html"}
    }'

# Make bucket publicly readable (if not using CloudFront)
echo -e "${YELLOW}Setting bucket policy for public access...${NC}"
aws s3api put-bucket-policy \
    --profile ${AWS_PROFILE} \
    --bucket ${BUCKET_NAME} \
    --policy "{
        \"Version\": \"2012-10-17\",
        \"Statement\": [
            {
                \"Sid\": \"PublicReadGetObject\",
                \"Effect\": \"Allow\",
                \"Principal\": \"*\",
                \"Action\": \"s3:GetObject\",
                \"Resource\": \"arn:aws:s3:::${BUCKET_NAME}/*\"
            }
        ]
    }"

# Invalidate CloudFront cache if distribution ID is provided
if [ ! -z "$DISTRIBUTION_ID" ]; then
    echo -e "${GREEN}Invalidating CloudFront cache...${NC}"
    aws cloudfront create-invalidation \
        --profile ${AWS_PROFILE} \
        --distribution-id ${DISTRIBUTION_ID} \
        --paths "/*"
fi

echo -e "${GREEN}✅ Deployment complete!${NC}"
echo -e "${GREEN}Website URL: http://${BUCKET_NAME}.s3-website-$(aws configure get region --profile ${AWS_PROFILE}).amazonaws.com${NC}"