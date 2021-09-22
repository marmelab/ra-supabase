# React-admin CRM

This is the CRM for Marmelab built with [react-admin](https://github.com/marmelab/react-admin).
This version uses [ra-supabase](https://github.com/marmelab/ra-supabase).

## How to run

After having cloned the react-admin repository, run the following commands at the react-admin root:

```sh
make install
```

Copy the `.env.local-example` file as `.env.local` and update its variables. You can then run the following command to start the application in development mode:

```sh
make start
```

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.<br>
See the section about [running tests](#running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed!
