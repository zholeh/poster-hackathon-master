const tr = require("./BI/transactions.json");

const {
  response: { data }
} = tr;

function parseXML(loadData, tns, tn) {
  let str = `<${tns}>`;
  loadData.forEach(element => {
    str += `<${tn}>`;
    Object.keys(element).forEach(key => {
      const val = element[key];
      if (Array.isArray(val)) str += parseXML(val, key, 'product');
      else str += `<${key}>${val}</${key}>`;
    });
    str += `</${tn}>`;
  });
  str += `</${tns}>`;

  return str;
}

const fs = require("fs");

fs.writeFile("./BI/Transactions.xml", parseXML(data, 'Transactions', 'Transaction'), function(err) {
  if (err) {
    return console.log(err);
  }

  console.log("The file was saved!");
});
