/**
 * Plugin to interact with firebug.
 *
 * Usage:
 *   :firebug                     opens firebug
 *   :firebug open                opens firebug
 *   :firebug close               closes firebug
 *   :firebug toggle              if closed, open firebug, otherwise close it.
 *   :firebug console-focus       places the cursor in the console command line.
 *   :firebug console-clear       clears the console
 *   :firebug tab <tabname>       focuses the specified firebug tab (console,
 *                                html, css, etc)
 *   :[count]firebug tabnext      focuses the next firebug tab (wraps at the end).
 *   :[count]firebug tabprevious  focuses the prev firebug tab (wraps at the
 *                                begining).
 *
 * @author Eric Van Dewoetine (ervandew@gmail.com)
 * @version 0.1
 */

const firebug = {
  open: function(){
    var contentBox = document.getElementById("fbContentBox");
    if (contentBox.collapsed)
      Firebug.toggleBar(true, 'console');
  },

  close: function(){
    var contentBox = document.getElementById("fbContentBox");
    if (!contentBox.collapsed)
      Firebug.toggleBar();
  },

  toggle: function(){
    Firebug.toggleBar(undefined, 'console');
  },

  console_focus: function(){
    Firebug.CommandLine.focus(FirebugContext);
  },

  console_clear: function(){
    Firebug.Console.clear();
  },

  tab: function(args){
    firebug.open();
    var name = args.arguments[0].toLowerCase();
    if (name == 'css'){
      name = 'stylesheet';
    }
    var browser = FirebugChrome.getCurrentBrowser();
    browser.chrome.selectPanel(name);
    browser.chrome.syncPanel();
    Firebug.showBar(true);
  },

  tabnext: function(args, count){
    firebug._gotoNextPrevTabName(count, false);
  },

  tabprevious: function(args, count){
    firebug._gotoNextPrevTabName(count, true);
  },

  _execute: function(args, count){
    var name = args.arguments.length ?
      args.arguments.shift().replace('-', '_') : 'open';
    var cmd = firebug[name];
    if (!cmd){
      liberator.echoerr("Unsupported firebug command: " + name);
      return false;
    }
    count = count > 1 ? count : 1;
    return cmd(args, count);
  },

  _gotoNextPrevTabName: function(count, previous){
    var panels = Firebug.getMainPanelTypes(FirebugContext);
    var names = [];
    panels.forEach(function(panel){names.push(panel.prototype.name);});

    var browser = FirebugChrome.getCurrentBrowser();
    var index = names.indexOf(browser.chrome.getSelectedPanel().name);
    count = count % names.length;
    if(previous){
      index = index - count;
      if (index < 0){
        index += names.length;
      }
    }else{
      index = index + count;
      if (index >= names.length){
        index -= names.length;
      }
    }
    firebug.tab({arguments: [names[index]]});
  },

  _completer: function(filter){
    var commands = [];
    for (var name in firebug){
      if (name.indexOf('_') !== 0 && firebug.hasOwnProperty(name)){
        commands.push(name.replace('_', '-'));
      }
    }
    commands = [[c, ''] for each (c in commands)];
    return [0, this.filter(commands, filter)];
  }
};

commands.add(["firebug"],
  "Control firebug from within vimperator.",
  function(args, special, count, modifiers) { firebug._execute(args, count); },
  { count: true, argCount: '*', completer: firebug._completer }
);
