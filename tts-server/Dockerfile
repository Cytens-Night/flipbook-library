# Piper TTS Docker Container
FROM python:3.11-slim

# Install dependencies
RUN apt-get update && apt-get install -y \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Install Piper TTS
WORKDIR /app
RUN wget https://github.com/rhasspy/piper/releases/download/2023.11.14-2/piper_linux_x86_64.tar.gz \
    && tar -xzf piper_linux_x86_64.tar.gz \
    && rm piper_linux_x86_64.tar.gz

# Download voice model
RUN wget -O en_US-lessac-medium.onnx https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/lessac/medium/en_US-lessac-medium.onnx \
    && wget -O en_US-lessac-medium.onnx.json https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/lessac/medium/en_US-lessac-medium.onnx.json

# Install Node.js for Express server
RUN apt-get update && apt-get install -y nodejs npm

# Copy server files (source paths adjusted for root build context on Railway)
COPY tts-server/package*.json ./
RUN npm install
COPY tts-server/server-docker.js ./server.js

EXPOSE 3001

CMD ["node", "server.js"]
