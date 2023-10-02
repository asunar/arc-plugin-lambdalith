async function routes (fastify) {
  // Testing route
  fastify.get('/', async (req) => {
    console.log(req)
    return { hello: 'world' }
  })

  // INIT TABLE. Launch just once to create the table
  fastify.get('/initdb', (req, reply) => {
    fastify.pg.connect(onConnect)
    function onConnect (err, client, release) {
      if (err) return reply.send(err)
      client.query(
        'CREATE TABLE IF NOT EXISTS "users" ("id" SERIAL PRIMARY KEY,"name" varchar(30),"description" varchar(30),"tweets" integer);',
        function onResult (err, result) {
          release()
          reply.send(err || result)
        }
      )
    }
  })

  // GET ALL USERS
  fastify.route({
    method: 'GET',
    url: '/users',
    // eslint-disable-next-line no-unused-vars
    handler: async function (request, reply) {
      const client = await fastify.pg.connect()
      try {
        const { rows } = await client.query('SELECT * from users')
        // Note: avoid doing expensive computation here, this will block releasing the client
        return rows
      }
      finally {
        // Release the client immediately after query resolves, or upon error
        client.release()
      }
    },
  })

  // GET ONE USER if exists
  fastify.route({
    method: 'GET',
    url: '/users/:id',
    // eslint-disable-next-line no-unused-vars
    handler: async function (request, reply) {
      const client = await fastify.pg.connect()
      try {
        const { rows } = await client.query(
          `SELECT * from users where id=${request.params.id}`
        )
        return rows[0]
      }
      finally {
        // Release the client immediately after query resolves, or upon error
        client.release()
      }


    },
  })

  // Create users
  /*
curl --header "Content-Type: application/json" \
  --request POST \
  --data '{"name":"brian","description":"test description", "tweets":"42"}' \
  http://localhost:3333/users
  */
  fastify.route({
    method: 'POST',
    url: '/users',
    // eslint-disable-next-line no-unused-vars
    handler: async function (request, reply) {
      const client = await fastify.pg.connect()
      const newUser = request.body
      try {
        const result = await         client.query(
          `INSERT into users (name,description,tweets) VALUES('${newUser.name}','${newUser.description}',${newUser.tweets})`
        )
        return result
      }
      finally {
        // Release the client immediately after query resolves, or upon error
        client.release()
      }
    },
  })

  // UPDATE ONE USER fields
  /*
curl --header "Content-Type: application/json" \
  --request PUT \
  --data '{"description":"UPDATED description"}' \
  http://localhost:3333/users/1
  */
  fastify.route({
    method: 'PUT',
    url: '/users/:id',
    // eslint-disable-next-line no-unused-vars
    handler: async function (request, reply) {
      const client = await fastify.pg.connect()
      try {
        const oldUserReq = await client.query(`SELECT * from users where id=${request.params.id}`)
        const oldUser = oldUserReq.rows[0]
        console.log('oldUser', oldUser)
        const result = await client.query(
          `UPDATE users SET(name,description,tweets) = ('${request.body.name || oldUser.name}', '${request.body.description || oldUser.description}', ${request.body.tweets || oldUser.tweets})
      WHERE id=${request.params.id}`
        )
        console.log(result)
        return `Updated: ${request.params.id}`
      }
      finally {
        // Release the client immediately after query resolves, or upon error
        client.release()
      }
    },
  })

  // DELETE ONE USER if exists
  /*
curl --request DELETE http://localhost:3333/users/1
  */
  fastify.route({
    method: 'DELETE',
    url: '/users/:id',
    // eslint-disable-next-line no-unused-vars
    handler: async function (request, reply) {
      const client = await fastify.pg.connect()
      try {
        const result = await client.query(
          `DELETE FROM users WHERE id=${request.params.id}`
        )
        console.log(result)
        return `Deleted: ${request.params.id}`
      }
      finally {
        // Release the client immediately after query resolves, or upon error
        client.release()
      }
    },
  })
}

module.exports = routes
