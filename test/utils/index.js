"use strict";

let NS1        = require('../../lib'),
    record     = require('./record'),
    changeCase = require('change-case')

let context_defaults = {
  record: false
}

if (process.env.NS1_JS_TEST_API_KEY && process.env.NS1_JS_TEST_API_KEY !== NS1.NS1Request.get_api_key()) {
  NS1.set_api_key(process.env.NS1_JS_TEST_API_KEY)
} else {
  // TODO: Below error should probably come from lib internally.
  throw new Error("NS1 API key required. Please set env variable NS1_JS_TEST_API_KEY")
  process.exit(1)
}

module.exports = {

  setup_context(context_str, options, cb) {
    
    if (typeof options === 'function' && cb === undefined) {
      cb      = options
      options = context_defaults
    }

    options = Object.assign({}, context_defaults, options)

    context(context_str, function() {
      let context_str_file = changeCase.snakeCase(context_str),
          recorder         = record(context_str_file, options.record)

      before(recorder.before)
      after(recorder.after)

      context(options.record || !!process.env.NS1_NOCK_RECORD ? 'setting up recorder...' : 'loading recording fixtures...', cb)
    })
  },

  rest_resource_tests: require('./rest_resource_tests')

}
