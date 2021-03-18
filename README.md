# marvelAPI
Prerequisite:
- Install redis server in your local machine, make sure it's running.
Or deploy redis-json docker in your local:
docker run --name some-redis -d redis

1, Create root-level .env file with following values:

PORT= ...port number for the main application  
PRIVATE_KEY= ...your private key (See: https://developer.marvel.com/account)  
PUBLIC_KEY= ...your public key (See: https://developer.marvel.com/account)  
REDIS_HOST=localhost  
LOG_LEVEL=error|warn|info|http|verbose|debug|silly (See: https://www.npmjs.com/package/winston#using-logging-levels)

2, Run: npm install

3, To start application:
npm run app

4, To run test:
npm run test

5, Swagger doc: localhost:{PORT}/docs (PORT as defined in step 1)


# Caching strategy
This application uses Redis as in-memory caching method. Thee timeout value is set to 10 mins. After 10 mins the stored data will be invalidated.
The cached data also contains an etag value, which exists as long as the cached data is still valid. Any subsequent request with etag value will respond back with:
- 304 status code and an empty body if there are no changes since the last live-data request.
- 200 status code and new data if there are changes.
This is for scenario wherer we want to increase the TTL of the cache and have a cronjob to do regular pulling and updating. It helps reduce the strain on network usage a bit.
