# Steps to run the backend-application

## Build and run document-loader-service

        cd document-loader-service/service
        docker build -t document-loader-service .
        docker run -d -p 8000:8000 document-loader-service

## Run the express server

        docker build -t blog-genie-service .
        docker run -d -p 3000:3000 blog-genie-service
