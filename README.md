Source code of centrífuga4, [Xamfrà](https://xamfra.net)'s student management platform.

INSTALLING
1. Clone this repository
2. Install [Python 3 and Pip](https://www.python.org/downloads/)
3. Install Python requirements using `pip install -r requirements.txt`
4. Install [npm](https://www.npmjs.com/get-npm)
5. Run `npm install` inside centrifuga4-frontend to install the npm modules

DEVELOPMENT
1. Python backend
    1. Create email_queue/secrets.py and add a variable `SMTP_PASSWORD = None`
    2. Use development/generate_sample_db.py to create a new database. It will contain a user 'admin@gmail.com' : 'admin'
    3. Run development/wsgi_development.py to run the backend development server
2. Frontend development server
    1. Run `npm start` inside centrifuga4-frontend to start the frontend development server
    
PRODUCTION
1. Run `npm build` inside centrifuga4-frontend to build the React files into static files
2. Run development/wsgi_production.py to run the server
3. Run Redis Server and email_queue/worker.py.
