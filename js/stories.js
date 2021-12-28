"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 * add a star and a delete button to each li if the use has logged in.
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();
  // return a boolean value, if a user is logged in, show favorite/not-favorite star
  const showStar = Boolean(currentUser);


  return $(`
      <li id="${story.storyId}">
      ${showStar ? makeStarHTML(story, currentUser) : ""}
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
        <button type="button" class="btn btn-outline-danger btn-sm" id="deleteBnt">Delete</button>
      </li>
    `);
}




/** Make favorite/not-favorite star for story */

function makeStarHTML(story, user) {
  const isFavorite = user.isFavorite(story);
  const starType = isFavorite ? "fas" : "far";
  return `
      <span class="star">
        <i class="${starType} fa-star"></i>
      </span>`;
}



/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

//Write a function in stories.js 
//that is called when users submit the form. 
//Pick a good name for it. This function should get the data from the form, 
//call the .addStory method you wrote, and then put that new story on the page.
function submitNewStoryForm(evt){
  evt.preventDefault();
//get all the necessary info from the form with user input
  const title = $("#story-title").val();
  const url = $("#story-url").val();
  const author = $("#story-author").val();
//prepare the data for API update and DOM manipulation
  const username = currentUser.username
  const storyData = {title, url, author, username };

//add this new story to API by using addStory()
  const story = await storyList.addStory(currentUser, storyData);


//mark up the new story
  const $story = generateStoryMarkup(story);
//add the markedup story to the HTML page
  $allStoriesList.prepend($story);

}

$submitForm.on("submit", submitNewStoryForm);


/** Handle favorite/un-favorite a story */
async function favoriteSwitch(){
  const $clicked = $(evt.target);
  const $closestLi = $clicked.closest("li");
  const storyId = $closestLi.attr("id");
  const story = storyList.stories.find(story => story.storyId === storyId);

  // see if the item is already favorited (checking by presence of star)
  if ($clicked.hasClass("fas")) {
    // if it is a favorite already: remove from user's fav list 
    await currentUser.deleteAUserFavorite(story);
    //if it is a favorite already: and change star(a mark up text can be found with tag<i>)
    $clicked.closest("i").removeClass("fas").addClass("fav")
  } else {
    // currently not a favorite: do the opposite
    await currentUser.addANewFavorite(story);
    $tgt.closest("i").toggleClass("fas far");
  }

}

$storiesLists.on("click", ".star", favoriteSwitch);

/******************************************************************************
 * Functionality for favorites list and starr/un-starr a story
 */

/** Put favorites list on page. */

function putFavoritesListOnPage() {
  $favoritedStories.empty();
    // loop through all of users favorites,mark up, and generate HTML for them
    for (let story of currentUser.favorites) {
      const $story = generateStoryMarkup(story);
      $favoritedStories.append($story);
    }
    $favoritedStories.show();
  }

 

// Part 4: Removing Stories

// Allow logged in users to remove a story from one's own stories. 
// Once a story has been deleted, 
// remove it from the DOM and let the API know its been deleted.

async function deleteStory(evt) {
const $closestLi = $(evt.target).closest("li"); 
const storyId = $closestLi.attr("id");
await storyList.removeStory(currentUser, storyId);
  // re-generate story list
await putUserStoriesOnPage(); }
$ownStories.on("click", "#deleteBnt", deleteStory);