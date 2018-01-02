let masterSeeds = require('./master_seeds');
const StellarSdk = require('../lib/index');

var admins = {
    local: [],
    dev: [
        'GBTRUMWH23MNME2TR6RBW3KOQPRIXGRDZPI3HVVUF5S32JQ6MM2NC4VF',
        'GDTEA7JYI2TNJF7ZIMCBGGJLGDSH3MOUZK5N4ZTEILQYSP4FS2SC6MYL',
        'GDWZZKOSXMUKYW5NUNDH4AIPRBROUI67GNAPCIQ3PXWYTBSNV6HIYWBB',
        'GBNH45C5RDSFJ6JV75IQA6OTXV2OQJZ37LBLULIIXN6K4RBTRHEXFF5O',
        'GDSAIMPNUGCT5GTRKYZME65YS7SFVLJSD6HFPJZT2FNYPRNTZVSPIYSF',
        'GBCKATEJYCBY5V7JIRHHTENPDF7AYDRSO3VDFMUXRAEE7CXBAYZPDTKS',
        'GAELAOCC44DFPXEHF2DEWRGQK6DUW2NEIRONGDDJ5ET7BWSE3ZB2YE6G',
        'GC7SVJFGSXNPPZ3RS2KJOWG3OSBOSSERXAEKBVW6YM7SHYCHLYRW4VTO',
        'GDVTUNOJ2BNYLTZTKMEZ3BKLMVFUIVGFUJEKLDF5KIWD4KRBXUA55IBR',
        'GCN4GZ625NUUJ64XLXQNDZVLCGKHHM6DFEQ4HJMNKC34CSQCCCZD7LDL',
        'GDSAIMPNUGCT5GTRKYZME65YS7SFVLJSD6HFPJZT2FNYPRNTZVSPIYSF',
    ],
    staging: [
        'GA6HRCUJY4WIDWE3PSBQDMRO5M4RHP6GL2OFBCXXEFU5CFU744OTNDKL',
        'GAOYBHSVM6E55S5TFLFRZIYIY5O3U34675NUHPA5U2XEPQDKUF3JIQDR',
        'GCJN5KZ2ZKPV3PXHGE6M7QQ5Q7XY4JT2F7K3GEYELEPYDRSNR3OSQPBL',
        'GB3I7QXFFSHWT7UAHZI2QGT7PCWOMFLYFE3CAFB374X36DNXLFUIQK6S',
    ]
}

const passphrases = {
    local: 'Test SDF Network ; September 2015',
    dev: 'Test SDF Network ; September 2015',
    staging: 'SUN Staging Network ; December 2017'
}

const urls = {
    local: 'http://127.0.0.1:8000',
    dev: 'http://18.195.18.3:8000',
    staging: 'http://staging.api.sun.swarm.fund'
}

//env is one of the {'local', 'dev', 'staging'}

module.exports = {
    getConfig: function (env) {
        const config = {
            url: urls[env],
            networkPassphrase: passphrases[env],
            master: StellarSdk.Keypair.fromSecret(masterSeeds[env]),
            issuance: StellarSdk.Keypair.fromSecret(masterSeeds[env]),
            admins: admins[env],
        };

        StellarSdk.Network.use(new StellarSdk.Network(config.networkPassphrase));
        config.server = new StellarSdk.Server(config.url, { allowHttp: true });

        return config
    }
};
