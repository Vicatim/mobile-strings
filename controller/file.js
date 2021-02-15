//@flow
import prettier from "prettier/standalone";
import { stringify } from "javascript-stringify";
import { parseByLanuage } from "./object";

// export
// file action helper
export function getMainObj(strings: any) {
  const plugins = [require("prettier/parser-babylon")];
  let exportObj = parseByLanuage(strings);
  var dataStr =
    "data:js;charset=utf-8," +
    encodeURIComponent(
      prettier.format(
        "export default" +
          stringify(exportObj).replace(/function (\w+)(\(\w+\))/gi, "$2 =>"),
        {
          parser: "babel-flow",
          plugins: plugins
        }
      )
    );
  return dataStr;
}
export function exportFile(strings: any) {
  let dataStr = getMainObj(strings);
  var downloadAnchorNode = document.createElement("a");
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", "languages.js");
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}

export function saveFile(strings: any) {
  // let dataStr = getMainObj(strings);
  // let workingDir = process.cwd();
  // let dir = "http://localhost:3000/" + "languages.js";
  // fs.writeFileSync(dir, dataStr);
  // var downloadAnchorNode = document.createElement("a");
  // downloadAnchorNode.setAttribute("href", dataStr);
  // downloadAnchorNode.setAttribute("download", "languages.js");
  // document.body.appendChild(downloadAnchorNode);
  // downloadAnchorNode.click();
  // downloadAnchorNode.remove();
}
