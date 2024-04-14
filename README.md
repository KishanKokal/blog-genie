# Steps to run the backend-application

## Build and run document-loader-service

        cd document-loader-service/service
        docker build -t document-loader-service .
        docker run -d -p 8000:8000 --name document-loader-service document-loader-service

## Run the express server

        cd server
        npm run dev
