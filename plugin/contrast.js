/**
 * Copyright (c) 2009 by Eric Van Dewoestine
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
 *
 * Plugin which adds a command to adjust the color contrast of the current site
 * by adjusting the primary foreground and background colors (currently only
 * targets the body element).
 *
 * The primary goal of this plugin is to provide a quick and easy means to
 * alter the contrast of a site. Most notably those where you are attempting to
 * read a large portion of text (like a blog), and the site has chosen a
 * background / foreground combination that strains your eyes (white on black,
 * black on white, etc).
 *
 * Usage:
 *   :contrast <amount>
 *     Adjusts the contrast by the specified amount where a positive amount
 *     will darken the background and lighten the foreground, and a negative
 *     amount will have the opposite affect.
 *
 *     Ex.
 *       :contrast -50
 *
 * Example mappings:
 *   " use ctrl j/k to adjust contrast.
 *   map <c-j> :contrast 10<cr>
 *   map <c-k> :contrast -10<cr>
 *
 * TODO:
 *   - remember contrast for the current site until user leaves it, appling the
 *     contrast as the user navigates.
 *     - dependent on real buffer id support in vimperator
 *   - add a reset command to restore orginal colors.
 *     - dependent on real buffer id support in vimperator
 *   - handle hrefs?
 *   - add selector support
 *   - auto handle common blogs/wikis
 *     - wordpress
 *       - are these different because of version or skin/template?
 *       #page (parentNode == document.body) (2.0.3)
 *       #primary (parentNode == document.body) (2.0.2)
 *       #content (parentNode == document.body) (2.7) (2.3.3?)
 *     - moin moin
 *       #page (parentNode == document.body)
 *     - mediawiki
 *       body #content ?
 *     - blogspot (all three)
 *       #content-wrapper
 *       #main-wrapper
 *       #sidebar-wrapper
 *     - movabletype
 *
 * @version 0.1
 */
function Contrast() {
  // given a css rgb string, adjust the values the specified amount and return
  // an array containing the rgb string and the individual rgb integer values.
  function adjust(value, amount){
    var regex = new RegExp(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    var [r, g, b] = [parseInt(v) for each (v in regex.exec(value).slice(1))];

    r = amount > 0 ? Math.min(255, r + amount) : Math.max(0, r + amount);
    g = amount > 0 ? Math.min(255, g + amount) : Math.max(0, g + amount);
    b = amount > 0 ? Math.min(255, b + amount) : Math.max(0, b + amount);

    return [rgb(r, g, b), r, g, b];
  }

  // convert the individual rgb colors into a css compatible string.
  function rgb(r, g, b){
    return 'rgb(' + r + ',' + g + ',' + b + ')';
  }

  // ensure a minimum amount of contrast between the foreground and background
  // colors.
  function contrast(fv, bv){
    var min = 125;
    var diff = Math.abs(fv - bv);
    if (diff < min){
      var val = bv > 125 ? bv - min : bv + min;
      val = Math.min(255, Math.max(0, val));
      return val;
    }
    return fv;
  }

  function getProperty(element, name){
    var doc = window.content.document;
    var style = doc.defaultView.getComputedStyle(element, "");
    var value = style.getPropertyValue(name);
    if (value == "" || value == "transparent"){
      if (element.parentNode){
        return getProperty(element.parentNode, name);
      }
      return name == "color" ? rgb(0, 0, 0) : rgb(255, 255, 255);
    }
    return value;
  }

  return {
    // given an element, adjust the foreground / background colors the
    // specified amount.
    adjustColors: function(element, amount){
      var bg = getProperty(element, "background-color");
      var fg = getProperty(element, "color");

      var [brgb, br, bg, bb] = adjust(bg, 0 - amount);
      element.style.backgroundColor = brgb;

      var [frgb, fr, fg, fb] = adjust(fg, amount);
      fr = contrast(fr, br);
      fg = contrast(fg, bg);
      fb = contrast(fb, bb);
      element.style.color = rgb(fr, fg, fb);
    }
  };
}

var contrast = Contrast();

commands.add(["contrast"],
  "Adjust the contrast of the current page.",
  function(args) {
    body = window.content.document.body;
    contrast.adjustColors(body, parseInt(args[0]));
    for each (node in body.childNodes){
      if (node.nodeName == "DIV"){
        contrast.adjustColors(node, parseInt(args[0]));
      }
    }
  }, {argCount: 1}
);
