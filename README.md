# retrospect-client-agent

Import the Recorder object from 'textrix-client' into your entry point file (ex. index.js) and call Recorder.init()

Fetch will automatically be patched to add chapter/session/user id headers to outgoing requests

Axios will also be patched in the same manner

Session Ids expire after 30 minutes, or when the tab/window is closed# retrospect-client-agent