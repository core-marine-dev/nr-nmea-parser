const { z } = require('zod')
const { NMEAParser: Parser } = require('@coremarine/nmea-parser')

const isString = value => z.string().safeParse(value).success
const isBoolean = value => z.boolean().safeParse(value).success
const isNullOrUndefined = value => value === null || value === undefined

const setNode = (parser, { memory, file }) => {
  if (isBoolean(memory)) {
    parser.memory = memory
  }
  if (file?.length) {
    parser.addProtocols({ file })
  }
}

const getMemory = (parser, memory) => {
  // Not memory
  if (isNullOrUndefined(memory)) { return undefined }
  const { command, payload } = memory
  // Memory command
  if (!isNullOrUndefined(command)) {
    if (isString(command)) {
      // Memory set
      if (command === 'set') {
        if (!isBoolean(payload)) {
          return "memory.payload should be boolean"
        }
        parser.memory = payload
        return {
            memory: parser.memory,
            characters: parser.bufferLimit
        }
      }
      // Memory get
      if (command ==='get') {
        return {
          memory: parser.memory,
          characters: parser.bufferLimit
        }
      }
    }
    return "memory.command should be \"get\" or \"set\""
  }
  // Invalid value
  return "invalid memory input"
}

const getProtocols = (parser, _protocols) => {
  // Not protocols
  if (isNullOrUndefined(_protocols)) { return undefined }
  const { command, file, content, protocols } = _protocols
  // Protocols command
  if (!isNullOrUndefined(command)) {
    if (isString(command)) {
      // SET
      if (command === 'set') {
        parser.addProtocols({ file, content, protocols })
        return parser.getProtocols()
      }
      // GET
      if (command === 'get') {
        return parser.getProtocols()
      }
    }
    return "protocols.command should be \"get\" or \"set\""
  }
  // Invalid value
  return "invalid protocols input"

}

const getSentence = (parser, sentence) => {
  // Not sentence
  if (isNullOrUndefined(sentence)) { return undefined }
  // Sentence
  if (isString(sentence)) {
    return parser.getSentence(sentence)
  }
  // Invalid sentence
  return "sentence must be a string"
}

const getPayload = (parser, payload) => {
  // Not payload
  if (isNullOrUndefined(payload)) { return undefined }
  // Payload
  if (isString(payload)) {
    return parser.parseData(payload)
  }
  // Invalid payload
  return "payload must be an ASCII string"
}

module.exports = function(RED) {
  // Component
  function NMEAParser(config) {
    RED.nodes.createNode(this, config)
    const node = this
    Object.assign(node, config)
    // Logic
    let parser = null
    try {
      parser = new Parser(true)
      setNode(parser, config)
    } catch (err) {
      node.error(err, 'problem setting up NMEA parser')
    }
    // Input
    node.on('input', (msg, send, done) => {
      let error = null
      try {
        const { memory, protocols, sentence, payload } = msg
        // Memory
        msg.memory = getMemory(parser, memory)
        // Protocols
        msg.protocols = getProtocols(parser, protocols)
        // Sentence
        msg.sentence = getSentence(parser, sentence)
        // Payload
        msg.payload = getPayload(parser, payload)
        send(msg)
      } catch (err) {
        error = err
        node.error(err, 'problem reading NMEA msg')
      }
      // Finish
      if (done) { (error === null ) ? done() : done(error) }
    })
  }
  // Register
  RED.nodes.registerType('nmea-parser', NMEAParser)
}
