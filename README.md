# Gluco-check

Repo divided into:

- api: contains the server side code consumed by the app
- app: conforms the mobile app

# API

This is a Node/Express REST API for getting quotes from different cab-hailing companies.

## Getting Started

```bash
  npm install
  npm run server # Express API Only :5000
```

# API Usage & Endpoints

## Get quotes for journey

#### [GET api/quotes/:startLatitude-:startLongitude-:endLatitude-:endLongitude]

- Request: Get quotes from different cab companies for the journey provided

- Response: 200 (application/json)

  - Body

          [
            {
              "company": "",
              "cost": "",
              "tripDuractionEstimate": "",
              "pickUpEstimate": ""
            },
            {
              "company": "",
              "cost": "",
              "tripDuractionEstimate": "",
              "pickUpEstimate": ""
            }
          ]

# APP

## Pre-requisites

- Node 10+

#### Project Setup

- Install expo client
  ```
  npm install expo-cli --global
  ```
- Install packages (root folder of project)
  ```
  npm install
  ```

#### Start local development server and API server

```bash
npm run start # Expo Client Only :19002
npm run start & npm run api # Express & Expo :5000 & :19002
```

- Go to URL provided usually
  ```
  http://localhost:19002/
  ```
- Open Expo app in your device (or download it)
  > Note: it could be either Android or iOS
- Scan the QR code
- That's it! Start coding! :rocket:
