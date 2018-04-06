/*speciesRequest, taxaRequest, resRequest, pfRequest, virRequest*/

/**
 * Function to calculate intersection between arrays. Note that this function
 * cannot receive empty arrays because that will cause the final intersection
 * to be nothing.
 * @param {Array} arr - This variable must be an array of arrays
 * @returns {Array} - returns an array with all the entries that are common in
 * all the arrays present in the initial array of arrays.
 */
const arraysIntersection = (arr) => {

  // sort by asceding order of array lenght
  arr.sort( (a, b) => {
    return a.length - b.length
  })

  // get first array as reference and the remaining as others
  const ref = arr[0],
    other = arr.slice(1,)

  let common = []
  let save

  // iterate through all reference entries. The rational is that each one of the other arrays must have the entries in ref.
  for (const el of ref){
    save = true
    for (const lst of other) {
      // if array lst doesn't have el then save is set to false, which will not save it to common list/array
      if (!lst.includes(el)) {
        save = false
      }
    }
    if (save) {
      common.push(el)
    }
  }

  return common
}

/**
 * Function that merges an array of arrays and removes the duplicates entries
 * from the resulting array
 * @param {Array} arr - Any array of arrays with strings
 * @returns {Array} - A unique array with unique entries
 */
const mergeNRemoveDuplicatesFromArray = (arr) => {
  // sum arrays
  let mergedListRes = [].concat.apply([], arr)
  // remove duplicates from array
  mergedListRes = mergedListRes.filter( (item, pos, self)  => {
    return self.indexOf(item) === pos
  })

  return mergedListRes
}


/**
 * Function that controls if a selector is being clicked for the first time
 * or if it is being deselected in order to allow to use other selectors
 * from the same level. For example, this prevents that multiple taxa selectors
 * are used at the same time
 * @param {boolean|String} lastTaxaSelector - The variable that controls the
 * last selector that was clicked. When nothing is selected it is false,
 * otherwise it will store the string with the last element that was clicked.
 * @param {Object} e - The object with the event
 * @param {Array} arrayOfSelectors - An array with all the ids of the selectors
 * to control.
 * @returns {boolean|String}
 */
const controlFiltersSameLevel = (lastTaxaSelector, e, arrayOfSelectors) => {

  // if lastTaxaSelector is false then disable all other selectors than the one
  //being clicked
  if (lastTaxaSelector === false) {
    for (const selector of arrayOfSelectors) {
      if (selector !== e.target.id) {
        $(`#${selector}`).prop("disabled", true)
      }
    }
    lastTaxaSelector = e.target.id
  } else {
    // otherwise just remove the disabled property.
    lastTaxaSelector = false
    for (const selector of arrayOfSelectors) {
      $(`#${selector}`).prop("disabled", false)
    }
  }

  // returns the state of lastTaxaSelector
  return lastTaxaSelector
}

/**
 * A function that is used to parse promises resulting from requests to psql db
 * and retrieves a list of the accession numbers queried
 * @param {Array} requestConst - An array of promises from post requests
 * @returns {Array} - returns a list of accession numbers as an array
 */
const mapRequest = (requestConst) => {
  requestList = []
  if (requestConst !==  false) {
    requestConst.map( (request) => {
      requestList.push(request.plasmid_id)
    })
  }
  return requestList
}

const parseQueriesIntersection = async (g, graphics, renderer,
                                        objectOfSelections) => {

  // first parse the multitude of taxa entries and resistance entries available
  const taxa = (objectOfSelections.order.length > 0) ? objectOfSelections.order
    : (objectOfSelections.family.length > 0) ? objectOfSelections.family
      : (objectOfSelections.genus.length > 0) ? objectOfSelections.genus
        : (objectOfSelections.species.length > 0) ? objectOfSelections.species
          : false

  const res = (objectOfSelections.card.length > 0) ? objectOfSelections.card
    : (objectOfSelections.resfinder.length > 0) ? objectOfSelections.resfinder
      : false

  const taxaQueryResults = (taxa === objectOfSelections.species) ?
    await speciesRequest(g, graphics, renderer, taxa[0], false) :
    (taxa !== false) ?
      await taxaRequest(g, graphics, renderer, taxa[0], false) :
      false

  // get accessions from taxa requests
  const listTaxa = mapRequest(taxaQueryResults)

  let listRes = []

  if (res !== false) {
    // since it is possible to select more than one resistance it is necessary
    // to iterate through each resistance and append the results to a list
    // (listRes).
    for (const r of res) {
      const resHandle = await resRequest(g, graphics, renderer, r, false)
      listRes.push(mapRequest(resHandle))
    }

    // merge results and remove duplicates
    listRes = mergeNRemoveDuplicatesFromArray(listRes)
  }

  let listPf = []

  if (objectOfSelections.pfinder.length > 0) {

    for (const pf of objectOfSelections.pfinder) {
      // since it is possible to select more than one plasmid family it is necessary
      // to iterate through each resistance and append the results to a list
      // (listPf).
      const pfHandle = await pfRequest(g, graphics, renderer, pf, false)
      listPf.push(mapRequest(pfHandle))
    }

    // merge results and remove duplicates
    listPf = mergeNRemoveDuplicatesFromArray(listPf)
  }

  let listVir = []

  if (objectOfSelections.virulence.length > 0) {

    for (const vir of objectOfSelections.virulence) {

      const virHandle = await virRequest(g, graphics, renderer, vir, false)
      listVir.push(mapRequest(virHandle))
    }

    // merge results and remove duplicates
    listVir = mergeNRemoveDuplicatesFromArray(listVir)
  }

  // remove empty arrays
  arrayOfArrays = [listTaxa, listRes, listPf, listVir]
  arrayOfArrays = arrayOfArrays.filter( (n) => { return n.length !== 0 })

  // here arrayOfArrays must not have empty arrays
  tempList = await arraysIntersection(arrayOfArrays)

  // color nodes after having tempList
  colorNodes(g, graphics, renderer, tempList, 0xff1c00)

  return tempList
}
