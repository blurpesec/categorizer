const punydict = require('./punydictionary.json');
const leven = require('fast-levenshtein');
const punycode = require('punycode');
const fs = require('fs');
const fsTwo = require('fs');

const tokenjson = require('./tokens.json');

const filename = './newItems.txt';
const protect = require('./protect.json');

var test = require('./domains.json');
//["myėTHęrwałletz.com", "coinbałłs.com"];

var lengthtotest = 3;
var str = '';
var totalchecks = 0;
var totalphishing = 0;
var totalscamming = 0;
var totalfakeico = 0;
var totals =
[
  {"phishing": 0},
  {"scamming": 0},
  {"fakeico": 0}
]
var scamslist = [];
var notphish = [];
var notphishorscam = [];

function initialize(){
  console.time("test");
  console.log("Testing using levenshtein distance of " + lengthtotest);
  for(var a = 0; a < test.length; a++){
    totalchecks += 1;
    str = '';
    var newstring = '';
    str = test[a];
    str = str   .replace('http://','')
                .replace('https://','')
                .replace('[.]','.')
                .replace('www.','')
                .split(/[/?#]/)[0]
                .toLowerCase();
    str = punycode.toUnicode(str);
    newstring = normalize(str)
    if(checkLevenshtein(newstring, str)){
      //console.log(str + " determined to be phishing.");
    }
    else{
      if(checkToken(newstring, str)){
        //console.log(str) + " was detected");
      }
    }
  }

  console.timeEnd("test");
  console.log("Total number of phishing category: " + totalphishing + " = " + totals[0].phishing + " / " + scamslist.length + " | " + totalphishing/scamslist.length);
  console.log("Total number of scamming category: " + totalscamming + " = " + totals[1].scamming + " / " + scamslist.length + " | " + totalscamming/scamslist.length);
  console.log("Total number of fake ico category: " + totalfakeico + " = " + totals[2].scamming + " / " + scamslist.length + " | " + totalfakeico/scamslist.length);


  console.log("Total number of positives: " + (totalphishing + totalscamming));
  console.log("Total number of negatives: " + notphishorscam.length);

  console.log("Total number of checks completed: " + (totalphishing + totalscamming + notphishorscam.length));
  console.log("Detected rate of incidence: " + (totalphishing + totalscamming)/totalchecks);

  console.log("Length of scamslist: " + scamslist.length);
  console.log("Categorizations still needed: " + notphishorscam.length);
  //console.log("Totals: " + JSON.stringify(totals, null, 2))
  fs.writeFileSync('./scamslist.json', JSON.stringify(scamslist, null, 4), function(e,results){
    if(e) console.log(e);
    else{
      //console.log("Done writing to scamslist.json");
      fs.close();
    }
  });

  fsTwo.writeFileSync('./notphishorscam.json', JSON.stringify(notphishorscam, null, 4), function(e,results){
    if(e) console.log(e);
    else{
        //console.log("Done writing to notphishorscam.json");
      fsTwo.close();
    }
  });
}

initialize();

function normalize(string){
  newstring = '';
  lookup = ['a','e','i','o','u','l','w','.','h','m','t','y','b','c','d','f','g','j','k','n','p','q','r','s','v','x','z'];
  for(var i = 0; i < string.length; i++){
    for(var c = 0; c < lookup.length; c++){
      if(punydict[lookup[c]].indexOf(string.charAt(i)) > -1){
        newstring += lookup[c];
        break;
      }
    }
  }
  return newstring;
}

function checkLevenshtein(input, str){
  var smallestleven = 15;
  var phishingOf = '';
  var length = 0;
  for(var i = 0; i <= protect.length-1; i++){
    length = leven.get(input, protect[i]);
    if(length < smallestleven){
      smallestleven = length;
      phishingOf = i;
    }
  }
  if(smallestleven <= lengthtotest){
    totalphishing += 1;
    totals[0].phishing += 1;
    scamslist.push(str);
    return true;
  }
  if(smallestleven > lengthtotest){
    notphish.push(str);
    return false;
  }
}

function checkToken(input, str){

  for(var y = 0; y < tokenjson.cards.length; y ++){
    for(var z = 0; z < tokenjson.cards[y].tokens.length; z++){
      if(input.indexOf(tokenjson.cards[y].tokens[z]) > -1){
        /*if(tokenjson.tokens[y].continue == true){
          // Add scam to scamslist, chang the chain to
        }
        else{*/
          scamslist.push(str);
          //var cat = tokenjson.tokens[y].category.toLowerCase();
          var subcat = tokenjson.cards[y].subcategory.toLowerCase();
          var name = tokenjson.cards[y].name.toLowerCase();
          //console.log("looking for: " + subcat + " in " + totals.count[1].phishing)\

        //for(var o = 0; o < 50; o++){
          /*if(subcat.indexOf(totals)!= 0){
            console.log("wat da fuck")
          }
          if(subcat.indexOf(totals) = 0){*/ // if subcategory exists in totals, add +1 ; always false;
            if(tokenjson.cards[y].category = "scamming"){
              //console.log(JSON.stringify(tokenjson.tokens[y], null, 2))
              totals[1].scamming += 1;
              totalscamming += 1;
              return true;
            }
            if(tokenjson.cards[y].category = "phishing"){
              totals[0].phishing += 1;
              totalphishing += 1;
              return true;
            }
            if(tokenjson.cards[y].category = "fakeico"){
              //console.log(input + " was detected as a fakeico category and subcategory: " + subcat + ". Under name: " + name);
              totals[2].fakeico += 1;
              totalfakeico += 1;
              return true;
            }
            /*
          }
          else{
            totals.count.push( {[subcat]: 1} );
          }
        }*/

        /*}*/
      }
    }
  }
  //if you get to this point, add to notphishorscam.json
  notphishorscam.push(str);
  return false;
}
