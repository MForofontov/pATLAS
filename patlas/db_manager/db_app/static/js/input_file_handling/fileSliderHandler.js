/* globals readColoring, fileChecks */

/**
 * Function to slide files to rightmost file in array
 * @param {Object} readJson - The object that stores keys between files and the
 * corresponding json results that may be displayed at a time
 * @param g
 * @param listGi
 * @param graphics
 * @param renderer
 * @returns {*[]}
 */
const slideToRight = (readJson, g, listGi, graphics, renderer) => {

  // fetches the index of the currently selected sample
  let readIndex = Object.keys(readJson).indexOf(currentSample)

  if (readIndex < Object.values(readJson).length || readIndex > 0) {
    // if readIndex is max value already then return to 0 to allow cycling
    (readIndex !== Object.values(readJson).length - 1) ?
    readIndex += 1 : readIndex = 0
    // change div containing naming of the file
    $("#fileNameDiv").html(`Current sample: ${Object.keys(readJson)[readIndex]}`)

    const nextFile = (typeof Object.values(readJson)[readIndex] === "string") ?
      JSON.parse(Object.values(readJson)[readIndex]) :
      Object.values(readJson)[readIndex]

    fileChecks(nextFile)
    const listGiFilter = readColoring(g, listGi, graphics, renderer, nextFile)
    return [readIndex, listGiFilter]
  }
}

/**
 * Function to slide files to leftmost file in array
 * @param {Object} readJson - The object that stores keys between files and the
 * corresponding json results that may be displayed at a time * @param g
 * @param listGi
 * @param graphics
 * @param renderer
 * @returns {any[]}
 */
const slideToLeft = (readJson, g, listGi, graphics, renderer) => {

  // fetches the index of the currently selected sample
  let readIndex = Object.keys(readJson).indexOf(currentSample)

  if (readIndex < Object.values(readJson).length || readIndex > 0) {
    // if readIndex is 0 then it should get the max value possible to allow
    // cycling
    (readIndex !== 0) ?
      readIndex -= 1 : readIndex = Object.values(readJson).length - 1
    // change div containing naming of the file
    $("#fileNameDiv").html(`Current sample: ${Object.keys(readJson)[readIndex]}`)

    const nextFile = (typeof Object.values(readJson)[readIndex] === "string") ?
      JSON.parse(Object.values(readJson)[readIndex]) :
      Object.values(readJson)[readIndex]

    fileChecks(nextFile)
    const listGiFilter = readColoring(g, listGi, graphics, renderer, nextFile)
    return [readIndex, listGiFilter]
  }
}
