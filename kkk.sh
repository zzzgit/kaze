#!/usr/bin/env node

let ccc = require('fs').readFileSync( process.env.GIT_PARAMS );
process.stdout(ccc)

var readline = require('readline');
var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

rl.on('line', function(line){
    console.log(line);
})
