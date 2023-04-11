const jeopardy = document.getElementById('jeopardy')
const spincontainer = document.getElementById('spin-container')
const site = "https://jservice.io/api/";
const NUM_CATEGORIES = 6;
const NUM_CLUES_PER_CAT = 5;

// categories is the main data structure for the app; it looks like this:

//  [
//    { title: "Math",h
//      clues: [
//        {question: "2+2", answer: 4, showing: null},
//        {question: "1+1", answer: 2, showing: null}
//        ...
//      ],
//    },
//    { title: "Literature",
//      clues: [
//        {question: "Hamlet Author", answer: "Shakespeare", showing: null},
//        {question: "Bell Jar Author", answer: "Plath", showing: null},
//        ...
//      ],
//    },
//    ...
//  ]
//database where you store the array for categories
let categories = [];


/** Get NUM_CATEGORIES random category from API.
 *
 * Returns array of category ids
 */
     
async function getCategoryIds() {
  // param 100 categories 
  let response = await axios.get(`${site}categories?count=100`);
  let ranCategory = _.sampleSize(response.data, NUM_CATEGORIES);
  let categoryId = ranCategory.map((item) => { 
     return item.id;
});
 
return categoryId;

}
/** Return object with data about a category:
 *
 *  Returns { title: "Math", clues: clue-array }`
 *
 * Where clue-array is:
 *   [
 *      {question: "Hamlet Author", answer: "Shakespeare", showing: null},
 *      {question: "Bell Jar Author", answer: "Plath", showing: null},
 *      ...
 *   ]
 */

async function getCategory(categoryId) {
  let response = await axios.get(`${site}category?id=${categoryId}`);
  let category = response.data;
  let everyClue = category.clues;
  let randClues = _.sampleSize(everyClue, NUM_CLUES_PER_CAT);
  let clues = randClues.map(item => ({
    question: item.question,
    answer: item.answer,
    showing: null,
  }));

  return { title: category.title, clues };
}
  

/** Fill the HTML table#jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initally, just show a "?" where the question/answer would go.)
 */

async function fillTable() {
  // Category rows for the header
  let catRow = $("<tr>");
  $("#jeopardy thead").empty();

  for (let i = 0; i < NUM_CATEGORIES; i++) {
    catRow.append($("<th>").text(categories[i].title));
  }
  $("#jeopardy thead").append(catRow);

  // Category rows for questions 
  $("#jeopardy tbody").empty();
  for (let y = 0; y < NUM_CLUES_PER_CAT; y++) {
    let catRow = $("<tr>");
    for (let x = 0; x < NUM_CATEGORIES; x++) {
      catRow.append($("<td>").attr("id", `${x}-${y}`).text("?"));
      $("#jeopardy tbody").append(catRow);//adds to the body 
    }
  }
}

/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if currently "answer", ignore click
 * */

function handleClick(e) {
  //clicking on question mark for clue => question => answer
  let id = e.target.id;
  let [catId, clueId] = id.split("-"); //id.split will split the id string at the space into an array for catid and clueid
  let clue = categories[catId].clues[clueId];
  
  let msg;

  if (!clue.showing) {
    msg = clue.question;
    clue.showing = "question";
  } else if (clue.showing === "question") {
    msg = clue.answer;
    clue.showing = "answer";
  } else {
    // ignore if showing answer 
    return
  }
  // Update text of cell
  $(`#${catId}-${clueId}`).html(msg);
}

/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * */

async function setupAndStart() {
  //loop for getting random category Ids for each category
  categories = [];
  let categoryIds = await getCategoryIds();
  for (let id of categoryIds) {
    let tempCategory = await getCategory(id);
    categories.push(tempCategory);
  }

  fillTable();
  for (let i = 0; i < categories.length; i++) {
    console.log(categories)
  }
}

/** On click of restart button, restart game. */

$("#restart").on("click", setupAndStart);

/** On page load, setup and start & add event handler for clicking clues */

$(async function () {
    setupAndStart();
    $("#jeopardy").on("click", "td", handleClick);
  }
);
