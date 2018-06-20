const punydict = require('./punydictionary.json');
const leven = require('fast-levenshtein');
const punycode = require('punycode');
const fs = require('fs');
const fsTwo = require('fs');

const filename = './newItems.txt';
const protect = require('./protect.json');
var test = require('./domains.json');

//["myėTHęrwałletz.com", "coinbałłs.com"];

var lengthtotest = 3;
var str = '';
var totalchecks = 0;
var totalphishing = 0;
var scamslist = [];
var stillneed = [];

function initialize(){
  console.time("test");
  console.log("Testing using levenshtein distance of " + lengthtotest);
  for(var a = 0; a < test.length; a++){
    totalchecks += 1;
    str = '';
    var newstring = '';
    str = test[a];
    //console.log("feeding in: " + str);
    str = str   .replace('http://','')
                .replace('https://','')
                .replace('[.]','.')
                .replace('www.','')
                .split(/[/?#]/)[0]
                .toLowerCase();
    //console.log("decode punycode from: " + str + " to: " + punycode.toUnicode(str));
    str = punycode.toUnicode(str);
    newstring = normalize(str)
    checkLevenshtein(newstring, str);
  }
  console.log("Total number of checks: " + totalchecks);
  console.log("Total number of phishing detected: " + totalphishing);
  console.log("Rate of incidence: " + totalphishing/totalchecks);
  console.timeEnd("test");
  console.log("Length of scamslist: " + scamslist.length);
  console.log("Length of still needed: " + stillneed.length);
  fs.writeFileSync('./scamslist.json', JSON.stringify(scamslist, null, 4), function(e,results){
    if(e) console.log(e);
    else{
      console.log("Done writing to scamslist.json");
      fs.close();
    }
  });
  fsTwo.writeFileSync('./stillneed.json', JSON.stringify(stillneed, null, 4), function(e,results){
    if(e) console.log(e);
    else{
      console.log("Done writing to stillneed.json");
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
  //console.log(str + " has been normalized to: " + newstring);
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
    scamslist.push(str);
  }
  if(smallestleven > lengthtotest){
    stillneed.push(str);
  }

  //console.log("Smallest leven distance " + "for " + input + " is " + smallestleven + " and is " + protect[phishingOf]);
}
