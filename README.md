# nr-nmea-parser

Node-Red component to read NMEA 0183 sentences. It is a wrapper of [@coremarine/nmea-parser](https://github.com/core-marine-dev/nmea-parser) (check it docs).

## Input

: payload (string) : NMEA ASCII content (important, it is an *ASCII* string, not other encoding).

: *protocols* (object) : Object to get or set the protocols supported and their sentences (look details below).

: *sentence* (string): Sentence ID to get if it is supported and its info (look details below).

: *memory* (object): Object to check or enabled / disabled parser memory state (look details below).

## Output

: payload (array) : It gives you the same parsing output that the CoreMarine NMEA Parser (an array of object with the info of each NMEA sentence).

: *memory* (object) : Response to the *memory* input (look details below).

: *protocols* (object) : Response to the *protocols* input (look details below).

: *sentence* (string): Response to the *sentence* input (look details below).

## Details

NMEA parser translate NMEA ASCII string data into a JavaScript objects (one for each
NMEA 0183 sentence). Each time it receives data from payload input, it gives the parsed sentences to payload output.

It just a wrapper of the npm library [@coremarine/nmea-parser](https://github.com/core-marine-dev/nmea-parser) (take a look on it).

To interact with the *memory* | *protocols* | *sentence* API is through the `memory` | `protocols` | `sentence` property:

- If you request something in `msg.memory` | `msg.protocols` | `msg.sentence` input
- The response will be in `msg.memory` | `msg.protocols` | `msg.sentence` output

### Memory

It is enabled by default:

- memory enabled: Every time you inject data, it's attached to the internal data.
- memory disabled: Every time you inject data, it clears internal data and add new one.

Internally it has a buffer with a max number of characters

|                          Input                           |                            Output                             |
| :------------------------------------------------------: | :-----------------------------------------------------------: |
| `memory`: { `command`: `"set"`, `payload`: **boolean** } | `memory`: { `memory`: **boolean**, `characters`: **number** } |
|             `memory`: { `command`: `"get"` }             | `memory`: { `memory`: **boolean**, `characters`: **number** } |

### Protocols

The parser can be feeded or expanded to understand more nmea sentences, standard or propietary.
To do that it should be passed an object with the property `command` equal to `"set"` and one this three properties:

1. `file`: It's the string file path to the protocols YAML file.
2. `content`: It's the string content of the protocols YAML file.
3. `protocols`: It's the JS object after parsing the protocols YAML file.

If you send more of them, parser only will read one (`file` upper other, `content` upper `protocols`)

If you just want to know what are the known or supported sentences, you just need the command `get`.

|                            Input                             |         Output         |
| :----------------------------------------------------------: | :--------------------: |
|   `protocols`: { `command`: `"set"`, `file`: **string** }    | `protocols`: **array** |
|  `protocols`: { `command`: `"set"`, `content`: **string** }  | `protocols`: **array** |
| `protocols`: { `command`: `"set"`, `protocols`: **object** } | `protocols`: **array** |
|             `protocols`: { `command`: `"get"` }              | `protocols`: **array** |

### Sentence

If you want to know if a sentence is known / supported, you need to send the sentence id.
Response will be an `object` with the whole info or `null` if it's unknown / not supported yet.

|         Input          |              Output             |
| :--------------------: | :-----------------------------: |
| `sentence`: **string** | `sentence`: **object** | `null` |
