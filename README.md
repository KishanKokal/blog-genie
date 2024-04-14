# Steps to run the application

## Install and run ollama

        docker run -d -v ollama:/root/.ollama -p 11434:11434 --name ollama ollama/ollama

## Install the llama2 model

        docker exec -it ollama ollama run llama2

## Continue running an exited docker container

        docker ps -a

        docker start <id>

## Build vector-search-service image

        docker build -t vector-search-service .

## Run the vector-search-service container

        docker run -d -p 8000:8000 --name vector-search-service vector-search-service
