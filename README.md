Source code of centrífuga4, [Xamfrà](https://xamfra.net)'s student management platform.

INSTALLING
1. Clone this repository
2. Install [Python 3 and Pip](https://www.python.org/downloads/)
3. Install Python requirements using `pip install -r requirements.txt`
4. Install [npm](https://www.npmjs.com/get-npm)
5. Run `npm install` inside centrifuga4-frontend to install the npm modules

DEVELOPMENT
1. Python backend
    1. Add all the required environment variables
    2. Use development/generate_sample_db.py to create a new database. It will contain a user 'admin@gmail.com' : 'admin'
    3. Run development/wsgi_development.py to run the backend development server
2. Frontend development server
    1. Run `npm start` inside centrifuga4-frontend to start the frontend development server
3. Run Redis Server and email_queue/worker.py.

DEVELOPMENT (USING THE BUILT REACT FILES)
1. Run `npm build` inside centrifuga4-frontend to build the React files into static files
2. Run wsgi_production.py to run the server
3. Run Redis Server worker.py.

AUTHORSHIP

v0 by A. Rius

v1-4 by @miquelvir

ARCHITECTURE AND DESIGN

Due to budget constraints, reduced development and maintenance group, and for simplicity's sake, centrifuga4 is build
following a monolithic approach. However, code decoupling and modularity are still important.

We are using 2 processes (dynos, in Heroku's slang), if we are not to count the Postgres and the Redis instances:
1. Web process: a Flask server serving the static files (including the React frontend) and all the APIs.
   1. Data API (for DB data access and modification)
   2. Auth API (to login, logout and ping)
   3. Front end static files
   4. Invites API (to create and send user invites, as well as to create users from invites)
   5. Password reset API (to ask for a password reset, as well as to change the password from a password reset request)
   6. Document validation page (checks the content and validity of a JWT token signed by the server and displays it in a simple static page).
2. Worker process: a Redis Queue worker for emails and long exports.

DEPLOYMENT

Due to the Redis Server, the deployment is limited to Linux servers. The one being used is Heroku; the Procfile 
specifies how the workers are to be run.

For now, it is run on the free tier; if dyno hours were not enough, then it would be useful to increment to a Hobby plan
(which would allow for a custom domain together with SSL). Similarly, if more than 500 students + 100 courses are needed,
Heroku Postgres would probably need to be upgraded. An alternative is deploying a small server to Xamfrà.

SECURITY COPIES

One can manually export a PostgreSQL dump file from Heroku ([see instructions](https://devcenter.heroku.com/articles/heroku-postgres-import-export)).
