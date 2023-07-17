const NodeCache = require("node-cache");
const cache = new NodeCache();

module.exports = duration => (req, res, next) => {
    const key = req.originalUrl;
        const cachedResponse = cache.get(key);

        if (cachedResponse != undefined){
            res.json(cachedResponse);
        } else {
            res.originalSend = res.send;
            res.send = body => {    //setting body of res to cache, so any responses will also go to cache.
                res.originalSend(body);
                cache.set(key, body, duration);
            };
            next();
        }
};