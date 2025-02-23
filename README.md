# M321_Chat-App
## Description
 This is a Chat-App which i implemented with the help of Node and other certain tools mentioned later on in this README. Firstly i wanted to implement this Application with NextJS, but i choose to do this with Node but give it a little Twist, something i havent tried before => Socket.io I want to try it since i'm interessted in Live Apps and besides i haven't gained enough experience to get a decent grade.

## Technologies
Node.js
JavaScript
Tailwind
Socket.io
HTML
MariaDB

## Structure of the Application

### How to Print the Project Structure in a File
*Windows*
````bash
Get-ChildItem -Path . -Exclude node_modules -Recurse | Format-Table -AutoSize > structure.txt
````
*Linux/MacOS* *(Recommended)*
````bash
tree -I "node_modules" > structure.txt
````

## Sources
### Docker
````bash
https://www.docker.com/
````
### Prometheus
````bash

````
### Grafana
````bash

````
### Socket.IO
````bash
https://socket.io/docs/v4/tutorial/step-1
````

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Login | Chat App</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="../Scripts/auth.js" defer></script>
</head>
<body class="bg-gradient-to-br from-teal-50 to-teal-100 min-h-screen">
    <div class="flex justify-center items-center min-h-screen px-4">
    <div class="w-full max-w-md bg-white rounded-lg shadow-xl p-8">
        <h2 class="text-3xl font-bold text-center text-teal-600 mb-8">Welcome Back</h2>
        <form id="loginForm" class="space-y-6">
        <div>
            <label for="username" class="block text-sm font-medium text-gray-700">Username</label>
            <input
            type="text"
            id="username"
            name="username"
            required
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
            placeholder="Enter your username"
            />
        </div>
        <div>
            <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
            <input
            type="password"
            id="password"
            name="password"
            required
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
            placeholder="Enter your password"
            />
        </div>
        <div id="login-error" class="text-red-600 text-sm hidden"></div>
        <button
            type="submit"
            class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
        >
            Sign in
        </button>
        <div class="text-center">
            <a href="/register" class="font-medium text-teal-600 hover:text-teal-500">
            Don't have an account? Sign up
            </a>
        </div>
        </form>
    </div>
    </div>
</body>
</html>
