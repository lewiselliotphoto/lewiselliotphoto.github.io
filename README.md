# Lewis Elliot Photography

## Setup for development

```bash
# First time only. Pull the node container
docker pull node:22-alpine

# - Run the container
# - Mount the sources
# - Use an interactive shell
# - Expose port 3000
# docker run -it --rm --entrypoint sh node:22-alpine
docker run -v "//$(pwd)/lewiselliotphoto:/app/" -p 3000:3000 -e WATCHPACK_POLLING=true -it --rm --entrypoint sh node:22-alpine

# Inside the container...
cd app/

# First time only. Install the dependencies
npm install

# Serve the website locally
npm start

# In the browser, go to:
http://localhost:3000
```