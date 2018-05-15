'use strict';

function Article (rawDataObj) {
  this.author = rawDataObj.author;
  this.authorUrl = rawDataObj.authorUrl;
  this.title = rawDataObj.title;
  this.category = rawDataObj.category;
  this.body = rawDataObj.body;
  this.publishedOn = rawDataObj.publishedOn;
}

// REVIEW: Instead of a global `articles = []` array, let's attach this list of all articles directly to the constructor function. Note: it is NOT on the prototype. In JavaScript, functions are themselves objects, which means we can add properties/values to them at any time. In this case, the array relates to ALL of the Article objects, so it does not belong on the prototype, as that would only be relevant to a single instantiated Article.
Article.all = [];

// COMMENT: Why isn't this method written as an arrow function?
// because the function is using the contextual this and cannot use the arrow function else the scope is using its parent scope and the this will be the wrong this
Article.prototype.toHtml = function() {
  let template = Handlebars.compile($('#article-template').text());

  this.daysAgo = parseInt((new Date() - new Date(this.publishedOn))/60/60/24/1000);

  // COMMENT: What is going on in the line below? What do the question mark and colon represent? How have we seen this same logic represented previously?
  // Not sure? Check the docs!
  // ? is a ternary usage of the if statement where if the condition before the ? is true it will assign this.publishStatus the template literal of how many days ago it was published (thing before the :) and if false it will assign draft.
  this.publishStatus = this.publishedOn ? `published ${this.daysAgo} days ago` : '(draft)';
  this.body = marked(this.body);

  return template(this);
};

// REVIEW: There are some other functions that also relate to all articles across the board, rather than just single instances. Object-oriented programming would call these "class-level" functions, that are relevant to the entire "class" of objects that are Articles.

// REVIEW: This function will take the rawData, how ever it is provided, and use it to instantiate all the articles. This code is moved from elsewhere, and encapsulated in a simply-named function for clarity.

// COMMENT: Where is this function called? What does 'rawData' represent now? How is this different from previous labs?
// this fucntion Article.loadAll is called in the function Article.fetchAll. Rawdata was an array of objects before. Now it is a key to access the value which is a JSON of an array of objects to make instances of articles. 
Article.loadAll = articleData => {
  articleData.sort((a,b) => (new Date(b.publishedOn)) - (new Date(a.publishedOn)))

  articleData.forEach(articleObject => Article.all.push(new Article(articleObject)))
}

// REVIEW: This function will retrieve the data from either a local or remote source, and process it, then hand off control to the View.
Article.fetchAll = () => {
  // REVIEW: What is this 'if' statement checking for? Where was the rawData set to local storage?
  if (localStorage.rawData) {

    Article.loadAll(JSON.parse(localStorage.rawData));

  } else {
    // Kept for reference on how to use AJAX for the same code below.
    // $.ajax({
    //   url:'/data/hackerIpsum.json',
    //   method:'GET',
    //   success: function(data, message) {
    //     console.log(data);
    //     console.log(message);
    //   },
    //   fail: function(err){
    //     console.error(err);
    //   }
    // })

    $.getJSON('/data/hackerIpsum.json', function(articleJson) {
      console.log(articleJson);
      localStorage.setItem('rawData', JSON.stringify(articleJson));
      Article.loadAll(articleJson);
    });
    // We knew we needed to get the data from the hackerIpsom first and we consoled that to make sure it was working. Next, we needed to put the information into localStorage so it would be available for the next time the page loaded.  This needed to be stringified to put it in proper format. After all of that, we needed to call the Article.loadAll function to load the articles into the Article function.  
  }
}
