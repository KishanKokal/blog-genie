# Steps to run the backend-application

## Build and run vector-search-service

        cd vector-search-service/service
        docker build -t vector-search-service .
        docker run -d -p 8000:8000 --name vector-search-service vector-search-service

## Run the express server

        cd server
        npm run dev
