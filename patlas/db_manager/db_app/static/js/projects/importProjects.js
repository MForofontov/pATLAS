/*globals FileSaver, iterateArrays, selectedFilter*/

/**
 * A function to save files to output
 * @param {String} fileName - the string that will be the file name
 * @param {String} typeOfFile - The type of data to be saved. It can be for
 * example "data:application/json;charset=utf-8" or "text/plain;charset=utf-8"
 * @param {Array} textToExport - The array of elements to be saved to file
 */
const fileDownloader = (fileName, typeOfFile, textToExport) => {

  const file = new Blob(textToExport, {type: textToExport})

  FileSaver.saveAs(file, fileName)
}


/**
 * Function to parse the current view to be displayed by the project. It can be
 * used for initial import of the project or for further views cycling
 * @param {Object} importedFileProject - The json file containing all the
 * project entries
 * @param {String} view - The string that checks the view that is requested by
 * the user, through the dropdown menu
 * @returns {Object|Array}
 */
const importProject = (importedFileProject, view) => {
  // get first imported project
  // TODO in the future this should receive a single project?
  const firstProject = JSON.parse(
    importedFileProject[Object.keys(importedFileProject)[0]]
  )

  return firstProject[view]
}

const setProjectView = async (g, graphics, renderer, projectInitialView, view) => {

  let storeLis = ""
  let i = 0

  selectedFilter = (view === "resistance") ? "res" : view

  // instance when view is resistance or taxa
  if (projectInitialView.constructor !== Array) {

    // iterate through each taxa level
    for (let k in projectInitialView) {

      if (projectInitialView.hasOwnProperty(k)) {
        const stringClass = k.charAt(0).toUpperCase() + k.slice(1)

        // iterate through the array of taxa selected within each taxa level to
        // append things to displayer in respective taxaModal
        for (const item in projectInitialView[k]) {
          if (projectInitialView[k].hasOwnProperty(item)) {
            filterDisplayer(projectInitialView[k][item], stringClass,
              `#p_${stringClass}`)
          }
        }
      }
    }
  }

  // for taxa use iterateArrays function to color nodes
  if (view === "taxa") {
    $("#taxaModalSubmit").click()
  } else if (view === "resistance") {
    $("#resSubmit").click()
  }

}
