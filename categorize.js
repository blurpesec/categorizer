const punydict = require('./punydictionary.json');
const leven = require('fast-levenshtein');
const punycode = require('punycode');

const filename = './newItems.txt';
const protect = require('./protect.json');
var test = require('./domains.json');
  //["myėTHęrwałletz.com", "coinbałłs.com"];
var str = '';
var totalchecks = 0;
var totalphishing = 0;

function initialize(){
  console.time("test");
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
    checkLevenshtein(newstring);
  }
  console.log("Total number of checks: " + totalchecks);
  console.log("Total number of phishing: " + totalphishing);
  console.log("Rate of incidence: " + totalphishing/totalchecks);
  console.timeEnd("test");
}

initialize();

function normalize(string){
  newstring = '';
  lookup = ['a','e','i','o','u','l','w','.','h','m','t','b','c','d','f','g','j','k','n','p','q','r','s','v','x','y','z'];
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

function checkLevenshtein(input){
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
  if(smallestleven <= 3){
    totalphishing += 1;
  }
  //console.log("Smallest leven distance " + "for " + input + " is " + smallestleven + " and is " + protect[phishingOf]);
}
