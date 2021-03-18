# marvelAPI

1, Create .env file with following values:

PORT=port number
PRIVATE_KEY=your private key
PUBLIC_KEY=your public key

2, Run: npm install
3, Run: npx ts-node-dev .\MarvelAPI.ts

# API: Swagger

/characters
+ Caching:
    - key: indexing from offset -> offset + limit
    - ttl: 1 day
/characters/:id
+ Caching:
    - key: id
    - ttl: 1 day