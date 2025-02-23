# Lewis Elliot Photography

## Setup for development

```bash
# The website content is hosted on Google Drive.
# For local development, it is necessary to download this content.
# The content should not be committed to the git repository,
# it will be downloaded on-the-fly in GitHub actions when the site is built.

cd google/

# The Google service account credentials are secret.
# Download the credentials json file for the service account
# https://console.cloud.google.com/iam-admin/serviceaccounts 
#
# Move this file into the current directory
stat credentials.json

# First time only, create a virtual Python environment
# Development was done with Python 3.12.2
python -m venv .venv

# Activate the virtual environment
. .venv/bin/activate

# Install the dependencies
python -m pip install --upgrade pip
python -m pip install -r requirements.txt

# Run the script to download the content
python download_content.py --output-dir ../lewiselliotphoto/src/content/
```

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