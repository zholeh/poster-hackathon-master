const { performance } = require("perf_hooks");

json = require("./bzu.json");
arr = Object.keys(json).map(el => {
  return { id: el, ...json[el] };
});

find = str => {
  
  const start = performance.now();
  const res = arr.filter(el => {
    reg = new RegExp(`^${str}`, "i");
    return reg.test(el.label);
  });
  res.sort((a,b)=>{
    return a.label.length - b.label.length;
  })

  console.log(performance.now() - start);
  return res;
};

module.exports.find = find;
