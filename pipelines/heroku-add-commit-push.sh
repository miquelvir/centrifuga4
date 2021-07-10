heroku login
git add .
git add -f web_app/build
git commit -m "automatic deployment"
git push heroku master