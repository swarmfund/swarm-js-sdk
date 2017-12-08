const StellarSdk = require('../../lib/index');

const masterSeeds = {
    swarmDev: 'SBMFQCGDVJBC2NYBRPURK3ISC4XJGGOLHMGHF7MIHVXE2DIQSMY6NYRH',
}

const passphrases = {
    swarmDev: 'Test SDF Network ; September 2015',
    swarmStaging: 'SUN Staging Network ; December 2017'
}

const urls = {
    swarmDev: 'http://18.195.18.3:8000',
    swarmStaging: 'https://staging.api.sun.swarm.fund'
}

const config = {
    url: urls.swarmDev,
    networkPassphrase: passphrases.swarmDev,
    master: StellarSdk.Keypair.fromSecret(masterSeeds.swarmDev),
    issuance: StellarSdk.Keypair.fromSecret(masterSeeds.swarmDev),
}

StellarSdk.Network.use(new StellarSdk.Network(config.networkPassphrase))
config.server = new StellarSdk.Server(config.url, { allowHttp: true })

module.exports = config
