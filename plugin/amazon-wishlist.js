/**
 * Copyright (c) 2012 by Eric Van Dewoestine
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL
 * THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 *
 * Plugin which adds the current page to your amazon wishlist.
 *
 * Usage:
 *   :wishlist
 *
 * @version 0.1
 */
commands.add(["wishlist"],
  "Reformat the current page for readability using arc90's Readability bookmarklet.",
  function(args) {
    window.content.document.location = "javascript:" +
      "(function(){" +
      "    var w=window," +
      "        l=w.location," +
      "        d=w.document," +
      "        s=d.createElement('script')," +
      "        e=encodeURIComponent,o='object'," +
      "        n='AUWLBook'," +
      "        u='https://www.amazon.com/wishlist/add'," +
      "        r='readyState'," +
      "        T=setTimeout," +
      "        a='setAttribute'," +
      "        g=function(){" +
      "          d[r]&&d[r]!='complete'?" +
      "            T(g,200):" +
      "            !w[n]?" +
      "              (s[a]('charset','UTF-8')," +
      "               s[a]('src',u+'.js?loc='+e(l))," +
      "               d.body.appendChild(s)," +
      "               f()):" +
      "              f()" +
      "        }," +
      "        f=function(){" +
      "          !w[n]?T(f,200):w[n].showPopover()" +
      "        };" +
      "    typeof s!=o?l.href=u+'?u='+e(l)+'&t='+e(d.title):g()" +
      "}())";
  }, {argCount: 0}
);
