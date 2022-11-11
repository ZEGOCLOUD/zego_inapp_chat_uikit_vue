## Overview

The following describe how to run the sample code of the In-app Chat UIKit.

## Prerequisites

- Go to [ZEGOCLOUD Admin Console\|\_blank](https://console.zegocloud.com/) and do the following:

  1.  Create a project, and get the `AppID` and `ServerSecret` of your project.
  2.  Subscribe to the **In-app Chat** service (Contact technical support if the subscript doesn’t go well).

<img src="https://storage.zego.im/sdk-doc/Pics/InappChat/ActivateZIMinConsole2.png">

- Platform-specific requirements:
  - Chrome 58 or later.
  - Node.js 14.18.1 or later
  - The device is connected to the internet.

## Run the sample code (Vue)

### Sample code directory structure

```bash
├── README.md                     # README file
├── package.json
├── public
├── src
│   ├── assets                    # Media resource
│   ├── views                     # Business component directory
│   ├── router                    # Business component router
│   ├── store                     # Business state management
│   ├── util                      # Utilities
│   ├── ZIMKit                    # In-app Chat UIKit SDK
│   ├── App.vue                   # Business components
│   ├── main.ts                   # Project entry file
│   ├── keyCenter.ts              # SDK config file
├── tsconfig.json                 # ts config file
```

### Run the sample code

1. Download the sample code, open the `keyCenter.ts` file under the `Samples/ZIMKitDemo/src` directory using VSCode (or other programming software), and fill in the `appID` and `serverSecret` you get from the ZEGOCLOUD Admin Console.

```javascript
const appConfig = {
  appID: 0, // The AppID you get from ZEGOCLOUD Admin Console.
  serverSecret: '', // The ServerSecret you get from ZEGOCLOUD Admin Console.
};
```

2. In Terminal, use the cd command to navigate to the `Samples/ZIMKitDemo` directory, and run the following command in order to run the sample code.

```bash
    npm install   # Install dependencies.
    npm run serve # After installing the dependencies, execute this to run the project.
```

Congratulations! So far, you have finished all the steps, and this is what you gonna see when the sample code is run successfully:

<img src="https://storage.zego.im/sdk-doc/Pics/ZIMKit/Web/zimkit_login.png" width="80%">

## More to explore

- To get started swiftly, follow the steps in this doc: [Integrate the SDK](https://docs.zegocloud.com/article/14665)
- To explore more customizable components, check this out: [Component overview](https://docs.zegocloud.com/article/14668)

## Get support

If you have any questions regarding bugs and feature requests, visit the [ZEGOCLOUD community](https://discord.gg/EtNRATttyp).
