# retrospect-client-agent

Retrospect Client Agent is a node.js package for recording browser events and instrumenting outgoing requests to enable backend tracing.

# Installation

This is a Node.js module available through the npm registry. Installation is done using the npm install command:

$ npm install retrospect-client-agent

# Configuring Recording

1. Import the Recorder object from 'textrix-client' into your entry point file (ex. index.js) and call Recorder.init()

```js
import Recorder from 'textrix-client'
Recorder.init();
```

Fetch will automatically be patched to add chapter/session/user id headers to outgoing requests. Axios will be patched in the same manner.

Session Ids expire after 30 minutes, or when the tab/window is closed

2. Edit the `config.json` file inside `retrospect-client-agent` package folder in `node_modules`.

    ### Configuration Options

    - `endpoint`: configures the event data to be sent to a backend that is provided by `[add our group backend name here and link to docker compose repo]`

    - `fullSnapshotEndpoint`: configures a separate endpoint for snapshot event data provided by `[add our group backend name here and link to docker compose repo]`

    - `sampling`: configuration settings for which browser events should be recorded.

    - `fullSnapshotEveryNthEvent`: configures how frequently a full snapshot of the DOM is sent to the fullSnapshotEndpoint

    <br>

    ### Configuration Steps

    - Edit the `endpoint` and `fullSnapshotEndpoint` properties to contain the name of the `[add group name and link here]` backend.

    <br>

    ### Example of `config.js` using a domain as a endpoint

    ```json
    
    {
      "endpoint": "myawesomeapp.com/events",
      "fullSnapshotEndpoint": "myawesomeapp.com/events/snapshots"
      ...
    }
    ```
