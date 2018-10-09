var models = require('express-cassandra')
var LOG = require('sb_logger_util')
var path = require('path')
var filename = path.basename(__filename)
var contactPoints = process.env.sunbird_cassandra_ips.split(',')
var cassandra = require('cassandra-driver')
// contactPoints = ['172.16.0.152', '172.16.0.115', '172.16.0.63']
contactPoints = ['10.0.1.138', '10.0.1.168', '10.0.1.65']
// 172.16.0.63// anoop
// 172.16.0.115 vinaya
console.log('models.consistencies.quorum ', models.consistencies.quorum)
models.setDirectory(path.join(__dirname, '.', '..', 'models', 'cassandra')).bind(
  {
    clientOptions: {
      contactPoints: contactPoints,
      protocolOptions: { port: 9042 },
      keyspace: 'dialcodes',
      queryOptions: { consistency: models.consistencies.quorum }
    },
    ormOptions: {
      defaultReplicationStrategy: {
        class: 'NetworkTopologyStrategy',
        datacenter1: 2
      },
      migration: 'safe'
    }
  },
  function (err) {
    // console.log("dsfsdf",new cassandra.policies.loadBalancing.DCAwareRoundRobinPolicy('172.16.0.152',1))
    if (err) {
      LOG.error({ filename, 'Error connecting to the database: ': err })
      throw err
    } else {
      LOG.info({ filename, 'connecting to database': 'success' })
    }
  }
)

function checkCassandraDBHealth (callback) {
  const client = new cassandra.Client({ contactPoints: contactPoints })
  client.connect()
    .then(function () {
      client.shutdown()
      callback(null, true)
    })
    .catch(function (err) {
      console.log('cassandra err:', err)
      client.shutdown()
      callback(err, false)
    })
}

module.exports = models
module.exports.checkCassandraDBHealth = checkCassandraDBHealth
