# Steps to run ollama
## Run the docker container
        docker run -d -v ollama:/root/.ollama -p 11434:11434 --name ollama ollama/ollama
## Install the llama2 model
        docker exec -it ollama ollama run llama2