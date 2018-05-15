'use strict';

function Article( rawDataObj ) {
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
// The method is attached to the prototype, using contextual 'this'. An arrow function might cause unexpected scope issues.
Article.prototype.toHtml = function() {
  let template = Handlebars.compile( $( '#article-template' ).text() );

  this.daysAgo = parseInt( ( new Date() - new Date( this.publishedOn ) ) / 60 / 60 / 24 / 1000 );

  // COMMENT: What is going on in the line below? What do the question mark and colon represent? How have we seen this same logic represented previously?
  // Not sure? Check the docs!
  // This is a ternary operator, which is an if/else statement for Boolean operations. The question mark represents the true/false evaluation; either side of the colon represents the code block for true/false respectively.
  this.publishStatus = this.publishedOn ? `published ${this.daysAgo} days ago` : '(draft)';
  this.body = marked( this.body );

  return template( this );
};

// REVIEW: There are some other functions that also relate to all articles across the board, rather than just single instances. Object-oriented programming would call these "class-level" functions, that are relevant to the entire "class" of objects that are Articles.

// REVIEW: This function will take the rawData, however it is provided, and use it to instantiate all the articles. This code is moved from elsewhere, and encapsulated in a simply-named function for clarity.

Article.loadAll = articleData => {
  articleData.sort( ( a, b ) => ( new Date( b.publishedOn ) ) - ( new Date( a.publishedOn ) ) );

  articleData.forEach( articleObject => Article.all.push( new Article( articleObject ) ) );
}

// REVIEW: This function will retrieve the data from either a local or remote source, and process it, then hand off control to the View.

// COMMENT: Where is this function called? What does 'rawData' represent now? How is this different from previous labs?
// This function is called on index.html, and it is checking local storage for existing data, and if none exists, it is loading article from JSON. 
Article.fetchAll = () => {
  // REVIEW: What is this 'if' statement checking for? Where was the rawData set to local storage?
  if (localStorage.getItem('rawData')) {

    Article.loadAll(JSON.parse(localStorage.getItem('rawData')));
    articleView.initIndexPage();

  } else {

    $.ajax ({
      url: '/data/hackerIpsum.json',
      method: 'GET',
      success: function (data, message) {
        //console.log(data);
        Article.loadAll(data);
        articleView.initIndexPage();
        localStorage.setItem('rawData', JSON.stringify(data));
      },
      fail: function (err) {
        console.error(err);
      }
    })
  }
}

Article.fetchAll();
