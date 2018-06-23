module.exports = {
    apps : [{
        name: 'KMS',
        script: 'npm',
        args: 'start',
        watch: true,
        ignore_watch: ['uploads']
    }]
};
