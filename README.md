# Steps to run the application

## Install and run ollama

        docker run -d -v ollama:/root/.ollama -p 11434:11434 --name ollama ollama/ollama

## Install the llama2 model

        docker exec -it ollama ollama run llama2

## Install and run mongodb community server

        docker run -d -p 27017:27017 --name mongodb mongodb/mongodb-community-server

## Continue running an exited docker container

        docker ps -a

        docker start <id>
