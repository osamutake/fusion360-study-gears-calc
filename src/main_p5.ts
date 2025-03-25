/*
pukiwiki に貼り付けられるコードを得るには、
esbuild src/main_p5.ts --bundle --outfile=dist/main.ts --define:RELEASE=true --external:p5 --charset=utf8
して、
dist/main.ts の
  var import_p5 = __toESM(__require("p5"));
までの部分を削除すればいい。

--minify を付けて１行にしてしまった方が先頭に空白を入れやすいけど、意地悪してるみたいになるので。
*/

import p5 from 'p5';
import { generateMenu } from './menu';

export const sketch = (p: p5) => {
  function setup() {
    // minimize canvas
    p.createCanvas(1, 1);
    p.createDiv().elt.appendChild(generateMenu());
  }

  p.setup = setup;
};

// pukiwiki 用にビルドするためのおまじない
//
/* eslint-disable @typescript-eslint/no-explicit-any */
declare const p: any;
/* eslint-disable @typescript-eslint/no-explicit-any */
declare const RELEASE: any;
if (typeof RELEASE != 'undefined') {
  sketch(p);
} else {
  new p5(sketch, window['p5wrapper']);
}
