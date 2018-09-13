/*globals listLengths, listGi, list, totalNumberOfLinks, counter,
bluebirdPromise */

/**
 * Function that allows the messages to be displayed in the loading div before
 * the vivagraph functions to add nodes and links are executed, which can
 * prevent them from showing up.
 * @param {String} message - The message to pass to the loading div
 * @param {Function} callbackFunction - The callback that should be executed to
 * resolve the promise
 * @returns {Promise<any>}
 */
const loadingMessage = (message, callbackFunction) => {
  return new Promise( (resolve) => {
    $("#loadingInfo").html(message)
    // waits a while to update the message and then executes the required
    // function
    setTimeout( () => {
      resolve(callbackFunction)
    }, 10)
  })
}

const develGenerationGraph = (g, jsonObj) => {
  return bluebirdPromise.map(Object.keys(jsonObj), (entry) => {
    const sequenceInfo = entry
    let dictDist = jsonObj[entry]

    counter++
    // next we need to retrieve each information type independently
    const sequence = sequenceInfo.split("_").slice(0, 3).join("_")

    // and continues
    const seqLength = sequenceInfo.split("_").slice(-1).join("")
    const logLength = Math.log(parseInt(seqLength)) //ln seq length
    listLengths.push(seqLength) // appends all lengths to this list
    listGi.push(sequence)
    //checks if sequence is not in list to prevent adding multiple nodes for each sequence
    if (list.indexOf(sequence) < 0) {
      g.addNode(sequence, {
        sequence: "<span style='color:#468499; font-weight: bold;'>Accession:" +
          " </span><a" +
          " href='https://www.ncbi.nlm.nih.gov/nuccore/" + sequence.split("_").slice(0, 2).join("_") + "' target='_blank'>" + sequence + "</a>",
        //species:"<font color='#468499'>Species:
        // </font>" + species,
        seqLength: "<span" +
          " style='color:#468499; font-weight: bold;'>Sequence length:" +
          " </span>" + seqLength,
        logLength
      })
      list.push(sequence)

      if (dictDist !== null) {
        // loops between all arrays of array pairing sequence and distances
        for (let i = 0; i < dictDist.length; i++) {
          const reference = Object.keys(dictDist[i])[0]  // stores
          // references in a unique variable
          const distance = Object.values(dictDist[i])[0].distance   // stores distances in a unique variable
          g.addLink(sequence, reference, { distance })
        }
      } else {
        dictDist = []
      }
    }
    // centers on node with more links
    storeMasterNode = storeRecenterDom(storeMasterNode, dictDist, sequence, counter)

  }, {concurrency: 10}).then( (results) => {
    return results
  })
}


/**
 * Function to add all nodes in the initial setup
 * @param g
 * @param {Object} json - The object containing all the nodes to be added and
 * their metadata
 * @param layout
 * @returns {*}
 */
const addAllNodes = (g, json, layout) => {

  return bluebirdPromise.map(json, (job) => {
    counter++
    const sequence = job.id
    const seqLength = job.length
    const logLength = Math.log(parseInt(seqLength))
    listLengths.push(seqLength)
    listGi.push(sequence)

    if (list.indexOf(sequence) < 0) {
      g.addNode(sequence, {
        sequence: "<span style='color:#468499; font-weight: bold;'>Accession:" +
          " </span><a" +
          " href='https://www.ncbi.nlm.nih.gov/nuccore/" + sequence.split("_").slice(0, 2).join("_") + "' target='_blank'>" + sequence + "</a>",
        seqLength: "<span" +
          " style='color:#468499; font-weight: bold;'>Sequence length:" +
          " </span>" + seqLength,
        logLength
      })
      list.push(sequence)
      return layout.setNodePosition(sequence, job.position.x, job.position.y)
    }
  }, {concurrency: 10}).then( (results) => {
    return results
  })
}

/**
 * Function to add all links in the initial setup. This function is executed
 * after adding all nodes
 * @param g
 * @param {Object} json - The object containing all the links to be added and
 * their metadata
 * @returns {*}
 */
const addAllLinks = (g, json) => {

  return bluebirdPromise.map(json, (job) => {
    const sequence = job.parentId   // stores sequences
    const reference = job.childId  // stores references
    const distNSizes = job.distNSizes   // stores distances
    // and sizeRatios
    if (reference !== "") {
      // here it adds only unique links because filtered.json file
      // just stores unique links
      return g.addLink(sequence, reference, distNSizes)
    }
  }, {concurrency: 10}).then( (results) => {
    return results
  })
}