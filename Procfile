web: node ./frontend/heroku-start.js
api: sh -c "cd ./backend/ && java -Dserver.port=$PORT $JAVA_OPTS -jar build/libs/*.jar"