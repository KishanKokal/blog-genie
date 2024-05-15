# Project Setup Guide

This document outlines the necessary steps to set up and run both the backend and frontend components of the application.

## Architecture

![blog-genie-architecture](./blog-genie-architecture.png)

## Backend Application Setup

### 1. Build and Run `document-loader-service`

The `document-loader-service` is responsible for fetching content from articles given the article link. Follow these steps to set it up:

Navigate to the `document-loader-service` directory and follow these commands to build and run the service:

```bash
cd document-loader-service/service
docker build -t document-loader-service .
docker run -d -p 8000:8000 document-loader-service
```

This will build the Docker image for the document loader service and run it on port 8000.

### 2. Run the Express Server

Next, build and run the Express server for the blog genie service. Execute the following commands:

```bash
docker build -t blog-genie-service .
docker run -d -p 3000:3000 blog-genie-service
```

This will create a Docker image for the blog genie service and run it on port 3000.

## Frontend Application Setup

### 1. Start the Frontend Development Server

To run the frontend application, navigate to the `client` directory and execute the following command:

```bash
cd client
npm run dev
```

This will start the development server for the frontend application.

---

By following these instructions, you will have both the backend and frontend components of the application up and running locally.

For further assistance or troubleshooting, please reach out at [kokalkishan.official@gmail.com](mailto:kokalkishan.official@gmail.com?subject=Blog%20Genie%20Assistance%20Request)
