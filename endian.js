// https://stackoverflow.com/a/7946195
function reverseEndian(v) {
  var s = v.toString(16); // translate to hex
  s = s.replace(/^(.(..)*)$/, '0$1'); // add leading 0 if needed
  var a = s.match(/../g); // split in groups of 2
  a.reverse(); // reverse the groups
  var s2 = a.join(''); // join back
  var v2 = parseInt(s2, 16); // reparse to decimal
  return v2;
}

module.exports = {
  reverseEndian
};
