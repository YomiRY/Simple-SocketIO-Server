const tag_debug_map = new Map();
const tag_prefix = 'SimpleSocketIO:';

function log(tag, msg) {    
    tag = tag_prefix + tag;
    if (!tag_debug_map.has(tag)) {
        tag_debug_map.set(tag, require('debug')(tag));
    }
    let tag_debug = tag_debug_map.get(tag);
    tag_debug(msg);
}

module.exports.log = log;