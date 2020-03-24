/**
 * Configuration Globais
 */
Pi.App.config({

    yum: {
        cache: false,
        sync: false
    },

    model: {
        cacheResponse: true
    },

    modules: {
        /**
          System Configuration
         */
        'Public': { base: 'localhost', url: '' },
        'Modules': { base: 'Public', url: '/modules' },
        'Vendor': { base: 'Public', url: '/public/vendor' },

        /**
          App Configuration
         */
    },

    asterisk: {
        signal: {
            url: 'wss://test.galileu.space:775'
        }
    },

    services: []
});