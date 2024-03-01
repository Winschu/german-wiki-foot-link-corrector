# GermanFootLinkCorrector

This script connects to the German Wikipedia via an API and updates all sub-pages
of `Wikipedia:WikiProjekt Fußball/Linkkorrekturen`.

It retrieves data by sending a GET request to `petscan.wmflabs.org`.

## Setup

To run the script, a local .env file needs to be created in the root directory. The format of this file should follow
the structure below:

```dotenv
USERNAME=
PASSWORD=
CLIENT_KEY=
CLIENT_SECRET=
TOKEN=
```